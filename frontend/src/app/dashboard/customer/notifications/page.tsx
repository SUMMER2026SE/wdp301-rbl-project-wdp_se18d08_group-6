"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import {
  getMyNotifications,
  getMyNotificationPreferences,
  markAllMyNotificationsRead,
  markMyNotificationRead,
  updateMyNotificationPreferences,
  type NotificationItem,
  type NotificationPreferences,
} from "@/lib/api";

type ViewFilter = "all" | "unread" | "read";

const DEFAULT_PREFERENCES: NotificationPreferences = {
  emailEnabled: true,
  inAppEnabled: true,
  bookingUpdatesEnabled: true,
  paymentUpdatesEnabled: true,
  reminderEnabled: true,
  marketingEnabled: false,
};

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function PreferenceSwitch({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-lg border border-sand bg-white px-4 py-3 text-sm text-ink">
      <span className="font-medium">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-sand text-lotus focus:ring-antique"
      />
    </label>
  );
}

export default function CustomerNotificationsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [view, setView] = useState<ViewFilter>("all");
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setErrorMsg(null);

      try {
        const [notificationsRes, preferencesRes] = await Promise.all([
          getMyNotifications(50),
          getMyNotificationPreferences(),
        ]);

        if (!active) return;

        if (notificationsRes.success && notificationsRes.data) {
          setNotifications(notificationsRes.data.notifications);
          setUnreadCount(notificationsRes.data.unreadCount);
        }

        if (preferencesRes.success && preferencesRes.data) {
          setPreferences(preferencesRes.data);
        }
      } catch {
        if (active) setErrorMsg("Không thể tải trung tâm thông báo.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      if (view === "unread") return !item.isRead;
      if (view === "read") return item.isRead;
      return true;
    });
  }, [notifications, view]);

  function flash(message: string) {
    setSuccessMsg(message);
    window.setTimeout(() => setSuccessMsg(null), 3500);
  }

  async function refreshNotifications() {
    const res = await getMyNotifications(50);
    if (res.success && res.data) {
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    }
  }

  async function handleMarkRead(id: string) {
    setMarkingId(id);
    setErrorMsg(null);

    try {
      const res = await markMyNotificationRead(id);
      if (!res.success) {
        setErrorMsg(res.message ?? "Không thể đánh dấu đã đọc.");
        return;
      }

      setNotifications((current) => current.map((item) => (item.id === id ? { ...item, isRead: true, readAt: new Date().toISOString() } : item)));
      setUnreadCount((current) => Math.max(0, current - 1));
    } catch {
      setErrorMsg("Không thể đánh dấu đã đọc.");
    } finally {
      setMarkingId(null);
    }
  }

  async function handleMarkAllRead() {
    setMarkingAll(true);
    setErrorMsg(null);

    try {
      const res = await markAllMyNotificationsRead();
      if (!res.success) {
        setErrorMsg(res.message ?? "Không thể đánh dấu tất cả đã đọc.");
        return;
      }

      setNotifications((current) => current.map((item) => ({ ...item, isRead: true, readAt: item.readAt ?? new Date().toISOString() })));
      setUnreadCount(0);
      flash("Đã đánh dấu tất cả thông báo là đã đọc.");
    } catch {
      setErrorMsg("Không thể đánh dấu tất cả đã đọc.");
    } finally {
      setMarkingAll(false);
    }
  }

  async function handleSavePreferences() {
    setSavingPrefs(true);
    setErrorMsg(null);

    try {
      const res = await updateMyNotificationPreferences(preferences);
      if (!res.success || !res.data) {
        setErrorMsg(res.message ?? "Không thể lưu tuỳ chọn thông báo.");
        return;
      }

      setPreferences(res.data);
      flash("Đã lưu tuỳ chọn thông báo.");
    } catch {
      setErrorMsg("Không thể lưu tuỳ chọn thông báo.");
    } finally {
      setSavingPrefs(false);
    }
  }

  const displayName = user?.fullName ?? user?.email ?? "Khách hàng";

  return (
    <div className="space-y-10">
      <header className="border-b border-sand pb-6">
        <h1 className="font-display text-5xl text-lotus sm:text-6xl">Thông báo của bạn</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-stone-600">
          Xin chào {displayName}. Đây là nơi bạn theo dõi cập nhật đơn thuê, thanh toán và các thay đổi từ hệ thống.
        </p>
      </header>

      {successMsg ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {successMsg}
        </div>
      ) : null}

      {errorMsg ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMsg}
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-8">
          <section className="rounded-xl border border-sand bg-white p-6 shadow-[0_10px_30px_rgba(77,16,15,0.04)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-3xl text-ink">Hộp thư thông báo</h2>
                <p className="mt-1 text-sm text-stone-500">{unreadCount} thông báo chưa đọc</p>
              </div>
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={markingAll || unreadCount === 0}
                className="rounded-lg border border-sand px-4 py-2 text-sm font-semibold text-stone-600 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {markingAll ? "Đang xử lý..." : "Đánh dấu tất cả đã đọc"}
              </button>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {(["all", "unread", "read"] as ViewFilter[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setView(item)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition ${view === item ? "bg-lotus text-white" : "border border-sand bg-white text-stone-600 hover:bg-[#fff8f6]"}`}
                >
                  {item === "all" ? "Tất cả" : item === "unread" ? "Chưa đọc" : "Đã đọc"}
                </button>
              ))}
            </div>

            <div className="mt-6 space-y-3">
              {loading ? (
                <div className="rounded-lg border border-dashed border-sand p-8 text-center text-stone-400">Đang tải thông báo...</div>
              ) : filteredNotifications.length === 0 ? (
                <div className="rounded-lg border border-dashed border-sand p-8 text-center text-stone-400">Chưa có thông báo phù hợp.</div>
              ) : (
                filteredNotifications.map((item) => (
                  <article key={item.id} className={`rounded-xl border p-4 transition ${item.isRead ? "border-sand bg-white" : "border-lotus/30 bg-[#fff8f6]"}`}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-ink">{item.title}</h3>
                          {!item.isRead ? (
                            <span className="rounded-full bg-lotus/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-lotus">Mới</span>
                          ) : null}
                        </div>
                        <p className="mt-2 whitespace-pre-line text-sm leading-7 text-stone-600">{item.body ?? "(Không có nội dung)"}</p>
                        <p className="mt-3 text-xs uppercase tracking-[0.14em] text-stone-400">{formatDateTime(item.createdAt)}</p>
                      </div>
                      <button
                        type="button"
                        disabled={item.isRead || markingId === item.id}
                        onClick={() => handleMarkRead(item.id)}
                        className="rounded-lg border border-sand bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-600 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {item.isRead ? "Đã đọc" : markingId === item.id ? "..." : "Đánh dấu đã đọc"}
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-6 lg:col-span-4">
          <section className="rounded-xl border border-sand bg-white p-6 shadow-[0_10px_30px_rgba(77,16,15,0.04)]">
            <h2 className="font-display text-3xl text-ink">Tuỳ chọn</h2>
            <p className="mt-1 text-sm text-stone-500">Điều chỉnh những gì bạn muốn nhận.</p>

            <div className="mt-5 space-y-3">
              <PreferenceSwitch label="Thông báo email" checked={preferences.emailEnabled} onChange={(value) => setPreferences((current) => ({ ...current, emailEnabled: value }))} />
              <PreferenceSwitch label="Thông báo trong ứng dụng" checked={preferences.inAppEnabled} onChange={(value) => setPreferences((current) => ({ ...current, inAppEnabled: value }))} />
              <PreferenceSwitch label="Cập nhật đơn thuê" checked={preferences.bookingUpdatesEnabled} onChange={(value) => setPreferences((current) => ({ ...current, bookingUpdatesEnabled: value }))} />
              <PreferenceSwitch label="Cập nhật thanh toán" checked={preferences.paymentUpdatesEnabled} onChange={(value) => setPreferences((current) => ({ ...current, paymentUpdatesEnabled: value }))} />
              <PreferenceSwitch label="Nhắc lịch / deadline" checked={preferences.reminderEnabled} onChange={(value) => setPreferences((current) => ({ ...current, reminderEnabled: value }))} />
              <PreferenceSwitch label="Khuyến mãi" checked={preferences.marketingEnabled} onChange={(value) => setPreferences((current) => ({ ...current, marketingEnabled: value }))} />
            </div>

            <button
              type="button"
              onClick={handleSavePreferences}
              disabled={savingPrefs}
              className="mt-5 w-full rounded-lg bg-lotus px-4 py-3 text-sm font-semibold text-white transition hover:bg-oxblood disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingPrefs ? "Đang lưu..." : "Lưu tuỳ chọn"}
            </button>
          </section>

          <section className="rounded-xl border border-sand bg-[#fff8f6] p-6">
            <h3 className="font-display text-2xl text-ink">Ghi chú</h3>
            <p className="mt-2 text-sm leading-7 text-stone-600">
              Những thông báo này được hệ thống tạo tự động từ các mốc đơn thuê, thanh toán và chăm sóc khách hàng. Nếu bạn không thấy gì mới, hãy kiểm tra lại tuỳ chọn email/in-app ở cột bên.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
