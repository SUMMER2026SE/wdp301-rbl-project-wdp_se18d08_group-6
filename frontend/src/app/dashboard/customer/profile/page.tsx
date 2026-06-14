"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { apiRequest } from "@/lib/api";
import { normalizeNullableText, type AuthenticatedUser } from "@/lib/auth";

export default function CustomerProfilePage() {
  const { replaceUser, user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFullName(user?.fullName ?? "");
    setPhone(user?.phone ?? "");
  }, [user?.fullName, user?.phone]);

  if (!user) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setSaving(true);

    try {
      const result = await apiRequest<AuthenticatedUser>("/users/me/profile", {
        method: "PATCH",
        body: JSON.stringify({
          fullName: normalizeNullableText(fullName),
          phone: normalizeNullableText(phone),
        }),
      });

      if (!result.success || !result.data) {
        setError(result.message ?? "Không thể cập nhật hồ sơ.");
        return;
      }

      replaceUser(result.data);
      setMessage("Cập nhật hồ sơ thành công.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-12 border-b pb-8" style={{ borderColor: "#e3beb8" }}>
        <h1 className="text-[40px] font-medium tracking-tight" style={{ color: "#8B0000", fontFamily: "EB Garamond, serif" }}>
          Hồ Sơ Cá Nhân
        </h1>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed" style={{ color: "#6E5E40" }}>
          Quản lý thông tin cá nhân và số liên lạc để đảm bảo lịch hẹn tại atelier và giao nhận trang phục được thuận tiện nhất.
        </p>
      </div>

      {/* Content Grid: Asymmetric 5/7 */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">

        {/* Column 1: Readonly account info (5 cols) */}
        <div className="flex flex-col gap-6 lg:col-span-5">
          <div className="relative overflow-hidden rounded-xl border p-8"
            style={{ backgroundColor: "#ffffff", borderColor: "#e3beb8", boxShadow: "0 8px 32px rgba(74,4,4,0.05)" }}>
            {/* Decorative circle */}
            <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-bl-full opacity-40"
              style={{ backgroundColor: "#ffe9e6" }} />

            <div className="relative z-10 flex flex-col gap-7">
              {/* Email */}
              <div>
                <span className="mb-2 block text-[11px] font-bold uppercase tracking-widest" style={{ color: "#6E5E40" }}>
                  Email
                </span>
                <p className="text-lg font-medium" style={{ color: "#1A1A1A" }}>
                  {user.email}
                </p>
              </div>
              <div className="h-px w-12" style={{ backgroundColor: "#e3beb8" }} />

              {/* Full Name */}
              <div>
                <span className="mb-2 block text-[11px] font-bold uppercase tracking-widest" style={{ color: "#6E5E40" }}>
                  Họ tên hiện tại
                </span>
                <p className="text-[22px] font-medium" style={{ color: "#1A1A1A", fontFamily: "EB Garamond, serif" }}>
                  {user.fullName ?? <span className="text-base italic opacity-50">Chưa cập nhật</span>}
                </p>
              </div>
              <div className="h-px w-12" style={{ backgroundColor: "#e3beb8" }} />

              {/* Phone */}
              <div>
                <span className="mb-2 block text-[11px] font-bold uppercase tracking-widest" style={{ color: "#6E5E40" }}>
                  SĐT hiện tại
                </span>
                <p className="text-lg font-medium" style={{ color: "#1A1A1A" }}>
                  {user.phone ?? <span className="text-base italic opacity-50">Chưa cập nhật</span>}
                </p>
              </div>
            </div>
          </div>

          {/* Security note */}
          <div className="flex items-start gap-4 rounded-xl p-5" style={{ backgroundColor: "#ffe9e6" }}>
            <span className="material-symbols-outlined mt-0.5 text-[22px]" style={{ color: "#C5A059" }}>
              verified_user
            </span>
            <p className="text-sm leading-relaxed" style={{ color: "#5a403c" }}>
              Tài khoản của bạn đang được bảo mật. Để thay đổi địa chỉ email chính, vui lòng liên hệ đội hỗ trợ của atelier.
            </p>
          </div>
        </div>

        {/* Column 2: Edit form (7 cols) */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="rounded-xl border p-8 md:p-12"
            style={{ backgroundColor: "#F9F5F0", borderColor: "#e3beb8", boxShadow: "0 2px 12px rgba(74,4,4,0.04)" }}
          >
            <h3 className="mb-8 flex items-center gap-3 text-2xl font-semibold" style={{ color: "#8B0000", fontFamily: "EB Garamond, serif" }}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>edit_document</span>
              Cập nhật thông tin
            </h3>

            <div className="flex flex-col gap-8">
              {/* Full Name */}
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-semibold uppercase tracking-wider" style={{ color: "#6E5E40" }}
                  htmlFor="fullName">
                  Họ và tên
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full bg-transparent py-3 text-lg transition-colors duration-300"
                  style={{
                    border: "none",
                    borderBottom: "1px solid #e3beb8",
                    outline: "none",
                    color: "#1A1A1A",
                    fontFamily: "Manrope, sans-serif",
                  }}
                  onFocus={(e) => { e.target.style.borderBottomColor = "#C5A059"; }}
                  onBlur={(e) => { e.target.style.borderBottomColor = "#e3beb8"; }}
                />
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-semibold uppercase tracking-wider" style={{ color: "#6E5E40" }}
                  htmlFor="phone">
                  Số điện thoại
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0909 000 000"
                  className="w-full bg-transparent py-3 text-lg transition-colors duration-300"
                  style={{
                    border: "none",
                    borderBottom: "1px solid #e3beb8",
                    outline: "none",
                    color: "#1A1A1A",
                    fontFamily: "Manrope, sans-serif",
                  }}
                  onFocus={(e) => { e.target.style.borderBottomColor = "#C5A059"; }}
                  onBlur={(e) => { e.target.style.borderBottomColor = "#e3beb8"; }}
                />
              </div>
            </div>

            {/* Messages */}
            {error && (
              <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
            )}
            {message && (
              <p className="mt-6 rounded-lg border px-4 py-3 text-sm" style={{ borderColor: "#C5A059", color: "#6E5E40", backgroundColor: "#fff8f0" }}>
                ✓ {message}
              </p>
            )}

            {/* Submit button */}
            <div className="mt-12 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="group flex items-center gap-3 rounded-xl px-10 py-4 text-[15px] font-semibold text-white shadow-sm transition-all duration-300 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                style={{ backgroundColor: "#8B0000" }}
              >
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
                {!saving && (
                  <span className="material-symbols-outlined text-[20px] transition-transform duration-200 group-hover:translate-x-1">
                    arrow_forward
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
