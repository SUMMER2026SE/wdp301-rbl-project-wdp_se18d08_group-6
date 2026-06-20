"use client";

import { useEffect, useState } from "react";
import { StaffPortalShell } from "@/components/heritage/ui";
import {
  getStaffPendingBookings,
  getStaffAllBookings,
  getStaffCompletedRefundBookings,
  advanceBookingStatus,
  markBookingPaid,
  createRefund,
  type StaffBookingResponse,
} from "@/lib/api";

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function formatVND(amount: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft:                { label: "Nháp",                color: "bg-stone-100 text-stone-600" },
  pending_confirmation: { label: "Chờ xác nhận",        color: "bg-amber-100 text-amber-700" },
  confirmed:            { label: "Đã xác nhận",         color: "bg-blue-100 text-blue-700" },
  awaiting_payment:     { label: "Chờ thanh toán",      color: "bg-yellow-100 text-yellow-700" },
  paid:                 { label: "Đã thanh toán",       color: "bg-green-100 text-green-700" },
  preparing:            { label: "Đang chuẩn bị",       color: "bg-purple-100 text-purple-700" },
  ready_for_pickup:     { label: "Sẵn sàng nhận",       color: "bg-teal-100 text-teal-700" },
  delivering:           { label: "Đang giao",           color: "bg-indigo-100 text-indigo-700" },
  renting:              { label: "Đang thuê",           color: "bg-lotus/10 text-lotus" },
  returned:             { label: "Đã trả",              color: "bg-stone-100 text-stone-600" },
  inspection_pending:   { label: "Chờ kiểm tra",        color: "bg-orange-100 text-orange-700" },
  completed:            { label: "Hoàn thành",          color: "bg-jade/10 text-jade" },
  cancelled:            { label: "Đã hủy",              color: "bg-red-100 text-red-600" },
  rejected:             { label: "Từ chối",             color: "bg-red-100 text-red-700" },
  overdue:              { label: "Quá hạn",             color: "bg-red-200 text-red-800" },
};

const NEXT_ACTIONS: Partial<Record<string, { status: string; label: string; style: string }[]>> = {
  pending_confirmation: [
    { status: "confirmed", label: "Xác nhận", style: "bg-lotus text-white hover:bg-oxblood" },
    { status: "rejected",  label: "Từ chối",  style: "border border-red-300 text-red-700 hover:bg-red-50" },
  ],
  confirmed: [
    { status: "awaiting_payment", label: "Chờ thanh toán", style: "bg-lotus text-white hover:bg-oxblood" },
    { status: "cancelled",        label: "Hủy",            style: "border border-red-300 text-red-700 hover:bg-red-50" },
  ],
  awaiting_payment: [
    // "paid" không dùng advanceBookingStatus nữa — staff phải qua dialog mark-paid
  ],
  paid: [
    { status: "preparing", label: "Bắt đầu chuẩn bị", style: "bg-lotus text-white hover:bg-oxblood" },
  ],
  preparing: [
    { status: "ready_for_pickup", label: "Sẵn sàng nhận", style: "bg-lotus text-white hover:bg-oxblood" },
  ],
  ready_for_pickup: [
    { status: "delivering", label: "Đang giao",      style: "bg-lotus text-white hover:bg-oxblood" },
    { status: "renting",    label: "Khách đã nhận",  style: "bg-lotus text-white hover:bg-oxblood" },
  ],
  delivering: [
    { status: "renting", label: "Khách đã nhận", style: "bg-lotus text-white hover:bg-oxblood" },
  ],
  renting: [
    { status: "returned", label: "Khách đã trả",  style: "bg-lotus text-white hover:bg-oxblood" },
    { status: "overdue",  label: "Đánh dấu quá hạn", style: "border border-red-300 text-red-700 hover:bg-red-50" },
  ],
  returned: [
    { status: "inspection_pending", label: "Bắt đầu kiểm tra", style: "bg-lotus text-white hover:bg-oxblood" },
  ],
  // inspection_pending → completed: bị cấm ở staff overview.
  // Việc hoàn tất chỉ được thực hiện qua màn Kiểm tra (/dashboard/staff/inspection).
  overdue: [
    { status: "returned", label: "Khách đã trả", style: "bg-lotus text-white hover:bg-oxblood" },
  ],
};

type Tab = "pending" | "all" | "refunds";

type PaymentDialog = {
  bookingId: string;
  customerName: string | null;
  rentalTotal: number;
  depositTotal: number;
} | null;

