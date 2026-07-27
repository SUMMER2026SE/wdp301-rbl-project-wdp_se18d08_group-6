-- Thêm trạng thái "refund_pending" (chờ staff hoàn cọc) vào booking_status:
-- inspection xong -> refund_pending -> (staff tạo yêu cầu hoàn cọc) -> owner duyệt -> completed
ALTER TYPE "booking_status" ADD VALUE IF NOT EXISTS 'refund_pending';
