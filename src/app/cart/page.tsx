"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { notifyCartUpdated } from "@/components/Toast";
import { formatPrice, FREE_SHIPPING_THRESHOLD, shippingCost } from "@/lib/utils";

type CartLine = {
  id: number;
  productId: number;
  quantity: number;
  name: string;
  slug: string;
  image: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
};

export default function CartPage() {
  const [lines, setLines] = useState<CartLine[] | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      const data = await res.json();
      setLines(data.lines);
    } catch {
      setLines([]);
    }
  }, []);

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener("kstore:cart-updated", handler);
    return () => window.removeEventListener("kstore:cart-updated", handler);
  }, [load]);

  async function updateQty(id: number, quantity: number) {
    if (quantity < 1) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/cart/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      if (res.ok) {
        const data = await res.json();
        setLines(data.lines);
        notifyCartUpdated();
      }
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: number) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/cart/${id}`, { method: "DELETE" });
      if (res.ok) {
        const data = await res.json();
        setLines(data.lines);
        notifyCartUpdated();
      }
    } finally {
      setBusyId(null);
    }
  }

  const subtotal = (lines ?? []).reduce((s, l) => s + l.price * l.quantity, 0);
  const shipping = shippingCost(subtotal);

  if (lines === null) {
    return <div className="mx-auto max-w-4xl px-4 py-24 text-center text-neutral-400">Loading cart…</div>;
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center">
        <span className="text-6xl">🛒</span>
        <h1 className="mt-5 text-3xl font-extrabold tracking-tight">Your cart is empty</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-neutral-500">
          Looks like you haven&apos;t added anything yet. Explore the store and find something you love.
        </p>
        <Link
          href="/products"
          className="mt-7 inline-block rounded-full bg-neutral-900 px-8 py-3 text-sm font-bold text-white transition hover:bg-neutral-700"
        >
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold tracking-tight">Shopping cart</h1>
      <p className="mt-1 text-sm text-neutral-500">{lines.length} {lines.length === 1 ? "item" : "items"} in your cart</p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {lines.map((l) => (
            <div
              key={l.id}
              className={`flex gap-4 rounded-2xl border border-neutral-100 p-4 transition sm:gap-5 ${busyId === l.id ? "opacity-60" : ""}`}
            >
              <Link href={`/products/${l.slug}`} className="shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                <img src={l.image} alt={l.name} className="h-24 w-24 object-cover sm:h-28 sm:w-28" />
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link href={`/products/${l.slug}`} className="font-bold hover:underline">
                      {l.name}
                    </Link>
                    <p className="mt-0.5 text-sm text-neutral-400">
                      {formatPrice(l.price)} {l.compareAtPrice && (
                        <span className="line-through">{formatPrice(l.compareAtPrice)}</span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => remove(l.id)}
                    className="text-neutral-400 transition hover:text-red-600"
                    aria-label={`Remove ${l.name}`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="flex items-center rounded-full border border-neutral-200">
                    <button
                      onClick={() => updateQty(l.id, l.quantity - 1)}
                      disabled={l.quantity <= 1 || busyId === l.id}
                      className="flex h-9 w-9 items-center justify-center text-neutral-600 transition hover:text-neutral-900 disabled:opacity-30"
                      aria-label="Decrease"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-bold">{l.quantity}</span>
                    <button
                      onClick={() => updateQty(l.id, l.quantity + 1)}
                      disabled={l.quantity >= l.stock || busyId === l.id}
                      className="flex h-9 w-9 items-center justify-center text-neutral-600 transition hover:text-neutral-900 disabled:opacity-30"
                      aria-label="Increase"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-base font-extrabold">{formatPrice(l.price * l.quantity)}</p>
                </div>
              </div>
            </div>
          ))}
          <Link href="/products" className="inline-block text-sm font-semibold text-orange-600 hover:underline">
            ← Continue shopping
          </Link>
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-2xl border border-neutral-100 bg-neutral-50 p-6 lg:sticky lg:top-32">
          <h2 className="text-lg font-bold">Order summary</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-neutral-500">Subtotal</dt>
              <dd className="font-semibold">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-500">Shipping</dt>
              <dd className="font-semibold">{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
            </div>
            <div className="flex justify-between border-t border-neutral-200 pt-3 text-base">
              <dt className="font-bold">Total</dt>
              <dd className="font-extrabold">{formatPrice(subtotal + shipping)}</dd>
            </div>
          </dl>
          {subtotal < FREE_SHIPPING_THRESHOLD && (
            <div className="mt-4 rounded-xl bg-white p-3 text-xs text-neutral-500">
              Add <span className="font-bold text-neutral-900">{formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)}</span> more
              for <span className="font-bold text-emerald-600">free shipping</span> 🚚
            </div>
          )}
          <Link
            href="/checkout"
            className="mt-5 block rounded-full bg-neutral-900 py-3.5 text-center text-sm font-bold text-white transition hover:bg-neutral-700"
          >
            Proceed to checkout →
          </Link>
          <p className="mt-3 text-center text-xs text-neutral-400">
            Free 30-day returns · Secure checkout
          </p>
        </aside>
      </div>
    </div>
  );
}
