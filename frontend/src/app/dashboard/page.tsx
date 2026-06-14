"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { resolveDashboardPath } from "@/lib/auth";

export default function DashboardPage() {
  const router = useRouter();
  const { session, status } = useAuth();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login?next=%2Fdashboard");
      return;
    }

    if (status === "authenticated" && session) {
      router.replace(resolveDashboardPath(session.user.role));
    }
  }, [router, session, status]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
        {status === "loading" ? "Checking your account..." : "Redirecting to your dashboard..."}
      </div>
    </div>
  );
}
