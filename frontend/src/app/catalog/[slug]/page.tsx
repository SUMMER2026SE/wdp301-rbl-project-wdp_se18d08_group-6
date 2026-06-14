import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicAtelierNav } from "@/components/heritage/ui";
import { catalogGarments, garmentSpecs, getGarmentBySlug, pairingItems } from "@/lib/heritage-mock-data";

export default async function GarmentDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const garment = getGarmentBySlug(slug);

  if (!garment) {
    notFound();
  }

  const related = catalogGarments.filter((item) => item.slug !== garment.slug).slice(0, 3);
  const sizeOptions = ["S", "M", "L", "XL"];
  const selectedSize = sizeOptions.find((size) => garment.size.includes(size)) ?? "M";

  return (
    <div className="min-h-screen bg-[#fff8f6] text-ink">
      <PublicAtelierNav active="collection" />

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-24 sm:px-6 lg:px-8 lg:pt-28">
        <nav className="mb-8 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
          <Link href="/catalog" className="transition hover:text-lotus">Bộ sưu tập</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span>{garment.category}</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-ink">{garment.title}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            <div className="overflow-hidden rounded-lg border border-sand bg-[#ffe9e6]">
              <img alt={garment.title} className="aspect-[3/4] w-full object-cover object-center transition duration-700 hover:scale-105" src={garment.detailImages[0]} />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {garment.detailImages.map((image, index) => (
                <div key={image} className={index === 0 ? "overflow-hidden rounded border border-antique bg-[#fff0ee]" : "overflow-hidden rounded border border-sand bg-[#fff8f6] opacity-80"}>
                  <img alt={`${garment.title} ${index + 1}`} className="aspect-square w-full object-cover" src={image} />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 lg:pt-6">
            <div className="relative mb-8 border-b border-sand/80 pb-8">
              <div className="pointer-events-none absolute right-0 top-0 hidden text-antique/20 lg:block">
                <span className="material-symbols-outlined text-[120px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_florist</span>
              </div>

              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-antique">{garment.category} · Bộ sưu tập hoàng phái</p>
              <h1 className="mt-3 font-display text-5xl text-ink sm:text-6xl">{garment.title}</h1>
              <div className="mt-6 flex flex-wrap items-end gap-4">
                <p className="text-3xl font-semibold text-lotus">{garment.dailyPrice}</p>
                <p className="pb-1 text-sm text-stone-500">Tiền cọc: <span className="font-semibold text-ink">{garment.deposit}</span></p>
              </div>
              <p className="mt-6 max-w-2xl text-base leading-8 text-stone-600">{garment.description}</p>
            </div>

            <div className="space-y-8">
              <div>
                <label className="mb-3 block text-sm font-semibold uppercase tracking-[0.18em] text-ink">Khoảng thời gian thuê</label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="relative">
                    <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-stone-400">calendar_month</span>
                    <input className="w-full rounded-lg border border-sand bg-white py-3 pl-10 pr-4 text-sm text-ink outline-none transition focus:border-antique" type="date" defaultValue="2024-09-14" />
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-stone-400">calendar_month</span>
                    <input className="w-full rounded-lg border border-sand bg-white py-3 pl-10 pr-4 text-sm text-ink outline-none transition focus:border-antique" type="date" defaultValue="2024-09-16" />
                  </div>
                </div>
                <p className="mt-2 flex items-center gap-2 text-sm font-medium text-jade"><span className="material-symbols-outlined text-[16px]">check_circle</span>Có thể giữ lịch cho mốc thời gian đã chọn</p>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-sm font-semibold uppercase tracking-[0.18em] text-ink">Kích thước</label>
                  <button type="button" className="text-sm text-antique underline-offset-4 transition hover:text-lotus hover:underline">Hướng dẫn số đo</button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {sizeOptions.map((size) => {
                    const available = garment.size.includes(size);
                    const active = size === selectedSize;

                    if (!available) {
                      return (
                        <div key={size} className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded border border-sand bg-[#f9f5f0] text-sm text-stone-400 opacity-60">
                          {size}
                          <div className="absolute inset-0 origin-top-left rotate-45 border-t border-stone-300" />
                        </div>
                      );
                    }

                    return (
                      <button key={size} type="button" className={active ? "flex h-12 w-12 items-center justify-center rounded border border-lotus bg-[#fff0ee] text-sm font-semibold text-lotus" : "flex h-12 w-12 items-center justify-center rounded border border-sand bg-white text-sm text-ink transition hover:border-antique"}>
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Link href="/try-on" className="group relative block overflow-hidden rounded-xl border border-antique/30 bg-gradient-to-r from-[#f9f5f0] to-white p-6 transition hover:border-antique/60">
                <div className="pointer-events-none absolute -right-5 -top-5 opacity-5 transition group-hover:opacity-10">
                  <span className="material-symbols-outlined text-[100px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-lotus">magic_button</span>
                  <div>
                    <h2 className="font-display text-3xl text-ink">Thử đồ AI <span className="font-sans text-base font-normal text-stone-500">(mô phỏng thử trên ảnh)</span></h2>
                    <p className="mt-2 max-w-xl text-sm leading-7 text-stone-600">Tải ảnh chân dung để xem thử cách bộ trang phục này ôm dáng và rơi vạt trên cơ thể bạn trước khi đặt thuê.</p>
                    <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-lotus">
                      Khám phá ngay
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            <div className="mt-8 space-y-4">
              <Link href="/booking/date-selection" className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-lotus px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-oxblood">
                Thêm vào đơn thuê
                <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
              </Link>
              <p className="text-center text-sm text-stone-500">Đã bao gồm công là ủi, làm sạch và hỗ trợ chỉnh sửa cơ bản.</p>
            </div>

            <section className="mt-12 border-t border-sand pt-8">
              <h2 className="font-display text-4xl text-ink">Thông số chi tiết</h2>
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

        <section className="mt-24 rounded-lg border border-sand bg-[#f9f5f0] px-6 py-12 lg:px-12">
          <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <h2 className="font-display text-5xl text-ink">Phối hợp phụ kiện</h2>
              <p className="mt-4 text-base leading-8 text-stone-600">Gợi ý khăn đóng vàng và bộ trang sức ngọc để hoàn thiện thần thái cung đình đúng tinh thần phục dựng.</p>
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

            <div className="overflow-hidden rounded-lg border border-sand shadow-[0_20px_40px_rgba(0,0,0,0.05)]">
              <img alt="Phụ kiện gợi ý" className="aspect-[4/3] w-full object-cover" src="https://lh3.googleusercontent.com/aida/AP1WRLsQQAUgD88ACQDVhZA3WnhFnlPEB8Chr4c0g2zIZGmaEyLNs5g2BCaGRoH54EoV9yvV2MiWYKy5BJlkNdy3X8zhmkS_OZMW7PucWbxxrPA5XONQHutPZfqEoNQfCP2PK4XylkqzXtP_DWORxdUFK0gONyAImXtT826ISbQtvzPhDRy5p8tENnunh0oXJcJh-Zi7JJfx230iU-ZEQNYSffg9FR3cpC_AicrXeMTPwPGhKdg5jfj7m2vJqFbM" />
            </div>
          </div>
        </section>

        <section className="mt-24">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="font-display text-4xl text-ink">Khám phá thêm trong bộ sưu tập</h2>
            <Link href="/catalog" className="hidden text-sm font-semibold uppercase tracking-[0.18em] text-lotus hover:underline md:block">Xem toàn bộ</Link>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {related.map((item) => (
              <Link key={item.slug} href={`/catalog/${item.slug}`} className="group flex flex-col gap-4">
                <div className="overflow-hidden rounded-lg border border-sand bg-[#ffe9e6]">
                  <img alt={item.title} className="aspect-[3/4] w-full object-cover transition duration-700 group-hover:scale-105" src={item.image} />
                </div>
                <div>
                  <h3 className="font-display text-3xl text-ink transition group-hover:text-lotus">{item.title}</h3>
                  <p className="mt-1 text-sm text-stone-500">{item.dailyPrice}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
