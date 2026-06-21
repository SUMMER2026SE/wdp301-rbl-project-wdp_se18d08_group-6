import { AppRole } from "@prisma/client";

export type AdminSettingKind = "number" | "text" | "json";

export type AdminSettingDefinition = {
  key: string;
  label: string;
  description: string;
  kind: AdminSettingKind;
  defaultValue: unknown;
};

export const ADMIN_SETTING_DEFINITIONS: AdminSettingDefinition[] = [
  {
    key: "max_rental_days",
    label: "Số ngày thuê tối đa",
    description: "Giới hạn số ngày của một đơn thuê trước khi hệ thống chặn lưu đơn.",
    kind: "number",
    defaultValue: { value: 30 },
  },
  {
    key: "deposit_refund_window_h",
    label: "Thời gian hoàn cọc",
    description: "Số giờ xử lý hoàn cọc sau khi đơn kết thúc.",
    kind: "number",
    defaultValue: { value: 48 },
  },
  {
    key: "late_penalty_per_day",
    label: "Phí trễ theo ngày",
    description: "Mức phí áp dụng cho mỗi ngày trả trễ hoặc quá hạn.",
    kind: "number",
    defaultValue: { value: 200000 },
  },
  {
    key: "store_address",
    label: "Địa chỉ cửa hàng",
    description: "Địa chỉ hiển thị trên cổng vận hành và phiếu hỗ trợ.",
    kind: "text",
    defaultValue: { value: "123 Lê Thánh Tôn, Bến Nghé, Quận 1, TP.HCM" },
  },
  {
    key: "store_phone",
    label: "Số điện thoại cửa hàng",
    description: "Số điện thoại hỗ trợ và xác nhận đơn.",
    kind: "text",
    defaultValue: { value: "0901999888" },
  },
  {
    key: "business_hours",
    label: "Giờ hoạt động",
    description: "Khung giờ vận hành để bộ phận điều phối tham chiếu.",
    kind: "json",
    defaultValue: { open: "08:00", close: "20:00", days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
  },
];

export const ADMIN_ROLE_OPTIONS: AppRole[] = ["customer", "staff", "manager_owner", "admin"];

