"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { getRoleLabel, resolveDashboardPath } from "@/lib/auth";

export function Header() {
  const router = useRouter();
  const { session, signOut } = useAuth();
  const dashboardHref = session ? resolveDashboardPath(session.user.role) : "/dashboard";
  const displayName = session?.user.fullName ?? session?.user.email ?? "Account";

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <Link href="/" className="text-base font-semibold tracking-wide text-ink">
          Co Phuc ERP
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-2 text-sm">
          <Link href="/catalog" className="rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100">
            Catalog
          </Link>
          <Link href={dashboardHref} className="rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100">
            Dashboard
          </Link>
          {session?.user.role === "customer" ? (
            <Link href="/dashboard/customer/profile" className="rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100">
              My profile
            </Link>
          ) : null}
          {session ? (
            <>
              <div className="hidden min-w-[10rem] text-right sm:block">
                <p className="truncate text-sm font-medium text-ink">{displayName}</p>
                <p className="mt-1 text-xs text-slate-500">{getRoleLabel(session.user.role)}</p>
              </div>
              <button
                type="button"
                className="rounded-md border border-slate-300 px-3 py-2 font-medium text-slate-700 hover:bg-slate-100"
                onClick={() => {
                  signOut();
                  router.push("/login");
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/register" className="rounded-md border border-slate-300 px-3 py-2 font-medium text-slate-700 hover:bg-slate-100">
                Register
              </Link>
              <Link href="/login" className="rounded-md bg-ink px-3 py-2 font-medium text-white hover:bg-slate-700">
                Login
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
