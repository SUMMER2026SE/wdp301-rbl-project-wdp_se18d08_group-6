export type CartItem = {
  garmentSizeId: string;
  garmentId: string;
  name: string;
  sizeLabel: string | null;
  dailyPrice: number;
  depositAmount: number;
  imageUrl?: string | null;
};

const CART_KEY = "copphuc_cart";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readCart(): CartItem[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function getCart() {
  return readCart();
}

export function addToCart(item: CartItem) {
  const cart = readCart();
  const next = cart.filter((entry) => entry.garmentSizeId !== item.garmentSizeId);
  next.push(item);
  writeCart(next);
}

export function removeFromCart(garmentSizeId: string) {
  const next = readCart().filter((entry) => entry.garmentSizeId !== garmentSizeId);
  writeCart(next);
}

export function clearCart() {
  writeCart([]);
}

export function cartCount() {
  return readCart().length;
}

export function getCartSummary() {
  const cart = readCart();
  return cart.reduce(
    (sum, item) => ({
      rentalTotal: sum.rentalTotal + item.dailyPrice,
      depositTotal: sum.depositTotal + item.depositAmount,
    }),
    { rentalTotal: 0, depositTotal: 0 },
  );
}
