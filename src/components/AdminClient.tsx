"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { cn, formatDate, formatPrice } from "@/lib/utils";

type User = { id: number; name: string; email: string; role: string };
type Category = { id: number; name: string; slug: string };
type AdminProduct = {
  id: number;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  image: string;
  categoryId: number | null;
  stock: number;
  featured: boolean;
  rating: number;
  ratingCount: number;
};
type Order = {
  id: number;
  orderNumber: string;
  email: string;
  name: string;
  status: string;
  total: number;
  createdAt: string;
  items: Array<{ id: number; productName: string; quantity: number; price: number }>;
};
type Stats = {
  revenue: number;
  orders: number;
  products: number;
  customers: number;
  pending: number;
  lowStock: Array<{ id: number; name: string; stock: number; slug: string }>;
  recentOrders: Order[];
  topProducts: Array<{ name: string; sold: number; revenue: number }>;
};

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];
const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-violet-100 text-violet-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

const emptyForm = {
  name: "",
  slug: "",
  price: "",
  compareAtPrice: "",
  stock: "10",
  categoryId: "",
  image: "",
  featured: false,
  description: "",
};

export default function AdminClient() {
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const loadAll = useCallback(async () => {
    const [meRes, statsRes, prodsRes, catsRes] = await Promise.all([
      fetch("/api/me"),
      fetch("/api/admin/stats"),
      fetch("/api/admin/products"),
      fetch("/api/categories"),
    ]);
    const me = await meRes.json();
    if (!meRes.ok || me.user?.role !== "admin") {
      router.replace("/login?next=/admin");
      return;
    }
    setUser(me.user);
    if (statsRes.ok) setStats(await statsRes.json());
    if (prodsRes.ok) setProducts(await prodsRes.json());
    if (catsRes.ok) setCategories((await catsRes.json()).categories);
    setLoading(false);
    await loadOrders();
  }, [router]);

  async function loadOrders() {
    const res = await fetch("/api/admin/orders");
    if (res.ok) setOrders(await res.json());
  }

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function saveProduct(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editing ? `/api/admin/products/${editing.id}` : "/api/admin/products";
      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug,
          price: form.price,
          compareAtPrice: form.compareAtPrice || null,
          stock: form.stock,
          categoryId: form.categoryId || null,
          image: form.image,
          featured: form.featured,
          description: form.description,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      toast(editing ? "Product updated" : "Product created");
      setModalOpen(false);
      setEditing(null);
      setForm(emptyForm);
      await loadAll();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Save failed", "error");
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(p: AdminProduct) {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/products/${p.id}`, { method: "DELETE" });
    if (res.ok) {
      toast("Product deleted", "info");
      await loadAll();
    } else {
      toast("Could not delete product", "error");
    }
  }

  async function updateStatus(orderId: number, status: string) {
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast(`Order marked ${status}`);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    } else {
      toast("Could not update order", "error");
    }
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(p: AdminProduct) {
    setEditing(p);
    setForm({
      name: p.name,
      slug: p.slug,
      price: String(p.price / 100),
      compareAtPrice: p.compareAtPrice ? String(p.compareAtPrice / 100) : "",
      stock: String(p.stock),
      categoryId: p.categoryId ? String(p.categoryId) : "",
      image: p.image,
      featured: p.featured,
      description: "",
    });
    setModalOpen(true);
  }

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 py-24 text-center text-neutral-400">Loading admin…</div>;
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "products", label: `Products (${products.length})` },
    { id: "orders", label: `Orders (${orders.length})` },
  ];

  const inputCls =
    "w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-neutral-900";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Admin dashboard</h1>
          <p className="mt-1 text-sm text-neutral-500">Manage your store as {user?.name}.</p>
        </div>
        <button onClick={openCreate} className="rounded-full bg-orange-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-orange-500">
          + New product
        </button>
      </div>

      <div className="mt-7 flex gap-2 overflow-x-auto border-b border-neutral-100 pb-px">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "shrink-0 rounded-t-xl border-b-2 px-5 py-3 text-sm font-semibold transition",
              tab === t.id ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-400 hover:text-neutral-700"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === "overview" && stats && (
        <div className="mt-8 space-y-8">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            {[
              { label: "Revenue", value: formatPrice(stats.revenue), sub: "excl. cancelled" },
              { label: "Orders", value: String(stats.orders), sub: `${stats.pending} pending` },
              { label: "Products", value: String(stats.products), sub: `${stats.lowStock.length} low stock` },
              { label: "Customers", value: String(stats.customers), sub: "registered" },
              { label: "Avg order", value: stats.orders ? formatPrice(Math.round(stats.revenue / stats.orders)) : "GH₵0", sub: "per order" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-neutral-100 p-5">
                <p className="text-xs font-semibold tracking-wide text-neutral-400 uppercase">{s.label}</p>
                <p className="mt-2 text-2xl font-extrabold">{s.value}</p>
                <p className="mt-1 text-xs text-neutral-400">{s.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-neutral-100 p-5">
              <h3 className="font-bold">Top sellers</h3>
              <div className="mt-4 space-y-3">
                {stats.topProducts.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-3 text-sm">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold">{i + 1}</span>
                    <span className="flex-1 truncate font-medium">{p.name}</span>
                    <span className="text-neutral-400">{p.sold} sold</span>
                    <span className="font-bold">{formatPrice(p.revenue)}</span>
                  </div>
                ))}
                {stats.topProducts.length === 0 && <p className="text-sm text-neutral-400">No sales yet.</p>}
              </div>
            </div>
            <div className="rounded-2xl border border-neutral-100 p-5">
              <h3 className="font-bold">Low stock alerts</h3>
              <div className="mt-4 space-y-3">
                {stats.lowStock.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 text-sm">
                    <span className="flex-1 truncate font-medium">{p.name}</span>
                    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", p.stock === 0 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700")}>
                      {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                    </span>
                  </div>
                ))}
                {stats.lowStock.length === 0 && <p className="text-sm text-neutral-400">All stocked up 👍</p>}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-100 p-5">
            <h3 className="font-bold">Recent orders</h3>
            <div className="mt-4 divide-y divide-neutral-100">
              {stats.recentOrders.map((o) => (
                <div key={o.id} className="flex items-center gap-3 py-3 text-sm">
                  <span className="font-mono text-xs font-bold">{o.orderNumber}</span>
                  <span className="flex-1 truncate text-neutral-500">{o.name}</span>
                  <span className="text-xs text-neutral-400">{formatDate(o.createdAt)}</span>
                  <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold capitalize", STATUS_STYLES[o.status] ?? "bg-neutral-100")}>
                    {o.status}
                  </span>
                  <span className="font-bold">{formatPrice(o.total)}</span>
                </div>
              ))}
              {stats.recentOrders.length === 0 && <p className="py-4 text-sm text-neutral-400">No orders yet.</p>}
            </div>
          </div>
        </div>
      )}

      {/* PRODUCTS */}
      {tab === "products" && (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-neutral-100">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-neutral-100 bg-neutral-50 text-xs text-neutral-500 uppercase">
              <tr>
                <th className="px-5 py-3 font-semibold">Product</th>
                <th className="px-5 py-3 font-semibold">Category</th>
                <th className="px-5 py-3 font-semibold">Price</th>
                <th className="px-5 py-3 font-semibold">Stock</th>
                <th className="px-5 py-3 font-semibold">Rating</th>
                <th className="px-5 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-50/60">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      <div>
                        <p className="font-semibold">{p.name}</p>
                        <p className="text-xs text-neutral-400">/{p.slug}</p>
                      </div>
                      {p.featured && <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] font-bold text-white">FEATURED</span>}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-neutral-500">{categories.find((c) => c.id === p.categoryId)?.name ?? "—"}</td>
                  <td className="px-5 py-3 font-semibold">
                    {formatPrice(p.price)}
                    {p.compareAtPrice && <span className="ml-1 text-xs text-neutral-400 line-through">{formatPrice(p.compareAtPrice)}</span>}
                  </td>
                  <td className="px-5 py-3">
                    <span className={cn("font-bold", p.stock === 0 ? "text-red-600" : p.stock <= 5 ? "text-amber-600" : "text-neutral-700")}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-neutral-500">{p.rating.toFixed(1)} ★ ({p.ratingCount})</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(p)} className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-semibold hover:border-neutral-900">
                        Edit
                      </button>
                      <button onClick={() => deleteProduct(p)} className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ORDERS */}
      {tab === "orders" && (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-neutral-100">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-neutral-100 bg-neutral-50 text-xs text-neutral-500 uppercase">
              <tr>
                <th className="px-5 py-3 font-semibold">Order</th>
                <th className="px-5 py-3 font-semibold">Customer</th>
                <th className="px-5 py-3 font-semibold">Items</th>
                <th className="px-5 py-3 font-semibold">Total</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-neutral-50/60">
                  <td className="px-5 py-3">
                    <p className="font-mono text-xs font-bold">{o.orderNumber}</p>
                    <p className="text-xs text-neutral-400">{formatDate(o.createdAt)}</p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-semibold">{o.name}</p>
                    <p className="text-xs text-neutral-400">{o.email}</p>
                  </td>
                  <td className="px-5 py-3 text-neutral-500">
                    {o.items.map((it) => (
                      <p key={it.id} className="text-xs">
                        {it.quantity}× {it.productName}
                      </p>
                    ))}
                  </td>
                  <td className="px-5 py-3 font-bold">{formatPrice(o.total)}</td>
                  <td className="px-5 py-3">
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      className={cn("rounded-full border-0 px-3 py-1.5 text-xs font-bold capitalize outline-none", STATUS_STYLES[o.status] ?? "bg-neutral-100")}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <p className="p-8 text-center text-sm text-neutral-400">No orders yet.</p>}
        </div>
      )}

      {/* PRODUCT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4" onClick={() => setModalOpen(false)}>
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-7" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-extrabold">{editing ? "Edit product" : "New product"}</h2>
            <form onSubmit={saveProduct} className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-neutral-500 uppercase">Name *</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="Product name" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold text-neutral-500 uppercase">Price (GH₵) *</label>
                  <input required type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputCls} placeholder="1429.99" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-neutral-500 uppercase">Compare-at (GH₵)</label>
                  <input type="number" step="0.01" min="0" value={form.compareAtPrice} onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })} className={inputCls} placeholder="1799.99" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold text-neutral-500 uppercase">Stock *</label>
                  <input required type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-neutral-500 uppercase">Category</label>
                  <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className={inputCls}>
                    <option value="">None</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-neutral-500 uppercase">Image URL</label>
                <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className={inputCls} placeholder="https://…" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-neutral-500 uppercase">Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} placeholder="Product description" />
              </div>
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="h-4 w-4" />
                Featured on homepage
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="rounded-full border border-neutral-200 px-5 py-2.5 text-sm font-semibold">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-neutral-700 disabled:opacity-50">
                  {saving ? "Saving…" : editing ? "Save changes" : "Create product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
