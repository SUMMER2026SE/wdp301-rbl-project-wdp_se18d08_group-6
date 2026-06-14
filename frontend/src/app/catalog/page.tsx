import Link from "next/link";
import { PublicAtelierNav } from "@/components/heritage/ui";
import { catalogFilters, catalogGarments } from "@/lib/heritage-mock-data";

const featuredGarment = catalogGarments[0];

export default function CatalogPage() {
  return (
    <div className="min-h-screen bg-[#fff8f6] text-ink">
      <PublicAtelierNav active="collection" />

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-24 sm:px-6 lg:px-8 lg:pt-28">
        <header className="py-12 text-center lg:py-20">
          <h1 className="font-display text-5xl uppercase text-ink sm:text-6xl">Lưu Trữ Di Sản</h1>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-stone-600 sm:text-lg">
            Khám phá bộ sưu tập y phục truyền thống Việt Nam được chọn lọc cho thuê. Mỗi bộ đồ đều được mô tả theo đúng tinh thần lưu trữ, từ lịch sử, chất liệu cho tới lịch thuê thực tế.
          </p>
        </header>

        <section className="mb-20 grid items-center gap-10 lg:grid-cols-[1.25fr_0.9fr] lg:gap-20">
          <div className="relative overflow-hidden rounded-sm border border-sand/70 bg-[#f8dcd8] shadow-[0_20px_40px_rgba(77,16,15,0.08)]">
            <img alt={featuredGarment.title} className="h-full w-full object-cover transition duration-700 hover:scale-105" src={featuredGarment.image} />
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.26em] text-antique">{featuredGarment.subtitle}</span>
            <h2 className="mt-5 font-display text-5xl text-oxblood">{featuredGarment.title}</h2>
            <p className="mt-6 text-base leading-8 text-stone-600">{featuredGarment.description}</p>

            <dl className="mt-8 space-y-4 border-y border-sand py-6 text-sm text-ink">
              <div className="flex items-center justify-between gap-4">
                <dt className="uppercase tracking-[0.16em] text-stone-500">Giai đoạn</dt>
                <dd>{featuredGarment.era}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="uppercase tracking-[0.16em] text-stone-500">Tình trạng</dt>
                <dd className="font-semibold text-jade">{featuredGarment.status}</dd>
              </div>
            </dl>

            <Link href={`/catalog/${featuredGarment.slug}`} className="mt-8 inline-flex items-center gap-3 border border-lotus px-8 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-lotus transition hover:bg-lotus hover:text-white">
              Khám phá
              <span className="material-symbols-outlined text-[18px]">arrow_right_alt</span>
            </Link>
          </div>
        </section>

        <section className="sticky top-20 z-20 mb-10 border-y border-sand/70 bg-mist/95 py-5 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-lotus">
                <span className="material-symbols-outlined text-[18px]">tune</span>
                Bộ lọc
              </span>
              {catalogFilters.map((item) => (
                <button key={item} type="button" className="rounded-full border border-sand bg-white px-4 py-2 text-sm text-stone-600 transition hover:border-antique hover:text-lotus">
                  {item}
                </button>
              ))}
            </div>
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-stone-500">
              Hiển thị <span className="font-semibold text-oxblood">124</span> hiện vật
            </div>
          </div>
        </section>

        <section className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          {catalogGarments.map((item) => (
            <article key={item.slug} className="group flex flex-col border border-antique/20 bg-white/80 p-4 backdrop-blur-sm transition duration-500 hover:border-antique/60 hover:shadow-[0_18px_40px_rgba(77,16,15,0.08)]">
              <Link href={`/catalog/${item.slug}`} className="relative overflow-hidden bg-[#f8dcd8]">
                <img alt={item.title} className="aspect-[3/4] w-full object-cover object-top transition duration-700 group-hover:scale-105" src={item.image} />
                <div className="absolute left-4 top-4 rounded bg-white/95 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-ink backdrop-blur">
                  {item.category}
                </div>
              </Link>
              <div className="relative flex flex-1 flex-col overflow-hidden px-2 pb-4 pt-8">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-antique">{item.era}</span>
                  <span className="rounded-full bg-[#fff0ee] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">Cỡ {item.size}</span>
                </div>

                <h3 className="font-display text-3xl text-oxblood transition group-hover:text-lotus">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-stone-600">{item.description}</p>

                <div className="mt-auto space-y-3 border-t border-antique/20 pt-6">
                  <div className="flex items-end justify-between gap-4">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Giá thuê</span>
                    <span className="text-base font-semibold text-lotus">{item.dailyPrice}</span>
                  </div>
                  <div className="flex items-end justify-between gap-4">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Tiền cọc</span>
                    <span className="text-sm text-ink">{item.deposit}</span>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 w-full translate-y-full border-t border-antique/20 bg-white py-3 transition duration-500 group-hover:translate-y-0">
                  <div className="flex justify-center">
                    <Link href={`/catalog/${item.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-lotus transition hover:text-oxblood">
                      <span className="material-symbols-outlined text-[18px]">visibility</span>
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
