"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import Stars from "@/components/Stars";
import { cn, formatDate, formatPrice } from "@/lib/utils";

type User = { id: number; name: string; email: string; role: string; createdAt: string };
type Order = {
  id: number;
  orderNumber: string;
  status: string;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  createdAt: string;
  items: Array<{ id: number; productName: string; productImage: string | null; price: number; quantity: number }>;
};
type WishProduct = {
  id: number;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  image: string;
  rating: number;
  ratingCount: number;
  stock: number;
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-violet-100 text-violet-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function AccountClient({ initialTab }: { initialTab: string }) {
  const [tab, setTab] = useState(initialTab);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<WishProduct[]>([]);
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    (async () => {
      const meRes = await fetch("/api/me");
      if (!meRes.ok) {
        router.replace("/login?next=/account");
        return;
      }
      const me = await meRes.json();
      setUser(me.user);
      setLoading(false);
      if (tab === "orders") loadOrders();
      if (tab === "wishlist") loadWishlist();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadOrders() {
    const res = await fetch("/api/orders");
    if (res.ok) {
      const data = await res.json();
      setOrders(data.orders);
    }
  }

  async function loadWishlist() {
    const res = await fetch("/api/wishlist");
    if (res.ok) {
      const data = await res.json();
      setWishlist(data.products);
    }
  }

  async function switchTab(t: string) {
    setTab(t);
    router.replace(`/account?tab=${t}`);
    if (t === "orders") loadOrders();
    if (t === "wishlist") loadWishlist();
  }

  async function removeFromWishlist(productId: number) {
    await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    setWishlist((w) => w.filter((p) => p.id !== productId));
    toast("Removed from wishlist", "info");
  }

  if (loading) {
    return <div className="mx-auto max-w-5xl px-4 py-24 text-center text-neutral-400">Loading…</div>;
  }

  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "orders", label: `Orders (${orders.length})` },
    { id: "wishlist", label: `Wishlist (${wishlist.length})` },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">My account</h1>
          <p className="mt-1 text-sm text-neutral-500">Welcome back, {user?.name.split(" ")[0]} 👋</p>
        </div>
        {user?.role === "admin" && (
          <Link href="/admin" className="rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-neutral-700">
            Admin dashboard →
          </Link>
        )}
      </div>

      <div className="mt-7 flex gap-2 overflow-x-auto border-b border-neutral-100 pb-px">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => switchTab(t.id)}
            className={cn(
              "shrink-0 rounded-t-xl border-b-2 px-5 py-3 text-sm font-semibold transition",
              tab === t.id
                ? "border-neutral-900 text-neutral-900"
                : "border-transparent text-neutral-400 hover:text-neutral-700"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "profile" && user && (
          <div className="max-w-md rounded-2xl border border-neutral-100 p-6">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-900 text-xl font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </span>
              <div>
                <p className="text-lg font-bold">{user.name}</p>
                <p className="text-sm text-neutral-500">{user.email}</p>
              </div>
            </div>
            <dl className="mt-6 space-y-3 border-t border-neutral-100 pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-neutral-500">Role</dt>
                <dd className="font-semibold capitalize">{user.role}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-500">Member since</dt>
                <dd className="font-semibold">{formatDate(user.createdAt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-500">Orders placed</dt>
                <dd className="font-semibold">{orders.length}</dd>
              </div>
            </dl>
          </div>
        )}

        {tab === "orders" && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-200 p-12 text-center">
                <p className="text-sm text-neutral-500">You haven&apos;t placed any orders yet.</p>
                <Link href="/products" className="mt-4 inline-block rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-neutral-700">
                  Start shopping
                </Link>
              </div>
            ) : (
              orders.map((o) => (
                <div key={o.id} className="rounded-2xl border border-neutral-100 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-mono text-sm font-extrabold">{o.orderNumber}</p>
                      <p className="mt-0.5 text-xs text-neutral-400">{formatDate(o.createdAt)}</p>
                    </div>
                    <span className={cn("rounded-full px-3 py-1 text-xs font-bold capitalize", STATUS_STYLES[o.status] ?? "bg-neutral-100 text-neutral-600")}>
                      {o.status}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    {o.items.map((it) => (
                      <div key={it.id} className="relative shrink-0">
                        <img src={it.productImage ?? ""} alt={it.productName} className="h-16 w-16 rounded-lg object-cover" />
                        <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-bold text-white">
                          {it.quantity}
                        </span>
                      </div>
                    ))}
                    <div className="ml-auto text-right">
                      <p className="text-xs text-neutral-400">Total</p>
                      <p className="font-extrabold">{formatPrice(o.total)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "wishlist" && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {wishlist.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-neutral-200 p-12 text-center">
                <p className="text-sm text-neutral-500">Your wishlist is empty. Tap the ♥ on any product to save it here.</p>
                <Link href="/products" className="mt-4 inline-block rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-neutral-700">
                  Explore products
                </Link>
              </div>
            ) : (
              wishlist.map((p) => (
                <div key={p.id} className="rounded-2xl border border-neutral-100 p-3">
                  <Link href={`/products/${p.slug}`} className="block overflow-hidden rounded-xl bg-neutral-100">
                    <img src={p.image} alt={p.name} className="aspect-square w-full object-cover" />
                  </Link>
                  <div className="px-1 pt-3">
                    <Link href={`/products/${p.slug}`} className="line-clamp-1 text-sm font-bold hover:underline">
                      {p.name}
                    </Link>
                    <div className="mt-1 flex items-center gap-1">
                      <Stars rating={p.rating} size="h-3 w-3" />
                      <span className="text-[11px] text-neutral-400">({p.ratingCount})</span>
                    </div>
                    <p className="mt-1 text-sm font-extrabold">{formatPrice(p.price)}</p>
                    <button
                      onClick={() => removeFromWishlist(p.id)}
                      className="mt-2 w-full rounded-full border border-neutral-200 py-2 text-xs font-semibold text-neutral-500 transition hover:border-red-300 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
