import { StaffReviewsClient } from "./staff-reviews-client";
import { StaffPortalShell } from "@/components/heritage/ui";

export const metadata = {
  title: "Quản lý đánh giá | Cổ Phục ERP",
};

export default function StaffReviewsPage() {
  return (
    <StaffPortalShell active="reviews" title="Quản lý đánh giá" subtitle="Xem, phản hồi và báo cáo đánh giá của khách hàng">
      <div className="space-y-6">
        <StaffReviewsClient />
      </div>
    </StaffPortalShell>
  );
}
