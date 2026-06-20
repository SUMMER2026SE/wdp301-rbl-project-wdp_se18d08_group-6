"use client";

export default function AdminOverviewPage() {
  return (
    <div className="space-y-8">
      <header className="border-b border-slate-200 pb-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-jade">Tổng quan</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Bảng điều khiển Admin</h1>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-600">Chào mừng bạn đến với trang quản trị.</p>
      </section>
    </div>
  );
}
