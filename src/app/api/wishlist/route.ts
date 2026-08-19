import { NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { products, wishlistItems } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return Response.json({ ids: [], products: [] });
  const rows = await db
    .select({
      productId: wishlistItems.productId,
      id: products.id,
      name: products.name,
      slug: products.slug,
      price: products.price,
      compareAtPrice: products.compareAtPrice,
      image: products.image,
      rating: products.rating,
      ratingCount: products.ratingCount,
      stock: products.stock,
    })
    .from(wishlistItems)
    .innerJoin(products, eq(wishlistItems.productId, products.id))
    .where(eq(wishlistItems.userId, user.id));
  return Response.json({ ids: rows.map((r) => r.productId), products: rows });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Sign in required" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const productId = Number(body.productId);
  if (!productId) return Response.json({ error: "Invalid product" }, { status: 400 });

  const [existing] = await db
    .select()
    .from(wishlistItems)
    .where(and(eq(wishlistItems.userId, user.id), eq(wishlistItems.productId, productId)))
    .limit(1);

  if (existing) {
    await db.delete(wishlistItems).where(eq(wishlistItems.id, existing.id));
    return Response.json({ active: false });
  }

  await db.insert(wishlistItems).values({ userId: user.id, productId });
  return Response.json({ active: true });
}
