"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { notifyCartUpdated, useToast } from "@/components/Toast";
import { cn } from "@/lib/utils";

export default function AddToCartButton({
  productId,
  stock,
  quantity = 1,
  className,
  children,
}: {
  productId: number;
  stock: number;
  quantity?: number;
  className?: string;
  children?: React.ReactNode;
}) {
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const soldOut = stock <= 0;

  async function add() {
    if (soldOut) return;
    setLoading(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      notifyCartUpdated();
      toast(data.message || "Added to cart");
      router.refresh();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not add to cart", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={add}
      disabled={loading || soldOut}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
    >
      {loading ? (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
        </svg>
      ) : soldOut ? (
        "Sold out"
      ) : (
        (children ?? (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
              />
            </svg>
            Add to cart
          </>
        ))
      )}
    </button>
  );
}
