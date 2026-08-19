import { NextRequest } from "next/server";
import { desc, eq } from "drizzle-orm";
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

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Admin only" }, { status: 401 });
  const all = await db.select().from(products).orderBy(desc(products.createdAt));
  return Response.json(all);
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Admin only" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  const price = toCents(body.price);
  const stock = Number(body.stock ?? 0);
  const categoryId = body.categoryId ? Number(body.categoryId) : null;
  const image = String(body.image ?? "").trim();
  const featured = Boolean(body.featured);
  const description = String(body.description ?? "").trim();
  const compareAtPrice = toCents(body.compareAtPrice);

  if (!name || price === null) {
    return Response.json({ error: "Name and a valid price are required" }, { status: 400 });
  }

  let slug = slugify(body.slug || name);
  let exists = true;
  let attempt = 0;
  while (exists) {
    const [row] = await db.select({ id: products.id }).from(products).where(eq(products.slug, slug)).limit(1);
    if (!row) {
      exists = false;
    } else {
      attempt += 1;
      slug = `${slugify(body.slug || name)}-${attempt + 1}`;
    }
  }

  const [product] = await db
    .insert(products)
    .values({
      name,
      slug,
      description: description || name,
      price,
      compareAtPrice,
      image: image || `https://placehold.co/900x900/eeeeee/666666?text=${encodeURIComponent(name)}`,
      gallery: image ? [image] : [],
      categoryId,
      stock: Number.isFinite(stock) && stock >= 0 ? Math.floor(stock) : 0,
      featured,
    })
    .returning();

  return Response.json({ product });
}
