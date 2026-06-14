import Link from "next/link";

const dashboards = [
  { href: "/dashboard/customer", label: "Bảng điều khiển khách hàng" },
  { href: "/dashboard/staff", label: "Vận hành nhân viên" },
  { href: "/dashboard/manager", label: "Quản lý/Chủ cửa hàng" },
  { href: "/dashboard/admin", label: "Quản trị hệ thống" },
  { href: "/dashboard/staff/inspection", label: "Kiểm tra trang phục" },
  { href: "/try-on", label: "Thử đồ AI" },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-ink">Bảng điều khiển</h1>
      <p className="mt-2 text-slate-600">
        Sau khi đăng nhập, hệ thống sẽ điều hướng theo vai trò. Mình đã nối thêm các màn convert từ `convert_FE.md` để bạn kiểm tra đúng luồng khách hàng và nhân viên ngay trong dự án.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {dashboards.map((item) => (
          <Link key={item.href} className="rounded-lg border border-slate-200 bg-white p-4 font-medium text-ink shadow-sm hover:bg-slate-50" href={item.href}>
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
