import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { cartItems } from "@/db/schema";
import { getCartToken, getCartLines, cartSubtotal, cartCount } from "@/lib/cart";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getCartToken();
  const body = await req.json().catch(() => ({}));
  const quantity = Number(body.quantity);

  if (!Number.isFinite(quantity) || quantity < 1) {
    return Response.json({ error: "Quantity must be at least 1" }, { status: 400 });
  }

  const [item] = await db.select().from(cartItems).where(eq(cartItems.id, Number(id))).limit(1);
  if (!item || item.cartToken !== token) {
    return Response.json({ error: "Item not found" }, { status: 404 });
  }

  await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, item.id));

  const lines = await getCartLines(token);
  return Response.json({
    lines,
    subtotal: cartSubtotal(lines),
    count: cartCount(lines),
  });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getCartToken();

  const [item] = await db.select().from(cartItems).where(eq(cartItems.id, Number(id))).limit(1);
  if (!item || item.cartToken !== token) {
    return Response.json({ error: "Item not found" }, { status: 404 });
  }

  await db.delete(cartItems).where(eq(cartItems.id, item.id));

  const lines = await getCartLines(token);
  return Response.json({
    lines,
    subtotal: cartSubtotal(lines),
    count: cartCount(lines),
  });
}