const PAYMENT_METHODS: { key: string; label: string; icon: string }[] = [
  { key: "cash", label: "Tiền mặt", icon: "payments" },
  { key: "bank_transfer", label: "Chuyển khoản", icon: "account_balance" },
  { key: "qr_code", label: "QR Code", icon: "qr_code" },
  { key: "pos_card", label: "Thẻ POS", icon: "credit_card" },
];

// Statuses mà item chưa có asset là vấn đề cần báo manager
const ASSET_NEEDED_STATUSES = [
  "confirmed",
  "awaiting_payment",
  "paid",
  "preparing",
];

export default function StaffDashboardPage() {
  const [tab, setTab] = useState<Tab>("pending");
  const [bookings, setBookings] = useState<StaffBookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorDialog, setErrorDialog] = useState<string | null>(null);
  const [paymentDialog, setPaymentDialog] = useState<PaymentDialog>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cash");

  // Refund form state
  const [refundDialog, setRefundDialog] = useState<{
    bookingId: string;
    customerName: string | null;
    pickupMethod: string;
    depositTotal: number;
    penaltyTotal: number;
  } | null>(null);
  const [refundBankName, setRefundBankName] = useState("");
  const [refundBankAccount, setRefundBankAccount] = useState("");
  const [refundBankHolder, setRefundBankHolder] = useState("");

  useEffect(() => {
    setLoading(true);
    setErrorMsg(null);
    let fetcher;
    if (tab === "refunds") {
      fetcher = getStaffCompletedRefundBookings;
    } else {
      fetcher = tab === "pending" ? getStaffPendingBookings : getStaffAllBookings;
    }
    fetcher()
      .then((res) => {
        if (res.success && res.data) setBookings(res.data);
        else setErrorMsg(res.message ?? "Không thể tải danh sách đơn.");
      })
      .finally(() => setLoading(false));
  }, [tab]);

  async function handleAction(id: string, status: string) {
    setActioningId(id);
    setErrorMsg(null);
    const res = await advanceBookingStatus(id, status);
    setActioningId(null);
    if (res.success && res.data) {
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: res.data!.status } : b)),
      );
      if (tab === "pending" && status !== "pending_confirmation") {
        setBookings((prev) => prev.filter((b) => b.id !== id));
      }
    } else {
      // Nếu lỗi liên quan đến asset thì hiển thị popup thay vì banner
      if (res.message?.includes("assigned asset")) {
        setErrorDialog(
          "Không thể chuyển trạng thái vì các món trong đơn chưa được gán tài sản vật lý.\n\n" +
          "Vui lòng báo cho Quản lý / Chủ cửa hàng để gán asset cho từng món hàng trước khi chuyển sang trạng thái này.",
        );
      } else {
        setErrorMsg(res.message ?? "Thao tác thất bại.");
      }
    }
  }

  function openPaymentDialog(booking: StaffBookingResponse) {
    setSelectedPaymentMethod("cash");
    setPaymentDialog({
      bookingId: booking.id,
      customerName: booking.customerName,
      rentalTotal: booking.rentalTotal,
      depositTotal: booking.depositTotal,
    });
  }

  async function handleMarkPaid() {
    if (!paymentDialog) return;
    const id = paymentDialog.bookingId;
    setActioningId(id);
    setErrorMsg(null);
    setPaymentDialog(null);
    const res = await markBookingPaid(id, selectedPaymentMethod);
    setActioningId(null);
    if (res.success && res.data) {
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: res.data!.status } : b)),
      );
    } else {
      setErrorMsg(res.message ?? "Không thể ghi nhận thanh toán.");
    }
  }

  async function handleMarkDeliveryPaid(bookingId: string) {
    setActioningId(bookingId);
    setErrorMsg(null);
    const res = await markBookingPaid(bookingId, "online");
    setActioningId(null);
    if (res.success && res.data) {
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: res.data!.status } : b)),
      );
    } else {
      setErrorMsg(res.message ?? "Không thể xác nhận thanh toán online.");
    }
  }

  function openRefundDialog(booking: StaffBookingResponse & { refunds?: Array<{ id: string; amount: number; status: string; refundMethod: string; createdAt: string; updatedAt: string }> }) {
    setRefundBankName("");
    setRefundBankAccount("");
    setRefundBankHolder("");
    setRefundDialog({
      bookingId: booking.id,
      customerName: booking.customerName,
      pickupMethod: booking.pickupMethod,
      depositTotal: booking.depositTotal,
      penaltyTotal: booking.penaltyTotal ?? 0,
    });
  }

  async function handleCashRefund() {
    if (!refundDialog) return;
    const id = refundDialog.bookingId;
    setActioningId(id);
    setErrorMsg(null);
    setRefundDialog(null);
    const res = await createRefund({
      bookingId: id,
      refundMethod: "cash",
      reason: "Hoàn cọc tiền mặt tại quầy",
    });
    setActioningId(null);
    if (res.success) {
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } else {
      setErrorMsg(res.message ?? "Không thể hoàn cọc.");
    }
  }

  async function handleDirectCashRefund(
    bookingId: string,
    customerName: string | null,
    pickupMethod: string,
    depositTotal: number,
    penaltyTotal: number,
  ) {
    setActioningId(bookingId);
    setErrorMsg(null);
    const res = await createRefund({
      bookingId,
      refundMethod: "cash",
      reason: "Hoàn cọc tiền mặt tại quầy",
    });
    setActioningId(null);
    if (res.success) {
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    } else {
      setErrorMsg(res.message ?? "Không thể hoàn cọc.");
    }
  }

  async function handleBankTransferRefund() {
    if (!refundDialog) return;
    const id = refundDialog.bookingId;
    setActioningId(id);
    setErrorMsg(null);
    setRefundDialog(null);
    const res = await createRefund({
      bookingId: id,
      refundMethod: "bank_transfer",
      reason: "Yêu cầu hoàn cọc chuyển khoản",
      bankName: refundBankName,
      bankAccountNumber: refundBankAccount,
      bankAccountHolder: refundBankHolder,
    });
    setActioningId(null);
    if (res.success) {
      setBookings((prev) =>
        prev.map((b) =>
          b.id === id
            ? {
                ...b,
                refunds: [
                  {
                    id: res.data!.id,
                    amount: res.data!.amount,
                    status: res.data!.status,
                    refundMethod: res.data!.refundMethod,
                    createdAt: res.data!.createdAt,
                    updatedAt: res.data!.updatedAt,
                  },
                ],
              }
            : b,
        ),
      );
    } else {
      setErrorMsg(res.message ?? "Không thể tạo yêu cầu hoàn cọc.");
    }
  }

  const refundAmount = refundDialog
    ? Math.max(0, refundDialog.depositTotal - refundDialog.penaltyTotal)
    : 0;

  const pendingRefundCount = tab === "pending" ? bookings.filter((b) => b.status === "pending_confirmation").length : 0;

  return (
    <StaffPortalShell
      active="overview"
      title="Quản lý đơn thuê"
      subtitle="Xác nhận, theo dõi và điều phối vòng đời đơn thuê trang phục."
    >
      {/* Tab bar */}
      <div className="mb-6 flex gap-2 border-b border-sand">
        <button
          type="button"
          onClick={() => setTab("pending")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] transition border-b-2 -mb-px ${
            tab === "pending"
              ? "border-lotus text-lotus"
              : "border-transparent text-stone-500 hover:text-lotus"
          }`}
        >
          Chờ xác nhận
          {pendingRefundCount > 0 && tab !== "pending" && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-lotus text-xs text-white">
              {pendingRefundCount}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setTab("all")}
          className={`px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] transition border-b-2 -mb-px ${
            tab === "all"
              ? "border-lotus text-lotus"
              : "border-transparent text-stone-500 hover:text-lotus"
          }`}
        >
          Tất cả đơn
        </button>
        <button
          type="button"
          onClick={() => setTab("refunds")}
          className={`px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] transition border-b-2 -mb-px ${
            tab === "refunds"
              ? "border-lotus text-lotus"
              : "border-transparent text-stone-500 hover:text-lotus"
          }`}
        >
          Hoàn cọc
        </button>
      </div>

      {errorMsg && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-stone-400">Đang tải...</div>
      ) : bookings.length === 0 ? (
        <div className="py-20 text-center text-stone-400">
          {tab === "pending" ? "Không có đơn nào đang chờ xác nhận." : tab === "refunds" ? "Không có đơn nào cần hoàn cọc." : "Chưa có đơn nào."}
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const s = STATUS_LABELS[booking.status] ?? { label: booking.status, color: "bg-stone-100 text-stone-600" };
            const actions = NEXT_ACTIONS[booking.status] ?? [];
            const isActioning = actioningId === booking.id;
            const garmentName = booking.items[0]?.garmentName ?? "—";
            const sizeLabel = booking.items[0]?.sizeLabel ?? "—";
            // Refund info for completed bookings
            const refund = (booking as any).refunds?.[0];
            const isRefunded = refund && (refund.status === "refunded" || refund.status === "partially_refunded");
            const isPendingRefund = refund && (refund.status === "pending" || refund.status === "refunding");

            return (
              <div
                key={booking.id}
                className="overflow-hidden rounded-xl border border-sand bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sand bg-[#fff8f6] px-6 py-3">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-ink">#{booking.id.slice(0, 8).toUpperCase()}</span>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${s.color}`}>
                      {s.label}
                    </span>
                    {tab === "refunds" && isRefunded && (
                      <span className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] bg-jade/10 text-jade">
                        Đã hoàn cọc
                      </span>
                    )}
                    {tab === "refunds" && isPendingRefund && (
                      <span className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] bg-yellow-100 text-yellow-700">
                        Chờ duyệt hoàn cọc
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-stone-400">
                    Tạo lúc {new Date(booking.createdAt).toLocaleString("vi-VN")}
                  </span>
                </div>

                <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Khách hàng</p>
                    <p className="mt-1 font-medium text-ink">{booking.customerName ?? "—"}</p>
                    {booking.customerPhone && (
                      <p className="text-sm text-stone-500">{booking.customerPhone}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Trang phục</p>
                    <p className="mt-1 font-medium text-ink">{garmentName}</p>
                    <p className="text-sm text-stone-500">Size: {sizeLabel}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Thời gian thuê</p>
                    <p className="mt-1 font-medium text-ink">
                      {formatDate(booking.rentalStartDate)} – {formatDate(booking.rentalEndDate)}
                    </p>
                    <p className="text-sm text-stone-500">{booking.days} ngày</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Hoàn cọc</p>
                    <p className="mt-1 font-medium text-ink">
                      Cọc: {formatVND(booking.depositTotal)}
                    </p>
                    <p className="text-sm text-stone-500">
                      Phạt: {formatVND(booking.penaltyTotal ?? 0)} → Hoàn: <span className="font-semibold text-jade">{formatVND(Math.max(0, booking.depositTotal - (booking.penaltyTotal ?? 0)))}</span>
                    </p>
                    {refund && (
                      <p className="mt-1 text-xs text-stone-400">
                        {refund.refundMethod === "cash" ? "Tiền mặt" : "Chuyển khoản"} · {refund.status === "refunded" ? "Đã hoàn" : refund.status === "pending" ? "Chờ duyệt" : refund.status}
                      </p>
                    )}
                  </div>
                </div>

                {/* Cảnh báo: item chưa có asset — staff không có quyền gán, phải báo manager */}
                {tab !== "refunds" && ASSET_NEEDED_STATUSES.includes(booking.status) && booking.items.some((item) => !item.garmentAssetId) && (
                  <div className="border-t border-amber-200 bg-amber-50/70 px-6 py-4">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined mt-0.5 text-amber-600 text-xl">warning</span>
                      <div>
                        <p className="text-sm font-semibold text-amber-700">
                          Cần gán tài sản — vui lòng báo Quản lý
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-amber-600">
                          Các item dưới đây chưa được gán tài sản vật lý. Việc gán asset thuộc quyền của{" "}
                          <strong>Quản lý / Chủ cửa hàng</strong> (manager_owner).
                          Nhân viên không thể tự gán. Vui lòng thông báo cho quản lý để gán asset trước khi chuyển trạng thái tiếp theo.
                        </p>
                        <ul className="mt-2 space-y-1">
                          {booking.items.filter((item) => !item.garmentAssetId).map((item) => (
                            <li key={item.id} className="text-xs text-amber-600 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">inventory_2</span>
                              {item.garmentName ?? "Trang phục"}
                              {item.sizeLabel ? ` (${item.sizeLabel})` : ""}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions bar */}
                {tab === "refunds" ? (
                  !isRefunded && (
                    <div className="flex flex-wrap justify-end gap-2 border-t border-sand px-6 py-4">
                      {isPendingRefund ? (
                        <div className="rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-2 text-sm text-yellow-700">
                          <span className="material-symbols-outlined text-base mr-1 align-middle">schedule</span>
                          {refund.refundMethod === "bank_transfer"
                            ? "Đã gửi yêu cầu hoàn cọc — chờ Quản lý duyệt chuyển khoản"
                            : "Đang chờ xử lý hoàn cọc"}
                        </div>
                      ) : (
                        <>
                          {booking.pickupMethod === "delivery" ? (
                            <button
                              type="button"
                              disabled={isActioning}
                              onClick={() => openRefundDialog(booking as any)}
                              className="rounded-lg bg-lotus px-4 py-2 text-sm font-semibold text-white transition hover:bg-oxblood disabled:opacity-50"
                            >
                              {isActioning ? "Đang xử lý..." : "Tạo yêu cầu hoàn cọc (chuyển khoản)"}
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={isActioning}
                              onClick={() => {
                                setRefundDialog({
                                  bookingId: booking.id,
                                  customerName: booking.customerName,
                                  pickupMethod: booking.pickupMethod,
                                  depositTotal: booking.depositTotal,
                                  penaltyTotal: booking.penaltyTotal ?? 0,
                                });
                                handleCashRefund();
                              }}
                              className="rounded-lg bg-jade px-4 py-2 text-sm font-semibold text-white transition hover:bg-forest disabled:opacity-50"
                            >
                              {isActioning ? "Đang xử lý..." : `Hoàn cọc tiền mặt (${formatVND(Math.max(0, booking.depositTotal - (booking.penaltyTotal ?? 0)))})`}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )
                ) : (
                  (actions.length > 0 || booking.status === "awaiting_payment") && (
                  <div className="flex flex-wrap justify-end gap-2 border-t border-sand px-6 py-4">
                    {/* Nút "Đã thanh toán" cho awaiting_payment */}
                    {booking.status === "awaiting_payment" && (
                      booking.pickupMethod === "delivery" ? (
                        <button
                          type="button"
                          disabled={isActioning}
                          onClick={() => handleMarkDeliveryPaid(booking.id)}
                          className="rounded-lg bg-jade px-4 py-2 text-sm font-semibold text-white transition hover:bg-forest disabled:opacity-50"
                        >
                          {isActioning ? "Đang xử lý..." : `Xác nhận đã nhận tiền online (${formatVND(booking.rentalTotal + booking.depositTotal)})`}
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={isActioning}
                          onClick={() => openPaymentDialog(booking)}
                          className="rounded-lg bg-jade px-4 py-2 text-sm font-semibold text-white transition hover:bg-forest disabled:opacity-50"
                        >
                          {isActioning ? "Đang xử lý..." : `Đã thanh toán (${formatVND(booking.rentalTotal + booking.depositTotal)})`}
                        </button>
                      )
                    )}
                    {actions.map((action) => (
                      <button
                        key={action.status}
                        type="button"
                        disabled={isActioning}
                        onClick={() => handleAction(booking.id, action.status)}
                        className={`rounded-lg px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${action.style}`}
                      >
                        {isActioning ? "Đang xử lý..." : action.label}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Refund dialog (for bank_transfer) ── */}
      {refundDialog && refundDialog.pickupMethod === "delivery" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl border border-sand bg-white p-8 shadow-2xl">
            <h3 className="font-display text-2xl text-ink">Yêu cầu hoàn cọc chuyển khoản</h3>
            <p className="mt-1 text-sm text-stone-500">
              Khách: <strong>{refundDialog.customerName ?? "—"}</strong>
            </p>

            <div className="mt-6 rounded-xl bg-[#f9fff8] border border-jade/30 p-4">
              <div className="flex justify-between text-sm">
                <span className="text-stone-600">Tiền cọc</span>
                <span className="font-semibold text-ink">{formatVND(refundDialog.depositTotal)}</span>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-stone-600">Phí phạt</span>
                <span className="font-semibold text-red-700">-{formatVND(refundDialog.penaltyTotal)}</span>
              </div>
              <div className="mt-3 border-t border-jade/30 pt-3 flex justify-between text-base">
                <span className="font-semibold text-ink">Tiền hoàn</span>
                <span className="font-bold text-jade">{formatVND(refundAmount)}</span>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-stone-500">Tên ngân hàng</label>
                <input
                  className="w-full rounded-lg border border-sand px-3 py-2 text-sm outline-none focus:border-antique"
                  placeholder="VD: Vietcombank, MB Bank..."
                  value={refundBankName}
                  onChange={(e) => setRefundBankName(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-stone-500">Số tài khoản</label>
                <input
                  className="w-full rounded-lg border border-sand px-3 py-2 text-sm outline-none focus:border-antique"
                  placeholder="Nhập số tài khoản khách"
                  value={refundBankAccount}
                  onChange={(e) => setRefundBankAccount(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-stone-500">Chủ tài khoản</label>
                <input
                  className="w-full rounded-lg border border-sand px-3 py-2 text-sm outline-none focus:border-antique"
                  placeholder="Tên chủ tài khoản"
                  value={refundBankHolder}
                  onChange={(e) => setRefundBankHolder(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setRefundDialog(null)}
                className="rounded-lg border border-sand px-5 py-2.5 text-sm font-semibold text-stone-600 transition hover:bg-stone-50"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={actioningId === refundDialog.bookingId || !refundBankName.trim() || !refundBankAccount.trim() || !refundBankHolder.trim()}
                onClick={handleBankTransferRefund}
                className="rounded-lg bg-lotus px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-oxblood disabled:opacity-50"
              >
                {actioningId === refundDialog.bookingId ? "Đang xử lý..." : "Gửi yêu cầu hoàn cọc"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Payment method dialog ── */}
      {paymentDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl border border-sand bg-white p-8 shadow-2xl">
            <h3 className="font-display text-2xl text-ink">Xác nhận thanh toán</h3>
            <p className="mt-1 text-sm text-stone-500">
              Khách: <strong>{paymentDialog.customerName ?? "—"}</strong>
            </p>

            <div className="mt-6 rounded-xl bg-[#f9fff8] border border-jade/30 p-4">
              <div className="flex justify-between text-sm">
                <span className="text-stone-600">Tiền thuê</span>
                <span className="font-semibold text-ink">{formatVND(paymentDialog.rentalTotal)}</span>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-stone-600">Tiền cọc</span>
                <span className="font-semibold text-ink">{formatVND(paymentDialog.depositTotal)}</span>
              </div>
              <div className="mt-3 border-t border-jade/30 pt-3 flex justify-between text-base">
                <span className="font-semibold text-ink">Tổng thu</span>
                <span className="font-bold text-jade">
                  {formatVND(paymentDialog.rentalTotal + paymentDialog.depositTotal)}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <label className="mb-3 block text-sm font-semibold uppercase tracking-[0.16em] text-stone-500">
                Phương thức thanh toán
              </label>
              <div className="grid grid-cols-2 gap-3">
                {PAYMENT_METHODS.map((pm) => (
                  <button
                    key={pm.key}
                    type="button"
                    onClick={() => setSelectedPaymentMethod(pm.key)}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-sm font-medium transition ${
                      selectedPaymentMethod === pm.key
                        ? "border-lotus bg-[#fff0ee] text-lotus"
                        : "border-sand bg-white text-stone-600 hover:bg-[#fff8f6]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-xl">{pm.icon}</span>
                    {pm.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPaymentDialog(null)}
                className="rounded-lg border border-sand px-5 py-2.5 text-sm font-semibold text-stone-600 transition hover:bg-stone-50"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={actioningId === paymentDialog.bookingId}
                onClick={handleMarkPaid}
                className="rounded-lg bg-jade px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-forest disabled:opacity-50"
              >
                {actioningId === paymentDialog.bookingId ? "Đang xử lý..." : "Xác nhận đã thu tiền"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Error popup dialog ── */}
      {errorDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl border border-sand bg-white p-8 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <span className="material-symbols-outlined text-5xl text-amber-500 mb-4">warning</span>
              <h3 className="font-display text-2xl text-ink">Không thể chuyển trạng thái</h3>
              <p className="mt-4 text-sm leading-relaxed text-stone-600 whitespace-pre-line">
                {errorDialog}
              </p>
              <div className="mt-6 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-left w-full">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-[0.14em] mb-1">Gợi ý</p>
                <p className="text-xs leading-relaxed text-amber-600">
                  Quay lại tab <strong>&quot;Tất cả đơn&quot;</strong>, tìm đơn này và kiểm tra cột trạng thái. Nếu thấy cảnh báo màu vàng, hãy báo cho Quản lý để gán tài sản.
                </p>
              </div>
            </div>
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => setErrorDialog(null)}
                className="rounded-lg bg-lotus px-8 py-2.5 text-sm font-semibold text-white transition hover:bg-oxblood"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </StaffPortalShell>
  );
}
