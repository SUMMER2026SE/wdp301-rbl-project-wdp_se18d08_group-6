"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { apiRequest } from "@/lib/api";
import { resolveDashboardPath, toAuthenticatedUser, type AppRole } from "@/lib/auth";

type LoginResult = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: AppRole;
  };
};

function getSafeRedirectPath(value: string | null, fallbackPath: string) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : fallbackPath;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, signIn, status } = useAuth();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session) {
      router.replace(getSafeRedirectPath(searchParams.get("next"), resolveDashboardPath(session.user.role)));
    }
  }, [router, searchParams, session, status]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const result = await apiRequest<LoginResult>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: normalizedEmail, password }),
      });

      if (!result.success || !result.data) {
        // Nếu email chưa xác thực, chuyển hướng sang trang nhập OTP
        if (result.message === "EMAIL_NOT_VERIFIED") {
          router.push(`/verify-email?email=${encodeURIComponent(normalizedEmail)}`);
          return;
        }
        setError(result.message ?? "Email hoặc mật khẩu không đúng.");
        return;
      }

      signIn({ accessToken: result.data.accessToken, user: toAuthenticatedUser(result.data.user) });
      router.push(getSafeRedirectPath(searchParams.get("next"), resolveDashboardPath(result.data.user.role)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat p-4"
      style={{ backgroundImage: "url('/images/bg-ao-dai.png')" }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/40 bg-white/60 p-8 shadow-[0_8px_32px_0_rgba(31,41,51,0.15)] backdrop-blur-xl">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-4xl font-bold text-ink">Đăng nhập</h1>
          <p className="mt-2 text-sm text-slate-700">Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-800">Email</label>
            <input
              className="w-full rounded-xl border border-white/50 bg-white/50 px-4 py-3 text-ink placeholder-slate-500 shadow-sm backdrop-blur-sm transition-all duration-300 focus:border-lotus focus:bg-white/80 focus:outline-none focus:ring-4 focus:ring-lotus/20"
              type="email"
              placeholder="nhap.email@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-800">Mật khẩu</label>
            <input
              className="w-full rounded-xl border border-white/50 bg-white/50 px-4 py-3 text-ink placeholder-slate-500 shadow-sm backdrop-blur-sm transition-all duration-300 focus:border-lotus focus:bg-white/80 focus:outline-none focus:ring-4 focus:ring-lotus/20"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          
          {error ? (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
              {error}
            </div>
          ) : null}
          
          <button
            className="w-full rounded-xl bg-lotus px-4 py-3.5 font-medium text-white shadow-lg shadow-lotus/30 transition-all duration-300 hover:bg-lotus/90 focus:outline-none focus:ring-4 focus:ring-lotus/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-700">
          Chưa có tài khoản?{" "}
          <Link className="font-semibold text-lotus transition-colors hover:text-lotus/80 hover:underline" href="/register">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
