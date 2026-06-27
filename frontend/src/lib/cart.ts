"use client";

export interface CartItem {
  garmentSizeId: string;
  garmentId: string;
  name: string;
  sizeLabel?: string | null;
  dailyPrice: number;
  depositAmount: number;
  imageUrl?: string | null;
}

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem("cart");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addToCart(item: CartItem) {
  const cart = getCart();
  const existing = cart.find(i => i.garmentSizeId === item.garmentSizeId);
  if (!existing) {
    cart.push(item);
    localStorage.setItem("cart", JSON.stringify(cart));
  }
}

export function removeFromCart(id: string) {
  const cart = getCart();
  const next = cart.filter(i => i.garmentSizeId !== id);
  localStorage.setItem("cart", JSON.stringify(next));
}

export function cartCount(): number {
  return getCart().length;
}

export function getCartSummary() {
  const cart = getCart();
  let rentalTotal = 0;
  let depositTotal = 0;
  for (const item of cart) {
    rentalTotal += item.dailyPrice;
    depositTotal += item.depositAmount;
  }
  return { rentalTotal, depositTotal };
}

export function clearCart() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("cart");
  }
}
