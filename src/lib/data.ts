import { and, asc, desc, eq, gte, ilike, inArray, lte, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, products, reviews } from "@/db/schema";

export async function getCategories() {
  const cats = await db.select().from(categories).orderBy(asc(categories.name));
  const countRows = await db
    .select({ categoryId: products.categoryId, count: sql<number>`count(*)::int` })
    .from(products)
    .groupBy(products.categoryId);
  const counts = new Map<number | null, number>();
  for (const r of countRows) counts.set(r.categoryId, r.count);
  return cats.map((c) => ({ ...c, count: counts.get(c.id) ?? 0 }));
}

export type ProductFilter = {
  q?: string;
  category?: string;
  sort?: string;
  min?: string;
  max?: string;
  page?: number;
  limit?: number;
};

export async function getProducts(f: ProductFilter = {}) {
  const limit = f.limit ?? 12;
  const page = Math.max(1, f.page ?? 1);
  const offset = (page - 1) * limit;

  const conditions = [];
  if (f.q) {
    conditions.push(
      or(
        ilike(products.name, `%${f.q}%`),
        ilike(products.description, `%${f.q}%`)
      )!
    );
  }
  if (f.category) {
    const [cat] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, f.category))
      .limit(1);
    if (cat) {
      conditions.push(eq(products.categoryId, cat.id));
    } else {
      conditions.push(eq(products.id, -1));
    }
  }
  if (f.min) {
    const v = Math.round(parseFloat(f.min) * 100);
    if (!isNaN(v)) conditions.push(gte(products.price, v));
  }
  if (f.max) {
    const v = Math.round(parseFloat(f.max) * 100);
    if (!isNaN(v)) conditions.push(lte(products.price, v));
  }

  const where = conditions.length ? and(...conditions) : undefined;

  const orderBy =
    f.sort === "price-asc"
      ? asc(products.price)
      : f.sort === "price-desc"
        ? desc(products.price)
        : f.sort === "rating"
          ? desc(products.rating)
          : f.sort === "name"
            ? asc(products.name)
            : desc(products.createdAt);

  const [rows, [{ count }]] = await Promise.all([
    db
      .select()
      .from(products)
      .where(where)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(where),
  ]);

  return { products: rows, total: count, page, pages: Math.max(1, Math.ceil(count / limit)) };
}

export async function getProductBySlug(slug: string) {
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);
  if (!product) return null;
  const [category] = product.categoryId
    ? await db.select().from(categories).where(eq(categories.id, product.categoryId)).limit(1)
    : [null];
  return { ...product, category };
}

export async function getProductReviews(productId: number) {
  return db
    .select()
    .from(reviews)
    .where(eq(reviews.productId, productId))
    .orderBy(desc(reviews.createdAt));
}

export async function getRelatedProducts(productId: number, categoryId: number | null, limit = 4) {
  if (!categoryId) return [];
  return db
    .select()
    .from(products)
    .where(and(eq(products.categoryId, categoryId), sql`${products.id} != ${productId}`))
    .orderBy(desc(products.rating))
    .limit(limit);
}

export async function getFeaturedProducts(limit = 8) {
  return db
    .select()
    .from(products)
    .where(eq(products.featured, true))
    .orderBy(desc(products.rating))
    .limit(limit);
}

export async function getNewArrivals(limit = 8) {
  return db
    .select()
    .from(products)
    .orderBy(desc(products.createdAt))
    .limit(limit);
}

export async function getProductByIds(ids: number[]) {
  if (ids.length === 0) return [];
  return db.select().from(products).where(inArray(products.id, ids));
}
