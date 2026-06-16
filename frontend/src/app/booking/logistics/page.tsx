"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { BookingFlowShell } from "@/components/heritage/ui";
import { logisticsMethods } from "@/lib/heritage-mock-data";

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function BookingLogisticsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const garmentId = searchParams.get("garmentId") ?? "";
  const startDate = searchParams.get("startDate") ?? "";
  const endDate = searchParams.get("endDate") ?? "";

  const isInvalid = !UUID_RE.test(garmentId) || !startDate || !endDate || endDate < startDate;

  const [pickupMethod, setPickupMethod] = useState<string>(logisticsMethods[0].key);

  function handleContinue() {
    const params = new URLSearchParams({ garmentId, startDate, endDate, pickupMethod });
    router.push(`/booking/review?${params.toString()}`);
  }

  const backParams = new URLSearchParams({ garmentId, startDate, endDate });

  if (isInvalid) {
    return (
      <BookingFlowShell currentStep="logistics" title="Phương thức vận chuyển" description="">
        <div className="py-20 text-center text-stone-500">
          <p>Thông tin đặt lịch không hợp lệ. Vui lòng <Link href="/catalog" className="text-lotus underline">chọn lại trang phục</Link>.</p>
        </div>
      </BookingFlowShell>
    );
  }

  return (
    <BookingFlowShell
      currentStep="logistics"
      title="Phương thức vận chuyển"
      description="Xác nhận cách nhận đồ và địa điểm bàn giao trước khi sang bước kiểm tra đơn."
    >
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-8">
          <section className="rounded-xl border border-sand bg-white p-6 shadow-[0_10px_40px_rgba(77,16,15,0.05)]">
            <div className="mb-4 flex items-start justify-between gap-4 border-b border-sand pb-4">
              <div>
                <h2 className="flex items-center gap-2 font-display text-3xl text-ink">
                  <span className="material-symbols-outlined text-jade">check_circle</span>Đã xác nhận lịch
                </h2>
                <p className="mt-1 text-sm text-stone-600">Trang phục còn trống cho khoảng thời gian bạn đã chọn.</p>
              </div>
              <span className="rounded-full bg-jade/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-jade">Có thể giữ lịch</span>
            </div>
            <div className="text-sm text-stone-600">
              <p>Thời gian thuê: <span className="font-medium text-ink">{startDate && endDate ? `${formatDate(startDate)} - ${formatDate(endDate)}` : "—"}</span></p>
            </div>
          </section>

          <section>
            <h2 className="mb-4 font-display text-3xl text-lotus">Phương thức nhận đồ</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {logisticsMethods.map((item) => (
                <label key={item.key} className="cursor-pointer">
                  <input
                    className="peer sr-only"
                    checked={pickupMethod === item.key}
                    name="delivery_method"
                    type="radio"
                    onChange={() => setPickupMethod(item.key)}
                  />
                  <div className="h-full rounded-xl border border-sand bg-white p-5 transition peer-checked:border-antique peer-checked:bg-[#fff0ee] hover:border-antique/60">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f9f5f0] text-bronze">
                        <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                      </div>
                      <span className={`material-symbols-outlined ${pickupMethod === item.key ? "text-antique" : "text-stone-300"}`}>check_circle</span>
                    </div>
                    <h3 className="font-semibold text-ink">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-stone-600">{item.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-sand bg-[#fff4ef] p-6">
            <h2 className="font-display text-3xl text-ink">Địa điểm nhận tại atelier</h2>
            <p className="mt-1 text-sm text-stone-600">Vui lòng đến trong khung giờ làm việc để thử và nhận bộ đồ.</p>
            <div className="mt-5 flex items-start gap-4 rounded-lg border border-sand bg-white p-4">
              <span className="material-symbols-outlined mt-1 text-antique">location_on</span>
              <div>
                <h3 className="font-semibold text-ink">Heritage Atelier</h3>
                <p className="mt-1 text-sm leading-7 text-stone-600">123 Silk Road, Quận 1<br />TP. Hồ Chí Minh, Việt Nam</p>
                <div className="mt-3 flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-[0.16em] text-bronze">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">schedule</span>09:00 - 20:00</span>
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">call</span>+84 28 3822 0000</span>
                </div>
              </div>
            </div>
          </section>

          <div className="flex flex-col gap-4 border-t border-sand pt-8 sm:flex-row sm:justify-between">
            <Link
              href={`/booking/date-selection?${backParams.toString()}`}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-bronze px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-bronze transition hover:bg-[#fff0ee]"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Quay lại lịch thuê
            </Link>
            <button
              type="button"
              onClick={handleContinue}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-lotus px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-oxblood"
            >
              Sang bước kiểm tra đơn
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <section className="rounded-xl border border-sand bg-white/90 p-6 shadow-[0_10px_40px_rgba(77,16,15,0.05)] backdrop-blur">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-lotus/10 text-lotus">
                <span className="material-symbols-outlined text-[18px]">diamond</span>
              </div>
              <h2 className="font-display text-2xl text-ink">Chăm sóc & tiền cọc</h2>
            </div>
            <ul className="space-y-3 text-sm leading-7 text-stone-600">
              <li className="flex gap-2"><span className="material-symbols-outlined text-antique">shield</span><span>Tiền cọc sẽ được áp vào bước xác nhận cuối cùng.</span></li>
              <li className="flex gap-2"><span className="material-symbols-outlined text-antique">dry_cleaning</span><span>Không tự giặt hoặc hấp sấy. Atelier phụ trách làm sạch.</span></li>
              <li className="flex gap-2"><span className="material-symbols-outlined text-antique">policy</span><span>Hoàn cọc sau khi nhân viên kiểm tra tình trạng bộ đồ khi trả.</span></li>
            </ul>
          </section>
        </aside>
      </div>
    </BookingFlowShell>
  );
}

export default function BookingLogisticsPage() {
  return (
    <Suspense>
      <BookingLogisticsInner />
    </Suspense>
  );
}
