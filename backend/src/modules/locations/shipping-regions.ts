// Bảng giá cước tiêu chuẩn Viettel Post (đơn hàng < 1kg), phân tuyến theo vùng miền.

export type ShippingRegion = "north" | "central" | "south";

export type ShippingRouteType = "intra" | "adjacent" | "inter";

export type ShippingRoute = {
  type: ShippingRouteType;
  label: string;
  fee: number;
  deliveryTimeText: string;
};

// Giá lấy theo cận trên của khung cước ước tính Viettel Post.
export const VIETTEL_POST_FEES: Record<ShippingRouteType, ShippingRoute> = {
  intra: { type: "intra", label: "Nội miền", fee: 24000, deliveryTimeText: "2 - 3 ngày" },
  adjacent: { type: "adjacent", label: "Cận miền", fee: 32000, deliveryTimeText: "3 - 4 ngày" },
  inter: { type: "inter", label: "Liên miền", fee: 38000, deliveryTimeText: "3 - 4 ngày" },
};

const NORTH = [
  "Hà Nội", "Hải Phòng", "Bắc Giang", "Bắc Kạn", "Bắc Ninh", "Cao Bằng", "Điện Biên",
  "Hà Giang", "Hà Nam", "Hải Dương", "Hòa Bình", "Hưng Yên", "Lai Châu", "Lạng Sơn",
  "Lào Cai", "Nam Định", "Ninh Bình", "Phú Thọ", "Quảng Ninh", "Sơn La", "Thái Bình",
  "Thái Nguyên", "Tuyên Quang", "Vĩnh Phúc", "Yên Bái",
];

const CENTRAL = [
  "Thanh Hóa", "Nghệ An", "Hà Tĩnh", "Quảng Bình", "Quảng Trị", "Thừa Thiên Huế", "Huế",
  "Đà Nẵng", "Quảng Nam", "Quảng Ngãi", "Bình Định", "Phú Yên", "Khánh Hòa", "Ninh Thuận",
  "Bình Thuận", "Kon Tum", "Gia Lai", "Đắk Lắk", "Đắk Nông", "Lâm Đồng",
];

const SOUTH = [
  "Hồ Chí Minh", "Sài Gòn", "Bà Rịa - Vũng Tàu", "Bà Rịa-Vũng Tàu", "Vũng Tàu", "Bình Dương",
  "Bình Phước", "Đồng Nai", "Tây Ninh", "An Giang", "Bạc Liêu", "Bến Tre", "Cà Mau",
  "Cần Thơ", "Đồng Tháp", "Hậu Giang", "Kiên Giang", "Long An", "Sóc Trăng", "Tiền Giang",
  "Trà Vinh", "Vĩnh Long",
];

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

const PROVINCE_REGIONS: Array<{ name: string; region: ShippingRegion }> = [
  ...NORTH.map((name) => ({ name: normalize(name), region: "north" as const })),
  ...CENTRAL.map((name) => ({ name: normalize(name), region: "central" as const })),
  ...SOUTH.map((name) => ({ name: normalize(name), region: "south" as const })),
];

/**
 * Tìm vùng miền từ chuỗi địa chỉ/tên tỉnh. Địa chỉ Việt Nam đặt tỉnh/thành ở cuối,
 * nên khi khớp nhiều tỉnh (ví dụ tên đường trùng tên tỉnh) sẽ ưu tiên tỉnh xuất hiện sau cùng.
 */
export function detectRegion(text: string | null | undefined): ShippingRegion | null {
  if (!text || !text.trim()) return null;
  const haystack = normalize(text);

  let best: { region: ShippingRegion; index: number } | null = null;
  for (const { name, region } of PROVINCE_REGIONS) {
    const index = haystack.lastIndexOf(name);
    if (index >= 0 && (!best || index > best.index)) {
      best = { region, index };
    }
  }
  return best?.region ?? null;
}

export function classifyRoute(from: ShippingRegion, to: ShippingRegion): ShippingRoute {
  if (from === to) return VIETTEL_POST_FEES.intra;
  const pair = [from, to];
  if (pair.includes("north") && pair.includes("south")) return VIETTEL_POST_FEES.inter;
  return VIETTEL_POST_FEES.adjacent;
}
