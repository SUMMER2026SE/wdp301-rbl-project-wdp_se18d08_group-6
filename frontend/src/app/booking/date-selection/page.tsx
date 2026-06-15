"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { BookingFlowShell } from "@/components/heritage/ui";
import { checkAvailability } from "@/lib/api";
import { apiRequest } from "@/lib/api";

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
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return Math.round((e - s) / 86400000) + 1;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function BookingDateSelectionInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const garmentId = searchParams.get("garmentId") ?? "";
  const isUuid = UUID_RE.test(garmentId);

  const [garment, setGarment] = useState<GarmentDetail | null>(null);
  const [loadingGarment, setLoadingGarment] = useState(true);

  const today = todayIso();
  const [startDate, setStartDate] = useState(searchParams.get("startDate") ?? today);
  const [endDate, setEndDate] = useState(searchParams.get("endDate") ?? today);

  const [availability, setAvailability] = useState<{ available: boolean } | null>(null);
  const [checking, setChecking] = useState(false);
  const [availError, setAvailError] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!garmentId || !isUuid) {
      setLoadingGarment(false);
      if (garmentId && !isUuid) setErrorMsg("ID trang phục không hợp lệ. Vui lòng chọn lại từ bộ sưu tập.");
      return;
    }
    setLoadingGarment(true);
    apiRequest<GarmentDetail>(`/garments/${garmentId}`)
      .then((res) => {
        if (res.success && res.data) setGarment(res.data);
        else setErrorMsg("Không tìm thấy trang phục.");
      })
      .finally(() => setLoadingGarment(false));
  }, [garmentId, isUuid]);

  useEffect(() => {
    if (!garmentId || !isUuid || !startDate || !endDate) return;
    if (endDate < startDate) return;
    setChecking(true);
    setAvailability(null);
    setAvailError(null);
    checkAvailability(garmentId, startDate, endDate)
      .then((res) => {
        if (res.success && res.data) {
          setAvailability({ available: res.data.available });
        } else {
          setAvailError(res.message ?? "Không thể kiểm tra lịch trống.");
        }
      })
      .finally(() => setChecking(false));
  }, [garmentId, isUuid, startDate, endDate]);

  const days = startDate && endDate && endDate >= startDate ? daysBetween(startDate, endDate) : 0;
  const rentalTotal = garment ? garment.dailyPrice * days : 0;
  const isValid = isUuid && days > 0 && availability?.available === true;

  function handleContinue() {
    const params = new URLSearchParams({
      garmentId,
      startDate,
      endDate,
    });
    router.push(`/booking/logistics?${params.toString()}`);
  }

  if (!garmentId) {
    return (
      <div className="py-20 text-center text-stone-500">
        <p>Vui lòng chọn trang phục từ <Link href="/catalog" className="text-lotus underline">bộ sưu tập</Link> trước.</p>
      </div>
    );
  }

  return (
    <BookingFlowShell
      currentStep="schedule"
      title="Chọn ngày thuê"
      description="Chọn khoảng thời gian phù hợp cho sự kiện của bạn. Hệ thống kiểm tra lịch trống theo thời gian thực."
    >
      <div className="grid gap-8 xl:grid-cols-12">
        <section className="xl:col-span-5">
          <div className="flex h-full flex-col overflow-hidden rounded-xl border border-sand bg-white shadow-[0_10px_40px_rgba(77,16,15,0.05)]">
            {loadingGarment ? (
              <div className="flex flex-1 items-center justify-center py-20 text-stone-400">Đang tải...</div>
            ) : garment ? (
              <div className="flex flex-1 flex-col p-6">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-lotus">{garment.categoryName ?? "Trang phục"}</span>
                <h2 className="mt-2 font-display text-4xl text-ink">{garment.name}</h2>
                <p className="mt-1 text-sm text-stone-500">Size: {garment.sizeLabel ?? "—"}</p>
                <dl className="mt-auto space-y-4 border-t border-sand pt-6 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-stone-500">Đơn giá cơ bản</dt>
                    <dd className="font-medium text-ink">{formatVND(garment.dailyPrice)} / ngày</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-stone-500">Tiền cọc bắt buộc</dt>
                    <dd className="font-medium text-ink">{formatVND(garment.depositAmount)}</dd>
                  </div>
                  <div className="flex items-start gap-3 border-t border-sand pt-4 text-xs text-stone-500">
                    <span className="material-symbols-outlined text-jade">verified_user</span>
                    <p>Cọc được hoàn sau khi nhân viên kiểm tra tình trạng bộ đồ.</p>
                  </div>
                </dl>
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center py-20 text-red-500">{errorMsg}</div>
            )}
          </div>
        </section>

        <section className="space-y-8 xl:col-span-7">
          <div className="rounded-xl border border-sand bg-white p-6 shadow-[0_10px_40px_rgba(77,16,15,0.05)] sm:p-8">
            <h2 className="mb-6 font-display text-3xl text-lotus">Chọn khoảng ngày thuê</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Ngày nhận đồ</label>
                <div className="relative">
                  <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-stone-400">calendar_month</span>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-sand bg-white py-3 pl-10 pr-4 text-sm text-ink outline-none transition focus:border-antique"
                    value={startDate}
                    min={today}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Ngày trả đồ</label>
                <div className="relative">
                  <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-stone-400">calendar_month</span>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-sand bg-white py-3 pl-10 pr-4 text-sm text-ink outline-none transition focus:border-antique"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {endDate < startDate && (
              <p className="mt-3 text-sm text-red-500">Ngày trả phải sau ngày nhận.</p>
            )}

            <div className="mt-4 flex items-center gap-2 text-sm">
              {!isUuid && garmentId ? (
                <><span className="material-symbols-outlined text-red-500 text-[18px]">error</span><span className="font-medium text-red-500">ID trang phục không hợp lệ — vui lòng chọn lại từ <Link href="/catalog" className="underline">bộ sưu tập</Link>.</span></>
              ) : checking ? (
                <span className="text-stone-400">Đang kiểm tra lịch trống...</span>
              ) : availability?.available === true ? (
                <><span className="material-symbols-outlined text-jade text-[18px]">check_circle</span><span className="font-medium text-jade">Có thể đặt lịch</span></>
              ) : availability?.available === false ? (
                <><span className="material-symbols-outlined text-red-500 text-[18px]">cancel</span><span className="font-medium text-red-500">Trang phục đã có lịch trong khoảng này</span></>
              ) : availError ? (
                <><span className="material-symbols-outlined text-amber-500 text-[18px]">warning</span><span className="text-amber-600">{availError}</span></>
              ) : null}
            </div>
          </div>

          <div className="rounded-xl border border-sand bg-white p-6 shadow-[0_10px_40px_rgba(77,16,15,0.05)] sm:p-8">
            <h3 className="font-display text-3xl text-ink">Tóm tắt chi phí</h3>
            <div className="mt-6 space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Khoảng ngày</span>
                <span className="font-medium text-ink">
                  {startDate && endDate && endDate >= startDate
                    ? `${formatDate(startDate)} - ${formatDate(endDate)} (${days} ngày)`
                    : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Tiền thuê</span>
                <span className="font-medium text-ink">{days > 0 && garment ? formatVND(rentalTotal) : "—"}</span>
              </div>
              <div className="flex items-end justify-between border-t border-sand pt-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Tạm thanh toán hôm nay</p>
                  <p className="text-xs text-stone-500">Chưa bao gồm cọc</p>
                </div>
                <span className="font-display text-4xl text-lotus">{days > 0 && garment ? formatVND(rentalTotal) : "—"}</span>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href={`/catalog/${searchParams.get("slug") ?? ""}`}
                className="inline-flex flex-1 items-center justify-center rounded-lg border border-bronze px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-bronze transition hover:bg-[#fff0ee]"
              >
                Quay lại chi tiết
              </Link>
              <button
                type="button"
                disabled={!isValid}
                onClick={handleContinue}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-lotus px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-oxblood disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Sang bước vận chuyển
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </BookingFlowShell>
  );
}

export default function BookingDateSelectionPage() {
  return (
    <Suspense>
      <BookingDateSelectionInner />
    </Suspense>
  );
}
