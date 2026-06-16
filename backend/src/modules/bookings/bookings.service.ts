import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { BookingStatus } from "@prisma/client";
import { ok } from "../../common/api-response";
import { PrismaService } from "../../prisma/prisma.service";
import type { CheckAvailabilityDto } from "./dto/check-availability.dto";
import type { CreateBookingDto } from "./dto/create-booking.dto";
import type { UpdateBookingStatusDto } from "./dto/update-booking-status.dto";

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

// Các trạng thái staff/manager được phép chuyển đến từ pending_confirmation
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
  [BookingStatus.inspection_pending]: [BookingStatus.completed],
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
      include: { items: { include: { garment: true } } },
    });

    return ok(this.serializeBooking(booking, days));
  }

  async findMine(customerId: string) {
    const bookings = await this.prisma.booking.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      include: { items: { include: { garment: true } } },
    });

    return ok(bookings.map((booking) => this.serializeBooking(booking)));
  }

  async findOne(customerId: string, id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { items: { include: { garment: true } } },
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
    const booking = await this.prisma.booking.findUnique({ where: { id } });

    if (!booking) {
      throw new NotFoundException("Booking not found.");
    }
    if (booking.customerId !== customerId) {
      throw new ForbiddenException("You do not have access to this booking.");
    }
    if (!CANCELLABLE_STATUSES.includes(booking.status)) {
      throw new BadRequestException("This booking can no longer be cancelled.");
    }

    const updated = await this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.cancelled },
      include: { items: { include: { garment: true } } },
    });

    return ok(this.serializeBooking(updated));
  }

  private serializeBooking(    booking: {
      id: string;
      status: BookingStatus;
      rentalStartDate: Date;
      rentalEndDate: Date;
      pickupMethod: string;
      rentalTotal: unknown;
      depositTotal: unknown;
      note: string | null;
      createdAt: Date;
      items: Array<{
        id: string;
        garmentId: string;
        dailyPrice: unknown;
        depositAmount: unknown;
        garment: { name: string; sizeLabel: string | null } | null;
      }>;
    },
    days?: number,
  ) {
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
      note: booking.note,
      createdAt: booking.createdAt.toISOString(),
      items: booking.items.map((item) => ({
        id: item.id,
        garmentId: item.garmentId,
        garmentName: item.garment?.name ?? null,
        sizeLabel: item.garment?.sizeLabel ?? null,
        dailyPrice: Number(item.dailyPrice),
        depositAmount: Number(item.depositAmount),
      })),
    };
  }

  // ── Staff / Manager endpoints ──────────────────────────────────────────────

  async findAllPending() {
    const bookings = await this.prisma.booking.findMany({
      where: { status: BookingStatus.pending_confirmation },
      orderBy: { createdAt: "asc" },
      include: {
        items: { include: { garment: true } },
        customer: { select: { profile: { select: { fullName: true, phone: true } }, email: true } },
      },
    });

    return ok(bookings.map((b) => ({
      ...this.serializeBooking(b),
      customerName: b.customer?.profile?.fullName ?? b.customer?.email ?? null,
      customerPhone: b.customer?.profile?.phone ?? null,
    })));
  }

  async findAllForStaff() {
    const bookings = await this.prisma.booking.findMany({
      where: {
        status: {
          notIn: [BookingStatus.draft],
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        items: { include: { garment: true } },
        customer: { select: { profile: { select: { fullName: true, phone: true } }, email: true } },
      },
    });

    return ok(bookings.map((b) => ({
      ...this.serializeBooking(b),
      customerName: b.customer?.profile?.fullName ?? b.customer?.email ?? null,
      customerPhone: b.customer?.profile?.phone ?? null,
    })));
  }

  async advanceStatus(id: string, dto: UpdateBookingStatusDto) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException("Booking not found.");

    const allowed = STAFF_ALLOWED_TRANSITIONS[booking.status];
    if (!allowed?.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from '${booking.status}' to '${dto.status}'.`,
      );
    }

    const updated = await this.prisma.booking.update({
      where: { id },
      data: { status: dto.status, ...(dto.note ? { note: dto.note } : {}) },
      include: { items: { include: { garment: true } } },
    });

    return ok(this.serializeBooking(updated));
  }
}
