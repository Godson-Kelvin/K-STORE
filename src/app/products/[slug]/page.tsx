import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getProductReviews, getRelatedProducts } from "@/lib/data";
import { getSessionUser } from "@/lib/auth";
import Gallery from "@/components/Gallery";
import BuyBox from "@/components/BuyBox";
import ReviewForm from "@/components/ReviewForm";
import ProductCard from "@/components/ProductCard";
import Stars from "@/components/Stars";
import { formatDate, formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, reviews, user] = await Promise.all([
    getProductBySlug(slug),
    getProductBySlug(slug).then((p) => (p ? getProductReviews(p.id) : [])),
    getSessionUser(),
  ]);

  if (!product) notFound();

  const related = await getRelatedProducts(product.id, product.categoryId, 4);
  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0;

  const specs: Array<[string, string]> = [
    ["Condition", "Brand new"],
    ["Shipping", "Ships within 24 hours"],
    ["Returns", "30-day free returns"],
    ["Warranty", "1-year limited warranty"],
    ["Stock", `${product.stock} available`],
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="text-xs text-neutral-400">
        <Link href="/" className="hover:text-neutral-700">Home</Link>
        <span className="mx-1.5">/</span>
        <Link href="/products" className="hover:text-neutral-700">Shop</Link>
        {product.category && (
          <>
            <span className="mx-1.5">/</span>
            <Link href={`/products?category=${product.category.slug}`} className="hover:text-neutral-700">
              {product.category.name}
            </Link>
          </>
        )}
        <span className="mx-1.5">/</span>
        <span className="font-semibold text-neutral-900">{product.name}</span>
      </nav>

      <div className="mt-5 grid gap-10 lg:grid-cols-2 lg:gap-14">
        {/* Gallery */}
        <Gallery images={product.gallery?.length ? product.gallery : [product.image]} name={product.name} />

        {/* Info */}
        <div>
          {product.category && (
            <Link
              href={`/products?category=${product.category.slug}`}
              className="text-xs font-bold tracking-widest text-orange-600 uppercase hover:underline"
            >
              {product.category.name}
            </Link>
          )}
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{product.name}</h1>

          <div className="mt-3 flex items-center gap-2">
            <Stars rating={product.rating} size="h-4 w-4" />
            <span className="text-sm font-semibold">{product.rating.toFixed(1)}</span>
            <span className="text-sm text-neutral-400">· {product.ratingCount} reviews</span>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <span className="text-3xl font-extrabold">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <>
                <span className="text-lg text-neutral-400 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
                <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-700">
                  Save {discount}%
                </span>
              </>
            )}
          </div>

          <p className="mt-5 leading-relaxed text-neutral-600">{product.description}</p>

          {/* Stock indicator */}
          <div className="mt-5 flex items-center gap-2 text-sm">
            {product.stock > 0 ? (
              product.stock <= 10 ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="font-semibold text-amber-700">
                    Only {product.stock} left in stock — order soon
                  </span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-emerald-700">In stock · ready to ship</span>
                </>
              )
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <span className="font-semibold text-red-600">Sold out</span>
              </>
            )}
          </div>

          <div className="mt-6">
            <BuyBox productId={product.id} stock={product.stock} />
          </div>

          <div className="mt-6 rounded-2xl border border-neutral-100 p-5">
            <dl className="space-y-3">
              {specs.map(([k, v]) => (
                <div key={k} className="flex items-center justify-between text-sm">
                  <dt className="text-neutral-500">{k}</dt>
                  <dd className="font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">Customer reviews</h2>
            <div className="mt-1 flex items-center gap-2">
              <Stars rating={product.rating} size="h-4 w-4" />
              <span className="text-sm text-neutral-500">
                {product.ratingCount} {product.ratingCount === 1 ? "review" : "reviews"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-200 p-10 text-center text-sm text-neutral-500">
                No reviews yet — be the first to share your experience.
              </div>
            ) : (
              reviews.map((r) => (
                <article key={r.id} className="rounded-2xl border border-neutral-100 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white">
                        {r.userName.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <p className="text-sm font-bold">{r.userName}</p>
                        <p className="text-xs text-neutral-400">{formatDate(r.createdAt)}</p>
                      </div>
                    </div>
                    <Stars rating={r.rating} />
                  </div>
                  <h3 className="mt-3 font-bold">{r.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-neutral-600">{r.comment}</p>
                </article>
              ))
            )}
          </div>

          <div>
            {user ? (
              <ReviewForm productId={product.id} />
            ) : (
              <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-6 text-center">
                <p className="text-sm text-neutral-600">Want to share your thoughts?</p>
                <Link
                  href={`/login?next=/products/${product.slug}`}
                  className="mt-4 inline-block rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-neutral-700"
                >
                  Sign in to review
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-extrabold tracking-tight">You might also like</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
