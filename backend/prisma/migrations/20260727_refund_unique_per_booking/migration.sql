-- Chống hoàn cọc 2 lần / race condition khi 2 request tạo refund đồng thời:
-- mỗi booking chỉ được có tối đa 1 refund đang xử lý hoặc đã hoàn thành công.
CREATE UNIQUE INDEX IF NOT EXISTS "refunds_booking_active_unique"
ON "refunds" ("booking_id")
WHERE status IN ('pending', 'refunding', 'refunded', 'partially_refunded');
