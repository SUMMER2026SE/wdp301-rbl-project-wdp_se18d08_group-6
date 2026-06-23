"use client";

const CART_STORAGE_KEY = "co_phuc_cart";

export type CartItem = {
    garmentSizeId: string;
    garmentId: string;
    name: string;
    sizeLabel: string | null;
    dailyPrice: number;
    depositAmount: number;
    imageUrl: string | null;
};

type CartData = {
    items: CartItem[];
};

function readCartData(): CartData {
    if (typeof window === "undefined") return { items: [] };
    try {
        const raw = window.localStorage.getItem(CART_STORAGE_KEY);
        if (!raw) return { items: [] };
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.items)) {
            return { items: parsed.items };
        }
        return { items: [] };
    } catch {
        return { items: [] };
    }
}

function writeCartData(data: CartData): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(data));
}

/** Lấy danh sách items trong giỏ */
export function getCart(): CartItem[] {
    return readCartData().items;
}

/** Thêm 1 item vào giỏ. Nếu garmentSizeId đã tồn tại thì bỏ qua (không thêm trùng). */
export function addToCart(item: CartItem): void {
    const data = readCartData();
    const exists = data.items.some((i) => i.garmentSizeId === item.garmentSizeId);
    if (!exists) {
        data.items.push(item);
        writeCartData(data);
    }
}

/** Xoá 1 item khỏi giỏ theo garmentSizeId */
export function removeFromCart(garmentSizeId: string): void {
    const data = readCartData();
    data.items = data.items.filter((i) => i.garmentSizeId !== garmentSizeId);
    writeCartData(data);
}

/** Xoá toàn bộ giỏ hàng */
export function clearCart(): void {
    writeCartData({ items: [] });
}

/** Số lượng items trong giỏ */
export function cartCount(): number {
    return readCartData().items.length;
}

/** Tổng quan giỏ hàng */
export function getCartSummary(): {
    items: CartItem[];
    rentalTotal: number;
    depositTotal: number;
    count: number;
} {
    const items = readCartData().items;
    return {
        items,
        rentalTotal: items.reduce((sum, i) => sum + i.dailyPrice, 0),
        depositTotal: items.reduce((sum, i) => sum + i.depositAmount, 0),
        count: items.length,
    };
}

/** Lắng nghe thay đổi giỏ hàng (cho component khác sync) */
export function onCartChange(callback: () => void): () => void {
    if (typeof window === "undefined") return () => { };
    const handler = (e: StorageEvent) => {
        if (e.key === CART_STORAGE_KEY) callback();
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
}