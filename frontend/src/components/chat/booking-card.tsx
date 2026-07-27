"use client";

import Link from "next/link";
import type { BookingCardMessage } from "@/lib/chat";

function formatVND(amount: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
}

interface BookingCardProps {
  booking: BookingCardMessage["booking"];
  /**
   * Vai trò của NGƯỜI XEM. detailUrl lưu trong metadata được tạo theo role của
   * người gửi, nên staff xem card do khách gửi sẽ bị dẫn sang trang của khách
   * (và ngược lại). Truyền viewerRole để link luôn đúng với người đang xem.
   */
  viewerRole?: "customer" | "staff";
}

export function BookingCard({ booking, viewerRole }: BookingCardProps) {
  const href =
    viewerRole === "staff"
      ? `/dashboard/staff/booking/${booking.id}`
      : viewerRole === "customer"
        ? `/booking/success?bookingId=${booking.id}`
        : booking.detailUrl ?? null;

  const content = (
    <>
      <p className="font-semibold text-ink">📋 Đơn thuê #{booking.code}</p>
      <p className="text-stone-600">{booking.statusLabel}</p>
      <p className="text-stone-600">
        📅 {formatDate(booking.rentalStartDate)} → {formatDate(booking.rentalEndDate)} ({booking.days} ngày)
      </p>
      <p className="text-stone-600">👗 {booking.itemCount} trang phục</p>
      <p className="text-stone-600">
        💰 {formatVND(booking.rentalTotal)} | Cọc: {formatVND(booking.depositTotal)}
      </p>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block max-w-[220px] rounded-xl border border-sand/70 bg-white p-3 shadow-sm space-y-1.5 text-xs transition hover:shadow-md hover:border-antique overflow-hidden"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="max-w-[220px] rounded-xl border border-sand/70 bg-white p-3 shadow-sm space-y-1.5 text-xs">
      {content}
    </div>
  );
}
