import Link from "next/link";
import type { ReactNode } from "react";
import { bookingFlowSteps } from "@/lib/heritage-mock-data";

type PublicNavKey = "collection" | "heritage" | "atelier" | "erp";
type BookingStepKey = (typeof bookingFlowSteps)[number]["key"];
type StaffNavKey = "overview" | "inspection";
type ManagerNavKey = "overview" | "inventory" | "inspection-log" | "laundry" | "damaged" | "finance" | "refunds" | "assets";

function navClass(active: boolean) {
  return active
    ? "border-b border-lotus pb-1 text-sm font-semibold uppercase tracking-[0.18em] text-lotus"
    : "border-b border-transparent pb-1 text-sm font-medium uppercase tracking-[0.18em] text-stone-600 transition hover:border-lotus/30 hover:text-lotus";
}

export function PublicAtelierNav({ active }: { active: PublicNavKey }) {
  const items = [
    { key: "collection", label: "Bộ sưu tập", href: "/catalog" },
    { key: "heritage", label: "Di sản", href: "/#di-san" },
    { key: "atelier", label: "Thử đồ AI", href: "/try-on" },
    { key: "erp", label: "Bảng điều hành ERP", href: "/dashboard/staff" },
  ] as const;

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-sand/60 bg-mist/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="font-display text-3xl text-lotus sm:text-4xl">
          Cổ Phục Rental
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {items.map((item) => (
            <Link key={item.key} href={item.href} className={navClass(item.key === active)}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 text-lotus">
          <Link href="/booking/review" aria-label="Giỏ thuê đồ" className="rounded-full p-2 transition hover:bg-lotus/10">
            <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
          </Link>
          <Link href="/dashboard/customer" aria-label="Tài khoản" className="rounded-full p-2 transition hover:bg-lotus/10">
            <span className="material-symbols-outlined text-[22px]">person</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

export function BookingFlowShell({
  currentStep,
  title,
  description,
  children,
}: {
  currentStep: BookingStepKey;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#fff8f6] text-ink">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-sand/70 bg-mist/95 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="font-display text-3xl text-lotus">Áo Dài Atelier</Link>
          <nav className="hidden gap-8 text-sm text-stone-600 md:flex">
            <Link href="/catalog" className="transition hover:text-lotus">Bộ sưu tập</Link>
            <Link href="/#di-san" className="transition hover:text-lotus">Di sản</Link>
            <Link href="/try-on" className="transition hover:text-lotus">Thử đồ AI</Link>
          </nav>
          <Link href="/dashboard/customer" className="text-lotus">
            <span className="material-symbols-outlined text-[24px]">account_circle</span>
          </Link>
        </div>
      </header>

      <div className="flex pt-20">
        <aside className="hidden h-[calc(100vh-80px)] w-64 shrink-0 border-r border-sand/70 bg-[#fff4ef] p-6 lg:sticky lg:top-20 lg:flex lg:flex-col">
          <div className="mb-8">
            <h2 className="font-display text-2xl text-lotus">Tiến trình đặt thuê</h2>
            <p className="mt-1 text-sm text-stone-500">Theo dõi từng bước xác nhận</p>
          </div>
          <nav className="flex flex-1 flex-col gap-2">
            {bookingFlowSteps.map((step) => {
              const isActive = step.key === currentStep;
              return (
                <Link
                  key={step.key}
                  href={step.href}
                  className={isActive
                    ? "flex items-center gap-3 rounded-lg bg-[#ffe9e6] px-4 py-3 text-sm font-semibold text-lotus"
                    : "flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-stone-600 transition hover:bg-[#fff8f6] hover:text-lotus"}
                >
                  <span className="material-symbols-outlined text-[20px]">{step.icon}</span>
                  <span>{step.label}</span>
                </Link>
              );
            })}
          </nav>
          <button type="button" className="mt-6 rounded-lg border border-sand bg-white px-4 py-3 text-sm font-medium text-lotus transition hover:bg-[#fff8f6]">
            Hỗ trợ đặt thuê
          </button>
        </aside>

        <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-12 lg:py-12">
          <div className="mb-10 max-w-3xl">
            <h1 className="font-display text-4xl text-ink sm:text-5xl">{title}</h1>
            <p className="mt-3 text-base leading-8 text-stone-600">{description}</p>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

export function CustomerDashboardShell({ children }: { children: ReactNode }) {
  const items = [
    { label: "Đơn thuê", icon: "calendar_today", href: "/dashboard/customer", active: true },
    { label: "Thử đồ AI", icon: "face_retouching_natural", href: "/try-on" },
    { label: "Số đo", icon: "straighten", href: "/dashboard/customer" },
    { label: "Hồ sơ", icon: "person", href: "/dashboard/customer" },
  ];

  return (
    <div className="min-h-screen bg-[#f9f5f0] text-ink md:flex">
      <aside className="hidden w-72 shrink-0 flex-col border-r border-sand bg-[#fff8f6] p-6 md:flex">
        <div className="mb-8">
          <h1 className="font-display text-4xl text-lotus">Áo Dài Atelier</h1>
        </div>
        <div className="mb-8 flex items-center gap-4 rounded-xl border border-sand/70 bg-white p-4">
          <img
            alt="Khách hàng"
            className="h-12 w-12 rounded-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_QN_tItDbrCaf8a7smjJ-LiW9FTeIP80Lomru3jba9_6LS_8WweViMDVmnOMibpAF6CI4z9S-J6Au5JDR8pTr2CbeX2y8oKDRBbMAyNe31d8iomBXmoLiiwWDBFlNQ6LVtet4kZyp4v0_gpYddfFCpReV54CK_MyiqPq0fOwMG7qaX5gp0AqESHobBR2h7KFa-pgLH5wW79xwrtFqIoqAX3oybSTevo27JHCgK_QsJpcT5dVnePGv6saMN7rI04PgHAClY1sIw2aa"
          />
          <div>
            <p className="text-lg font-semibold text-ink">Xin chào</p>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-antique">Thành viên di sản</p>
          </div>
        </div>
        <Link href="/catalog" className="mb-6 inline-flex items-center justify-center gap-2 rounded-lg bg-lotus px-4 py-3 text-sm font-semibold text-white transition hover:bg-oxblood">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Thuê bộ mới
        </Link>
        <nav className="flex flex-1 flex-col gap-2">
          {items.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={item.active
                ? "flex items-center gap-3 rounded-lg bg-[#ffe9e6] px-4 py-3 text-sm font-semibold text-lotus"
                : "flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-stone-600 transition hover:bg-white hover:text-lotus"}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-10">{children}</main>
    </div>
  );
}

export function StaffPortalShell({
  active,
  title,
  subtitle,
  onTabChange,
  children,
}: {
  active: StaffNavKey;
  title: string;
  subtitle: string;
  children: ReactNode;
  onTabChange?: (key: StaffNavKey) => void;
}) {
  const items = [
    { key: "overview", label: "Tổng quan", icon: "dashboard", href: "/dashboard/staff" },
    { key: "inspection", label: "Kiểm tra", icon: "search_check", href: "/dashboard/staff/inspection" },
  ] as const;

  return (
    <div className="min-h-screen bg-[#f9f5f0] text-ink lg:flex">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sand bg-[#fff4ef] p-4 lg:flex">
        <div className="mb-8 px-3 pt-4">
          <h1 className="font-display text-3xl text-lotus">Nhân sự Atelier</h1>
          <p className="mt-1 text-sm text-stone-500">Central Operations</p>
        </div>
        <Link href="/catalog" className="mb-8 inline-flex items-center justify-center gap-2 rounded-xl bg-lotus px-4 py-3 text-sm font-semibold text-white transition hover:bg-oxblood">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Tạo booking mới
        </Link>
        <nav className="flex flex-1 flex-col gap-2">
          {items.map((item) => {
            const isActive = item.key === active;
            return (
              <a
                key={item.key}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  onTabChange?.(item.key);
                }}
                className={isActive
                  ? "flex items-center gap-3 rounded-xl bg-[#ffe9e6] px-4 py-3 text-sm font-semibold text-lotus"
                  : "flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-stone-600 transition hover:bg-white hover:text-lotus"}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-sand bg-[#fff8f6]/95 px-4 backdrop-blur md:px-6 lg:px-8">
          <div>
            <h2 className="font-display text-3xl text-lotus">Cổ Phục Rental</h2>
            <p className="text-xs uppercase tracking-[0.18em] text-stone-500">{subtitle}</p>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-stone-400">search</span>
              <input
                className="w-72 rounded-full border border-sand bg-white py-2 pl-10 pr-4 text-sm text-ink outline-none transition focus:border-antique"
                placeholder="Tìm mã đơn, khách hàng..."
                type="text"
              />
            </div>
            <button type="button" className="rounded-full p-2 text-lotus transition hover:bg-lotus/10">
              <span className="material-symbols-outlined text-[22px]">notifications</span>
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="font-display text-4xl text-ink sm:text-5xl">{title}</h1>
            <p className="mt-2 text-base text-stone-600">{subtitle}</p>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

export function ManagerPortalShell({
  active,
  title,
  subtitle,
  onTabChange,
  managerName = "Quản lý cửa hàng",
  managerEmail,
  onProfile,
  onSignOut,
  currentDateLabel = "",
  children,
}: {
  active: ManagerNavKey;
  title: string;
  subtitle: string;
  onTabChange?: (key: ManagerNavKey) => void;
  managerName?: string;
  managerEmail?: string | null;
  onProfile?: () => void;
  onSignOut?: () => void;
  currentDateLabel?: string;
  children: ReactNode;
}) {
  const initials = managerName
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "QL";
  // Manager: nút chính là thêm trang phục (đi tới inventory), không phải tạo booking
  const items = [
    { key: "overview", label: "Tổng quan", icon: "dashboard", href: "/dashboard/manager" },
    { key: "assets", label: "Gán tài sản", icon: "swap_horiz", href: "/dashboard/manager#assets" },
    { key: "inventory", label: "Kho trang phục", icon: "inventory_2", href: "/dashboard/manager#inventory" },
    { key: "inspection-log", label: "Nhật ký kiểm tra", icon: "fact_check", href: "/dashboard/manager#inspection-log" },
    { key: "laundry", label: "Giặt sấy", icon: "dry_cleaning", href: "/dashboard/manager#laundry" },
    { key: "damaged", label: "Hư hỏng & Mất", icon: "report_problem", href: "/dashboard/manager#damaged" },
    { key: "finance", label: "Tài chính", icon: "payments", href: "/dashboard/manager#finance" },
    { key: "refunds", label: "Duyệt hoàn cọc", icon: "request_quote", href: "/dashboard/manager#refunds" },
  ] as const;
  return (
    <div className="min-h-screen bg-[#f9f5f0] text-ink lg:flex">
      <aside className="hidden w-72 shrink-0 flex-col border-r border-sand bg-[#fff4ef] p-4 lg:flex">
        <div className="mb-8 px-3 pt-4">
          <h1 className="font-display text-3xl text-lotus">Cổ Phục Rental</h1>
          <p className="mt-1 text-sm text-stone-500">Bảng quản lý vận hành</p>
        </div>
        <div className="mb-8 flex items-center gap-4 rounded-xl border border-sand/70 bg-white p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ffe9e6] font-display text-xl text-lotus">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">{managerName}</p>
            <p className="truncate text-xs uppercase tracking-[0.16em] text-antique">{managerEmail ?? "Manager / Owner"}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onTabChange?.("inventory")}
          className="mb-6 inline-flex items-center justify-center gap-2 rounded-xl bg-lotus px-4 py-3 text-sm font-semibold text-white transition hover:bg-oxblood"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Thêm trang phục
        </button>
        <nav className="flex flex-1 flex-col gap-2">
          {items.map((item) => {
            const isActive = item.key === active;
            return (
              <a
                key={item.key}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  onTabChange?.(item.key);
                }}
                className={isActive
                  ? "flex items-center gap-3 rounded-xl bg-[#ffe9e6] px-4 py-3 text-sm font-semibold text-lotus"
                  : "flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-stone-600 transition hover:bg-white hover:text-lotus"}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>
        <div className="mt-6 border-t border-sand pt-4">
          <button type="button" className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-stone-600 transition hover:bg-white hover:text-lotus">
            <span className="material-symbols-outlined text-[20px]">support_agent</span>
            <span>Hỗ trợ vận hành</span>
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-sand bg-[#fff8f6]/95 px-4 backdrop-blur md:px-6 lg:px-8">
          <div>
            <h2 className="font-display text-3xl text-lotus">Cổ Phục Rental</h2>
            <p className="text-xs uppercase tracking-[0.18em] text-stone-500">{subtitle}</p>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <div className="rounded-full border border-sand bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
              {currentDateLabel || "Đang đồng bộ"}
            </div>
            <button type="button" onClick={() => onTabChange?.("assets")} className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100">
              <span className="material-symbols-outlined text-[18px]">priority_high</span>
              Cần xử lý
            </button>
            <button type="button" onClick={onProfile} className="inline-flex items-center gap-2 rounded-full border border-sand bg-white px-3 py-2 text-sm font-semibold text-stone-600 transition hover:border-lotus hover:text-lotus">
              <span className="material-symbols-outlined text-[18px]">account_circle</span>
              Hồ sơ
            </button>
            <button type="button" onClick={onSignOut} className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100">
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Đăng xuất
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-4xl text-ink sm:text-5xl">{title}</h1>
              <p className="mt-2 text-base text-stone-600">{subtitle}</p>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bronze">Manager / Owner</p>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}


