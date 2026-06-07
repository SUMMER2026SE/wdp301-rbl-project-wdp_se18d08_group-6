import Link from "next/link";
import { roleCards, sampleGarments } from "@/lib/sample-data";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <section className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-jade">Graduation MVP</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight text-ink md:text-5xl">
            ERP cho thue co phuc va ao dai Viet Nam
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Codebase nen cho he thong quan ly catalog, tai san trang phuc, booking, dat coc,
            giao nhan, kiem tra hu hong va phong thu do ao AI bang Supabase.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="rounded-md bg-lotus px-4 py-2 font-medium text-white hover:bg-red-800" href="/catalog">
              View catalog
            </Link>
            <Link className="rounded-md border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-white" href="/register">
              Create account
            </Link>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-ink">MVP modules</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>Auth + roles: Customer, Staff, Manager/Owner, Admin</li>
            <li>Garment catalog + physical asset lifecycle</li>
            <li>Booking + availability conflict prevention</li>
            <li>Payment/deposit/refund/penalty tracking</li>
            <li>AI try-on and damage detection placeholders</li>
          </ul>
        </div>
      </section>

      <section className="mt-12 grid gap-4 md:grid-cols-3">
        {roleCards.map((card) => (
          <article key={card.role} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-jade">{card.role}</p>
            <h2 className="mt-2 text-lg font-semibold text-ink">{card.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{card.description}</p>
          </article>
        ))}
      </section>

      <section className="mt-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-jade">Seed preview</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">Trang phuc mau</h2>
          </div>
          <Link href="/catalog" className="text-sm font-medium text-lotus hover:text-red-800">
            Open catalog
          </Link>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {sampleGarments.map((item) => (
            <article key={item.name} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">{item.category}</p>
              <h3 className="mt-2 text-lg font-semibold text-ink">{item.name}</h3>
              <dl className="mt-4 space-y-2 text-sm text-slate-600">
                <div className="flex justify-between"><dt>Size</dt><dd>{item.size}</dd></div>
                <div className="flex justify-between"><dt>Price</dt><dd>{item.dailyPrice}</dd></div>
                <div className="flex justify-between"><dt>Deposit</dt><dd>{item.deposit}</dd></div>
                <div className="flex justify-between"><dt>Status</dt><dd>{item.status}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
