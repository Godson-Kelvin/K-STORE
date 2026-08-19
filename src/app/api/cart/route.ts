import { NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { cartItems, products } from "@/db/schema";
import { getCartToken, getCartLines, cartSubtotal, cartCount } from "@/lib/cart";

export const dynamic = "force-dynamic";

export async function GET() {
  const token = await getCartToken();
  const lines = await getCartLines(token);
  return Response.json({
    lines,
    subtotal: cartSubtotal(lines),
    count: cartCount(lines),
  });
}

export async function POST(req: NextRequest) {
  const token = await getCartToken();
  const body = await req.json().catch(() => ({}));
  const productId = Number(body.productId);
  let quantity = Number(body.quantity ?? 1);

  if (!productId || isNaN(productId)) {
    return Response.json({ error: "Invalid product" }, { status: 400 });
  }
  if (!Number.isFinite(quantity) || quantity < 1) quantity = 1;

  const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  if (!product) return Response.json({ error: "Product not found" }, { status: 404 });
  if (product.stock <= 0) return Response.json({ error: "This product is sold out" }, { status: 400 });

  const [existing] = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.cartToken, token), eq(cartItems.productId, productId)))
    .limit(1);

  if (existing) {
    const newQty = Math.min(existing.quantity + quantity, Math.max(product.stock, 1));
    await db.update(cartItems).set({ quantity: newQty }).where(eq(cartItems.id, existing.id));
  } else {
    await db
      .insert(cartItems)
      .values({
        cartToken: token,
        productId,
        quantity: Math.min(quantity, Math.max(product.stock, 1)),
      });
  }

  const lines = await getCartLines(token);
  return Response.json({
    message: "Added to cart",
    count: cartCount(lines),
    subtotal: cartSubtotal(lines),
  });
}
