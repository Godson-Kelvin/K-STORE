"use client";

import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";
import WishlistButton from "@/components/WishlistButton";
import Stars from "@/components/Stars";
import { formatPrice } from "@/lib/utils";

export type ProductCardData = {
  id: number;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  image: string;
  rating: number;
  ratingCount: number;
  stock: number;
  categoryName?: string | null;
  featured?: boolean;
};

export default function ProductCard({ product }: { product: ProductCardData }) {
  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0;

  return (
    <div className="group relative flex flex-col rounded-2xl border border-neutral-100 bg-white p-3 transition hover:border-neutral-200 hover:shadow-xl hover:shadow-neutral-900/5">
      <div className="relative overflow-hidden rounded-xl bg-neutral-100">
        <Link href={`/products/${product.slug}`}>
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </Link>
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="rounded-full bg-orange-600 px-2.5 py-1 text-[11px] font-bold text-white">
              -{discount}%
            </span>
          )}
          {product.featured && (
            <span className="rounded-full bg-neutral-900 px-2.5 py-1 text-[11px] font-bold text-white">
              Featured
            </span>
          )}
        </div>
        <div className="absolute top-2.5 right-2.5">
          <WishlistButton productId={product.id} iconOnly className="!h-9 !w-9 shadow-sm" />
        </div>
        {product.stock <= 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <span className="rounded-full bg-neutral-900 px-4 py-1.5 text-xs font-semibold text-white">
              Sold out
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col px-1 pt-3.5 pb-1">
        {product.categoryName && (
          <span className="text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">
            {product.categoryName}
          </span>
        )}
        <Link
          href={`/products/${product.slug}`}
          className="mt-1 line-clamp-1 font-semibold text-neutral-900 hover:underline"
        >
          {product.name}
        </Link>
        <div className="mt-1 flex items-center gap-1.5">
          <Stars rating={product.rating} />
          <span className="text-xs text-neutral-400">({product.ratingCount})</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-base font-bold">{formatPrice(product.price)}</span>
          {product.compareAtPrice && (
            <span className="text-sm text-neutral-400 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>
      </div>

      <div className="px-1 pb-1">
        <AddToCartButton
          productId={product.id}
          stock={product.stock}
          className="w-full !py-2.5 text-sm"
        />
      </div>
    </div>
  );
}
