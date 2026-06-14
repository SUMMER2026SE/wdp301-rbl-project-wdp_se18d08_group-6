const cards = [
  "Tài khoản người dùng",
  "Vai trò và phân quyền",
  "Cấu hình hệ thống",
  "Nhật ký kiểm soát",
];

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-sm font-semibold uppercase tracking-wider text-jade">Quản trị viên</p>
      <h1 className="mt-2 text-3xl font-semibold text-ink">Khu vực quản trị hệ thống</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <section key={card} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-ink">{card}</h2>
            <p className="mt-2 text-sm text-slate-600">Module giữ chỗ cho cấu hình nền tảng, phân quyền và theo dõi audit log.</p>
          </section>
        ))}
      </div>
    </div>
  );
}
