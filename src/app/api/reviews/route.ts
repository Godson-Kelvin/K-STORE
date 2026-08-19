import { NextRequest } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { products, reviews } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Sign in to write a review" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const productId = Number(body.productId);
  const rating = Number(body.rating);
  const title = String(body.title ?? "").trim();
  const comment = String(body.comment ?? "").trim();

  if (!productId) return Response.json({ error: "Invalid product" }, { status: 400 });
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return Response.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
  }
  if (comment.length < 10) {
    return Response.json({ error: "Review must be at least 10 characters" }, { status: 400 });
  }

  const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  if (!product) return Response.json({ error: "Product not found" }, { status: 404 });

  const [review] = await db
    .insert(reviews)
    .values({
      productId,
      userId: user.id,
      userName: user.name,
      rating,
      title: title || "Review",
      comment,
    })
    .returning();

  const result = await db.execute<{ avg: number; cnt: number }>(
    sql`SELECT COALESCE(AVG(rating),0)::float8 AS avg, COUNT(*)::int AS cnt FROM reviews WHERE product_id = ${productId}`
  );
  const agg = result.rows[0];
  await db
    .update(products)
    .set({ rating: Math.round(agg.avg * 10) / 10, ratingCount: agg.cnt })
    .where(eq(products.id, productId));

  return Response.json({ review });
}
