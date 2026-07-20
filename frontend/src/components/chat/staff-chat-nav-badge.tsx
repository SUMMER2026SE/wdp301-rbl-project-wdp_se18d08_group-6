"use client";

import { useEffect, useState } from "react";
import { getChatConversations } from "@/lib/chat";
import { readStoredSession } from "@/lib/auth";

const POLL_INTERVAL_MS = 30_000;

/**
 * Badge đếm số cuộc trò chuyện đang chờ staff xử lý, hiển thị cạnh mục CSKH
 * trên navbar: gồm "Cần trả lời" (khách nhắn mà staff chưa đáp) và
 * "Chờ tiếp nhận" (khách mới, chưa có staff nào nhận).
 */
export function StaffChatNavBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const session = readStoredSession();
      if (!session || session.user.role !== "staff") return;

      const res = await getChatConversations();
      if (cancelled || !res.success || !res.data) return;

      const needsReply = res.data.filter(
        (c) =>
          c.staffId === session.user.id &&
          c.status !== "resolved" &&
          (!c.lastMessage || c.lastMessage.sender_id !== session.user.id),
      ).length;
      const unassigned = res.data.filter((c) => c.staffId === null && c.status === "open").length;
      setCount(needsReply + unassigned);
    }

    void load();
    const timer = setInterval(() => void load(), POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  if (count === 0) return null;

  return (
    <span className="ml-auto inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-lotus px-1.5 text-[11px] font-bold leading-none text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}
