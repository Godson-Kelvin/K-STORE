import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-neutral-950 text-neutral-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600 text-sm font-black text-white">K</span>
              <span className="text-lg font-extrabold tracking-tight text-white">K-Store</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-neutral-400">
              Everything you need, delivered fast. Curated tech, fashion and home essentials with
              hassle-free returns.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold tracking-wide text-white uppercase">Shop</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/products" className="hover:text-white">All Products</Link></li>
              <li><Link href="/products?sort=price-asc" className="hover:text-white">Under GH₵1,000</Link></li>
              <li><Link href="/products?sort=rating" className="hover:text-white">Top Rated</Link></li>
              <li><Link href="/products?category=audio" className="hover:text-white">Audio</Link></li>
              <li><Link href="/products?category=fashion" className="hover:text-white">Fashion</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold tracking-wide text-white uppercase">Support</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/account" className="hover:text-white">My Account</Link></li>
              <li><Link href="/account?tab=orders" className="hover:text-white">Track Order</Link></li>
              <li><Link href="/cart" className="hover:text-white">Shopping Cart</Link></li>
              <li><span className="cursor-default">Returns & Refunds</span></li>
              <li><span className="cursor-default">Shipping Info</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold tracking-wide text-white uppercase">Stay in the loop</h4>
            <p className="mt-4 text-sm text-neutral-400">Get 10% off your first order and early access to drops.</p>
            <form className="mt-4 flex gap-2">
              <input
                type="email"
                placeholder="you@email.com"
                className="w-full rounded-full border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm text-white placeholder-neutral-500 outline-none focus:border-orange-500"
              />
              <button className="shrink-0 rounded-full bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-500">
                Join
              </button>
            </form>
            <div className="mt-6 flex items-center gap-2 text-xs text-neutral-500">
              <span className="rounded border border-neutral-700 px-2 py-1">VISA</span>
              <span className="rounded border border-neutral-700 px-2 py-1">MC</span>
              <span className="rounded border border-neutral-700 px-2 py-1">AMEX</span>
              <span className="rounded border border-neutral-700 px-2 py-1">PayPal</span>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-neutral-800 pt-6 text-xs text-neutral-500 sm:flex-row">
          <p>© {new Date().getFullYear()} K-Store. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
