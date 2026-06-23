"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PublicAtelierNav } from "@/components/heritage/ui";
import { getGarmentsGrouped, type GarmentGrouped } from "@/lib/api";
import { addToCart, cartCount, removeFromCart, getCart } from "@/lib/cart";

function formatVND(amount: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

export default function CatalogPage() {
  const [groups, setGroups] = useState<GarmentGrouped[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [cartCountVal, setCartCountVal] = useState(0);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [addedMsg, setAddedMsg] = useState<string | null>(null);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    function fetchGroups() {
      getGarmentsGrouped().then((res) => {
        if (res.success && res.data) setGroups(res.data);
      }).finally(() => setLoading(false));
    }

    fetchGroups();

    // Re-fetch when the tab becomes visible so manager image updates
    // are reflected without a full page reload.
    function handleVisibilityChange() {
      if (document.visibilityState === "visible") fetchGroups();
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Sync cart count
  useEffect(() => {
    setCartCountVal(cartCount());
    const interval = setInterval(() => setCartCountVal(cartCount()), 500);
    return () => clearInterval(interval);
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    groups.forEach((g) => { if (g.categoryName) set.add(g.categoryName); });
    return ["all", ...Array.from(set)];
  }, [groups]);

  const filtered = useMemo(
    () => activeCategory === "all" ? groups : groups.filter((g) => g.categoryName === activeCategory),
    [groups, activeCategory],
  );

  function handleSelectSize(groupSlug: string, garmentId: string) {
    setSelectedSizes((prev) => ({ ...prev, [groupSlug]: garmentId }));
  }

  function handleAddToCart(group: GarmentGrouped) {
    const selectedGarmentId = selectedSizes[group.slug];
    if (!selectedGarmentId) {
      // Default to first size
      const firstSize = group.sizes[0];
      if (!firstSize) return;
      const s = firstSize;
      addToCart({
        garmentSizeId: s.garmentSizeId,
        garmentId: group.garmentId,
        name: group.name + (s.sizeLabel ? ` (Size ${s.sizeLabel})` : ""),
        sizeLabel: s.sizeLabel,
        dailyPrice: s.dailyPrice,
        depositAmount: s.depositAmount,
        imageUrl: group.imageUrl,
      });
    } else {
      const s = group.sizes.find((sz) => sz.garmentSizeId === selectedGarmentId)!;
      addToCart({
        garmentSizeId: s.garmentSizeId,
        garmentId: group.garmentId,
        name: group.name + (s.sizeLabel ? ` (Size ${s.sizeLabel})` : ""),
        sizeLabel: s.sizeLabel,
        dailyPrice: s.dailyPrice,
        depositAmount: s.depositAmount,
        imageUrl: group.imageUrl,
      });
    }
    setCartCountVal(cartCount());
    setAddedMsg(`Đã thêm "${group.name}" vào giỏ`);
    setTimeout(() => setAddedMsg(null), 2000);
  }

  function handleRemoveFromCart(garmentId: string) {
    removeFromCart(garmentId);
    setCartCountVal(cartCount());
  }

  const featured = filtered[0];
  const cartItems = getCart();

  return (
    <div className="min-h-screen bg-[#fff8f6] text-ink">
      <PublicAtelierNav active="collection" />

      {/* Cart icon floating */}
      <div className="fixed right-4 top-24 z-30 sm:right-8">
        <button
          type="button"
          onClick={() => setShowCart(!showCart)}
          className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg border border-sand hover:border-lotus transition"
        >
          <span className="material-symbols-outlined text-2xl text-lotus">shopping_bag</span>
          {cartCountVal > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-oxblood text-[11px] font-bold text-white">
              {cartCountVal}
            </span>
          )}
        </button>

        {/* Cart dropdown */}
        {showCart && (
          <div className="absolute right-0 top-14 w-80 rounded-xl border border-sand bg-white p-4 shadow-2xl">
            <h3 className="font-display text-lg text-ink mb-3 border-b border-sand pb-2">
              Giỏ thuê ({cartCountVal})
            </h3>
            {cartItems.length === 0 ? (
              <p className="text-sm text-stone-400 py-4">Giỏ hàng trống</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.garmentSizeId} className="flex items-center justify-between text-sm border-b border-sand/50 pb-2">
                    <div>
                      <p className="font-medium text-ink">{item.name}</p>
                      <p className="text-xs text-stone-500">{formatVND(item.dailyPrice)}/ngày</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFromCart(item.garmentSizeId)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Xoá
                    </button>
                  </div>
                ))}
              </div>
            )}
            {cartItems.length > 0 && (
              <Link
                href="/booking/date-selection"
                className="mt-3 block w-full rounded-lg bg-lotus px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-oxblood transition"
                onClick={() => setShowCart(false)}
              >
                Thuê ngay
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Toast message */}
      {addedMsg && (
        <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 rounded-full bg-jade px-6 py-3 text-sm font-semibold text-white shadow-lg">
          {addedMsg}
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-24 sm:px-6 lg:px-8 lg:pt-28">
        <header className="py-12 text-center lg:py-20">
          <h1 className="font-display text-5xl uppercase text-ink sm:text-6xl">Lưu Trữ Di Sản</h1>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-stone-600 sm:text-lg">
            Khám phá bộ sưu tập y phục truyền thống Việt Nam được chọn lọc cho thuê. Chọn size và thêm vào giỏ để bắt đầu.
          </p>
        </header>

        {/* Filter bar */}
        <section className="sticky top-20 z-20 mb-10 border-y border-sand/70 bg-mist/95 py-5 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-lotus">
                <span className="material-symbols-outlined text-[18px]">tune</span>
                Bộ lọc
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full border px-4 py-2 text-sm transition ${activeCategory === cat
                      ? "border-lotus bg-lotus text-white"
                      : "border-sand bg-white text-stone-600 hover:border-antique hover:text-lotus"
                    }`}
                >
                  {cat === "all" ? "Tất cả" : cat}
                </button>
              ))}
            </div>
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-stone-500">
              Hiển thị <span className="font-semibold text-oxblood">{filtered.length}</span> trang phục
            </div>
          </div>
        </section>

        {/* Featured */}
        {featured && (
          <section className="mb-20 grid items-center gap-10 lg:grid-cols-[1.25fr_0.9fr] lg:gap-20">
            <div className="relative overflow-hidden rounded-sm border border-sand/70 bg-[#f8dcd8] shadow-[0_20px_40px_rgba(77,16,15,0.08)]">
              <div className="flex aspect-[4/5] items-center justify-center">
                {featured.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={featured.imageUrl} alt={featured.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-[80px] text-antique/30">checkroom</span>
                )}
              </div>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.26em] text-antique">
                {featured.categoryName ?? "Trang phục"}
              </span>
              <h2 className="mt-5 font-display text-5xl text-oxblood">{featured.name}</h2>
              <dl className="mt-8 space-y-4 border-y border-sand py-6 text-sm text-ink">
                <div className="flex items-center justify-between gap-4">
                  <dt className="uppercase tracking-[0.16em] text-stone-500">Size</dt>
                  <dd className="flex gap-2">
                    {featured.sizes.map((s) => (
                      <button
                        key={s.garmentSizeId}
                        type="button"
                        onClick={() => handleSelectSize(featured.slug, s.garmentSizeId)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold transition ${(selectedSizes[featured.slug] ?? featured.sizes[0]?.garmentSizeId) === s.garmentSizeId
                            ? "bg-lotus text-white"
                            : "bg-[#fff0ee] text-stone-600 hover:bg-lotus/20"
                          }`}
                      >
                        {s.sizeLabel ?? "—"}
                      </button>
                    ))}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="uppercase tracking-[0.16em] text-stone-500">Giá thuê</dt>
                  <dd className="font-semibold text-lotus">
                    {(() => {
                      const sel = selectedSizes[featured.slug] ?? featured.sizes[0]?.garmentSizeId;
                      const sz = featured.sizes.find((s) => s.garmentSizeId === sel) ?? featured.sizes[0];
                      return sz ? formatVND(sz.dailyPrice) + " / ngày" : "—";
                    })()}
                  </dd>
                </div>
              </dl>
              <button
                type="button"
                onClick={() => handleAddToCart(featured)}
                className="mt-8 inline-flex items-center gap-3 border border-lotus px-8 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-lotus transition hover:bg-lotus hover:text-white"
              >
                Thêm vào giỏ
                <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
              </button>
            </div>
          </section>
        )}

        {/* Grid */}
        {loading ? (
          <div className="py-20 text-center text-stone-400">Đang tải bộ sưu tập...</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-stone-400">
            <span className="material-symbols-outlined text-[48px]">checkroom</span>
            <p className="mt-4">Chưa có trang phục nào.</p>
          </div>
        ) : (
          <section className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
            {filtered.slice(featured ? 1 : 0).map((group) => {
              const selectedGarmentId = selectedSizes[group.slug] ?? group.sizes[0]?.garmentSizeId;
              const selectedSize = group.sizes.find((s) => s.garmentSizeId === selectedGarmentId) ?? group.sizes[0];
              return (
                <article
                  key={group.slug}
                  className="group flex flex-col border border-antique/20 bg-white/80 p-4 backdrop-blur-sm transition duration-500 hover:border-antique/60 hover:shadow-[0_18px_40px_rgba(77,16,15,0.08)]"
                >
                  <Link href={`/catalog/${selectedGarmentId}`} className="relative flex aspect-[3/4] items-center justify-center overflow-hidden bg-[#f8dcd8] cursor-pointer">
                    {group.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={group.imageUrl} alt={group.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    ) : (
                      <span className="material-symbols-outlined text-[60px] text-antique/40">checkroom</span>
                    )}
                    <div className="absolute left-4 top-4 rounded bg-white/95 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-ink backdrop-blur">
                      {group.categoryName ?? "Trang phục"}
                    </div>
                  </Link>

                  <div className="flex flex-1 flex-col px-2 pb-4 pt-6">
                    <Link href={`/catalog/${selectedGarmentId}`} className="hover:underline">
                      <h3 className="font-display text-2xl text-oxblood">{group.name}</h3>
                    </Link>

                    {/* Size pills */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {group.sizes.map((s) => (
                        <button
                          key={s.garmentSizeId}
                          type="button"
                          onClick={() => handleSelectSize(group.slug, s.garmentSizeId)}
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase transition ${selectedGarmentId === s.garmentSizeId
                              ? "bg-lotus text-white"
                              : "bg-[#fff0ee] text-stone-500 hover:bg-lotus/20"
                            }`}
                        >
                          {s.sizeLabel ?? "—"}
                        </button>
                      ))}
                    </div>

                    <div className="mt-auto space-y-2 border-t border-antique/20 pt-4">
                      <div className="flex items-end justify-between gap-4">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Giá thuê</span>
                        <span className="text-base font-semibold text-lotus">
                          {selectedSize ? formatVND(selectedSize.dailyPrice) + " / ngày" : "—"}
                        </span>
                      </div>
                      <div className="flex items-end justify-between gap-4">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Tiền cọc</span>
                        <span className="text-sm text-ink">
                          {selectedSize ? formatVND(selectedSize.depositAmount) : "—"}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddToCart(group)}
                      className="mt-4 w-full rounded-lg bg-lotus px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-oxblood"
                    >
                      Thêm vào giỏ
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {/* Bottom CTA */}
        {cartCountVal > 0 && (
          <div className="mt-16 text-center">
            <Link
              href="/booking/date-selection"
              className="inline-flex items-center gap-3 rounded-lg bg-oxblood px-10 py-5 text-base font-semibold text-white shadow-lg transition hover:bg-red-950"
            >
              Xem giỏ & đặt lịch ({cartCountVal} món)
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}