import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { AssetStatus, BookingStatus, PaymentStatus } from "@prisma/client";
import { ok } from "../../common/api-response";
import { PrismaService } from "../../prisma/prisma.service";
import type { CheckAvailabilityDto } from "./dto/check-availability.dto";
import type { CreateBookingDto } from "./dto/create-booking.dto";
import type { UpdateBookingStatusDto } from "./dto/update-booking-status.dto";
import type { AssignAssetDto } from "./dto/assign-asset.dto";
import type { MarkPaidDto } from "./dto/mark-paid.dto";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const RELEASED_STATUSES: BookingStatus[] = [
  BookingStatus.cancelled,
  BookingStatus.rejected,
  BookingStatus.completed,
];

const CANCELLABLE_STATUSES: BookingStatus[] = [
  BookingStatus.draft,
  BookingStatus.pending_confirmation,
  BookingStatus.confirmed,
  BookingStatus.awaiting_payment,
];

const RETURN_QUEUE_STATUSES: BookingStatus[] = [
  BookingStatus.returned,
  BookingStatus.inspection_pending,
  BookingStatus.overdue,
];

const ASSET_REQUIRED_STATUSES: BookingStatus[] = [
  BookingStatus.ready_for_pickup,
  BookingStatus.delivering,
  BookingStatus.renting,
];

