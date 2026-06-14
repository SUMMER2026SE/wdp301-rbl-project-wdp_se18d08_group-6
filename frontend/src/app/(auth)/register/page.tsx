"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { apiRequest } from "@/lib/api";
import { resolveDashboardPath } from "@/lib/auth";

type RegisterResult = {
  id: string;
  email: string;
  role: string;
};

type PasswordStrength = {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
};

function checkPasswordStrength(password: string): PasswordStrength {
  return {
    hasMinLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
  };
}

function isPasswordStrong(strength: PasswordStrength): boolean {
  return strength.hasMinLength && strength.hasUppercase && strength.hasLowercase && strength.hasNumber;
}

function StrengthItem({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`flex items-center gap-1 text-xs transition-colors ${ok ? "text-jade" : "text-slate-400"}`}>
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${ok ? "bg-jade" : "bg-slate-300"}`} />
      {label}
    </span>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { session, status } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const strength = checkPasswordStrength(password);
  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  useEffect(() => {
    if (status === "authenticated" && session) {
      router.replace(resolveDashboardPath(session.user.role));
    }
  }, [router, session, status]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!isPasswordStrong(strength)) {
      setError("Mật khẩu chưa đủ mạnh. Vui lòng đáp ứng tất cả yêu cầu bên dưới.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);

    try {
      const result = await apiRequest<RegisterResult>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ fullName, email, password }),
      });

      if (!result.success) {
        setError(result.message ?? "Đăng ký thất bại. Vui lòng thử lại.");
        return;
      }

      router.push(`/verify-email?email=${encodeURIComponent(email.trim().toLowerCase())}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat p-4 py-12"
      style={{ backgroundImage: "url('/images/bg-ao-dai.png')" }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/40 bg-white/60 p-8 shadow-[0_8px_32px_0_rgba(31,41,51,0.15)] backdrop-blur-xl">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-4xl font-bold text-ink">Đăng ký</h1>
          <p className="mt-2 text-sm text-slate-700">Tạo tài khoản khách hàng mới để trải nghiệm dịch vụ.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" suppressHydrationWarning>
          {/* Họ và tên */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-800">Họ và tên</label>
            <input suppressHydrationWarning
              className="w-full rounded-xl border border-white/50 bg-white/50 px-4 py-3 text-ink placeholder-slate-500 shadow-sm backdrop-blur-sm transition-all duration-300 focus:border-lotus focus:bg-white/80 focus:outline-none focus:ring-4 focus:ring-lotus/20"
              placeholder="Nguyễn Văn A"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-800">Email</label>
            <input suppressHydrationWarning
              className="w-full rounded-xl border border-white/50 bg-white/50 px-4 py-3 text-ink placeholder-slate-500 shadow-sm backdrop-blur-sm transition-all duration-300 focus:border-lotus focus:bg-white/80 focus:outline-none focus:ring-4 focus:ring-lotus/20"
              type="email"
              placeholder="nhap.email@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          {/* Mật khẩu + thanh kiểm tra độ mạnh */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-800">Mật khẩu</label>
            <input suppressHydrationWarning
              className="w-full rounded-xl border border-white/50 bg-white/50 px-4 py-3 text-ink placeholder-slate-500 shadow-sm backdrop-blur-sm transition-all duration-300 focus:border-lotus focus:bg-white/80 focus:outline-none focus:ring-4 focus:ring-lotus/20"
              type="password"
              placeholder="Tối thiểu 8 ký tự"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onBlur={() => setPasswordTouched(true)}
              required
            />
            {/* Hiển thị kiểm tra độ mạnh khi người dùng bắt đầu nhập */}
            {(passwordTouched || password.length > 0) && (
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 rounded-lg border border-white/50 bg-white/40 px-3 py-2">
                <StrengthItem ok={strength.hasMinLength} label="≥ 8 ký tự" />
                <StrengthItem ok={strength.hasUppercase} label="Chữ hoa (A-Z)" />
                <StrengthItem ok={strength.hasLowercase} label="Chữ thường (a-z)" />
                <StrengthItem ok={strength.hasNumber} label="Chữ số (0-9)" />
              </div>
            )}
          </div>

          {/* Xác nhận mật khẩu */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-800">Xác nhận mật khẩu</label>
            <input suppressHydrationWarning
              className={`w-full rounded-xl border px-4 py-3 text-ink placeholder-slate-500 shadow-sm backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-4 bg-white/50 ${
                passwordMismatch
                  ? "border-red-400 focus:border-red-400 focus:ring-red-200"
                  : "border-white/50 focus:border-lotus focus:bg-white/80 focus:ring-lotus/20"
              }`}
              type="password"
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
            {passwordMismatch && (
              <p className="mt-1 text-xs text-red-600">Mật khẩu xác nhận không khớp.</p>
            )}
            {!passwordMismatch && confirmPassword.length > 0 && password === confirmPassword && (
              <p className="mt-1 text-xs text-jade">✓ Mật khẩu khớp nhau.</p>
            )}
          </div>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <button suppressHydrationWarning
            className="w-full rounded-xl bg-lotus px-4 py-3.5 font-medium text-white shadow-lg shadow-lotus/30 transition-all duration-300 hover:bg-lotus/90 focus:outline-none focus:ring-4 focus:ring-lotus/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            {loading ? "Đang tạo tài khoản..." : "Đăng ký ngay"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-700">
          Đã có tài khoản?{" "}
          <Link className="font-semibold text-lotus transition-colors hover:text-lotus/80 hover:underline" href="/login">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
