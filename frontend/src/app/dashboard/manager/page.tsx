const cards = [
  "Quản lý catalog trang phục",
  "Kiểm kê tài sản",
  "Giá thuê và chính sách",
  "Báo cáo doanh thu và tiền cọc",
];

export default function ManagerDashboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-sm font-semibold uppercase tracking-wider text-jade">Quản lý/Chủ cửa hàng</p>
      <h1 className="mt-2 text-3xl font-semibold text-ink">Khu vực điều hành cửa hàng</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <section key={card} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-ink">{card}</h2>
            <p className="mt-2 text-sm text-slate-600">Module giữ chỗ cho vận hành cấp chủ cửa hàng, từ chính sách đến đối soát tài chính cơ bản.</p>
          </section>
        ))}
      </div>
    </div>
  );
}
