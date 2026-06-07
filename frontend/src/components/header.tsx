import Link from "next/link";

const navItems = [
  { href: "/catalog", label: "Catalog" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-base font-semibold tracking-wide text-ink">
          Co Phuc ERP
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="rounded-md bg-ink px-3 py-2 font-medium text-white hover:bg-slate-700"
          >
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
