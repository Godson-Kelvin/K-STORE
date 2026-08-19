"use client";

import { useState } from "react";
import AddToCartButton from "@/components/AddToCartButton";
import WishlistButton from "@/components/WishlistButton";
import { cn } from "@/lib/utils";

export default function BuyBox({ productId, stock }: { productId: number; stock: number }) {
  const [qty, setQty] = useState(1);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        {/* Quantity stepper */}
        <div className="flex items-center rounded-full border border-neutral-200">
          <button
            onClick={() => setQty((v) => Math.max(1, v - 1))}
            disabled={qty <= 1}
            className="flex h-12 w-12 items-center justify-center text-lg text-neutral-600 transition hover:text-neutral-900 disabled:opacity-30"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="w-8 text-center text-sm font-bold">{qty}</span>
          <button
            onClick={() => setQty((v) => Math.min(stock, v + 1))}
            disabled={qty >= stock}
            className="flex h-12 w-12 items-center justify-center text-lg text-neutral-600 transition hover:text-neutral-900 disabled:opacity-30"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        <AddToCartButton productId={productId} stock={stock} quantity={qty} className="flex-1 !py-3.5" />
      </div>
      <WishlistButton productId={productId} className={cn("w-full")} />
    </div>
  );
}
