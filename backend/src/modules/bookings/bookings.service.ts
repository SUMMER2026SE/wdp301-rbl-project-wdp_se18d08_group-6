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

// Booking ở các trạng thái này không còn giữ chỗ trang phục nữa.
const RELEASED_STATUSES: BookingStatus[] = [
  BookingStatus.cancelled,
  BookingStatus.rejected,
  BookingStatus.completed,
];

// Chỉ cho phép khách tự hủy khi đơn còn ở giai đoạn sớm.
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

// Các trạng thái yêu cầu tất cả item phải được gán asset trước khi chuyển.
const ASSET_REQUIRED_STATUSES: BookingStatus[] = [
  BookingStatus.ready_for_pickup,
  BookingStatus.delivering,
  BookingStatus.renting,
];

// Các trạng thái staff/manager được phép chuyển đến theo workflow vận hành.
// LƯU Ý: inspection_pending → completed đã bị xóa khỏi đây.
// Việc hoàn tất booking chỉ được thực hiện qua InspectionsService.completeInspection().
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
  // inspection_pending → completed: bị cấm ở đây, chỉ đi qua completeInspection()
  [BookingStatus.overdue]: [BookingStatus.returned],
};

type SerializableBooking = {
  id: string;
  status: BookingStatus;
  rentalStartDate: Date;
  rentalEndDate: Date;
  pickupMethod: string;
  rentalTotal: unknown;
  depositTotal: unknown;
  penaltyTotal?: unknown;
  note: string | null;
  createdAt: Date;
  items: Array<{
    id: string;
    garmentId: string;
    garmentAssetId?: string | null;
    dailyPrice: unknown;
    depositAmount: unknown;
    garment: { name: string; sizeLabel: string | null } | null;
    garmentAsset?: {
      id: string;
      assetCode: string;
      status: AssetStatus;
      conditionNote: string | null;
    } | null;
  }>;
};

