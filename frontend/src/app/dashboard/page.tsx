import Link from "next/link";

const dashboards = [
  { href: "/dashboard/customer", label: "Customer dashboard" },
  { href: "/dashboard/staff", label: "Staff operation" },
  { href: "/dashboard/manager", label: "Manager/Owner" },
  { href: "/dashboard/admin", label: "Admin" },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-ink">Dashboard</h1>
      <p className="mt-2 text-slate-600">
        Role-based redirects will be wired after backend JWT auth is completed. Use these links during MVP setup.
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