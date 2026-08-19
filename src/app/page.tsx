import Link from "next/link";
import { getCategories, getFeaturedProducts, getNewArrivals } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import { formatPrice, FREE_SHIPPING_THRESHOLD } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, featured, arrivals] = await Promise.all([
    getCategories(),
    getFeaturedProducts(8),
    getNewArrivals(8),
  ]);

  return (
    <div className="animate-fade-up">
      {/* HERO */}
      <section className="relative overflow-hidden bg-neutral-950">
        <img
          src="/hero.jpg"
          alt="K-Store hero"
          className="absolute inset-0 h-full w-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/70 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-orange-300 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
              NEW SEASON · NOW LIVE
            </span>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
              Everything you need.
              <span className="block text-orange-500">Delivered fast.</span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-neutral-300 sm:text-lg">
              Curated audio, wearables, tech, fashion and home essentials — with free shipping over
              GH₵1,000 and 30-day hassle-free returns.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="rounded-full bg-orange-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-600/30 transition hover:bg-orange-500"
              >
                Shop now
              </Link>
              <Link
                href="/products?sort=rating"
                className="rounded-full border border-white/25 bg-white/5 px-7 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/10"
              >
                Bestsellers
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-8 text-sm text-neutral-300">
              <div>
                <p className="text-lg font-bold text-white">50K+</p>
                <p className="text-xs text-neutral-400">Happy customers</p>
              </div>
              <div>
                <p className="text-lg font-bold text-white">4.8★</p>
                <p className="text-xs text-neutral-400">Average rating</p>
              </div>
              <div>
                <p className="text-lg font-bold text-white">24h</p>
                <p className="text-xs text-neutral-400">Dispatch time</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Shop by category</h2>
            <p className="mt-1 text-sm text-neutral-500">Find exactly what you&apos;re looking for.</p>
          </div>
          <Link href="/products" className="text-sm font-semibold text-orange-600 hover:text-orange-500">
            View all →
          </Link>
        </div>
        <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/products?category=${c.slug}`}
              className="group relative overflow-hidden rounded-2xl bg-neutral-100"
            >
              <img
                src={c.image ?? ""}
                alt={c.name}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute right-4 bottom-3.5 left-4 flex items-end justify-between">
                <div>
                  <p className="font-bold text-white">{c.name}</p>
                  <p className="text-xs text-white/70">{c.count} items</p>
                </div>
                <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur transition group-hover:bg-orange-600">
                  Shop
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="bg-neutral-50 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Featured picks</h2>
              <p className="mt-1 text-sm text-neutral-500">Hand-picked favorites our customers love.</p>
            </div>
            <Link href="/products?sort=rating" className="text-sm font-semibold text-orange-600 hover:text-orange-500">
              View all →
            </Link>
          </div>
          <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* PROMO BANNER */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-neutral-950 px-6 py-14 text-center sm:px-12">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-orange-600/30 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl" />
          <div className="relative">
            <p className="text-xs font-bold tracking-[0.25em] text-orange-400 uppercase">Limited time</p>
            <h3 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
              Take 10% off your first order
            </h3>
            <p className="mx-auto mt-3 max-w-md text-sm text-neutral-400">
              Use code <span className="rounded bg-white/10 px-2 py-1 font-mono font-bold text-orange-300">KSTORE10</span> at
              checkout. Plus free shipping on everything over GH₵1,000.
            </p>
            <div className="mt-7 flex justify-center gap-3">
              <Link
                href="/products"
                className="rounded-full bg-orange-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-500"
              >
                Start shopping
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">New arrivals</h2>
            <p className="mt-1 text-sm text-neutral-500">Fresh drops, just in.</p>
          </div>
          <Link href="/products?sort=newest" className="text-sm font-semibold text-orange-600 hover:text-orange-500">
            View all →
          </Link>
        </div>
        <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {arrivals.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* VALUE PROPS */}
      <section className="border-t border-neutral-100 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            {
              title: "Free & fast shipping",
              desc: `Free shipping on orders over ${formatPrice(FREE_SHIPPING_THRESHOLD)}, dispatched within 24 hours.`,
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              ),
            },
            {
              title: "30-day returns",
              desc: "Changed your mind? Send it back within 30 days for a full refund, no questions asked.",
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
              ),
            },
            {
              title: "Secure checkout",
              desc: "256-bit encrypted payments with Visa, Mastercard, Amex and PayPal. Your data stays yours.",
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              ),
            },
          ].map((v) => (
            <div key={v.title} className="flex gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-900">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-6 w-6">
                  {v.icon}
                </svg>
              </span>
              <div>
                <h3 className="font-bold">{v.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-neutral-500">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
