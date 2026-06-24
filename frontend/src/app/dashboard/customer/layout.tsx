"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { ProtectedPage } from "@/components/auth/protected-page";
import { useAuth } from "@/components/auth/auth-provider";

const navItems = [
  { href: "/dashboard/customer", label: "Bookings", icon: "calendar_today" },
  { href: "/try-on", label: "AI Try-On", icon: "face_retouching_natural" },
  { href: "/dashboard/customer/measurements", label: "Measurements", icon: "straighten" },
  { href: "/dashboard/customer/profile", label: "Profile", icon: "person" },
  { href: "/dashboard/customer/addresses", label: "Addresses", icon: "location_on" },
];

export default function CustomerDashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const displayName = user?.fullName ?? user?.email ?? "Premium Member";

  function handleSignOut() {
    signOut();
    router.push("/login");
  }

  return (
    <ProtectedPage allowedRoles={["customer"]}>
      <div className="flex min-h-screen" style={{ backgroundColor: "#F9F5F0", fontFamily: "Manrope, sans-serif" }}>

        {/* ── Side Navigation ── */}
        <nav className="fixed left-0 top-0 hidden h-full w-64 flex-col border-r py-8 px-4 md:flex z-40"
          style={{ backgroundColor: "#F9F5F0", borderColor: "#e3beb8" }}>

          {/* Avatar + Greeting */}
          <div className="mb-10 flex items-center gap-3 px-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
              style={{ backgroundColor: "#8B0000" }}>
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-semibold leading-tight" style={{ color: "#8B0000", fontFamily: "EB Garamond, serif" }}>
                Xin Chào
              </p>
              <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider" style={{ color: "#C5A059" }}>
                {user?.fullName ?? "Premium Member"}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <ul className="flex flex-1 flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard/customer" && pathname.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-4 rounded-xl px-4 py-3 text-[13px] font-semibold uppercase tracking-wider transition-all duration-200"
                    style={isActive
                      ? { backgroundColor: "#f8dcd8", color: "#8B0000", transform: "scale(0.97)" }
                      : { color: "#5a403c" }}
                    onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = "#ffe9e6"; e.currentTarget.style.color = "#8B0000"; } }}
                    onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = ""; e.currentTarget.style.color = "#5a403c"; } }}
                  >
                    <span className="material-symbols-outlined text-[22px]"
                      style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Footer: CTA + Settings */}
          <div className="mt-auto flex flex-col gap-3">
            <Link
              href="/catalog"
              className="w-full rounded-lg py-3 px-4 text-center text-[13px] font-semibold uppercase tracking-wider text-white shadow-sm transition-all duration-200 hover:opacity-90"
              style={{ backgroundColor: "#8B0000" }}
            >
              Thuê ngay
            </Link>
            <div className="border-t pt-3" style={{ borderColor: "#e3beb8" }}>
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-4 rounded-xl px-4 py-2 text-[13px] font-semibold uppercase tracking-wider transition-colors duration-200"
                style={{ color: "#5a403c" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#8B0000"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "#5a403c"; }}
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
                Đăng xuất
              </button>
            </div>
          </div>
        </nav>

        {/* ── Main Content ── */}
        <div className="flex flex-1 flex-col md:ml-64">

          {/* Top bar (mobile) */}
          <header className="flex items-center justify-between border-b px-4 py-4 md:hidden"
            style={{ backgroundColor: "#F9F5F0", borderColor: "#e3beb8" }}>
            <span className="text-2xl font-medium" style={{ color: "#8B0000", fontFamily: "EB Garamond, serif" }}>
              Áo Dài Heritage
            </span>
            <div className="flex items-center gap-3" style={{ color: "#8B0000" }}>
              <button className="hover:opacity-70">
                <span className="material-symbols-outlined">notifications</span>
              </button>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 px-4 py-8 md:px-16 md:py-12">
            <div className="mx-auto max-w-[1200px]">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedPage>
  );
}