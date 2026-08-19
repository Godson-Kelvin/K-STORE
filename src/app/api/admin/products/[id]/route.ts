import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

function toCents(v: unknown): number | null {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Admin only" }, { status: 401 });

  const { id } = await params;
  const productId = Number(id);
  const [existing] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  if (!existing) return Response.json({ error: "Product not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const patch: Record<string, unknown> = {};

  if (typeof body.name === "string" && body.name.trim()) {
    patch.name = body.name.trim();
    patch.slug = slugify(body.name.trim());
  }
  if (typeof body.description === "string") patch.description = body.description.trim();
  if (body.price !== undefined) {
    const c = toCents(body.price);
    if (c === null) return Response.json({ error: "Invalid price" }, { status: 400 });
    patch.price = c;
  }
  if (body.compareAtPrice !== undefined) patch.compareAtPrice = toCents(body.compareAtPrice);
  if (body.stock !== undefined) patch.stock = Math.max(0, Math.floor(Number(body.stock) || 0));
  if (typeof body.image === "string") patch.image = body.image.trim();
  if (body.categoryId !== undefined) patch.categoryId = body.categoryId ? Number(body.categoryId) : null;
  if (typeof body.featured === "boolean") patch.featured = body.featured;

  if (patch.slug && patch.slug !== existing.slug) {
    const [dup] = await db.select({ id: products.id }).from(products).where(eq(products.slug, patch.slug as string)).limit(1);
    if (dup && dup.id !== productId) {
      patch.slug = `${patch.slug}-${existing.id}`;
    }
  }

  const [product] = await db
    .update(products)
    .set(patch)
    .where(eq(products.id, productId))
    .returning();

  return Response.json({ product });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Admin only" }, { status: 401 });

  const { id } = await params;
  const productId = Number(id);
  const [existing] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  if (!existing) return Response.json({ error: "Product not found" }, { status: 404 });

  await db.delete(products).where(eq(products.id, productId));
  return Response.json({ ok: true });
}
