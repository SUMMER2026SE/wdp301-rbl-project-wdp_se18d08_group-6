"use client";

import Link from "next/link";
import { FormEvent, Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { getDashboardPathByRole } from "@/lib/auth";

type LoginResult = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
};

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await apiRequest<LoginResult>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!result.success || !result.data) {
        setError(result.message ?? "Đăng nhập thất bại");
        return;
      }

      const storage = rememberMe ? window.localStorage : window.sessionStorage;
      const otherStorage = rememberMe ? window.sessionStorage : window.localStorage;

      otherStorage.removeItem("access_token");
      otherStorage.removeItem("user_role");
      otherStorage.removeItem("user_email");

      storage.setItem("access_token", result.data.accessToken);
      storage.setItem("user_role", result.data.user.role);
      storage.setItem("user_email", result.data.user.email);

      router.push(getDashboardPathByRole(result.data.user.role));
    } catch {
      setError("Không thể kết nối đến hệ thống đăng nhập.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen w-full bg-white">
      <div className="flex min-h-screen w-full flex-col md:flex-row">
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
                <button type="button" className="font-semibold text-lotus transition hover:text-oxblood" onClick={() => setError("Chức năng quên mật khẩu đang được cập nhật.")}>Quên mật khẩu?</button>
              </div>

              {error ? <p className="text-sm text-red-700">{error}</p> : null}

              <div className="pt-2">
                <button
                  className="focus-ring flex w-full justify-center rounded-sm bg-lotus px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-oxblood disabled:cursor-not-allowed disabled:opacity-60"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Đang đăng nhập..." : "Đăng nhập"}
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
