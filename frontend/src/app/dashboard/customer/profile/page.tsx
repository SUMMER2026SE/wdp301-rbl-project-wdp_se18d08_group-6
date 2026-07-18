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

  if (!user) return null;

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

  const userInitial = (user.fullName ?? user.email ?? "?").charAt(0).toUpperCase();

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <header className="border-b border-sand pb-6">
        <h1 className="font-display text-4xl text-lotus sm:text-5xl">Hồ Sơ Cá Nhân</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-stone-600">
          Quản lý thông tin cá nhân và số liên lạc để đảm bảo lịch hẹn tại atelier và giao nhận trang phục được thuận tiện nhất.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Column 1: Account info card */}
        <div className="flex flex-col gap-6 lg:col-span-5">
          <div className="relative overflow-hidden rounded-lg border border-sand bg-white p-8 shadow-sm">
            <div className="pointer-events-none absolute right-0 top-0 h-28 w-28 rounded-bl-full bg-lotus/5" />
            {/* Avatar */}
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-lotus text-xl font-bold text-white">
                {userInitial}
              </div>
              <div>
                <p className="font-display text-2xl text-ink">
                  {user.fullName ?? <span className="text-base italic text-stone-400">Chưa cập nhật</span>}
                </p>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-antique">Thành viên di sản</p>
              </div>
            </div>
            <div className="space-y-5">
              <div>
                <span className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-bronze">Email</span>
                <p className="text-sm font-medium text-ink">{user.email}</p>
              </div>
              <div className="h-px w-10 bg-sand" />
              <div>
                <span className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-bronze">Số điện thoại</span>
                <p className="text-sm font-medium text-ink">
                  {user.phone ?? <span className="italic text-stone-400">Chưa cập nhật</span>}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-sand bg-parchment p-4">
            <span className="material-symbols-outlined mt-0.5 text-[20px] text-antique">verified_user</span>
            <p className="text-sm leading-relaxed text-stone-600">
              Tài khoản đang được bảo mật. Để thay đổi email chính, vui lòng liên hệ đội hỗ trợ atelier.
            </p>
          </div>
        </div>

        {/* Column 2: Edit form */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="rounded-lg border border-sand bg-parchment p-8 shadow-sm md:p-10">
            <h3 className="mb-8 flex items-center gap-2 font-display text-2xl text-lotus">
              <span className="material-symbols-outlined text-[22px]">edit_document</span>
              Cập nhật thông tin
            </h3>

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-stone-500" htmlFor="fullName">
                  Họ và tên
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full rounded-md border border-sand bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-lotus"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-stone-500" htmlFor="phone">
                  Số điện thoại
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0909 000 000"
                  className="w-full rounded-md border border-sand bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-lotus"
                />
              </div>
            </div>

            {error && (
              <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}
            {message && (
              <div className="mt-6 flex items-center gap-2 rounded-md border border-jade/30 bg-jade/5 px-4 py-3 text-sm text-jade">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                {message}
              </div>
            )}

            <div className="mt-10 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="group inline-flex items-center gap-2 rounded-md bg-lotus px-8 py-3 text-sm font-semibold text-white transition hover:bg-oxblood disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
                {!saving && (
                  <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-0.5">
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
