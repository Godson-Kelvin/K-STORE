import { NextRequest } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { cartItems, orderItems, orders, products } from "@/db/schema";
import { getCartToken, getCartLines, cartSubtotal } from "@/lib/cart";
import { getSessionUser } from "@/lib/auth";
import { orderNumber, PROMO_CODES, shippingCost } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const token = await getCartToken();
  const lines = await getCartLines(token);
  if (lines.length === 0) {
    return Response.json({ error: "Your cart is empty" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  const name = String(body.name ?? "").trim();
  const address = String(body.address ?? "").trim();
  const city = String(body.city ?? "").trim();
  const postalCode = String(body.postalCode ?? "").trim();
  const country = String(body.country ?? "").trim();
  const promoCode = String(body.promoCode ?? "").trim().toUpperCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Please enter a valid email" }, { status: 400 });
  }
  if (!name || !address || !city || !country) {
    return Response.json({ error: "Please fill in all shipping details" }, { status: 400 });
  }

  const user = await getSessionUser();

  try {
    const order = await db.transaction(async (tx) => {
      // Validate + reserve stock
      for (const line of lines) {
        const [p] = await tx.select().from(products).where(eq(products.id, line.productId)).limit(1);
        if (!p || p.stock < line.quantity) {
          throw new Error(`Only ${p?.stock ?? 0} left in stock for ${line.name}`);
        }
      }

      const subtotal = cartSubtotal(lines);
      const discountPct = PROMO_CODES[promoCode] ?? 0;
      const discount = Math.round((subtotal * discountPct) / 100);
      const shipping = shippingCost(subtotal - discount);
      const total = subtotal - discount + shipping;

      const [order] = await tx
        .insert(orders)
        .values({
          orderNumber: orderNumber(),
          userId: user?.id ?? null,
          email,
          name,
          address,
          city,
          postalCode,
          country,
          subtotal,
          shipping,
          discount,
          total,
          promoCode: discountPct > 0 ? promoCode : null,
        })
        .returning();

      for (const line of lines) {
        await tx.insert(orderItems).values({
          orderId: order.id,
          productId: line.productId,
          productName: line.name,
          productImage: line.image,
          price: line.price,
          quantity: line.quantity,
        });
        await tx
          .update(products)
          .set({ stock: sql`${products.stock} - ${line.quantity}` })
          .where(eq(products.id, line.productId));
      }

      await tx.delete(cartItems).where(eq(cartItems.cartToken, token));
      return order;
    });

    return Response.json({
      order: {
        orderNumber: order.orderNumber,
        total: order.total,
        email: order.email,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Checkout failed";
    return Response.json({ error: message }, { status: 400 });
  }
}
