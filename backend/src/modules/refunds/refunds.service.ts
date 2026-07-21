import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { BookingStatus, PaymentStatus } from "@prisma/client";
import { ok } from "../../common/api-response";
import { PrismaService } from "../../prisma/prisma.service";
import type { CreateRefundDto } from "./dto/create-refund.dto";
import type { UpdateRefundStatusDto } from "./dto/update-refund.dto";

@Injectable()
export class RefundsService {
  constructor(private readonly prisma: PrismaService) {}

  async calculate(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException("Booking not found.");
    const depositTotal = Number(booking.depositTotal);
    const penaltyTotal = Number(booking.penaltyTotal);
    return ok({ bookingId, depositTotal, penaltyTotal, refundAmount: Math.max(0, depositTotal - penaltyTotal) });
  }

  async create(dto: CreateRefundDto, staffId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
      include: { refunds: true, payments: true },
    });
    if (!booking) throw new NotFoundException("Booking not found.");
    if (booking.status !== BookingStatus.completed)
      throw new BadRequestException("Chỉ có thể hoàn cọc cho đơn đã hoàn tất kiểm tra.");

    const existingActive = booking.refunds.find((r) => r.status === PaymentStatus.pending || r.status === PaymentStatus.refunding);
    if (existingActive) throw new BadRequestException("Đơn này đã có yêu cầu hoàn cọc đang chờ xử lý.");

    if (dto.refundMethod === "bank_transfer") {
      if (!dto.bankName || !dto.bankAccountNumber || !dto.bankAccountHolder)
        throw new BadRequestException("Cần cung cấp đầy đủ thông tin ngân hàng.");
    }

    const amount = Math.max(0, Number(booking.depositTotal) - Number(booking.penaltyTotal));
    if (amount <= 0) throw new BadRequestException("Không có tiền cọc để hoàn lại.");

    const paymentId = booking.payments[0]?.id ?? null;
    const isCash = dto.refundMethod === "cash";

    const refund = await this.prisma.$transaction(async (tx) => {
      const created = await tx.refund.create({
        data: {
          bookingId: dto.bookingId, paymentId, amount,
          status: isCash ? PaymentStatus.refunded : PaymentStatus.pending,
          refund_method: dto.refundMethod, reason: dto.reason ?? null,
          bank_name: dto.bankName ?? null, bank_account_number: dto.bankAccountNumber ?? null, bank_account_holder: dto.bankAccountHolder ?? null,
          processed_by: staffId,
        },
      });

      const txType = isCash ? "refund_cash" : "refund_bank_transfer_pending";
      await tx.financialTransaction.create({
        data: { bookingId: dto.bookingId, refundId: created.id, transactionType: txType, amount, note: `Hoàn cọc ${dto.refundMethod === "cash" ? "tiền mặt" : "chuyển khoản"}. Số tiền: ${amount.toLocaleString("vi-VN")}đ` },
      });

      return tx.refund.findUnique({
        where: { id: created.id },
        include: {
          booking: { select: { id: true, customerId: true, depositTotal: true, penaltyTotal: true, pickupMethod: true, customer: { select: { profile: { select: { fullName: true, phone: true } }, email: true } } } },
        },
      });
    });

    return ok(this.serialize(refund!));
  }

  async approve(id: string, dto: UpdateRefundStatusDto, managerId: string) {
    const refund = await this.prisma.refund.findUnique({ where: { id }, include: { booking: true } });
    if (!refund) throw new NotFoundException("Refund not found.");
    if (refund.status !== PaymentStatus.pending && refund.status !== PaymentStatus.refunding)
      throw new BadRequestException(`Không thể duyệt hoàn cọc ở trạng thái: ${refund.status}.`);
    if (refund.refund_method !== "bank_transfer")
      throw new BadRequestException("Chỉ refund chuyển khoản mới cần duyệt.");
    if (!dto.proofImageUrl) throw new BadRequestException("Cần cung cấp ảnh bill chuyển khoản.");

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.refund.update({
        where: { id },
        data: { status: dto.status, proof_image_url: dto.proofImageUrl, processed_by: managerId },
      });
      await tx.financialTransaction.create({
        data: { bookingId: refund.bookingId, refundId: id, transactionType: "refund_bank_transfer_approved", amount: Number(refund.amount), note: dto.note ?? `Đã duyệt hoàn cọc chuyển khoản.` },
      });
      return tx.refund.findUnique({
        where: { id },
        include: {
          booking: { select: { id: true, customerId: true, depositTotal: true, penaltyTotal: true, pickupMethod: true, customer: { select: { profile: { select: { fullName: true, phone: true } }, email: true } } } },
        },
      });
    });

    return ok(this.serialize(updated!));
  }

  async findByBooking(bookingId: string) {
    const refunds = await this.prisma.refund.findMany({
      where: { bookingId }, orderBy: { createdAt: "desc" },
      include: {
        booking: { select: { id: true, customerId: true, depositTotal: true, penaltyTotal: true, pickupMethod: true, customer: { select: { profile: { select: { fullName: true, phone: true } }, email: true } } } },
      },
    });
    return ok(refunds.map((r) => this.serialize(r)));
  }

  async findOne(id: string) {
    const refund = await this.prisma.refund.findUnique({
      where: { id },
      include: {
        booking: { select: { id: true, customerId: true, depositTotal: true, penaltyTotal: true, pickupMethod: true, customer: { select: { profile: { select: { fullName: true, phone: true } }, email: true } } } },
      },
    });
    if (!refund) throw new NotFoundException("Refund not found.");
    return ok(this.serialize(refund));
  }

  async findPendingForStaff() {
    const refunds = await this.prisma.refund.findMany({
      where: { status: { in: [PaymentStatus.pending, PaymentStatus.refunding] } }, orderBy: { createdAt: "asc" },
      include: {
        booking: { select: { id: true, customerId: true, depositTotal: true, penaltyTotal: true, pickupMethod: true, customer: { select: { profile: { select: { fullName: true, phone: true } }, email: true } } } },
      },
    });
    return ok(refunds.map((r) => this.serialize(r)));
  }

  async findPendingForManager() {
    const refunds = await this.prisma.refund.findMany({
      where: { status: { in: [PaymentStatus.pending, PaymentStatus.refunding] }, refund_method: "bank_transfer" }, orderBy: { createdAt: "asc" },
      include: {
        booking: { select: { id: true, customerId: true, depositTotal: true, penaltyTotal: true, pickupMethod: true, customer: { select: { profile: { select: { fullName: true, phone: true } }, email: true } } } },
      },
    });
    return ok(refunds.map((r) => this.serialize(r)));
  }

  async findByCustomerBooking(customerId: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException("Booking not found.");
    if (booking.customerId !== customerId) throw new ForbiddenException("Bạn không có quyền xem thông tin hoàn cọc của đơn này.");

    const refunds = await this.prisma.refund.findMany({
      where: { bookingId }, orderBy: { createdAt: "desc" },
      include: { booking: { select: { id: true, depositTotal: true, penaltyTotal: true, pickupMethod: true } } },
    });

    return ok(refunds.map((r) => ({
      id: r.id, bookingId: r.bookingId, amount: Number(r.amount), status: r.status, refundMethod: r.refund_method,
      reason: r.reason, bankName: r.bank_name,
      bankAccountNumber: r.bank_account_number ? `****${r.bank_account_number.slice(-4)}` : null,
      bankAccountHolder: r.bank_account_holder,
      createdAt: r.createdAt.toISOString(), updatedAt: r.updated_at.toISOString(),
    })));
  }

  private serialize(refund: any) {
    return {
      id: refund.id, bookingId: refund.bookingId, amount: Number(refund.amount), status: refund.status,
      refundMethod: refund.refund_method, reason: refund.reason,
      bankName: refund.bank_name, bankAccountNumber: refund.bank_account_number, bankAccountHolder: refund.bank_account_holder,
      proofImageUrl: refund.proof_image_url,
      createdAt: refund.createdAt.toISOString(), updatedAt: refund.updated_at.toISOString(),
      booking: {
        id: refund.booking.id, depositTotal: Number(refund.booking.depositTotal), penaltyTotal: Number(refund.booking.penaltyTotal),
        pickupMethod: refund.booking.pickupMethod,
        customerName: refund.booking.customer?.profile?.fullName ?? refund.booking.customer?.email ?? null,
        customerPhone: refund.booking.customer?.profile?.phone ?? null,
      },
      processedBy: null,
    };
  }
}