type StaffBooking = SerializableBooking & {
  customer?: {
    email: string;
    profile: { fullName: string | null; phone: string | null } | null;
  } | null;
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

    if (endDay < startDay) {
      throw new BadRequestException("End date must be on or after start date.");
    }

    const days = Math.round((endDay.getTime() - startDay.getTime()) / MS_PER_DAY) + 1;
    return { startDay, endDay, days };
  }

  // Tìm các booking đang giữ chỗ cùng garment và trùng khoảng ngày.
  private async findOverlappingBookings(garmentId: string, startDay: Date, endDay: Date) {
    return this.prisma.booking.findMany({
      where: {
        status: { notIn: RELEASED_STATUSES },
        rentalStartDate: { lte: endDay },
        rentalEndDate: { gte: startDay },
        items: { some: { garmentId } },
      },
      select: {
        id: true,
        rentalStartDate: true,
        rentalEndDate: true,
      },
    });
  }

  async checkAvailability(dto: CheckAvailabilityDto) {
    const garment = await this.prisma.garment.findFirst({
      where: { id: dto.garmentId, isActive: true },
    });
    if (!garment) {
      throw new NotFoundException("Garment not found.");
    }

    const { startDay, endDay } = this.parseDateRange(dto.startDate, dto.endDate);
    const conflicts = await this.findOverlappingBookings(dto.garmentId, startDay, endDay);

    return ok({
      garmentId: dto.garmentId,
      available: conflicts.length === 0,
      conflictDates: conflicts.map((c) => ({
        bookingId: c.id,
        startDate: c.rentalStartDate.toISOString().slice(0, 10),
        endDate: c.rentalEndDate.toISOString().slice(0, 10),
      })),
    });
  }

  async create(customerId: string, dto: CreateBookingDto) {
    const garment = await this.prisma.garment.findFirst({
      where: { id: dto.garmentId, isActive: true },
    });
    if (!garment) {
      throw new NotFoundException("Garment not found.");
    }

    const { startDay, endDay, days } = this.parseDateRange(dto.startDate, dto.endDate);

    const conflicts = await this.findOverlappingBookings(dto.garmentId, startDay, endDay);
    if (conflicts.length > 0) {
      throw new BadRequestException("Garment is not available for the selected dates.");
    }

    const dailyPrice = Number(garment.dailyPrice);
    const depositAmount = Number(garment.depositAmount);
    const rentalTotal = dailyPrice * days;

    const booking = await this.prisma.booking.create({
      data: {
        customerId,
        status: BookingStatus.pending_confirmation,
        rentalStartDate: startDay,
        rentalEndDate: endDay,
        pickupMethod: dto.pickupMethod ?? "store_pickup",
        rentalTotal,
        depositTotal: depositAmount,
        note: dto.note ?? null,
        items: {
          create: {
            garmentId: garment.id,
            dailyPrice,
            depositAmount,
          },
        },
      },
      include: { items: { include: { garment: true, garmentAsset: true } } },
    });

    return ok(this.serializeBooking(booking, days));
  }

  async findMine(customerId: string) {
    const bookings = await this.prisma.booking.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      include: { items: { include: { garment: true, garmentAsset: true } } },
    });

    return ok(bookings.map((booking) => this.serializeBooking(booking)));
  }

  async findOne(customerId: string, id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { items: { include: { garment: true, garmentAsset: true } } },
    });

    if (!booking) {
      throw new NotFoundException("Booking not found.");
    }
    if (booking.customerId !== customerId) {
      throw new ForbiddenException("You do not have access to this booking.");
    }

    return ok(this.serializeBooking(booking));
  }

  async cancel(customerId: string, id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!booking) {
      throw new NotFoundException("Booking not found.");
    }
    if (booking.customerId !== customerId) {
      throw new ForbiddenException("You do not have access to this booking.");
    }
    if (!CANCELLABLE_STATUSES.includes(booking.status)) {
      throw new BadRequestException("This booking can no longer be cancelled.");
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      // Fix #1: Giải phóng asset đã gán khi hủy đơn
      const assignedIds = booking.items
        .map((item) => item.garmentAssetId)
        .filter((id): id is string => Boolean(id));
      if (assignedIds.length > 0) {
        await tx.garmentAsset.updateMany({
          where: { id: { in: assignedIds } },
          data: { status: AssetStatus.available },
        });
      }

      return tx.booking.update({
        where: { id },
        data: { status: BookingStatus.cancelled },
        include: { items: { include: { garment: true, garmentAsset: true } } },
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
        items: { include: { garment: true, garmentAsset: true } },
        customer: { select: { profile: { select: { fullName: true, phone: true } }, email: true } },
      },
    });

    return ok(bookings.map((booking) => this.serializeStaffBooking(booking)));
  }

  async findReturnQueue() {
    const bookings = await this.prisma.booking.findMany({
      where: { status: { in: RETURN_QUEUE_STATUSES } },
      orderBy: [{ status: "asc" }, { rentalEndDate: "asc" }],
      take: 100,
      include: {
        items: { include: { garment: true, garmentAsset: true } },
        customer: { select: { profile: { select: { fullName: true, phone: true } }, email: true } },
      },
    });

    return ok(bookings.map((booking) => this.serializeStaffBooking(booking)));
  }

  async findAllForStaff() {
    const bookings = await this.prisma.booking.findMany({
      where: {
        status: {
          notIn: [BookingStatus.draft, BookingStatus.cancelled, BookingStatus.rejected, BookingStatus.completed],
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        items: { include: { garment: true, garmentAsset: true } },
        customer: { select: { profile: { select: { fullName: true, phone: true } }, email: true } },
      },
    });

    return ok(bookings.map((booking) => this.serializeStaffBooking(booking)));
  }

  /**
   * Danh sách booking có item chưa được gán asset.
   * Chỉ dành cho manager_owner/admin — người quản lý kho và tài sản.
   */
  async findBookingsNeedingAssets() {
    const bookings = await this.prisma.booking.findMany({
      where: {
        status: {
          in: [
            BookingStatus.confirmed,
            BookingStatus.awaiting_payment,
            BookingStatus.paid,
            BookingStatus.preparing,
          ],
        },
        items: { some: { garmentAssetId: null } },
      },
      orderBy: { createdAt: "asc" },
      include: {
        items: { include: { garment: true, garmentAsset: true } },
        customer: { select: { profile: { select: { fullName: true, phone: true } }, email: true } },
      },
    });

    return ok(bookings.map((booking) => this.serializeStaffBooking(booking)));
  }

  async advanceStatus(id: string, dto: UpdateBookingStatusDto, changedBy?: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!booking) throw new NotFoundException("Booking not found.");

    const allowed = STAFF_ALLOWED_TRANSITIONS[booking.status];
    if (!allowed?.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from '${booking.status}' to '${dto.status}'.`,
      );
    }

    // Fix #5: Validate tất cả item đã có asset trước khi ready_for_pickup/delivering/renting
    if (ASSET_REQUIRED_STATUSES.includes(dto.status)) {
      const itemCount = booking.items.length;
      const assignedCount = booking.items.filter((i) => Boolean(i.garmentAssetId)).length;
      if (itemCount === 0 || assignedCount < itemCount) {
        throw new BadRequestException(
          `All booking items must have an assigned asset before transitioning to '${dto.status}'. ` +
          `(${assignedCount}/${itemCount} items have assets assigned)`,
        );
      }
    }

    // Cấm inspection_pending → completed qua đường này (Fix #2 + #4)
    // Việc hoàn tất booking chỉ được thực hiện qua InspectionsService.completeInspection()
    if (dto.status === BookingStatus.completed && booking.status === BookingStatus.inspection_pending) {
      throw new BadRequestException(
        "Cannot directly complete a booking during inspection. " +
        "Use the inspection workflow to complete each item's inspection session.",
      );
    }

    // Cấm paid nếu booking không có payment record (phải dùng markPaid)
    if (dto.status === BookingStatus.paid) {
      throw new BadRequestException(
        "Cannot manually set booking to 'paid'. Use the mark-paid endpoint to record payment details.",
      );
    }

    // Tự động set paymentDueAt khi chuyển sang awaiting_payment (chỉ cho store_pickup)
    if (dto.status === BookingStatus.awaiting_payment && booking.pickupMethod === "store_pickup") {
      const dueDate = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 giờ
      await this.prisma.booking.update({
        where: { id },
        data: { paymentDueAt: dueDate },
      });
    }

    const assetIds = booking.items
      .map((item) => item.garmentAssetId)
      .filter((assetId): assetId is string => Boolean(assetId));

    const updated = await this.prisma.$transaction(async (tx) => {
      if (assetIds.length > 0) {
        // Giao đồ: reserved → rented
        if (dto.status === BookingStatus.renting) {
          await tx.garmentAsset.updateMany({
            where: { id: { in: assetIds } },
            data: { status: AssetStatus.rented },
          });
        }

        // Nhận trả đồ: rented → inspection_pending
        if (dto.status === BookingStatus.returned || dto.status === BookingStatus.inspection_pending) {
          await tx.garmentAsset.updateMany({
            where: { id: { in: assetIds } },
            data: { status: AssetStatus.inspection_pending },
          });
        }

        // Fix #1: Hủy/từ chối: giải phóng asset về available
        if (dto.status === BookingStatus.cancelled || dto.status === BookingStatus.rejected) {
          await tx.garmentAsset.updateMany({
            where: { id: { in: assetIds } },
            data: { status: AssetStatus.available },
          });
        }
      }

      await tx.bookingStatusHistory.create({
        data: {
          bookingId: id,
          fromStatus: booking.status,
          toStatus: dto.status,
          changedBy: changedBy ?? null,
          note: dto.note ?? null,
        },
      });

      return tx.booking.update({
        where: { id },
        data: { status: dto.status, ...(dto.note ? { note: dto.note } : {}) },
        include: { items: { include: { garment: true, garmentAsset: true } } },
      });
    });

    return ok(this.serializeBooking(updated));
  }

  async assignAsset(
    bookingId: string,
    itemId: string,
    dto: AssignAssetDto,
    staffId?: string,
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { items: true },
    });
    if (!booking) throw new NotFoundException("Booking not found.");

    const item = booking.items.find((i) => i.id === itemId);
    if (!item) throw new NotFoundException("Booking item not found.");

    if (item.garmentAssetId) {
      throw new BadRequestException("Item already has an assigned asset.");
    }

    const asset = await this.prisma.garmentAsset.findUnique({
      where: { id: dto.garmentAssetId },
      include: { bookingItems: { include: { booking: true } } },
    });
    if (!asset) throw new NotFoundException("Garment asset not found.");

    if (asset.garmentId !== item.garmentId) {
      throw new BadRequestException(
        `Asset '${asset.assetCode}' belongs to a different garment.`,
      );
    }

    if (asset.status !== AssetStatus.available) {
      throw new BadRequestException(
        `Asset '${asset.assetCode}' is not available (current status: ${asset.status}).`,
      );
    }

    // Kiểm tra asset không bị booking active khác giữ trong cùng khoảng ngày
    const conflictingItem = asset.bookingItems.find((bi) => {
      if (bi.bookingId === bookingId) return false;
      return !RELEASED_STATUSES.includes(bi.booking.status);
    });

    if (conflictingItem) {
      throw new BadRequestException(
        `Asset '${asset.assetCode}' is already assigned to another active booking.`,
      );
    }

    await this.prisma.$transaction([
      this.prisma.bookingItem.update({
        where: { id: itemId },
        data: { garmentAssetId: dto.garmentAssetId },
      }),
      this.prisma.garmentAsset.update({
        where: { id: dto.garmentAssetId },
        data: { status: AssetStatus.reserved },
      }),
      // Fix #6: Audit trail cho việc gán asset
      this.prisma.bookingStatusHistory.create({
        data: {
          bookingId,
          fromStatus: booking.status,
          toStatus: booking.status, // không đổi status, chỉ ghi log
          changedBy: staffId ?? null,
          note: `Gán asset ${asset.assetCode} vào item ${item.garmentId.slice(0, 8)}`,
        },
      }),
    ]);

    const updated = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { items: { include: { garment: true, garmentAsset: true } } },
    });

    return ok(this.serializeBooking(updated!));
  }

  /**
   * Đánh dấu đã thanh toán.
   *
   * Store pickup: staff chọn paymentMethod (cash/bank/qr/pos) → ghi nhận thu tiền tại quầy.
   * Delivery: staff xác nhận khách đã thanh toán online → paymentMethod mặc định "online".
   */
  async markPaid(id: string, dto: MarkPaidDto, staffId?: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { items: true, payments: true },
    });
    if (!booking) throw new NotFoundException("Booking not found.");

    if (booking.status !== BookingStatus.awaiting_payment) {
      throw new BadRequestException(
        `Booking must be in 'awaiting_payment' status to mark as paid (current: ${booking.status}).`,
      );
    }

    const isDelivery = booking.pickupMethod === "delivery";
    const paymentMethod = isDelivery ? "online" : (dto.paymentMethod ?? "cash");
    const totalAmount = Number(booking.rentalTotal);
    const depositAmount = Number(booking.depositTotal);

    const paymentMethodLabel: Record<string, string> = {
      cash: "Tiền mặt",
      bank_transfer: "Chuyển khoản",
      qr_code: "QR Code",
      pos_card: "Thẻ POS",
      online: "Thanh toán online",
    };

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id },
        data: {
          status: BookingStatus.paid,
          paymentDueAt: null,
        },
      });

      await tx.payment.create({
        data: {
          bookingId: id,
          provider: isDelivery ? "online" : "manual",
          paymentMethod,
          amount: totalAmount + depositAmount,
          depositAmount,
          status: PaymentStatus.paid,
          paidAt: new Date(),
        },
      });

      const note =
        dto.note
          ? `${paymentMethodLabel[paymentMethod] ?? paymentMethod}. ${dto.note}`
          : isDelivery
            ? `Khách đã thanh toán online. Thuê ${totalAmount.toLocaleString("vi-VN")}đ + Cọc ${depositAmount.toLocaleString("vi-VN")}đ = ${(totalAmount + depositAmount).toLocaleString("vi-VN")}đ`
            : `Thu tiền tại quầy: ${paymentMethodLabel[paymentMethod] ?? paymentMethod}. Thuê ${totalAmount.toLocaleString("vi-VN")}đ + Cọc ${depositAmount.toLocaleString("vi-VN")}đ = ${(totalAmount + depositAmount).toLocaleString("vi-VN")}đ`;

      await tx.bookingStatusHistory.create({
        data: {
          bookingId: id,
          fromStatus: BookingStatus.awaiting_payment,
          toStatus: BookingStatus.paid,
          changedBy: staffId ?? null,
          note,
        },
      });

      return tx.booking.findUnique({
        where: { id },
        include: { items: { include: { garment: true, garmentAsset: true } } },
      });
    });

    return ok(this.serializeBooking(updated!));
  }

  /**
   * Hủy các booking store_pickup đã quá hạn thanh toán.
   * Dùng cho scheduled job hoặc gọi thủ công từ admin.
   */
  async cancelExpiredAwaitingPayments() {
    const now = new Date();

    const expiredBookings = await this.prisma.booking.findMany({
      where: {
        status: BookingStatus.awaiting_payment,
        pickupMethod: "store_pickup",
        paymentDueAt: { lt: now },
      },
      include: { items: true },
    });

    const results: { bookingId: string; released: number }[] = [];
    for (const booking of expiredBookings) {
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
            bookingId: booking.id,
            fromStatus: BookingStatus.awaiting_payment,
            toStatus: BookingStatus.cancelled,
            note: "Tự động hủy — quá hạn thanh toán 2 giờ",
          },
        });

        return tx.booking.update({
          where: { id: booking.id },
          data: { status: BookingStatus.cancelled },
        });
      });

      results.push({
        bookingId: updated.id,
        released: booking.items.filter((i) => Boolean(i.garmentAssetId)).length,
      });
    }

    return ok({
      expiredCount: results.length,
      releasedAssets: results.reduce((sum, r) => sum + r.released, 0),
      bookings: results.map((r) => r.bookingId),
    });
  }

  private serializeStaffBooking(booking: StaffBooking) {
    return {
      ...this.serializeBooking(booking),
      customerName: booking.customer?.profile?.fullName ?? booking.customer?.email ?? null,
      customerPhone: booking.customer?.profile?.phone ?? null,
    };
  }

  private serializeBooking(booking: SerializableBooking, days?: number) {
    const start = booking.rentalStartDate;
    const end = booking.rentalEndDate;
    const computedDays =
      days ??
      Math.round(
        (Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()) -
          Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate())) /
          MS_PER_DAY,
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
      items: booking.items.map((item) => ({
        id: item.id,
        garmentId: item.garmentId,
        garmentName: item.garment?.name ?? null,
        sizeLabel: item.garment?.sizeLabel ?? null,
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
