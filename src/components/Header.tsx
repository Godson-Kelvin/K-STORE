"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { notifyCartUpdated } from "@/components/Toast";
import { cn } from "@/lib/utils";

type Category = { id: number; name: string; slug: string };
type User = { id: number; name: string; email: string; role: string };

export default function Header() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [count, setCount] = useState(0);
  const [q, setQ] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []))
      .catch(() => {});
    refresh();
    const handler = () => refresh();
    window.addEventListener("kstore:cart-updated", handler);
    return () => window.removeEventListener("kstore:cart-updated", handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  async function refresh() {
    try {
      const [meRes, cartRes] = await Promise.all([fetch("/api/me"), fetch("/api/cart")]);
      if (meRes.ok) {
        const me = await meRes.json();
        setUser(me.user ?? null);
      } else {
        setUser(null);
      }
      if (cartRes.ok) {
        const cart = await cartRes.json();
        setCount(cart.lines.reduce((s: number, l: { quantity: number }) => s + l.quantity, 0));
      }
    } catch {
      /* ignore */
    }
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(q.trim() ? `/products?q=${encodeURIComponent(q.trim())}` : "/products");
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    notifyCartUpdated();
    router.push("/");
    router.refresh();
  }

  const navLink = (href: string, label: string, exact = false) => (
    <Link
      href={href}
      className={cn(
        "text-sm font-medium transition hover:text-neutral-900",
        (exact ? pathname === href : pathname.startsWith(href)) ? "text-neutral-900" : "text-neutral-500"
      )}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50">
      {/* Promo strip */}
      <div className="bg-orange-600 px-4 py-2 text-center text-xs font-semibold tracking-wide text-white">
        Free shipping on orders over GH₵1,000 · Use code <span className="underline underline-offset-2">KSTORE10</span> for 10% off
      </div>

      <div className="border-b border-neutral-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          {/* Mobile menu button */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-700 hover:bg-neutral-100 lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              )}
            </svg>
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-sm font-black text-white">
              K
            </span>
            <span className="text-lg font-extrabold tracking-tight">K-Store</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 lg:flex">
            {navLink("/", "Home", true)}
            {navLink("/products", "Shop")}
            {categories.slice(0, 5).map((c) => (
              <Link
                key={c.id}
                href={`/products?category=${c.slug}`}
                className="text-sm font-medium text-neutral-500 transition hover:text-neutral-900"
              >
                {c.name}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {/* Search */}
            <form onSubmit={submitSearch} className="hidden md:block">
              <div className="relative">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search products…"
                  className="w-44 rounded-full border border-neutral-200 bg-neutral-50 py-2 pr-4 pl-9 text-sm outline-none transition focus:w-56 focus:border-neutral-900 focus:bg-white"
                />
              </div>
            </form>

            {/* Account */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-700 transition hover:bg-neutral-100"
                aria-label="Account"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl shadow-black/5">
                  {user ? (
                    <>
                      <div className="border-b border-neutral-100 px-4 py-3">
                        <p className="truncate text-sm font-semibold">{user.name}</p>
                        <p className="truncate text-xs text-neutral-500">{user.email}</p>
                      </div>
                      <div className="p-1.5">
                        <MenuItem href="/account">My Account</MenuItem>
                        <MenuItem href="/account?tab=orders">My Orders</MenuItem>
                        <MenuItem href="/account?tab=wishlist">Wishlist</MenuItem>
                        {user.role === "admin" && <MenuItem href="/admin">Admin Dashboard</MenuItem>}
                        <button
                          onClick={logout}
                          className="block w-full rounded-lg px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100"
                        >
                          Sign out
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-2">
                      <Link
                        href="/login"
                        className="block rounded-full bg-neutral-900 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-neutral-700"
                      >
                        Sign in
                      </Link>
                      <Link
                        href="/register"
                        className="mt-1 block rounded-full px-4 py-2 text-center text-sm font-semibold text-neutral-700 hover:bg-neutral-100"
                      >
                        Create account
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-neutral-700 transition hover:bg-neutral-100"
              aria-label="Cart"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z"
                />
              </svg>
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-600 px-1 text-[11px] font-bold text-white">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile search + nav */}
        {mobileOpen && (
          <div className="border-t border-neutral-100 bg-white px-4 py-4 lg:hidden">
            <form onSubmit={submitSearch} className="relative mb-3">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products…"
                className="w-full rounded-full border border-neutral-200 bg-neutral-50 py-2.5 pr-4 pl-9 text-sm outline-none focus:border-neutral-900"
              />
            </form>
            <div className="flex flex-col gap-1">
              <Link href="/" className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-neutral-100">Home</Link>
              <Link href="/products" className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-neutral-100">Shop All</Link>
              {categories.map((c) => (
                <Link key={c.id} href={`/products?category=${c.slug}`} className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-neutral-100">
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function MenuItem({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="block rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100">
      {children}
    </Link>
  );
}
