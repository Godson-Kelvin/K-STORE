import Link from "next/link";
import { getCategories, getProducts } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import SortSelect from "@/components/SortSelect";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  q?: string;
  category?: string;
  sort?: string;
  min?: string;
  max?: string;
  page?: string;
}>;

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const category = sp.category ?? "";
  const sort = sp.sort ?? "newest";
  const min = sp.min ?? "";
  const max = sp.max ?? "";
  const page = Number(sp.page) || 1;

  const [categories, result] = await Promise.all([
    getCategories(),
    getProducts({ q, category, sort, min, max, page, limit: 12 }),
  ]);

  const currentCat = categories.find((c) => c.slug === category);

  const qs = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (sort) params.set("sort", sort);
    if (min) params.set("min", min);
    if (max) params.set("max", max);
    for (const [k, v] of Object.entries(overrides)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    const s = params.toString();
    return s ? `?${s}` : "";
  };

  const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "rating", label: "Top rated" },
    { value: "name", label: "Name A–Z" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb / title */}
      <nav className="text-xs text-neutral-400">
        <Link href="/" className="hover:text-neutral-700">Home</Link>
        <span className="mx-1.5">/</span>
        <span className="text-neutral-600">Shop</span>
        {currentCat && (
          <>
            <span className="mx-1.5">/</span>
            <span className="font-semibold text-neutral-900">{currentCat.name}</span>
          </>
        )}
      </nav>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {q ? `Results for “${q}”` : currentCat ? currentCat.name : "All products"}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {result.total} {result.total === 1 ? "product" : "products"}
            {currentCat && <> in {currentCat.name}</>}
          </p>
        </div>

        {/* Sort */}
        <form method="get" action="/products" className="flex items-center gap-2">
          {q && <input type="hidden" name="q" value={q} />}
          {category && <input type="hidden" name="category" value={category} />}
          {min && <input type="hidden" name="min" value={min} />}
          {max && <input type="hidden" name="max" value={max} />}
          <label htmlFor="sort" className="text-sm text-neutral-500">Sort by</label>
          <SortSelect value={sort} options={sortOptions} />
        </form>
      </div>

      <div className="mt-7 grid gap-8 lg:grid-cols-[220px_1fr]">
        {/* Filters */}
        <aside className="lg:sticky lg:top-32 lg:self-start">
          <div className="rounded-2xl border border-neutral-100 p-5">
            <h2 className="text-sm font-bold tracking-wide uppercase">Categories</h2>
            <ul className="mt-3 space-y-1">
              <li>
                <Link
                  href={qs({ category: undefined, page: undefined })}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition",
                    !category ? "bg-neutral-900 font-semibold text-white" : "text-neutral-600 hover:bg-neutral-100"
                  )}
                >
                  All <span className="text-xs opacity-60">{result.total}</span>
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={qs({ category: c.slug, page: undefined })}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition",
                      category === c.slug
                        ? "bg-neutral-900 font-semibold text-white"
                        : "text-neutral-600 hover:bg-neutral-100"
                    )}
                  >
                    {c.name} <span className="text-xs opacity-60">{c.count}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <h2 className="mt-6 text-sm font-bold tracking-wide uppercase">Price</h2>
            <form method="get" action="/products" className="mt-3 space-y-2">
              {q && <input type="hidden" name="q" value={q} />}
              {category && <input type="hidden" name="category" value={category} />}
              {sort && <input type="hidden" name="sort" value={sort} />}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute top-1/2 left-3 -translate-y-1/2 text-xs text-neutral-400">₵</span>
                  <input
                    name="min"
                    defaultValue={min}
                    inputMode="decimal"
                    placeholder="Min"
                    className="w-full rounded-lg border border-neutral-200 py-2 pr-3 pl-7 text-sm outline-none focus:border-neutral-900"
                  />
                </div>
                <span className="text-neutral-300">–</span>
                <div className="relative flex-1">
                  <span className="absolute top-1/2 left-3 -translate-y-1/2 text-xs text-neutral-400">₵</span>
                  <input
                    name="max"
                    defaultValue={max}
                    inputMode="decimal"
                    placeholder="Max"
                    className="w-full rounded-lg border border-neutral-200 py-2 pr-3 pl-7 text-sm outline-none focus:border-neutral-900"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full rounded-full border border-neutral-900 py-2 text-sm font-semibold transition hover:bg-neutral-900 hover:text-white"
              >
                Apply
              </button>
              {(min || max || q || category) && (
                <Link
                  href="/products"
                  className="block text-center text-xs text-neutral-400 hover:text-neutral-700"
                >
                  Clear all filters
                </Link>
              )}
            </form>
          </div>
        </aside>

        {/* Grid */}
        <div>
          {q && (
            <div className="mb-4 flex items-center gap-2 text-sm text-neutral-500">
              Showing results for
              <span className="rounded-full bg-neutral-100 px-3 py-1 font-semibold text-neutral-900">“{q}”</span>
              <Link href={qs({ q: undefined })} className="text-orange-600 hover:underline">
                Clear search
              </Link>
            </div>
          )}

          {result.products.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-200 py-24 text-center">
              <span className="text-5xl">🔍</span>
              <h3 className="mt-4 text-lg font-bold">No products found</h3>
              <p className="mt-1 max-w-sm text-sm text-neutral-500">
                Try adjusting your search or filters to find what you&apos;re looking for.
              </p>
              <Link
                href="/products"
                className="mt-6 rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-neutral-700"
              >
                Browse everything
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {result.products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {result.pages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <Link
                href={qs({ page: page > 1 ? String(page - 1) : undefined })}
                aria-disabled={page <= 1}
                className={cn(
                  "rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold transition",
                  page <= 1 ? "pointer-events-none opacity-40" : "hover:border-neutral-900"
                )}
              >
                ← Prev
              </Link>
              {Array.from({ length: result.pages }, (_, i) => i + 1).map((n) => (
                <Link
                  key={n}
                  href={qs({ page: n === 1 ? undefined : String(n) })}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition",
                    n === result.page ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100"
                  )}
                >
                  {n}
                </Link>
              ))}
              <Link
                href={qs({ page: page < result.pages ? String(page + 1) : undefined })}
                aria-disabled={page >= result.pages}
                className={cn(
                  "rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold transition",
                  page >= result.pages ? "pointer-events-none opacity-40" : "hover:border-neutral-900"
                )}
              >
                Next →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
