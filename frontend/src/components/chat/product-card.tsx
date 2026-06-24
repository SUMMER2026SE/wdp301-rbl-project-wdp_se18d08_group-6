"use client";

import Link from "next/link";
import type { ProductCardMessage } from "@/lib/chat";

function formatVND(amount: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

interface ProductCardProps {
  product: ProductCardMessage["product"];
}

/**
 * A compact product card rendered inside chat messages.
 * Clicking navigates to the product detail page.
 */
export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={product.detailUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block max-w-[180px] rounded-xl border border-sand/70 bg-white shadow-sm transition hover:shadow-md hover:border-antique overflow-hidden"
    >
      {/* Thumbnail */}
      <div className="aspect-[4/3] w-full overflow-hidden bg-[#fff7f2]">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover"
          onError={(e) => {
            // Fallback if image fails to load
            const target = e.currentTarget;
            target.src = "https://dep.com.vn/wp-content/uploads/2020/11/ao-dai-9.jpg";
          }}
        />
      </div>

      {/* Info */}
      <div className="p-3 space-y-1">
        <p className="text-sm font-semibold text-ink leading-tight line-clamp-2">{product.name}</p>
        {product.size && (
          <p className="text-xs text-stone-500">Size: {product.size}</p>
        )}
        <p className="text-sm font-semibold text-lotus">{formatVND(product.price)}</p>
      </div>
    </Link>
  );
}