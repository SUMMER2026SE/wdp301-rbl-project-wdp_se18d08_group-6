"use client";

import { useEffect, useState } from "react";
import {
  getStaffAllBookings,
  getAvailableAssets,
  assignAssetToBookingItem,
  type StaffBookingResponse,
  type AvailableAsset,
} from "@/lib/api";

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function formatVND(amount: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
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
};

type AssetAssignState = Record<string, {
  assets: AvailableAsset[];
  loading: boolean;
  selected: string;
  open: boolean;
}>;

type Tab = "assets" | "catalog" | "finance";

export default function ManagerDashboardPage() {
  const [tab, setTab] = useState<Tab>("assets");
  const [bookings, setBookings] = useState<StaffBookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [assetAssignState, setAssetAssignState] = useState<AssetAssignState>({});

  useEffect(() => {
    setLoading(true);
    setErrorMsg(null);
    getStaffAllBookings()
      .then((res) => {
        if (res.success && res.data) setBookings(res.data);
        else setErrorMsg(res.message ?? "Không thể tải danh sách đơn.");
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Asset assignment helpers ──

  async function openAssetPicker(itemKey: string, garmentId: string) {
    setAssetAssignState((prev) => ({
      ...prev,
      [itemKey]: { assets: [], loading: true, selected: "", open: true },
    }));
    const res = await getAvailableAssets(garmentId);
    if (res.success && res.data) {
      const data = res.data;
      setAssetAssignState((prev) => ({
        ...prev,
        [itemKey]: {
          assets: data,
          loading: false,
          selected: data.length > 0 ? data[0].id : "",
          open: true,
        },
      }));
    } else {
      setAssetAssignState((prev) => ({
        ...prev,
        [itemKey]: { assets: [], loading: false, selected: "", open: true },
      }));
    }
  }

  async function handleAssignAsset(bookingId: string, itemId: string, itemKey: string) {
    const state = assetAssignState[itemKey];
    if (!state?.selected) return;
    setActioningId(bookingId);
    setErrorMsg(null);
    const res = await assignAssetToBookingItem(bookingId, itemId, state.selected);
    setActioningId(null);
    if (res.success) {
      const listRes = await getStaffAllBookings();
      if (listRes.success && listRes.data) setBookings(listRes.data);
      setAssetAssignState((prev) => {
        const next = { ...prev };
        delete next[itemKey];
        return next;
      });
    } else {
      setErrorMsg(res.message ?? "Không thể gán tài sản.");
    }
  }

  function closeAssetPicker(itemKey: string) {
    setAssetAssignState((prev) => {
      const next = { ...prev };
      delete next[itemKey];
      return next;
    });
  }

  // Lọc booking có item chưa có asset
  const bookingsNeedingAssets = bookings.filter((b) =>
    ["confirmed", "awaiting_payment", "paid", "preparing"].includes(b.status) &&
    b.items.some((item) => !item.garmentAssetId)
  );

  // Tổng quan tài chính
  const activeBookings = bookings.filter((b) =>
    ["renting", "returned", "inspection_pending", "ready_for_pickup", "delivering"].includes(b.status)
  );
  const totalRentalRevenue = bookings
    .filter((b) => b.status === "completed" || b.status === "renting" || b.status === "returned" || b.status === "inspection_pending")
    .reduce((sum, b) => sum + b.rentalTotal, 0);
  const totalDepositHeld = activeBookings.reduce((sum, b) => sum + b.depositTotal, 0);
  const totalPenalties = bookings
    .filter((b) => (b.penaltyTotal ?? 0) > 0)
    .reduce((sum, b) => sum + (b.penaltyTotal ?? 0), 0);

  return (
    <div className="min-h-screen bg-[#f9f5f0]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
        {/* Header */}
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-jade">Quản lý / Chủ cửa hàng</p>
          <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">Khu vực điều hành</h1>
          <p className="mt-2 text-base text-stone-600">Quản lý catalog, kiểm kê tài sản và đối soát tài chính.</p>
        </div>

        {/* Tab bar */}
        <div className="mb-8 flex gap-2 border-b border-sand">
          {([
            { key: "assets" as const, label: "Gán tài sản", icon: "inventory_2", count: bookingsNeedingAssets.length },
            { key: "catalog" as const, label: "Catalog", icon: "apparel", count: 0 },
            { key: "finance" as const, label: "Tài chính", icon: "finance", count: 0 },
          ]).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key as Tab)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] transition border-b-2 -mb-px ${
                tab === t.key
                  ? "border-jade text-jade"
                  : "border-transparent text-stone-500 hover:text-jade"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
              {t.label}
              {t.count > 0 && tab !== t.key && (
                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-xs text-white">
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {errorMsg && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-stone-400">Đang tải dữ liệu...</div>
        ) : tab === "assets" ? (
          /* ── TAB: Gán tài sản ── */
          <div className="space-y-6">
            {bookingsNeedingAssets.length === 0 ? (
              <div className="py-20 text-center text-stone-400">
                <span className="material-symbols-outlined text-5xl text-stone-200 mb-4 block">check_circle</span>
                Tất cả đơn đều đã được gán tài sản. Không có gì cần xử lý.
              </div>
            ) : (
              bookingsNeedingAssets.map((booking) => {
                const s = STATUS_LABELS[booking.status] ?? { label: booking.status, color: "bg-stone-100 text-stone-600" };
                const unassignedItems = booking.items.filter((item) => !item.garmentAssetId);
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
                        {booking.customerName ?? "—"} · {formatDate(booking.rentalStartDate)} – {formatDate(booking.rentalEndDate)}
                      </span>
                    </div>

                    {/* Items needing assets */}
                    <div className="px-6 py-4 space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">warning</span>
                        {unassignedItems.length} item chưa gán tài sản
                      </p>
                      {unassignedItems.map((item) => {
                        const itemKey = `${booking.id}-${item.id}`;
                        const state = assetAssignState[itemKey];
                        return (
                          <div key={itemKey} className="flex items-center gap-4 rounded-lg border border-amber-200 bg-amber-50/50 p-4">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-ink">
                                {item.garmentName ?? "Trang phục"}
                                {item.sizeLabel && <span className="ml-1 text-stone-500">({item.sizeLabel})</span>}
                              </p>
                              <div className="mt-1 flex gap-4 text-xs text-stone-500">
                                <span>{formatVND(item.dailyPrice)}/ngày</span>
                                <span>Cọc: {formatVND(item.depositAmount)}</span>
                              </div>
                            </div>

                            {!state?.open ? (
                              <button
                                type="button"
                                className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
                                onClick={() => openAssetPicker(itemKey, item.garmentId)}
                              >
                                <span className="material-symbols-outlined text-[16px] align-middle mr-1">add</span>
                                Gán tài sản
                              </button>
                            ) : state.loading ? (
                              <span className="text-sm text-stone-400">Đang tải...</span>
                            ) : state.assets.length === 0 ? (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-red-600 font-medium">Hết tài sản khả dụng</span>
                                <button
                                  type="button"
                                  className="text-sm text-stone-500 underline"
                                  onClick={() => closeAssetPicker(itemKey)}
                                >
                                  Đóng
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3">
                                <select
                                  className="min-w-[200px] rounded-lg border border-sand bg-white px-3 py-2 text-sm outline-none focus:border-antique"
                                  value={state.selected}
                                  onChange={(e) =>
                                    setAssetAssignState((prev) => ({
                                      ...prev,
                                      [itemKey]: { ...prev[itemKey], selected: e.target.value },
                                    }))
                                  }
                                  aria-label="Chọn tài sản"
                                >
                                  {state.assets.map((a) => (
                                    <option key={a.id} value={a.id}>
                                      {a.assetCode} {a.conditionNote ? `— ${a.conditionNote}` : ""}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  type="button"
                                  disabled={actioningId === booking.id}
                                  className="rounded-lg bg-jade px-4 py-2 text-sm font-semibold text-white transition hover:bg-forest disabled:opacity-50"
                                  onClick={() => handleAssignAsset(booking.id, item.id, itemKey)}
                                >
                                  {actioningId === booking.id ? "..." : "Xác nhận gán"}
                                </button>
                                <button
                                  type="button"
                                  className="text-sm text-stone-500 underline"
                                  onClick={() => closeAssetPicker(itemKey)}
                                >
                                  Hủy
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : tab === "catalog" ? (
          /* ── TAB: Catalog ── */
          <div className="rounded-xl border border-sand bg-white p-10 text-center shadow-sm">
            <span className="material-symbols-outlined text-5xl text-stone-200 mb-4 block">apparel</span>
            <h3 className="font-display text-2xl text-ink">Quản lý Catalog</h3>
            <p className="mt-2 text-stone-500">
              Module quản lý danh mục sản phẩm, giá thuê, tiền cọc, và trạng thái hoạt động của từng mẫu trang phục.
            </p>
            <p className="mt-2 text-sm text-stone-400">(Đang phát triển — sẽ triển khai trong giai đoạn tiếp theo)</p>
          </div>
        ) : (
          /* ── TAB: Tài chính ── */
          <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-xl border border-sand bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Doanh thu cho thuê</p>
                <p className="mt-2 font-display text-3xl text-jade">{formatVND(totalRentalRevenue)}</p>
                <p className="mt-1 text-sm text-stone-500">Từ các đơn completed + đang thuê</p>
              </div>
              <div className="rounded-xl border border-sand bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Tiền cọc đang giữ</p>
                <p className="mt-2 font-display text-3xl text-amber-700">{formatVND(totalDepositHeld)}</p>
                <p className="mt-1 text-sm text-stone-500">{activeBookings.length} đơn đang active</p>
              </div>
              <div className="rounded-xl border border-sand bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Tiền phạt phát sinh</p>
                <p className="mt-2 font-display text-3xl text-red-700">{formatVND(totalPenalties)}</p>
                <p className="mt-1 text-sm text-stone-500">Từ các lần kiểm tra phát hiện hư hỏng</p>
              </div>
            </div>

            {/* Detail table placeholder */}
            <div className="rounded-xl border border-sand bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-stone-500">
                Đối soát thanh toán gần đây
              </h3>
              <div className="py-10 text-center text-stone-400">
                <span className="material-symbols-outlined text-4xl text-stone-200 mb-2 block">receipt_long</span>
                Module đối soát chi tiết sẽ được triển khai trong giai đoạn tiếp theo.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
