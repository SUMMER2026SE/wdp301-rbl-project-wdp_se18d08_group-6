"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { apiRequest } from "@/lib/api";
import { getRoleLabel, normalizeNullableText, type AuthenticatedUser } from "@/lib/auth";

export default function ManagerProfilePage() {
  const router = useRouter();
  const { replaceUser, signOut, user } = useAuth();
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
      setMessage("Cập nhật hồ sơ quản lý thành công.");
    } finally {
      setSaving(false);
    }
  }

  function handleSignOut() {
    signOut();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen bg-[#f9f5f0] text-ink">
      <header className="border-b border-sand bg-[#fff8f6] px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <h1 className="font-display text-3xl text-lotus">Hồ sơ quản lý</h1>
            <p className="text-sm text-stone-500">Cập nhật thông tin tài khoản vận hành cửa hàng.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/manager" className="rounded-lg border border-sand bg-white px-4 py-2 text-sm font-semibold text-stone-600 transition hover:border-lotus hover:text-lotus">
              Quay lại dashboard
            </Link>
            <button type="button" onClick={handleSignOut} className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100">
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <section className="rounded-xl border border-sand bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ffe9e6] font-display text-2xl text-lotus">
                {(user.fullName ?? user.email).slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold text-ink">{user.fullName ?? "Quản lý cửa hàng"}</p>
                <p className="truncate text-sm text-stone-500">{user.email}</p>
              </div>
            </div>

            <div className="mt-6 space-y-4 border-t border-sand pt-6 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-stone-500">Vai trò</span>
                <span className="font-semibold text-lotus">{getRoleLabel(user.role)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-stone-500">Trạng thái</span>
                <span className="font-semibold text-jade">Đang hoạt động</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-stone-500">Số điện thoại</span>
                <span className="font-medium text-ink">{user.phone ?? "Chưa cập nhật"}</span>
              </div>
            </div>
          </section>

          <form onSubmit={handleSubmit} className="rounded-xl border border-sand bg-white p-6 shadow-sm">
            <h2 className="font-display text-2xl text-ink">Thông tin liên hệ</h2>
            <p className="mt-1 text-sm text-stone-500">Thông tin này dùng cho điều phối vận hành và hỗ trợ nội bộ.</p>

            {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            {message && <div className="mt-4 rounded-lg border border-jade/30 bg-jade/10 p-3 text-sm text-jade">{message}</div>}

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Họ tên</label>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full rounded-lg border border-sand px-3 py-2 text-sm outline-none focus:border-antique" placeholder="Tên quản lý" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Số điện thoại</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-lg border border-sand px-3 py-2 text-sm outline-none focus:border-antique" placeholder="Số điện thoại" />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button type="submit" disabled={saving} className="rounded-lg bg-lotus px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-oxblood disabled:opacity-50">
                {saving ? "Đang lưu..." : "Lưu hồ sơ"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
