"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ProtectedPage } from "@/components/auth/protected-page";
import { useAuth } from "@/components/auth/auth-provider";

const tabs = [
  { href: "/dashboard/customer", label: "Overview" },
  { href: "/dashboard/customer/profile", label: "Profile" },
  { href: "/dashboard/customer/measurements", label: "Measurements" },
  { href: "/dashboard/customer/addresses", label: "Addresses" },
];

export default function CustomerDashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <ProtectedPage allowedRoles={["customer"]}>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-jade">Customer</p>
            <h1 className="mt-2 text-3xl font-semibold text-ink">Customer account</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Manage your contact details, body measurements, and delivery addresses for rental orders.
            </p>
          </div>
          <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Current account</p>
            <h2 className="mt-3 text-lg font-semibold text-ink">{user?.fullName ?? user?.email ?? "Customer"}</h2>
            <dl className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex justify-between gap-4">
                <dt>Email</dt>
                <dd className="text-right text-ink">{user?.email ?? "-"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Phone</dt>
                <dd className="text-right text-ink">{user?.phone ?? "Not updated"}</dd>
              </div>
            </dl>
          </section>
        </div>

        <nav className="mt-8 flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={isActive ? "page" : undefined}
                className={isActive
                  ? "rounded-md bg-ink px-4 py-2 text-sm font-medium text-white"
                  : "rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8">{children}</div>
      </div>
    </ProtectedPage>
  );
}
