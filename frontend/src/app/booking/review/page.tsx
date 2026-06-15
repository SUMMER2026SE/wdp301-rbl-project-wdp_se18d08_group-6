"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { BookingFlowShell } from "@/components/heritage/ui";
import { createBooking, apiRequest } from "@/lib/api";

type GarmentDetail = {
  id: string;
  name: string;
  categoryName: string | null;
  sizeLabel: string | null;
  dailyPrice: number;
  depositAmount: number;
};

function formatVND(amount: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function daysBetween(start: string, end: string) {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1;
}

const pickupLabels: Record<string, string> = {
  pickup: "Nhận tại xưởng & hoàn trả tại cửa hàng",
  delivery: "Giao tận nơi & nhận lại tại nhà",
  store_pickup: "Nhận tại atelier & hoàn trả tại cửa hàng",
};

function BookingReviewInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const garmentId = searchParams.get("garmentId") ?? "";
  const startDate = searchParams.get("startDate") ?? "";
  const endDate = searchParams.get("endDate") ?? "";
  const pickupMethod = searchParams.get("pickupMethod") ?? "store_pickup";

  const [garment, setGarment] = useState<GarmentDetail | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!garmentId) return;
    apiRequest<GarmentDetail>(`/garments/${garmentId}`).then((res) => {
      if (res.success && res.data) setGarment(res.data);
    });
  }, [garmentId]);

  const days = startDate && endDate ? daysBetween(startDate, endDate) : 0;
  const rentalTotal = garment ? garment.dailyPrice * days : 0;
  const depositTotal = garment ? garment.depositAmount : 0;
  const grandTotal = rentalTotal + depositTotal;

  async function handleConfirm() {
    if (!garmentId || !startDate || !endDate) return;
    setSubmitting(true);
    setErrorMsg(null);
    const res = await createBooking({ garmentId, startDate, endDate, pickupMethod });
    setSubmitting(false);
    if (res.success && res.data) {
      router.push(`/booking/success?bookingId=${res.data.id}`);
    } else {
      setErrorMsg(res.message ?? "Không thể tạo booking. Vui lòng thử lại.");
    }
  }

  const backParams = new URLSearchParams({ garmentId, startDate, endDate, pickupMethod });

  return (
    <BookingFlowShell
      currentStep="review"
      title="Kiểm tra đơn hàng"
      description="Rà lại bộ đồ, thời gian thuê, phương thức nhận đồ và các khoản thanh toán trước khi xác nhận booking."
    >
      <div className="grid gap-8 xl:grid-cols-12 xl:items-start">
        <div className="space-y-8 xl:col-span-7">
          <section className="rounded-xl border border-sand bg-white p-6 shadow-sm">
            <h2 className="mb-6 border-b border-sand pb-3 text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Trang phục đã chọn</h2>
            {garment ? (
              <div className="flex flex-col gap-6 sm:flex-row">
                <div className="flex-1">
                  <h3 className="font-display text-4xl text-ink">{garment.name}</h3>
                  <p className="mt-2 text-sm text-stone-600">{garment.categoryName}</p>
                  <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                    <div><span className="block text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Size</span><span className="text-ink">{garment.sizeLabel ?? "—"}</span></div>
                    <div><span className="block text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Tình trạng</span><span className="text-ink">Lưu trữ tốt</span></div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-stone-400">Đang tải...</p>
            )}
          </section>

          <div className="grid gap-8 md:grid-cols-2">
            <section className="rounded-xl border border-sand bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-2 border-b border-sand pb-3">
                <span className="material-symbols-outlined text-stone-500">calendar_today</span>
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Lịch thuê</h2>
              </div>
              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between"><span className="text-stone-500">Nhận đồ</span><span className="font-medium text-ink">{startDate ? formatDate(startDate) : "—"}</span></div>
                <div className="flex items-center justify-between"><span className="text-stone-500">Trả đồ</span><span className="font-medium text-ink">{endDate ? formatDate(endDate) : "—"}</span></div>
                <div className="flex items-center justify-between border-t border-sand pt-4"><span className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Thời lượng</span><span className="font-semibold text-lotus">{days} ngày</span></div>
              </div>
            </section>

            <section className="rounded-xl border border-sand bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-2 border-b border-sand pb-3">
                <span className="material-symbols-outlined text-stone-500">local_shipping</span>
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Vận chuyển</h2>
              </div>
              <div className="space-y-4 text-sm">
                <div><span className="block text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Phương thức</span><span className="font-medium text-ink">{pickupLabels[pickupMethod] ?? pickupMethod}</span></div>
                <div><span className="block text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Địa điểm</span><span className="leading-7 text-stone-600">123 Silk Road, Quận 1<br />TP. Hồ Chí Minh</span></div>
              </div>
            </section>
          </div>
        </div>

        <aside className="xl:col-span-5 xl:sticky xl:top-28">
          <section className="rounded-xl border border-sand bg-white p-8 shadow-[0_20px_40px_rgba(0,0,0,0.05)]">
            <h2 className="border-b border-sand pb-4 font-display text-3xl text-ink">Tóm tắt thanh toán</h2>
            <div className="mt-6 space-y-4 text-sm">
              <div className="flex items-center justify-between"><span className="text-stone-500">Tiền thuê ({days} ngày)</span><span className="text-ink">{garment ? formatVND(rentalTotal) : "—"}</span></div>
              <div className="flex items-center justify-between"><span className="text-stone-500">Làm sạch chuyên biệt</span><span className="font-medium text-jade">Đã bao gồm</span></div>
            </div>

            <div className="mt-8 rounded-lg border border-antique/40 bg-antique/10 p-4">
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1 text-sm font-semibold text-bronze"><span className="material-symbols-outlined text-[16px]">security</span>Tiền cọc bảo đảm</span>
                <span className="font-medium text-bronze">{garment ? formatVND(depositTotal) : "—"}</span>
              </div>
              <p className="mt-2 text-xs leading-6 text-bronze">Hoàn lại sau khi nhân viên kiểm tra đạt yêu cầu.</p>
            </div>

            <div className="mt-8 border-t border-sand pt-6">
              <div className="mb-2 flex items-end justify-between gap-4"><span className="text-lg text-ink">Tổng thanh toán</span><span className="font-display text-4xl text-lotus">{garment ? formatVND(grandTotal) : "—"}</span></div>
              <p className="text-right text-xs text-stone-500">Gồm tiền thuê và tiền cọc hoàn lại</p>
            </div>

            <label className="mt-8 flex cursor-pointer items-start gap-3 text-sm leading-7 text-stone-600">
              <input className="mt-1 h-5 w-5 rounded border-sand text-lotus focus:ring-lotus" type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
              <span>Tôi đã đọc chính sách nghi lễ và đồng ý giữ gìn trang phục như một tài sản văn hóa trong suốt thời gian thuê.</span>
            </label>

            {errorMsg && <p className="mt-4 text-sm text-red-500">{errorMsg}</p>}

            <div className="mt-6 flex flex-col gap-3">
              <Link
                href={`/booking/logistics?${backParams.toString()}`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-bronze px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-bronze transition hover:bg-[#fff0ee]"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Quay lại vận chuyển
              </Link>
              <button
                type="button"
                disabled={!agreed || submitting || !garment}
                onClick={handleConfirm}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-lotus px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-oxblood disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? "Đang xử lý..." : "Xác nhận đặt lịch"}
                {!submitting && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
              </button>
            </div>
          </section>
        </aside>
      </div>
    </BookingFlowShell>
  );
}

export default function BookingReviewPage() {
  return (
    <Suspense>
      <BookingReviewInner />
    </Suspense>
  );
}
