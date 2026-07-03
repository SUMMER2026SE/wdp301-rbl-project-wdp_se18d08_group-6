"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getMyBookings, cancelBooking, getCustomerRefund, getDeliveryTrack } from "@/lib/api";
import type { BookingResponse, CustomerRefundResponse, DeliveryTrackData } from "@/lib/api";
import { DeliveryTracker } from "@/components/location/delivery-tracker";
import { readStoredSession } from "@/lib/auth";
import { getMyChatConversation, sendBookingCardMessage } from "@/lib/chat";
import { customerWidgets } from "@/lib/heritage-mock-data";
import { STATUS_LABELS, statusBadgeClass, statusOf, ACTIVE_BOOKING_STATUSES, CANCELLABLE_STATUSES } from "@/lib/status-labels";

function formatVND(n: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default function CustomerDashboardPage() {
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [userName, setUserName] = useState("Khách hàng");
  // Refund status map: bookingId → refund
  const [refundMap, setRefundMap] = useState<Record<string, CustomerRefundResponse | null>>({});
  // Delivery tracking
  const [deliveryTrack, setDeliveryTrack] = useState<DeliveryTrackData | null>(null);

  // Poll delivery tracking every 10s. Only track active delivery handoff, not already-renting/completed orders.
  useEffect(() => {
    const deliveryBooking = bookings
      .filter((b) => b.pickupMethod === "delivery" && ["delivering", "ready_for_pickup"].includes(b.status))
      .sort((a, b) => {
        const priority = (status: string) => (status === "delivering" ? 0 : 1);
        const byPriority = priority(a.status) - priority(b.status);
        if (byPriority !== 0) return byPriority;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })[0];

    if (!deliveryBooking) {
      setDeliveryTrack(null);
      return;
    }

    const fetchTracking = () => {
      getDeliveryTrack(deliveryBooking.id).then((res) => {
        if (res.success && res.data) {
          setDeliveryTrack(res.data);
        } else {
          setDeliveryTrack(null);
        }
      });
    };

    fetchTracking();
    const interval = setInterval(fetchTracking, 10000);
    return () => clearInterval(interval);
  }, [bookings]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sendingBookingId, setSendingBookingId] = useState<string | null>(null);

  useEffect(() => {
    const session = readStoredSession();
    if (session?.user?.fullName) setUserName(session.user.fullName);
    else if (session?.user?.email) setUserName(session.user.email.split("@")[0]);

    getMyBookings().then((res) => {
      if (res.success && res.data) {
        const data = res.data;
        setBookings(data);
        // Fetch refund status for completed bookings
        const completedBookingIds = data
          .filter((b) => b.status === "completed")
          .map((b) => b.id);
        completedBookingIds.forEach((bookingId) => {
          getCustomerRefund(bookingId).then((refundRes) => {
            if (refundRes.success && refundRes.data && refundRes.data.length > 0) {
              setRefundMap((prev) => ({ ...prev, [bookingId]: refundRes.data![0] }));
            } else {
              setRefundMap((prev) => ({ ...prev, [bookingId]: null }));
            }
          });
        });
      }
    }).finally(() => setLoading(false));
  }, []);

  async function handleCancel(id: string) {
    setCancellingId(id);
    const res = await cancelBooking(id);
    if (res.success && res.data) {
      setBookings((prev) => prev.map((b) => (b.id === id ? res.data! : b)));
    }
    setCancellingId(null);
  }

  async function handleSendBookingCard(bookingId: string, topic: "booking_support" | "complaint") {
    setSendingBookingId(bookingId);
    try {
      let convId = conversationId;
      if (!convId) {
        const convRes = await getMyChatConversation();
        if (convRes.success && convRes.data) {
          convId = convRes.data.id;
          setConversationId(convId);
        }
      }
      if (convId) {
        await sendBookingCardMessage({ conversationId: convId, bookingId, topic });
      }
    } finally {
      setSendingBookingId(null);
    }
  }

  const activeBooking = bookings.find((b) => ACTIVE_BOOKING_STATUSES.has(b.status));
  const history = bookings.filter((b) => !ACTIVE_BOOKING_STATUSES.has(b.status));

  return (
    <div className="space-y-10">
      <header className="mb-12">
        <h1 className="font-display text-5xl text-lotus sm:text-6xl">Xin chào, {userName}</h1>
        <p className="mt-3 flex items-center gap-2 text-base text-stone-600">
          <span className="material-symbols-outlined text-antique">workspace_premium</span>
          Thành viên di sản
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-8">

          {/* Đơn đang active */}
          {loading ? (
            <div className="rounded-xl border border-sand bg-white p-8 text-stone-400">Đang tải đơn thuê...</div>
          ) : activeBooking ? (
            <section className="overflow-hidden rounded-xl border border-sand bg-white p-8 shadow-md">
              <div className="flex flex-col gap-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display text-4xl text-ink">
                      {activeBooking.items[0]?.garmentName ?? "Trang phục"}
                    </h2>
                    <p className="mt-1 text-sm text-stone-600">
                      {formatDate(activeBooking.rentalStartDate)} - {formatDate(activeBooking.rentalEndDate)}
                      {" "}({activeBooking.days} ngày)
                    </p>
                    <p className="mt-1 text-sm text-stone-500">
                      Tiền thuê: <span className="font-medium text-ink">{formatVND(activeBooking.rentalTotal)}</span>
                      {" "}· Cọc: <span className="font-medium text-ink">{formatVND(activeBooking.depositTotal)}</span>
                    </p>
                  </div>
                  <span className={statusBadgeClass(statusOf(activeBooking.status).color)}>
                    {statusOf(activeBooking.status).label}
                  </span>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={`/booking/success?bookingId=${activeBooking.id}`}
                    className="inline-flex items-center justify-center rounded-lg bg-lotus px-5 py-3 text-sm font-semibold text-white transition hover:bg-oxblood"
                  >
                    Xem chi tiết
                  </Link>
                  {CANCELLABLE_STATUSES.has(activeBooking.status) && (
                    <button
                      type="button"
                      disabled={cancellingId === activeBooking.id}
                      onClick={() => handleCancel(activeBooking.id)}
                      className="rounded-lg border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-600 transition hover:bg-stone-50 disabled:opacity-40"
                    >
                      {cancellingId === activeBooking.id ? "Đang hủy..." : "Hủy đơn"}
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={sendingBookingId === activeBooking.id}
                    onClick={() => void handleSendBookingCard(activeBooking.id, "booking_support")}
                    className="rounded-lg bg-jade px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest disabled:opacity-40"
                  >
                    {sendingBookingId === activeBooking.id ? "Đang gửi..." : "Hỗ trợ đơn hàng"}
                  </button>
                  <button
                    type="button"
                    disabled={sendingBookingId === activeBooking.id}
                    onClick={() => void handleSendBookingCard(activeBooking.id, "complaint")}
                    className="rounded-lg bg-oxblood px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-950 disabled:opacity-40"
                  >
                    {sendingBookingId === activeBooking.id ? "Đang gửi..." : "Khiếu nại"}
                  </button>
                </div>
              </div>
            </section>
          ) : (
            <section className="rounded-xl border border-sand bg-white p-8 text-center shadow-sm">
              <p className="text-stone-500">Bạn chưa có đơn thuê nào đang hoạt động.</p>
              <Link
                href="/catalog"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-lotus px-5 py-3 text-sm font-semibold text-white transition hover:bg-oxblood"
              >
                Khám phá bộ sưu tập
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </section>
          )}

          {/* Delivery tracking */}
          {deliveryTrack && (
            <section className="space-y-4">
              <h2 className="font-display text-3xl text-ink flex items-center gap-2">
                <span className="material-symbols-outlined text-antique">local_shipping</span>
                Theo dõi giao hàng
              </h2>
              <DeliveryTracker data={deliveryTrack} />
            </section>
          )}

          {/* Lịch sử */}
          <section>
            <h2 className="mb-6 font-display text-4xl text-ink">Lịch sử thuê trang phục</h2>
            {history.length === 0 && !loading ? (
              <p className="text-sm text-stone-400">Chưa có lịch sử thuê.</p>
            ) : (
              <div className="overflow-hidden rounded-xl border border-sand bg-white">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-parchment text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                      <th className="px-6 py-4">Trang phục</th>
                      <th className="px-6 py-4">Thời gian</th>
                      <th className="px-6 py-4">Trạng thái</th>
                      <th className="px-6 py-4">Tổng</th>
                      <th className="px-6 py-4">Hoàn cọc</th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((b) => {
                      const st = statusOf(b.status);
                      const refund = refundMap[b.id];
                      return (
                        <tr key={b.id} className="border-t border-sand transition hover:bg-mist">
                          <td className="px-6 py-4 font-medium text-ink">{b.items[0]?.garmentName ?? "—"}</td>
                          <td className="px-6 py-4 text-stone-600">
                            {formatDate(b.rentalStartDate)} - {formatDate(b.rentalEndDate)}
                          </td>
                          <td className="px-6 py-4">
                            <span className={statusBadgeClass(st.color)}>
                              {st.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-stone-600">{formatVND(b.rentalTotal + b.depositTotal)}</td>
                          <td className="px-6 py-4">
                            {b.status === "completed" ? (
                              refund === undefined ? (
                                <span className="text-xs text-stone-400">Đang tải...</span>
                              ) : refund ? (
                                refund.status === "refunded" || refund.status === "partially_refunded" ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-jade/10 px-3 py-1 text-xs font-semibold text-jade">
                                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                    Đã hoàn {formatVND(refund.amount)}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                                    Đang xử lý {formatVND(refund.amount)}
                                  </span>
                                )
                              ) : (
                                <span className="text-xs text-stone-400">—</span>
                              )
                            ) : (
                              <span className="text-xs text-stone-400">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-1.5">
                              <button
                                type="button"
                                disabled={sendingBookingId === b.id}
                                onClick={() => void handleSendBookingCard(b.id, "booking_support")}
                                className="rounded-lg bg-jade px-2.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-forest disabled:opacity-40"
                              >
                                {sendingBookingId === b.id ? "..." : "Hỗ trợ"}
                              </button>
                              <button
                                type="button"
                                disabled={sendingBookingId === b.id}
                                onClick={() => void handleSendBookingCard(b.id, "complaint")}
                                className="rounded-lg bg-oxblood px-2.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-red-950 disabled:opacity-40"
                              >
                                {sendingBookingId === b.id ? "..." : "Khiếu nại"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-6 lg:col-span-4">
          {customerWidgets.map((item) => (
            <Link
              key={item.title}
              href={item.href || "/dashboard/customer"}
              className="block rounded-xl border border-sand bg-white p-6 shadow-sm transition-all duration-200 hover:border-lotus/40 hover:shadow-md hover:-translate-y-0.5 group"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${item.accent}`}>
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                </div>
                <span className="material-symbols-outlined text-stone-400 group-hover:text-lotus transition-colors duration-200">arrow_forward</span>
              </div>
              <h3 className="font-display text-3xl text-ink group-hover:text-lotus transition-colors duration-200">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-stone-600">{item.description}</p>
            </Link>
          ))}
        </aside>
      </div>
    </div>
  );
}