const STAFF_ALLOWED_TRANSITIONS: Partial<Record<BookingStatus, BookingStatus[]>> = {
  [BookingStatus.pending_confirmation]: [BookingStatus.confirmed, BookingStatus.rejected],
  [BookingStatus.confirmed]: [BookingStatus.awaiting_payment, BookingStatus.cancelled],
  [BookingStatus.awaiting_payment]: [BookingStatus.paid],
  [BookingStatus.paid]: [BookingStatus.preparing],
  [BookingStatus.preparing]: [BookingStatus.ready_for_pickup],
  [BookingStatus.ready_for_pickup]: [BookingStatus.delivering, BookingStatus.renting],
  [BookingStatus.delivering]: [BookingStatus.renting],
  [BookingStatus.renting]: [BookingStatus.returned, BookingStatus.overdue],
  [BookingStatus.returned]: [BookingStatus.inspection_pending],
  [BookingStatus.overdue]: [BookingStatus.returned],
};

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  private parseDateRange(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new BadRequestException("Invalid rental dates.");
    }
    const startDay = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
    const endDay = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));
    if (endDay < startDay) throw new BadRequestException("End date must be on or after start date.");
    const days = Math.round((endDay.getTime() - startDay.getTime()) / MS_PER_DAY) + 1;
    return { startDay, endDay, days };
  }

  // ── Availability ───────────────────────────────────────────────────────────

  async checkAvailability(dto: CheckAvailabilityDto) {
    const size = await this.prisma.garment_sizes.findFirst({
      where: { id: dto.garmentSizeId, is_active: true },
    });
    if (!size) throw new NotFoundException("Garment size not found.");

    const { startDay, endDay } = this.parseDateRange(dto.startDate, dto.endDate);

    const availableCount = await this.prisma.garmentAsset.count({
      where: { garment_size_id: dto.garmentSizeId, status: AssetStatus.available },
    });

    const freeReservedCount = await this.prisma.garmentAsset.count({
      where: {
        garment_size_id: dto.garmentSizeId,
        status: { in: [AssetStatus.reserved, AssetStatus.rented] },
        bookingItems: {
          none: {
            booking: {
              status: { notIn: RELEASED_STATUSES },
              rentalStartDate: { lte: endDay },
              rentalEndDate: { gte: startDay },
            },
          },
        },
      },
    });

    const totalAvailable = availableCount + freeReservedCount;
    const totalValidAssets = await this.prisma.garmentAsset.count({
      where: {
        garment_size_id: dto.garmentSizeId,
        status: { notIn: [AssetStatus.retired, AssetStatus.lost] },
      },
    });

    return ok({
      garmentSizeId: dto.garmentSizeId,
      available: totalAvailable > 0,
      availableCount: totalAvailable,
      totalAssets: totalValidAssets,
    });
  }

  // ── Create Booking ─────────────────────────────────────────────────────────

  async create(customerId: string, dto: CreateBookingDto) {
    const { startDay, endDay, days } = this.parseDateRange(dto.startDate, dto.endDate);

    const sizes = await this.prisma.garment_sizes.findMany({
      where: { id: { in: dto.garmentSizeIds }, is_active: true },
      include: { garments: true },
    });

    if (sizes.length !== dto.garmentSizeIds.length) {
      const found = new Set(sizes.map((s) => s.id));
      const missing = dto.garmentSizeIds.filter((id) => !found.has(id));
      throw new NotFoundException(`Không tìm thấy size: ${missing.join(", ")}`);
    }

    for (const sizeId of dto.garmentSizeIds) {
      const avail = await this.checkAvailability({
        garmentSizeId: sizeId,
        startDate: dto.startDate,
        endDate: dto.endDate,
      } as CheckAvailabilityDto);
      if (!avail.data?.available) {
        const s = sizes.find((sz) => sz.id === sizeId)!;
        throw new BadRequestException(
          `"${s.garments.name}" (${s.size_label ?? "—"}) không còn sản phẩm khả dụng.`,
        );
      }
    }

    const sizeMap = new Map(sizes.map((s) => [s.id, s]));
    let rentalTotal = 0;
    let depositTotal = 0;
    const itemsData = dto.garmentSizeIds.map((sizeId) => {
      const size = sizeMap.get(sizeId)!;
      const dp = Number(size.daily_price ?? 0);
      const da = Number(size.deposit_amount ?? 0);
      rentalTotal += dp * days;
      depositTotal += da;
      return { garmentId: size.garment_id, garment_size_id: sizeId, dailyPrice: dp, depositAmount: da };
    });

    const booking = await this.prisma.booking.create({
      data: {
        customerId,
        status: BookingStatus.pending_confirmation,
        rentalStartDate: startDay,
        rentalEndDate: endDay,
        pickupMethod: dto.pickupMethod ?? "store_pickup",
        rentalTotal,
        depositTotal,
        note: dto.note ?? null,
        items: { create: itemsData },
      },
      include: {
        items: {
          include: {
            garment_sizes: { include: { garments: true } },
            garmentAsset: true,
          },
        },
      },
    });

    return ok(this.serializeBooking(booking, days));
  }

  // ── Customer endpoints ─────────────────────────────────────────────────────

  async findMine(customerId: string) {
    const bookings = await this.prisma.booking.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            garment_sizes: { include: { garments: true } },
            garmentAsset: true,
          },
        },
      },
    });
    return ok(bookings.map((b) => this.serializeBooking(b)));
  }

  async findOne(customerId: string, id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            garment_sizes: { include: { garments: true } },
            garmentAsset: true,
          },
        },
      },
    });
    if (!booking) throw new NotFoundException("Booking not found.");
    if (booking.customerId !== customerId) throw new ForbiddenException("You do not have access to this booking.");
    return ok(this.serializeBooking(booking));
  }

  async cancel(customerId: string, id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!booking) throw new NotFoundException("Booking not found.");
    if (booking.customerId !== customerId) throw new ForbiddenException("You do not have access to this booking.");
    if (!CANCELLABLE_STATUSES.includes(booking.status)) {
      throw new BadRequestException("This booking can no longer be cancelled.");
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const assignedIds = booking.items
        .map((item) => item.garmentAssetId)
        .filter((id): id is string => Boolean(id));
      if (assignedIds.length > 0) {
        await tx.garmentAsset.updateMany({
          where: { id: { in: assignedIds } },
          data: { status: AssetStatus.available },
        });
      }
      await tx.bookingStatusHistory.create({
        data: {
          bookingId: id,
          fromStatus: booking.status,
          toStatus: BookingStatus.cancelled,
          note: "Khách hàng tự hủy đơn",
        },
      });
      return tx.booking.update({
        where: { id },
        data: { status: BookingStatus.cancelled },
        include: {
          items: {
            include: {
              garment_sizes: { include: { garments: true } },
              garmentAsset: true,
            },
          },
        },
      });
    });
    return ok(this.serializeBooking(updated));
  }

  // ── Staff / Manager endpoints ──────────────────────────────────────────────

  async findAllPending() {
    const bookings = await this.prisma.booking.findMany({
      where: { status: BookingStatus.pending_confirmation },
      orderBy: { createdAt: "asc" },
      include: {
        items: {
          include: {
            garment_sizes: { include: { garments: true } },
            garmentAsset: true,
          },
        },
        customer: { select: { profile: { select: { fullName: true, phone: true } }, email: true } },
      },
    });
    return ok(bookings.map((b) => this.serializeStaffBooking(b)));
  }

  async findReturnQueue() {
    const bookings = await this.prisma.booking.findMany({
      where: { status: { in: RETURN_QUEUE_STATUSES } },
      orderBy: [{ status: "asc" }, { rentalEndDate: "asc" }],
      take: 100,
      include: {
        items: {
          include: {
            garment_sizes: { include: { garments: true } },
            garmentAsset: true,
          },
        },
        customer: { select: { profile: { select: { fullName: true, phone: true } }, email: true } },
      },
    });
    return ok(bookings.map((b) => this.serializeStaffBooking(b)));
  }

  async findAllForStaff() {
    const bookings = await this.prisma.booking.findMany({
      where: { status: { notIn: [BookingStatus.draft, BookingStatus.cancelled, BookingStatus.rejected, BookingStatus.completed] } },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        items: {
          include: {
            garment_sizes: { include: { garments: true } },
            garmentAsset: true,
          },
        },
        customer: { select: { profile: { select: { fullName: true, phone: true } }, email: true } },
      },
    });
    return ok(bookings.map((b) => this.serializeStaffBooking(b)));
  }

  async findBookingsNeedingAssets() {
    const bookings = await this.prisma.booking.findMany({
      where: {
        status: { in: [BookingStatus.confirmed, BookingStatus.awaiting_payment, BookingStatus.paid, BookingStatus.preparing] },
        items: { some: { garmentAssetId: null } },
      },
      orderBy: { createdAt: "asc" },
      include: {
        items: {
          include: {
            garment_sizes: { include: { garments: true } },
            garmentAsset: true,
          },
        },
        customer: { select: { profile: { select: { fullName: true, phone: true } }, email: true } },
      },
    });
    return ok(bookings.map((b) => this.serializeStaffBooking(b)));
  }

  async findCompletedWithPendingRefunds() {
    const bookings = await this.prisma.booking.findMany({
      where: { status: BookingStatus.completed, depositTotal: { gt: 0 } },
      orderBy: { updatedAt: "desc" },
      take: 100,
      include: {
        items: {
          include: {
            garment_sizes: { include: { garments: true } },
            garmentAsset: true,
          },
        },
        customer: { select: { profile: { select: { fullName: true, phone: true } }, email: true } },
        refunds: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });
    return ok(bookings.map((b) => ({
      ...this.serializeStaffBooking(b),
      refunds: b.refunds.map((r) => ({
        id: r.id, amount: Number(r.amount), status: r.status,
        refundMethod: r.refund_method, createdAt: r.createdAt.toISOString(), updatedAt: r.updated_at.toISOString(),
      })),
    })));
  }

  async advanceStatus(id: string, dto: UpdateBookingStatusDto, changedBy?: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!booking) throw new NotFoundException("Booking not found.");

    const allowed = STAFF_ALLOWED_TRANSITIONS[booking.status];
    if (!allowed?.includes(dto.status)) {
      throw new BadRequestException(`Cannot transition from '${booking.status}' to '${dto.status}'.`);
    }

    if (ASSET_REQUIRED_STATUSES.includes(dto.status)) {
      const itemCount = booking.items.length;
      const assignedCount = booking.items.filter((i) => Boolean(i.garmentAssetId)).length;
      if (itemCount === 0 || assignedCount < itemCount) {
        throw new BadRequestException(
          `All booking items must have an assigned asset before transitioning to '${dto.status}'. (${assignedCount}/${itemCount})`,
        );
      }
    }

    if (dto.status === BookingStatus.completed && booking.status === BookingStatus.inspection_pending) {
      throw new BadRequestException("Cannot directly complete a booking during inspection.");
    }

    if (dto.status === BookingStatus.paid) {
      throw new BadRequestException("Cannot manually set booking to 'paid'. Use the mark-paid endpoint.");
    }

    if (dto.status === BookingStatus.awaiting_payment && booking.pickupMethod === "store_pickup") {
      await this.prisma.booking.update({
        where: { id },
        data: { paymentDueAt: new Date(Date.now() + 2 * 60 * 60 * 1000) },
      });
    }

    const assetIds = booking.items
      .map((item) => item.garmentAssetId)
      .filter((assetId): assetId is string => Boolean(assetId));

    const updated = await this.prisma.$transaction(async (tx) => {
      if (assetIds.length > 0) {
        if (dto.status === BookingStatus.renting) {
          await tx.garmentAsset.updateMany({ where: { id: { in: assetIds } }, data: { status: AssetStatus.rented } });
        }
        if (dto.status === BookingStatus.returned || dto.status === BookingStatus.inspection_pending) {
          await tx.garmentAsset.updateMany({ where: { id: { in: assetIds } }, data: { status: AssetStatus.inspection_pending } });
        }
        if (dto.status === BookingStatus.cancelled || dto.status === BookingStatus.rejected) {
          await tx.garmentAsset.updateMany({ where: { id: { in: assetIds } }, data: { status: AssetStatus.available } });
        }
      }
      await tx.bookingStatusHistory.create({
        data: { bookingId: id, fromStatus: booking.status, toStatus: dto.status, changedBy: changedBy ?? null, note: dto.note ?? null },
      });
      return tx.booking.update({
        where: { id },
        data: { status: dto.status, ...(dto.note ? { note: dto.note } : {}) },
        include: {
          items: {
            include: {
              garment_sizes: { include: { garments: true } },
              garmentAsset: true,
            },
          },
        },
      });
    });
    return ok(this.serializeBooking(updated));
  }

  async assignAsset(bookingId: string, itemId: string, dto: AssignAssetDto, staffId?: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId }, include: { items: true } });
    if (!booking) throw new NotFoundException("Booking not found.");

    const item = booking.items.find((i) => i.id === itemId);
    if (!item) throw new NotFoundException("Booking item not found.");
    if (item.garmentAssetId) throw new BadRequestException("Item already has an assigned asset.");

    const asset = await this.prisma.garmentAsset.findUnique({
      where: { id: dto.garmentAssetId },
      include: { bookingItems: { include: { booking: true } } },
    });
    if (!asset) throw new NotFoundException("Garment asset not found.");

    if (asset.status !== AssetStatus.available)
      throw new BadRequestException(`Asset '${asset.assetCode}' is not available (current: ${asset.status}).`);

    const conflictingItem = asset.bookingItems.find((bi) => {
      if (bi.bookingId === bookingId) return false;
      return !RELEASED_STATUSES.includes(bi.booking.status);
    });
    if (conflictingItem)
      throw new BadRequestException(`Asset '${asset.assetCode}' is already assigned to another active booking.`);

    await this.prisma.$transaction([
      this.prisma.bookingItem.update({ where: { id: itemId }, data: { garmentAssetId: dto.garmentAssetId } }),
      this.prisma.garmentAsset.update({ where: { id: dto.garmentAssetId }, data: { status: AssetStatus.reserved } }),
      this.prisma.bookingStatusHistory.create({
        data: { bookingId, fromStatus: booking.status, toStatus: booking.status, changedBy: staffId ?? null, note: `Gán asset ${asset.assetCode}` },
      }),
    ]);

    const updated = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        items: {
          include: {
            garment_sizes: { include: { garments: true } },
            garmentAsset: true,
          },
        },
      },
    });
    return ok(this.serializeBooking(updated!));
  }

  async markPaid(id: string, dto: MarkPaidDto, staffId?: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id }, include: { items: true, payments: true } });
    if (!booking) throw new NotFoundException("Booking not found.");
    if (booking.status !== BookingStatus.awaiting_payment)
      throw new BadRequestException(`Booking must be in 'awaiting_payment' to mark as paid (current: ${booking.status}).`);

    const isDelivery = booking.pickupMethod === "delivery";
    const paymentMethod = isDelivery ? "online" : (dto.paymentMethod ?? "cash");
    const totalAmount = Number(booking.rentalTotal);
    const depositAmount = Number(booking.depositTotal);

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.booking.update({ where: { id }, data: { status: BookingStatus.paid, paymentDueAt: null } });
      await tx.payment.create({
        data: {
          bookingId: id, provider: isDelivery ? "online" : "manual", paymentMethod,
          amount: totalAmount + depositAmount, depositAmount, status: PaymentStatus.paid, paidAt: new Date(),
        },
      });
      await tx.bookingStatusHistory.create({
        data: { bookingId: id, fromStatus: BookingStatus.awaiting_payment, toStatus: BookingStatus.paid, changedBy: staffId ?? null, note: "Đã thanh toán" },
      });
      return tx.booking.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              garment_sizes: { include: { garments: true } },
              garmentAsset: true,
            },
          },
        },
      });
    });
    return ok(this.serializeBooking(updated!));
  }

  async cancelExpiredAwaitingPayments() {
    const now = new Date();
    const expiredBookings = await this.prisma.booking.findMany({
      where: { status: BookingStatus.awaiting_payment, pickupMethod: "store_pickup", paymentDueAt: { lt: now } },
      include: { items: true },
    });
    const results: { bookingId: string; released: number }[] = [];
    for (const booking of expiredBookings) {
      await this.prisma.$transaction(async (tx) => {
        const assignedIds = booking.items.map((i) => i.garmentAssetId).filter(Boolean) as string[];
        if (assignedIds.length > 0)
          await tx.garmentAsset.updateMany({ where: { id: { in: assignedIds } }, data: { status: AssetStatus.available } });
        await tx.bookingStatusHistory.create({
          data: { bookingId: booking.id, fromStatus: BookingStatus.awaiting_payment, toStatus: BookingStatus.cancelled, note: "Tự động hủy — quá hạn thanh toán" },
        });
        await tx.booking.update({ where: { id: booking.id }, data: { status: BookingStatus.cancelled } });
      });
      results.push({ bookingId: booking.id, released: booking.items.filter((i) => i.garmentAssetId).length });
    }
    return ok({ expiredCount: results.length, releasedAssets: results.reduce((s, r) => s + r.released, 0), bookings: results.map((r) => r.bookingId) });
  }

  // ── Serialization ──────────────────────────────────────────────────────────

  private serializeStaffBooking(booking: any) {
    return {
      ...this.serializeBooking(booking),
      customerName: booking.customer?.profile?.fullName ?? booking.customer?.email ?? null,
      customerPhone: booking.customer?.profile?.phone ?? null,
    };
  }

  private serializeBooking(booking: any, days?: number) {
    const start = new Date(booking.rentalStartDate);
    const end = new Date(booking.rentalEndDate);
    const computedDays = days ?? Math.round(
      (Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()) -
       Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate())) / MS_PER_DAY,
    ) + 1;

    return {
      id: booking.id,
      status: booking.status,
      rentalStartDate: start.toISOString().slice(0, 10),
      rentalEndDate: end.toISOString().slice(0, 10),
      days: computedDays,
      pickupMethod: booking.pickupMethod,
      rentalTotal: Number(booking.rentalTotal),
      depositTotal: Number(booking.depositTotal),
      penaltyTotal: Number(booking.penaltyTotal ?? 0),
      note: booking.note,
      createdAt: booking.createdAt.toISOString(),
      items: (booking.items ?? []).map((item: any) => ({
        id: item.id,
        garmentSizeId: item.garment_size_id,
        garmentId: item.garmentId,
        garmentName: item.garment_sizes?.garments?.name ?? null,
        sizeLabel: item.garment_sizes?.size_label ?? null,
        dailyPrice: Number(item.dailyPrice),
        depositAmount: Number(item.depositAmount),
        garmentAssetId: item.garmentAssetId ?? item.garmentAsset?.id ?? null,
        assetCode: item.garmentAsset?.assetCode ?? null,
        assetStatus: item.garmentAsset?.status ?? null,
        conditionNote: item.garmentAsset?.conditionNote ?? null,
      })),
    };
  }
}
