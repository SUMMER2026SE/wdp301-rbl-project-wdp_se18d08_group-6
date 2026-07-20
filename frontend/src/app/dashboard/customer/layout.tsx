"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { ProtectedPage } from "@/components/auth/protected-page";
import { useAuth } from "@/components/auth/auth-provider";
import { CustomerNavbar } from "@/components/customer/navbar";
import { CustomerFooter } from "@/components/customer/footer";

const navItems = [
  { href: "/dashboard/customer", label: "Đơn thuê", icon: "calendar_today" },
  { href: "/dashboard/customer/notifications", label: "Thông báo", icon: "notifications" },
  { href: "/try-on", label: "Thử đồ AI", icon: "face_retouching_natural" },
  { href: "/dashboard/customer/measurements", label: "Số đo", icon: "straighten" },
  { href: "/dashboard/customer/profile", label: "Hồ sơ", icon: "person" },
  { href: "/dashboard/customer/addresses", label: "Địa chỉ", icon: "location_on" },
];

export default function CustomerDashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const displayName = user?.fullName ?? user?.email ?? "Khách hàng";
  const userInitial = displayName.charAt(0).toUpperCase();

  function handleSignOut() {
    signOut();
    router.push("/login");
  }

  return (
    <ProtectedPage allowedRoles={["customer"]}>
      <div className="flex min-h-screen flex-col bg-mist text-ink">
        <CustomerNavbar />

        <div className="flex flex-1">
          {/* Sidebar */}
          {/* sticky (không phải fixed) để sidebar chiếm chỗ trong layout — footer bên dưới không bị che */}
          <aside className="sticky top-16 hidden h-[calc(100vh-64px)] w-64 shrink-0 flex-col self-start border-r border-sand bg-parchment p-4 md:flex">
            {/* User greeting */}
            <div className="mb-8 flex items-center gap-3 rounded-lg border border-sand/70 bg-white p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lotus text-sm font-bold text-white">
                {userInitial}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">Xin chào</p>
                <p className="truncate text-xs font-semibold uppercase tracking-[0.16em] text-antique">
                  {displayName}
                </p>
              </div>
            </div>

            {/* CTA */}
            <Link
              href="/catalog"
              className="mb-6 inline-flex items-center justify-center gap-2 rounded-lg bg-lotus px-4 py-3 text-sm font-semibold text-white transition hover:bg-oxblood"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Thuê bộ mới
            </Link>

            {/* Nav items */}
            <nav className="flex flex-1 flex-col gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/dashboard/customer" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={
                      isActive
                        ? "flex items-center gap-3 rounded-lg bg-lotus/10 px-4 py-3 text-sm font-semibold text-lotus"
                        : "flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-stone-600 transition hover:bg-white hover:text-lotus"
                    }
                  >
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Sign out */}
            <button
              type="button"
              onClick={handleSignOut}
              className="mt-4 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-stone-600 transition hover:bg-white hover:text-lotus"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              Đăng xuất
            </button>
          </aside>

          {/* Main content */}
          <main className="min-w-0 flex-1 px-4 py-8 pb-24 md:px-10 md:py-10 md:pb-10">
            <div className="mx-auto max-w-[1200px]">{children}</div>
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 border-t border-sand bg-mist/95 backdrop-blur-md md:hidden">
          {navItems.slice(0, 5).map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard/customer" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-1 flex-col items-center justify-center gap-1 transition ${
                  isActive ? "text-lotus" : "text-stone-500 hover:text-stone-800"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span className="text-[10px] font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <CustomerFooter />
      </div>
    </ProtectedPage>
  );
}
