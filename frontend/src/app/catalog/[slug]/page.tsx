"use client";

import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { PublicAtelierNav } from "@/components/heritage/ui";
import { getGarmentsGrouped, type GarmentGrouped } from "@/lib/api";
import { addToCart, cartCount } from "@/lib/cart";
import { garmentSpecs, pairingItems } from "@/lib/heritage-mock-data";

function formatVND(amount: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(iso: string, n: number) {
  const d = new Date(iso);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export default function GarmentDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: garmentId } = use(params);
  const router = useRouter();

  const [group, setGroup] = useState<GarmentGrouped | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundFlag, setNotFoundFlag] = useState(false);
  const [selectedGarmentId, setSelectedGarmentId] = useState<string | null>(null);
  const [addedMsg, setAddedMsg] = useState<string | null>(null);

  const today = todayIso();
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(addDays(today, 2));

  useEffect(() => {
    // Tìm garment trong danh sách grouped
    getGarmentsGrouped().then((res) => {
      if (res.success && res.data) {
        for (const g of res.data) {
          const found = g.sizes.find((s) => s.garmentSizeId === garmentId);
          if (found) {
            setGroup(g);
            setSelectedGarmentId(garmentId);
            setLoading(false);
            return;
          }
        }
        setNotFoundFlag(true);
      } else {
        setNotFoundFlag(true);
      }
      setLoading(false);
    });
  }, [garmentId]);

  if (notFoundFlag) notFound();

  const selectedSize = group?.sizes.find((s) => s.garmentSizeId === selectedGarmentId) ?? group?.sizes[0];

  function handleAddToCart() {
    if (!group || !selectedSize) return;
    const s = selectedSize;
    addToCart({
      garmentSizeId: s.garmentSizeId,
      garmentId: s.garmentSizeId || "",
      name: group.name + (s.sizeLabel ? ` (Size ${s.sizeLabel})` : ""),
      sizeLabel: s.sizeLabel,
      dailyPrice: s.dailyPrice,
      depositAmount: s.depositAmount,
      imageUrl: group.imageUrl,
    });
    setAddedMsg("ÄÃ£ thÃªm vÃ o giá»!");
    setTimeout(() => setAddedMsg(null), 2000);
  }

  function handleBookNow() {
    if (!group || !selectedSize) return;
    const s = selectedSize;
    addToCart({
      garmentSizeId: s.garmentSizeId,
      garmentId: s.garmentSizeId || "",
      name: group.name + (s.sizeLabel ? ` (Size ${s.sizeLabel})` : ""),
      sizeLabel: s.sizeLabel,
      dailyPrice: s.dailyPrice,
      depositAmount: s.depositAmount,
      imageUrl: group.imageUrl,
    });
    const p = new URLSearchParams({ startDate, endDate });
    router.push(`/booking/date-selection?${p.toString()}`);
  }

  return (
    <div className="min-h-screen bg-[#fff8f6] text-ink">
      <PublicAtelierNav active="collection" />

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-24 sm:px-6 lg:px-8 lg:pt-28">
        <nav className="mb-8 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
          <Link href="/catalog" className="transition hover:text-lotus">Bá»™ sÆ°u táº­p</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span>{group?.categoryName ?? "â€”"}</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-ink">{loading ? "..." : group?.name}</span>
        </nav>

        {loading ? (
          <div className="flex h-64 items-center justify-center text-stone-400">Äang táº£i...</div>
        ) : group ? (
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
            <div className="space-y-4 lg:sticky lg:top-28 lg:self-start">
              <div className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded-lg border border-sand bg-[#ffe9e6]">
                {group.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={group.imageUrl} alt={group.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-[80px] text-antique/30">checkroom</span>
                )}
              </div>
            </div>

            <div className="pt-2 lg:pt-6">
              <div className="relative mb-8 border-b border-sand/80 pb-8">
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-antique">{group.categoryName} Â· Bá»™ sÆ°u táº­p</p>
                <h1 className="mt-3 font-display text-5xl text-ink sm:text-6xl">{group.name}</h1>
                <div className="mt-6 flex flex-wrap items-end gap-4">
                  <p className="text-3xl font-semibold text-lotus">
                    {selectedSize ? formatVND(selectedSize.dailyPrice) + " / ngÃ y" : "â€”"}
                  </p>
                  <p className="pb-1 text-sm text-stone-500">
                    Tiá»n cá»c: <span className="font-semibold text-ink">{selectedSize ? formatVND(selectedSize.depositAmount) : "â€”"}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-8">
                {/* Date range picker */}
                <div>
                  <label className="mb-3 block text-sm font-semibold uppercase tracking-[0.18em] text-ink">Khoáº£ng thá»i gian thuÃª</label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="relative">
                      <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-stone-400">calendar_month</span>
                      <input
                        type="date" min={today} value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full rounded-lg border border-sand bg-white py-3 pl-10 pr-4 text-sm text-ink outline-none transition focus:border-antique"
                      />
                    </div>
                    <div className="relative">
                      <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-stone-400">calendar_month</span>
                      <input
                        type="date" min={startDate} value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full rounded-lg border border-sand bg-white py-3 pl-10 pr-4 text-sm text-ink outline-none transition focus:border-antique"
                      />
                    </div>
                  </div>
                </div>

                {/* Size - interactive */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <label className="text-sm font-semibold uppercase tracking-[0.18em] text-ink">KÃ­ch thÆ°á»›c</label>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {group.sizes.map((s) => {
                      const active = s.garmentSizeId === selectedGarmentId;
                      return (
                        <button
                          key={s.garmentSizeId}
                          type="button"
                          onClick={() => setSelectedGarmentId(s.garmentSizeId)}
                          className={
                            active
                              ? "flex h-12 min-w-[3rem] items-center justify-center rounded border border-lotus bg-[#fff0ee] px-3 text-sm font-semibold text-lotus"
                              : "flex h-12 min-w-[3rem] items-center justify-center rounded border border-sand bg-white px-3 text-sm text-ink transition hover:border-antique"
                          }
                        >
                          {s.sizeLabel ?? "â€”"}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Link href="/try-on" className="group relative block overflow-hidden rounded-xl border border-antique/30 bg-gradient-to-r from-[#f9f5f0] to-white p-6 transition hover:border-antique/60">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-lotus">magic_button</span>
                    <div>
                      <h2 className="font-display text-3xl text-ink">Thá»­ Ä‘á»“ AI <span className="font-sans text-base font-normal text-stone-500">(mÃ´ phá»ng thá»­ trÃªn áº£nh)</span></h2>
                      <p className="mt-2 max-w-xl text-sm leading-7 text-stone-600">Táº£i áº£nh chÃ¢n dung Ä‘á»ƒ xem thá»­ cÃ¡ch bá»™ trang phá»¥c Ã´m dÃ¡ng trÆ°á»›c khi Ä‘áº·t thuÃª.</p>
                      <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-lotus">KhÃ¡m phÃ¡ ngay<span className="material-symbols-outlined text-[16px]">arrow_forward</span></span>
                    </div>
                  </div>
                </Link>
              </div>

              <div className="mt-8 space-y-3">
                <button
                  type="button"
                  onClick={handleBookNow}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-lotus px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-oxblood"
                >
                  Äáº·t thuÃª ngay
                  <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-lotus px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-lotus transition hover:bg-[#fff0ee]"
                >
                  ThÃªm vÃ o giá»
                  <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                </button>
                {addedMsg && <p className="text-center text-sm font-medium text-jade">{addedMsg}</p>}
                <p className="text-center text-sm text-stone-500">ÄÃ£ bao gá»“m cÃ´ng lÃ  á»§i, lÃ m sáº¡ch vÃ  há»— trá»£ chá»‰nh sá»­a cÆ¡ báº£n.</p>
              </div>

              <section className="mt-12 border-t border-sand pt-8">
                <h2 className="font-display text-4xl text-ink">ThÃ´ng sá»‘ chi tiáº¿t</h2>
                <ul className="mt-6 space-y-4">
                  {garmentSpecs.map((spec) => (
                    <li key={spec.label} className="flex items-center justify-between gap-4 border-b border-sand/70 pb-3 text-sm">
                      <span className="text-stone-500">{spec.label}</span>
                      <span className="font-medium text-ink">{spec.value}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        ) : null}

        {/* Pairing accessories */}
        {group && (
          <section className="mt-24 rounded-lg border border-sand bg-[#f9f5f0] px-6 py-12 lg:px-12">
            <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
              <div>
                <h2 className="font-display text-5xl text-ink">Phá»‘i há»£p phá»¥ kiá»‡n</h2>
                <p className="mt-4 text-base leading-8 text-stone-600">Gá»£i Ã½ phá»¥ kiá»‡n Ä‘á»ƒ hoÃ n thiá»‡n tháº§n thÃ¡i trang phá»¥c.</p>
                <div className="mt-8 space-y-4">
                  {pairingItems.map((item) => (
                    <div key={item.title} className="flex items-center gap-4 rounded-lg border border-sand bg-white p-4 transition hover:border-antique">
                      <img alt={item.title} className="h-16 w-16 rounded object-cover" src={item.image} />
                      <div className="flex-1">
                        <h3 className="font-semibold text-ink">{item.title}</h3>
                        <p className="text-sm text-antique">{item.price}</p>
                      </div>
                      <span className="material-symbols-outlined text-stone-500">add_circle</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border border-sand bg-[#f8dcd8]">
                <span className="material-symbols-outlined text-[60px] text-antique/30">diamond</span>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}


