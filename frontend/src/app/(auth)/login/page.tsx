"use client";

import Link from "next/link";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
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

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, signIn, status } = useAuth();

  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const registeredMessage = useMemo(() => {
    if (searchParams.get("registered") !== "1") {
      return null;
    }
    return "Tài khoản mới đã được tạo. Bạn có thể đăng nhập ngay.";
  }, [searchParams]);

  // Tự động chuyển hướng nếu đã đăng nhập
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
        // Email chưa xác thực → chuyển đến trang nhập OTP
        if (result.message === "EMAIL_NOT_VERIFIED") {
          router.push(`/verify-email?email=${encodeURIComponent(normalizedEmail)}`);
          return;
        }
        setError(result.message ?? "Email hoặc mật khẩu không đúng.");
        return;
      }

      // Đăng nhập qua context AuthProvider (thay thế cách lưu localStorage thủ công)
      signIn({ accessToken: result.data.accessToken, user: toAuthenticatedUser(result.data.user) });
      router.push(getSafeRedirectPath(searchParams.get("next"), resolveDashboardPath(result.data.user.role)));
    } catch {
      setError("Không thể kết nối đến hệ thống đăng nhập.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen w-full bg-white">
      <div className="flex min-h-screen w-full flex-col md:flex-row">
        {/* Cột trái: Ảnh di sản đẹp mắt */}
        <section className="relative hidden overflow-hidden bg-[#fee2dd] md:flex md:w-1/2">
          <img
            alt="Cổ Phục Rental - Heritage"
            className="absolute inset-0 h-full w-full object-cover"
            src="https://lh3.googleusercontent.com/aida/AP1WRLuW52zIUPG8s28NGtCZDox-IsYxTuydKP_K4rWuLOB5gdlIbvRy8-CQNiUTpxBOgVzlCIwzOIK5CJaNf_t1rMKqLDdnjDInRE0TNkAdMx6NI7c4eRsVAwhIP0ScRVOczYYBJVIeDilq85F_r-OAQt01_S6j_TMgwFkNP7Un6GJq5OuB8ZiGPluckIqInH7ZBKk1SVSbQzjYyyJs6sMyoV_Szs72Fh4piXP_iHDwm_elQjCRJvQJMbHn6Ds"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-oxblood/60 to-transparent" />
          <div className="absolute bottom-0 left-0 p-12 text-white">
            <h1 className="font-display text-5xl">Cổ Phục Rental</h1>
            <p className="mt-4 max-w-md text-lg leading-8 text-white/85">
              Preserving the elegance of Vietnamese cultural heritage, one garment at a time.
            </p>
          </div>
        </section>

        {/* Cột phải: Form đăng nhập */}
        <section className="flex w-full items-center justify-center bg-white px-4 py-10 md:w-1/2 md:px-12">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center md:hidden">
              <h1 className="font-display text-4xl text-oxblood">Cổ Phục Rental</h1>
            </div>

            <div className="mb-10 text-center md:text-left">
              <h2 className="font-display text-5xl text-lotus">Chào Mừng Trở Lại</h2>
              <p className="mt-2 text-base text-[#5a403c]">Cổng thông tin dành cho Khách hàng và Thành viên Cửa hàng</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {registeredMessage ? (
                <div className="rounded-sm border border-jade/20 bg-jade/10 px-4 py-3 text-sm text-jade">
                  {registeredMessage}
                </div>
              ) : null}

              <div>
                <label className="mb-1 block text-sm font-semibold text-ink" htmlFor="email">Email</label>
                <input
                  id="email"
                  className="focus-ring block w-full border border-sand bg-white px-4 py-3 text-ink shadow-sm"
                  autoComplete="email"
                  placeholder="your@email.com"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-ink" htmlFor="password">Mật khẩu</label>
                <input
                  id="password"
                  className="focus-ring block w-full border border-sand bg-white px-4 py-3 text-ink shadow-sm"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>

              <div className="flex items-center justify-between gap-4 pt-1 text-sm">
                <label className="flex items-center gap-2 text-ink">
                  <input
                    className="h-4 w-4 rounded border-sand text-lotus focus:ring-antique"
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                  />
                  Ghi nhớ đăng nhập
                </label>
                <button
                  type="button"
                  className="font-semibold text-lotus transition hover:text-oxblood"
                  onClick={() => setError("Chức năng quên mật khẩu đang được cập nhật.")}
                >
                  Quên mật khẩu?
                </button>
              </div>

              {error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <div className="pt-2">
                <button
                  className="focus-ring flex w-full justify-center rounded-sm bg-lotus px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-oxblood disabled:cursor-not-allowed disabled:opacity-60"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Đang xử lý..." : "Đăng nhập"}
                </button>
              </div>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-sand/60" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-[#5a403c]">Hoặc</span>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-[#5a403c]">
                Khách hàng mới?
                <Link className="ml-1 font-semibold text-lotus transition hover:text-oxblood hover:underline" href="/register">
                  Đăng ký tài khoản mới
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <LoginPageContent />
    </Suspense>
  );
}
