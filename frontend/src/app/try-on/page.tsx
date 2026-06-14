"use client";

import Link from "next/link";
import { useState } from "react";
import { PublicAtelierNav } from "@/components/heritage/ui";

type ViewState = "empty" | "processing" | "result";

export default function TryOnPage() {
  const [viewState, setViewState] = useState<ViewState>("empty");

  function handleGenerate() {
    setViewState("processing");
    window.setTimeout(() => setViewState("result"), 1800);
  }

  return (
    <div className="min-h-screen bg-[#fff8f6] text-ink">
      <PublicAtelierNav active="atelier" />

      <main className="mx-auto flex max-w-7xl flex-col gap-16 px-4 pb-24 pt-24 sm:px-6 lg:px-8 lg:pt-28">
        <section className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-5xl text-lotus sm:text-6xl">Thử Đồ AI - Chạm Vào Di Sản</h1>
          <p className="mt-5 text-base leading-8 text-stone-600 sm:text-lg">
            Tải ảnh chân dung để hình dung cách bộ Nhật Bình Hoàng Phái hiển thị trên phom người của bạn trước khi đặt lịch thuê thực tế.
          </p>
        </section>

        <section className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-8">
            <section className="rounded-xl border border-sand bg-white p-6 shadow-[0_10px_30px_rgba(77,16,15,0.05)]">
              <div className="flex items-start gap-4">
                <img alt="Nhật Bình Hoàng Phái" className="h-32 w-24 rounded object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCj5ck_UaMSl1uD4zlKkfvhtONMurEubIPMx6tLlfTpzvN2d7l3g2n5zivNVBVY8Biol8EPFmqU3vli1KGtwGwKxDxOfMVwcKJDSutwpM6642gGJEMoBkKKy8RAaftkGnh6ALXV3Z4sJBZyXFFZS7KO6qYWZStuI0Gyhmw2V2G4II_ZEhb3K38moMGV7MKRHa7IsxB4DNTBBsDlilyqTrNNekF_UTXJLjdM7XrbfWyY6gAyAlYYg9QHUoVkeNdFSAE-B_BLRrL2eFLv" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-antique">Trang phục đã chọn</p>
                  <h2 className="mt-2 font-display text-4xl text-ink">Nhật Bình Hoàng Phái</h2>
                  <p className="mt-2 text-sm leading-7 text-stone-600">Bản phục dựng cuối thế kỷ XIX với nền lụa đỏ thẫm, thêu rồng mây kim tuyến và kết cấu nghi lễ cung đình.</p>
                  <Link href="/catalog/nhat-binh-hoang-phai" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-lotus hover:underline">
                    Đổi trang phục
                    <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                  </Link>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-sand bg-white p-8 shadow-[0_10px_30px_rgba(77,16,15,0.05)]">
              <h2 className="border-b border-sand pb-4 font-display text-3xl text-lotus">Tải ảnh chân dung</h2>
              <div className="mt-6 rounded-xl border-2 border-dashed border-sand bg-[#fff8f6] p-10 text-center transition hover:border-antique">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fff0ee] text-antique">
                  <span className="material-symbols-outlined text-3xl">add_a_photo</span>
                </div>
                <p className="mt-4 text-base text-ink">Kéo ảnh vào đây hoặc chọn tệp từ máy</p>
                <p className="mt-2 text-sm text-stone-500">JPG, PNG tối đa 10MB. Ảnh chính diện sẽ cho kết quả đẹp hơn.</p>
              </div>

              <label className="mt-6 flex items-start gap-3 text-sm leading-7 text-stone-600">
                <input className="mt-1 h-5 w-5 rounded border-sand text-lotus focus:ring-lotus" type="checkbox" defaultChecked />
                <span>Tôi đồng ý cho hệ thống dùng ảnh này để tạo bản xem thử kỹ thuật số. Ảnh chỉ được xử lý tạm thời cho phiên làm việc hiện tại.</span>
              </label>

              <button type="button" onClick={handleGenerate} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-lotus px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-oxblood">
                <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                Tạo hình ảnh thử đồ
              </button>
            </section>
          </div>

          <section className="relative min-h-[620px] overflow-hidden rounded-xl border border-sand bg-[#ffe9e6]">
            {viewState === "empty" ? (
              <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                <span className="material-symbols-outlined text-6xl text-stone-400">imagesmode</span>
                <p className="mt-4 max-w-md text-base leading-8 text-stone-600">Hình ảnh thử đồ của bạn sẽ xuất hiện ở đây sau khi hệ thống hoàn tất quá trình dựng AI.</p>
              </div>
            ) : null}

            {viewState === "processing" ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 p-8 text-center backdrop-blur-sm">
                <div className="h-24 w-24 animate-spin rounded-full border-4 border-[#fff4ef] border-t-antique" />
                <h2 className="mt-6 font-display text-4xl text-lotus">Đang dệt nên hình ảnh...</h2>
                <p className="mt-2 text-sm leading-7 text-stone-600">Hệ thống thử đồ AI đang ghép phom trang phục với gương mặt và tỉ lệ cơ thể của bạn.</p>
              </div>
            ) : null}

            {viewState === "result" ? (
              <div className="flex h-full flex-col items-center justify-center p-4">
                <img alt="Kết quả thử đồ AI" className="max-h-full w-full rounded-lg object-contain shadow-[0_20px_40px_rgba(0,0,0,0.16)]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXCLxkStIb8XurhKw7rE6GV80hKLMQPf6Zn6W_GCX57mw14O073YZVpiXpDUSagh1g1tHJg4uBiENqHNkl3E6zgEEpOAjKSGc4xklW5t382-tVOH81fgicCSq4Ki2Y1W0SbG2M8XtdqEEipWjBRK1EdSCWJWRSP4IdgPYRCv4aM4QDLIoAikPzElnmxACfiu0lW-rO8Rybj1YL5FzmrpYMomjzGdLO92vnuTAq2_Zgs_g6M38GkweLkZCzjBH6E1VDQSyoD9PqQWz0" />
                <div className="mt-6 flex flex-wrap justify-center gap-3 rounded-full border border-sand bg-white/90 px-5 py-3 text-sm shadow">
                  <button type="button" className="inline-flex items-center gap-2 text-stone-700 transition hover:text-lotus"><span className="material-symbols-outlined text-[18px]">download</span>Lưu</button>
                  <button type="button" className="inline-flex items-center gap-2 text-stone-700 transition hover:text-lotus"><span className="material-symbols-outlined text-[18px]">share</span>Chia sẻ</button>
                  <Link href="/booking/date-selection" className="inline-flex items-center gap-2 font-semibold text-lotus"><span className="material-symbols-outlined text-[18px]">calendar_month</span>Đặt lịch thuê</Link>
                </div>
              </div>
            ) : null}
          </section>
        </section>
      </main>
    </div>
  );
}
