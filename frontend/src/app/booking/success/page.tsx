"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { bookingSuccessTimeline } from "@/lib/heritage-mock-data";

function BookingSuccessInner() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const displayCode = bookingId ? `#${bookingId.slice(0, 8).toUpperCase()}` : "#—";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(120deg,#f9f5f0_0%,#fff0ee_50%,#f9f5f0_100%)] px-4 py-12 text-ink">
      <main className="w-full max-w-3xl text-center">
        <div className="rounded-2xl border border-sand bg-white/80 p-8 shadow-[0_30px_60px_rgba(77,16,15,0.08)] backdrop-blur sm:p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-jade/10 text-jade">
            <span className="material-symbols-outlined text-4xl">check_circle</span>
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-antique">Đặt lịch thành công</p>
          <h1 className="mt-3 font-display text-5xl text-ink sm:text-6xl">Giữ lịch thành công</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-stone-600">Xưởng đã ghi nhận yêu cầu thuê. Thông tin bàn giao và trạng thái chuẩn bị sẽ được cập nhật trong bảng điều khiển khách hàng.</p>

          <div className="mt-8 rounded-xl border border-sand bg-[#fff8f6] p-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Mã booking</p>
            <p className="mt-2 font-display text-3xl text-lotus">{displayCode}</p>
            {bookingId && <p className="mt-1 text-xs text-stone-400 break-all">{bookingId}</p>}
          </div>

          <section className="mt-10 text-left">
            <h2 className="font-display text-3xl text-ink">Tiếp theo sẽ diễn ra gì?</h2>
            <div className="mt-6 space-y-6">
              {bookingSuccessTimeline.map((item, index) => (
                <div key={item.title} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ffe9e6] text-lotus">{index + 1}</div>
                    {index < bookingSuccessTimeline.length - 1 ? <div className="mt-2 h-full w-px bg-sand" /> : null}
                  </div>
                  <div className="pb-2">
                    <h3 className="text-lg font-semibold text-ink">{item.title}</h3>
                    <p className="mt-1 text-sm leading-7 text-stone-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/dashboard/customer" className="inline-flex items-center justify-center rounded-lg bg-lotus px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-oxblood">
              Xem bảng điều khiển khách hàng
            </Link>
            <Link href="/" className="inline-flex items-center justify-center rounded-lg border border-bronze px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-bronze transition hover:bg-[#fff0ee]">
              Về trang chủ
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense>
      <BookingSuccessInner />
    </Suspense>
  );
}
