"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { notifyCartUpdated } from "@/components/Toast";
import { formatPrice, PROMO_CODES, shippingCost } from "@/lib/utils";

type CartLine = {
  id: number;
  productId: number;
  quantity: number;
  name: string;
  slug: string;
  image: string;
  price: number;
  stock: number;
};

type OrderResult = { orderNumber: string; total: number; email: string };

export default function CheckoutPage() {
  const [lines, setLines] = useState<CartLine[] | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("Ghana");
  const [promo, setPromo] = useState("");
  const [appliedPromo, setAppliedPromo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<OrderResult | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [cartRes, meRes] = await Promise.all([fetch("/api/cart"), fetch("/api/me")]);
        const cart = await cartRes.json();
        setLines(cart.lines);
        if (meRes.ok) {
          const me = await meRes.json();
          if (me.user) {
            setName(me.user.name);
            setEmail(me.user.email);
          }
        }
      } catch {
        setLines([]);
      }
    })();
  }, []);

  const subtotal = useMemo(() => (lines ?? []).reduce((s, l) => s + l.price * l.quantity, 0), [lines]);
  const discountPct = appliedPromo ? PROMO_CODES[appliedPromo] ?? 0 : 0;
  const discount = Math.round((subtotal * discountPct) / 100);
  const shipping = shippingCost(subtotal - discount);
  const total = subtotal - discount + shipping;

  function applyPromo(e: React.FormEvent) {
    e.preventDefault();
    const code = promo.trim().toUpperCase();
    if (PROMO_CODES[code]) {
      setAppliedPromo(code);
      setError("");
    } else {
      setError("That promo code isn't valid");
    }
  }

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, address, city, postalCode, country, promoCode: appliedPromo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      setOrder(data.order);
      notifyCartUpdated();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-8 w-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </span>
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight">Order confirmed!</h1>
        <p className="mt-2 text-neutral-500">
          Thanks, {name.split(" ")[0] || "friend"}! A confirmation email is on its way to{" "}
          <span className="font-semibold text-neutral-900">{order.email}</span>.
        </p>
        <div className="mt-8 rounded-2xl border border-neutral-100 bg-neutral-50 p-6">
          <p className="text-sm text-neutral-500">Order number</p>
          <p className="mt-1 font-mono text-xl font-extrabold tracking-wide">{order.orderNumber}</p>
          <p className="mt-3 text-sm text-neutral-500">
            Total charged: <span className="font-bold text-neutral-900">{formatPrice(order.total)}</span>
          </p>
        </div>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/account?tab=orders" className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-bold text-white hover:bg-neutral-700">
            Track your order
          </Link>
          <Link href="/products" className="rounded-full border border-neutral-200 px-6 py-3 text-sm font-bold hover:border-neutral-900">
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  if (lines === null) {
    return <div className="mx-auto max-w-4xl px-4 py-24 text-center text-neutral-400">Loading checkout…</div>;
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center">
        <span className="text-6xl">🧾</span>
        <h1 className="mt-5 text-3xl font-extrabold tracking-tight">Nothing to check out</h1>
        <p className="mt-2 text-sm text-neutral-500">Your cart is empty. Add some products first!</p>
        <Link href="/products" className="mt-7 inline-block rounded-full bg-neutral-900 px-8 py-3 text-sm font-bold text-white hover:bg-neutral-700">
          Browse products
        </Link>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-900";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold tracking-tight">Checkout</h1>
      <p className="mt-1 text-sm text-neutral-500">Almost there — enter your shipping details to place the order.</p>

      <form onSubmit={placeOrder} className="mt-8 grid gap-10 lg:grid-cols-[1fr_400px]">
        <div className="space-y-8">
          <section>
            <h2 className="flex items-center gap-2 font-bold">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-xs text-white">1</span>
              Contact
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className={`${inputCls} sm:col-span-2`}
              />
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className={inputCls}
              />
            </div>
          </section>

          <section>
            <h2 className="flex items-center gap-2 font-bold">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-xs text-white">2</span>
              Shipping address
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <input
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address"
                className={`${inputCls} sm:col-span-2`}
              />
              <input
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className={inputCls}
              />
              <input
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="Postal code"
                className={inputCls}
              />
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className={`${inputCls} sm:col-span-2`}
              >
                {["Ghana", "Nigeria", "Côte d'Ivoire", "Togo", "United States", "United Kingdom", "Canada", "South Africa", "Other"].map(
                  (c) => (
                    <option key={c}>{c}</option>
                  )
                )}
              </select>
            </div>
          </section>

          <section>
            <h2 className="flex items-center gap-2 font-bold">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-xs text-white">3</span>
              Payment
            </h2>
            <div className="mt-4 rounded-2xl border border-neutral-200 p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                  </svg>
                </span>
                <div className="flex-1">
                  <p className="text-sm font-bold">Demo payment</p>
                  <p className="text-xs text-neutral-400">No real card will be charged — this is a demo store.</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">Test mode</span>
              </div>
            </div>
          </section>
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-2xl border border-neutral-100 bg-neutral-50 p-6 lg:sticky lg:top-32">
          <h2 className="text-lg font-bold">Order summary</h2>
          <div className="mt-4 space-y-3">
            {lines.map((l) => (
              <div key={l.id} className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <img src={l.image} alt={l.name} className="h-14 w-14 rounded-lg object-cover" />
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-bold text-white">
                    {l.quantity}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="truncate text-sm font-semibold">{l.name}</p>
                  <p className="text-xs text-neutral-400">{formatPrice(l.price)} each</p>
                </div>
                <p className="text-sm font-bold">{formatPrice(l.price * l.quantity)}</p>
              </div>
            ))}
          </div>

          {/* Promo */}
          <form onSubmit={applyPromo} className="mt-5 flex gap-2">
            <input
              value={promo}
              onChange={(e) => setPromo(e.target.value)}
              placeholder="Promo code (try KSTORE10)"
              className="w-full rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-neutral-900"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full border border-neutral-900 px-4 py-2.5 text-sm font-semibold hover:bg-neutral-900 hover:text-white"
            >
              Apply
            </button>
          </form>
          {appliedPromo && (
            <p className="mt-2 flex items-center justify-between rounded-lg bg-emerald-100 px-3 py-2 text-xs font-bold text-emerald-700">
              {appliedPromo} applied (−{discountPct}%)
              <button type="button" onClick={() => setAppliedPromo("")} className="underline">Remove</button>
            </p>
          )}
          {error && <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>}

          <dl className="mt-5 space-y-2.5 border-t border-neutral-200 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-neutral-500">Subtotal</dt>
              <dd className="font-semibold">{formatPrice(subtotal)}</dd>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <dt>Discount</dt>
                <dd className="font-semibold">−{formatPrice(discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-neutral-500">Shipping</dt>
              <dd className="font-semibold">{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
            </div>
            <div className="flex justify-between border-t border-neutral-200 pt-3 text-base">
              <dt className="font-bold">Total</dt>
              <dd className="font-extrabold">{formatPrice(total)}</dd>
            </div>
          </dl>

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-full bg-orange-600 py-3.5 text-sm font-bold text-white transition hover:bg-orange-500 disabled:opacity-50"
          >
            {loading ? "Placing order…" : `Place order · ${formatPrice(total)}`}
          </button>
          <p className="mt-3 text-center text-xs text-neutral-400">Secure checkout · 30-day returns</p>
        </aside>
      </form>
    </div>
  );
}
