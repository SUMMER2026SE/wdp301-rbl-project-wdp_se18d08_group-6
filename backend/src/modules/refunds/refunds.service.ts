import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { BookingStatus, PaymentStatus, Prisma } from "@prisma/client";
import { ok } from "../../common/api-response";
import { PrismaService } from "../../prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import type { CreateRefundDto } from "./dto/create-refund.dto";
import type { UpdateRefundStatusDto } from "./dto/update-refund.dto";

@Injectable()
export class RefundsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

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
    if (booking.status !== BookingStatus.refund_pending && booking.status !== BookingStatus.completed)
      throw new BadRequestException("Chỉ có thể hoàn cọc cho đơn đã kiểm tra xong.");

    // Chặn hoàn cọc 2 lần: đơn đã có refund thành công thì không được tạo thêm.
    const alreadyRefunded = booking.refunds.find(
      (r) => r.status === PaymentStatus.refunded || r.status === PaymentStatus.partially_refunded,
    );
    if (alreadyRefunded) throw new BadRequestException("Đơn này đã được hoàn cọc trước đó.");

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

    let refund;
    try {
      refund = await this.prisma.$transaction(async (tx) => {
      // Mọi yêu cầu hoàn cọc (kể cả tiền mặt) đều ở trạng thái pending,
      // chờ owner/manager duyệt thì tiền mới được ghi nhận đã hoàn.
      const created = await tx.refund.create({
        data: {
          bookingId: dto.bookingId, paymentId, amount,
          status: PaymentStatus.pending,
          refund_method: dto.refundMethod, reason: dto.reason ?? null,
          bank_name: dto.bankName ?? null, bank_account_number: dto.bankAccountNumber ?? null, bank_account_holder: dto.bankAccountHolder ?? null,
          processed_by: staffId,
        },
      });

      const txType = isCash ? "refund_cash_pending" : "refund_bank_transfer_pending";
      await tx.financialTransaction.create({
        data: { bookingId: dto.bookingId, refundId: created.id, transactionType: txType, amount, note: `Yêu cầu hoàn cọc ${dto.refundMethod === "cash" ? "tiền mặt" : "chuyển khoản"}. Số tiền: ${amount.toLocaleString("vi-VN")}đ` },
      });

      return tx.refund.findUnique({
        where: { id: created.id },
        include: {
          booking: {
            select: {
              id: true, customerId: true, depositTotal: true, penaltyTotal: true, pickupMethod: true,
              customer: { select: { profile: { select: { fullName: true, phone: true } }, email: true } },
              items: { select: { id: true, garment_sizes: { select: { size_label: true, garments: { select: { name: true, images: { orderBy: { sortOrder: "asc" }, take: 1, select: { imageUrl: true } } } } } } } },
            },
          },
        },
      });
      });
    } catch (e) {
      // Unique index refunds_booking_active_unique: 2 request tạo refund cùng lúc
      // cho 1 đơn thì request đến sau bị DB từ chối.
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        throw new BadRequestException("Đơn này đã có yêu cầu hoàn cọc (thao tác trùng lặp).");
      }
      throw e;
    }

    return ok(this.serialize(refund!));
  }

  // Đơn ở bước "Chờ hoàn cọc" nhưng phạt >= cọc (vd phạt cộng thêm sau kiểm tra)
  // → không có gì để hoàn, cho phép staff đóng đơn về "Hoàn tất" không tạo refund.
  async closeWithoutRefund(bookingId: string, staffId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { refunds: true },
    });
    if (!booking) throw new NotFoundException("Booking not found.");
    if (booking.status !== BookingStatus.refund_pending)
      throw new BadRequestException("Chỉ đóng được đơn đang ở trạng thái chờ hoàn cọc.");

    const refundAmount = Number(booking.depositTotal) - Number(booking.penaltyTotal);
    if (refundAmount > 0)
      throw new BadRequestException("Đơn vẫn còn tiền cọc phải hoàn — hãy tạo yêu cầu hoàn cọc.");

    const activeRefund = booking.refunds.find(
      (r) => r.status === PaymentStatus.pending || r.status === PaymentStatus.refunding,
    );
    if (activeRefund) throw new BadRequestException("Đơn đang có yêu cầu hoàn cọc chờ xử lý.");

    await this.prisma.$transaction([
      this.prisma.booking.update({ where: { id: bookingId }, data: { status: BookingStatus.completed } }),
      this.prisma.bookingStatusHistory.create({
        data: {
          bookingId,
          fromStatus: BookingStatus.refund_pending,
          toStatus: BookingStatus.completed,
          changedBy: staffId,
          note: "Phạt ≥ cọc — hoàn tất, không hoàn cọc",
        },
      }),
    ]);

    void this.notificationsService.notifyUser({
      userId: booking.customerId,
      templateKey: "refund.closed_no_refund",
      data: { bookingId, bookingCode: bookingId.slice(0, 8).toUpperCase() },
    }).catch(() => {});

    return ok({ bookingId, status: BookingStatus.completed });
  }

  // Staff/manager huỷ một yêu cầu hoàn cọc còn đang chờ duyệt — dùng khi số tiền
  // không còn khớp (phạt đổi sau khi tạo yêu cầu) hoặc yêu cầu tạo nhầm.
  // Sau khi reject, có thể tạo lại yêu cầu hoàn cọc mới với số tiền đúng.
  async reject(id: string, staffId: string, reason?: string) {
    const refund = await this.prisma.refund.findUnique({ where: { id } });
    if (!refund) throw new NotFoundException("Refund not found.");
    if (refund.status !== PaymentStatus.pending && refund.status !== PaymentStatus.refunding)
      throw new BadRequestException(`Không thể từ chối yêu cầu hoàn cọc ở trạng thái: ${refund.status}.`);

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.refund.update({
        where: { id },
        data: { status: PaymentStatus.cancelled, processed_by: staffId },
      });
      await tx.financialTransaction.create({
        data: {
          bookingId: refund.bookingId, refundId: id,
          transactionType: "refund_rejected",
          amount: 0,
          note: reason ?? "Đã từ chối yêu cầu hoàn cọc.",
        },
      });
      return result;
    });

    return ok({ id: updated.id, status: updated.status });
  }

  async approve(id: string, dto: UpdateRefundStatusDto, managerId: string) {
    const refund = await this.prisma.refund.findUnique({ where: { id }, include: { booking: true } });
    if (!refund) throw new NotFoundException("Refund not found.");
    if (refund.status !== PaymentStatus.pending && refund.status !== PaymentStatus.refunding)
      throw new BadRequestException(`Không thể duyệt hoàn cọc ở trạng thái: ${refund.status}.`);
    const isBankTransfer = refund.refund_method === "bank_transfer";
    if (isBankTransfer && !dto.proofImageUrl) throw new BadRequestException("Cần cung cấp ảnh bill chuyển khoản.");

    // Số tiền hoàn được chốt lúc TẠO yêu cầu, nhưng phạt của đơn có thể đổi
    // sau đó (vd phát hiện hư hỏng thêm). Tính lại từ dữ liệu hiện tại của đơn
    // trước khi duyệt, không tin mù số tiền đã đóng băng.
    const liveDeposit = Number(refund.booking.depositTotal);
    const livePenalty = Number(refund.booking.penaltyTotal);
    const liveRefundAmount = Math.max(0, liveDeposit - livePenalty);
    const frozenAmount = Number(refund.amount);

    if (liveRefundAmount <= 0) {
      // Phạt đã tăng lên >= cọc sau khi yêu cầu được tạo → không còn gì để hoàn.
      // Tự huỷ yêu cầu này để không kẹt hàng đợi, staff dùng "Đóng đơn — không hoàn cọc".
      await this.prisma.$transaction(async (tx) => {
        await tx.refund.update({ where: { id }, data: { status: PaymentStatus.cancelled, processed_by: managerId } });
        await tx.financialTransaction.create({
          data: {
            bookingId: refund.bookingId, refundId: id, transactionType: "refund_rejected", amount: 0,
            note: "Tự động huỷ: phạt hiện tại đã bằng hoặc vượt tiền cọc, không còn gì để hoàn.",
          },
        });
      });
      throw new BadRequestException(
        "Tiền phạt của đơn đã tăng lên bằng hoặc vượt tiền cọc kể từ lúc tạo yêu cầu này — yêu cầu đã bị huỷ tự động. " +
        "Vào màn Hoàn cọc của nhân viên và dùng nút \"Đóng đơn — không hoàn cọc\" để hoàn tất đơn.",
      );
    }

    if (Math.round(liveRefundAmount) !== Math.round(frozenAmount)) {
      throw new BadRequestException(
        `Số tiền hoàn đã thay đổi kể từ lúc tạo yêu cầu (lúc tạo: ${frozenAmount.toLocaleString("vi-VN")}đ, hiện tại: ${liveRefundAmount.toLocaleString("vi-VN")}đ) ` +
        `do tiền phạt của đơn đã cập nhật. Vui lòng từ chối yêu cầu này rồi tạo lại yêu cầu hoàn cọc mới để lấy đúng số tiền.`,
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.refund.update({
        where: { id },
        data: { status: dto.status, proof_image_url: dto.proofImageUrl ?? null, processed_by: managerId },
      });
      await tx.financialTransaction.create({
        data: {
          bookingId: refund.bookingId, refundId: id,
          transactionType: isBankTransfer ? "refund_bank_transfer_approved" : "refund_cash",
          amount: Number(refund.amount),
          note: dto.note ?? `Đã duyệt hoàn cọc ${isBankTransfer ? "chuyển khoản" : "tiền mặt"}.`,
        },
      });

      // Duyệt hoàn cọc xong → đơn mới thực sự hoàn tất.
      if (
        (dto.status === PaymentStatus.refunded || dto.status === PaymentStatus.partially_refunded) &&
        refund.booking.status === BookingStatus.refund_pending
      ) {
        await tx.booking.update({ where: { id: refund.bookingId }, data: { status: BookingStatus.completed } });
        await tx.bookingStatusHistory.create({
          data: { bookingId: refund.bookingId, fromStatus: BookingStatus.refund_pending, toStatus: BookingStatus.completed, changedBy: managerId, note: "Đã duyệt hoàn cọc" },
        });
      }
      return tx.refund.findUnique({
        where: { id },
        include: {
          booking: {
            select: {
              id: true, customerId: true, depositTotal: true, penaltyTotal: true, pickupMethod: true,
              customer: { select: { profile: { select: { fullName: true, phone: true } }, email: true } },
              items: { select: { id: true, garment_sizes: { select: { size_label: true, garments: { select: { name: true, images: { orderBy: { sortOrder: "asc" }, take: 1, select: { imageUrl: true } } } } } } } },
            },
          },
        },
      });
    });

    // Báo cho khách biết cọc đã được hoàn — không chặn response nếu gửi lỗi.
    void this.notificationsService.notifyUser({
      userId: refund.booking.customerId,
      templateKey: "refund.approved",
      data: {
        bookingId: refund.bookingId,
        bookingCode: refund.bookingId.slice(0, 8).toUpperCase(),
        amount: Number(refund.amount).toLocaleString("vi-VN") + "đ",
        refundMethodLabel: isBankTransfer ? "chuyển khoản" : "tiền mặt",
      },
    }).catch(() => {});

    return ok(this.serialize(updated!));
  }

  async findByBooking(bookingId: string) {
    const refunds = await this.prisma.refund.findMany({
      where: { bookingId }, orderBy: { createdAt: "desc" },
      include: {
        booking: {
          select: {
            id: true, customerId: true, depositTotal: true, penaltyTotal: true, pickupMethod: true,
            customer: { select: { profile: { select: { fullName: true, phone: true } }, email: true } },
            items: { select: { id: true, garment_sizes: { select: { size_label: true, garments: { select: { name: true, images: { orderBy: { sortOrder: "asc" }, take: 1, select: { imageUrl: true } } } } } } } },
          },
        },
      },
    });
    return ok(refunds.map((r) => this.serialize(r)));
  }

  async findOne(id: string) {
    const refund = await this.prisma.refund.findUnique({
      where: { id },
      include: {
        booking: {
          select: {
            id: true, customerId: true, depositTotal: true, penaltyTotal: true, pickupMethod: true,
            customer: { select: { profile: { select: { fullName: true, phone: true } }, email: true } },
            items: { select: { id: true, garment_sizes: { select: { size_label: true, garments: { select: { name: true, images: { orderBy: { sortOrder: "asc" }, take: 1, select: { imageUrl: true } } } } } } } },
          },
        },
      },
    });
    if (!refund) throw new NotFoundException("Refund not found.");
    return ok(this.serialize(refund));
  }

  async findPendingForStaff() {
    const refunds = await this.prisma.refund.findMany({
      where: { status: { in: [PaymentStatus.pending, PaymentStatus.refunding] } }, orderBy: { createdAt: "asc" },
      include: {
        booking: {
          select: {
            id: true, customerId: true, depositTotal: true, penaltyTotal: true, pickupMethod: true,
            customer: { select: { profile: { select: { fullName: true, phone: true } }, email: true } },
            items: { select: { id: true, garment_sizes: { select: { size_label: true, garments: { select: { name: true, images: { orderBy: { sortOrder: "asc" }, take: 1, select: { imageUrl: true } } } } } } } },
          },
        },
      },
    });
    return ok(refunds.map((r) => this.serialize(r)));
  }

  async findPendingForManager() {
    const refunds = await this.prisma.refund.findMany({
      where: { status: { in: [PaymentStatus.pending, PaymentStatus.refunding] } }, orderBy: { createdAt: "desc" },
      include: {
        booking: {
          select: {
            id: true, customerId: true, depositTotal: true, penaltyTotal: true, pickupMethod: true,
            customer: { select: { profile: { select: { fullName: true, phone: true } }, email: true } },
            items: { select: { id: true, garment_sizes: { select: { size_label: true, garments: { select: { name: true, images: { orderBy: { sortOrder: "asc" }, take: 1, select: { imageUrl: true } } } } } } } },
          },
        },
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
      proofImageUrl: r.proof_image_url,
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
        customerId: refund.booking.customerId ?? null,
        customerName: refund.booking.customer?.profile?.fullName ?? refund.booking.customer?.email ?? null,
        customerPhone: refund.booking.customer?.profile?.phone ?? null,
        items: (refund.booking.items ?? []).map((item: any) => ({
          id: item.id,
          garmentName: item.garment_sizes?.garments?.name ?? null,
          sizeLabel: item.garment_sizes?.size_label ?? null,
          imageUrl: item.garment_sizes?.garments?.images?.[0]?.imageUrl ?? null,
        })),
      },
      processedBy: null,
    };
  }
}
