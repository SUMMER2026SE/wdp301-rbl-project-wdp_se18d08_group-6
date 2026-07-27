"use client";

import { StaffReviewsClient } from "../../staff/reviews/staff-reviews-client";
import { ManagerPortalShell } from "@/components/heritage/ui";

export default function ManagerReviewsPage() {
  return (
    <ManagerPortalShell 
      active="reviews" 
      title="Quản lý đánh giá" 
      subtitle="Xem, phản hồi và báo cáo đánh giá của khách hàng"
    >
      <div className="space-y-6">
        <StaffReviewsClient />
      </div>
    </ManagerPortalShell>
  );
}
