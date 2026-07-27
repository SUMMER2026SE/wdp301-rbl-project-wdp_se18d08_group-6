"use client";

import { useEffect, useState } from "react";
import { getStaffReviews } from "@/lib/api";

export function ManagerReviewsNavBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    let timer: NodeJS.Timeout;

    const fetchCount = async () => {
      try {
        const res = await getStaffReviews();
        if (res.success && res.data && mounted) {
          const reportedCount = res.data.filter(r => r.isReported && r.status === "public").length;
          setCount(reportedCount);
        }
      } catch (err) {
        // ignore
      }

      if (mounted) {
        timer = setTimeout(fetchCount, 30000); // poll every 30s
      }
    };

    fetchCount();

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  if (count === 0) return null;

  return (
    <span className="ml-auto inline-flex h-5 items-center justify-center rounded-full bg-red-500 px-2 text-[10px] font-bold text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}
