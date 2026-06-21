"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { getRoleLabel, resolveDashboardPath } from "@/lib/auth";
import { publicNavItems } from "@/lib/site-content";

const authRoutes = new Set(["/login", "/register", "/verify-email", "/forgot-password", "/reset-password"]);
const hiddenPrefixes = ["/catalog", "/booking", "/try-on", "/dashboard/customer", "/dashboard/staff", "/dashboard/manager", "/dashboard/admin"];

const appNavItems = [
  { href: "/catalog", label: "Danh mục" },
  { href: "/dashboard", label: "Bảng điều khiển" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, signOut, status } = useAuth();

  const publicSectionIds = useMemo(
    () => publicNavItems.map((item) => item.href.split("#")[1]).filter(Boolean),
    [],
  );
  const [activeSection, setActiveSection] = useState(publicSectionIds[0] ?? "");

  useEffect(() => {
    if (pathname !== "/") {
      return;
    }

    function syncActiveSectionFromViewport() {
      const sections = publicSectionIds
        .map((id) => document.getElementById(id))
        .filter((section): section is HTMLElement => section instanceof HTMLElement);

      const visibleSection = sections.find((section) => {
        const rect = section.getBoundingClientRect();
        return rect.top <= 180 && rect.bottom >= 180;
      });

      if (visibleSection) {
        setActiveSection(visibleSection.id);
        return;
      }

      if (window.scrollY < 120 && publicSectionIds[0]) {
        setActiveSection(publicSectionIds[0]);
      }
    }

    function syncActiveSectionFromHash() {
      const currentHash = window.location.hash.replace("#", "");

      if (currentHash && publicSectionIds.includes(currentHash)) {
        setActiveSection(currentHash);
        return;
      }

      syncActiveSectionFromViewport();
    }

    syncActiveSectionFromHash();
    window.addEventListener("scroll", syncActiveSectionFromViewport, { passive: true });
    window.addEventListener("hashchange", syncActiveSectionFromHash);

    return () => {
      window.removeEventListener("scroll", syncActiveSectionFromViewport);
      window.removeEventListener("hashchange", syncActiveSectionFromHash);
    };
  }, [pathname, publicSectionIds]);

  if (authRoutes.has(pathname)) {
    return null;
  }

  if (hiddenPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return null;
  }

  const displayName = session?.user.fullName ?? session?.user.email ?? null;
  const dashboardHref = session ? resolveDashboardPath(session.user.role) : "/dashboard";

  // Header cho landing page (pathname = "/")
  if (pathname === "/") {
    return (
      <header className="sticky top-0 z-40 border-b border-sand/80 bg-parchment/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="font-display text-3xl leading-none text-lotus">
            Cổ Phục Rental
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {publicNavItems.map((item) => {
              const sectionId = item.href.split("#")[1] ?? "";
              const isActive = activeSection === sectionId;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={isActive
                    ? "border-b border-lotus pb-1 text-sm font-semibold text-lotus"
                    : "border-b border-transparent pb-1 text-sm font-medium text-stone-600 transition hover:border-lotus/35 hover:text-lotus"}
                  onClick={() => setActiveSection(sectionId)}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/catalog" className="hidden rounded-sm bg-lotus px-5 py-2 text-sm font-semibold text-white transition hover:bg-oxblood md:inline-flex">
              Thuê Ngay
            </Link>
            <button type="button" className="text-stone-600 transition hover:text-lotus" aria-label="Tìm kiếm">
              <span className="material-symbols-outlined text-[22px]">search</span>
            </button>
            <button type="button" className="text-stone-600 transition hover:text-lotus" aria-label="Giỏ thuê đồ">
              <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
            </button>

            {/* Hiển thị icon tài khoản theo trạng thái đăng nhập */}
            {status === "authenticated" && session ? (
              <div className="relative flex items-center gap-2">
                <Link href={dashboardHref} className="hidden text-stone-600 transition hover:text-lotus md:inline-flex" aria-label="Dashboard">
                  <span className="material-symbols-outlined text-[22px]">person</span>
                </Link>
              </div>
            ) : (
              <Link href="/login" className="hidden text-stone-600 transition hover:text-lotus md:inline-flex" aria-label="Tài khoản">
                <span className="material-symbols-outlined text-[22px]">person</span>
              </Link>
            )}
          </div>
        </div>
      </header>
    );
  }

  // Header cho các trang app (dashboard/manager, catalog, v.v.)
  return (
    <header className="sticky top-0 z-40 border-b border-sand/80 bg-mist/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="font-display text-3xl leading-none text-lotus">
          Cổ Phục Rental
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-stone-700 md:flex">
          {appNavItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-lotus">
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Khu vực tài khoản: hiển thị theo trạng thái đăng nhập */}
        {status === "authenticated" && session ? (
          <div className="flex items-center gap-3">
            <div className="hidden flex-col items-end text-right md:flex">
              <p className="max-w-[160px] truncate text-sm font-semibold text-ink">{displayName}</p>
              <p className="text-xs text-stone-500">{getRoleLabel(session.user.role)}</p>
            </div>
            <Link
              href={dashboardHref}
              className="rounded-sm border border-lotus/40 px-3 py-1.5 text-sm font-medium text-lotus transition hover:bg-lotus hover:text-white"
            >
              Dashboard
            </Link>
            <button
              type="button"
              className="rounded-sm bg-lotus px-4 py-2 text-sm font-semibold text-white transition hover:bg-oxblood"
              onClick={() => {
                signOut();
                router.push("/login");
              }}
            >
              Đăng xuất
            </button>
          </div>
        ) : (
          <Link href="/login" className="rounded-sm bg-lotus px-4 py-2 text-sm font-semibold text-white transition hover:bg-oxblood">
            Đăng nhập
          </Link>
        )}
      </div>
    </header>
  );
}
