"use client";

import { useEffect, useState } from "react";
import { StaffPortalShell } from "@/components/heritage/ui";
import {
  getStaffPendingBookings,
  getStaffAllBookings,
  advanceBookingStatus,
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
    { status: "paid", label: "Đánh dấu đã thanh toán", style: "bg-lotus text-white hover:bg-oxblood" },
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
  inspection_pending: [
    { status: "completed", label: "Hoàn thành", style: "bg-jade text-white hover:bg-forest" },
  ],
  overdue: [
    { status: "returned", label: "Khách đã trả", style: "bg-lotus text-white hover:bg-oxblood" },
  ],
};

type Tab = "pending" | "all";

export default function StaffDashboardPage() {
  const [tab, setTab] = useState<Tab>("pending");
  const [bookings, setBookings] = useState<StaffBookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setErrorMsg(null);
    const fetcher = tab === "pending" ? getStaffPendingBookings : getStaffAllBookings;
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
      setErrorMsg(res.message ?? "Thao tác thất bại.");
    }
  }

  const pendingCount = bookings.filter((b) => b.status === "pending_confirmation").length;

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
          {pendingCount > 0 && tab !== "pending" && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-lotus text-xs text-white">
              {pendingCount}
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
          {tab === "pending" ? "Không có đơn nào đang chờ xác nhận." : "Chưa có đơn nào."}
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const s = STATUS_LABELS[booking.status] ?? { label: booking.status, color: "bg-stone-100 text-stone-600" };
            const actions = NEXT_ACTIONS[booking.status] ?? [];
            const isActioning = actioningId === booking.id;
            const garmentName = booking.items[0]?.garmentName ?? "—";
            const sizeLabel = booking.items[0]?.sizeLabel ?? "—";

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
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Thanh toán</p>
                    <p className="mt-1 font-medium text-ink">{formatVND(booking.rentalTotal)}</p>
                    <p className="text-sm text-stone-500">Cọc: {formatVND(booking.depositTotal)}</p>
                  </div>
                </div>

                {actions.length > 0 && (
                  <div className="flex flex-wrap justify-end gap-2 border-t border-sand px-6 py-4">
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
                )}
              </div>
            );
          })}
        </div>
      )}
    </StaffPortalShell>
  );
}
