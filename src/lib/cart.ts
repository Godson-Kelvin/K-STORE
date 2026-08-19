import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { cartItems, products } from "@/db/schema";

export const CART_COOKIE = "kstore_cart";

export async function getCartToken(): Promise<string> {
  const cookieStore = await cookies();
  let token = cookieStore.get(CART_COOKIE)?.value;
  if (!token) {
    token = randomBytes(16).toString("hex");
    cookieStore.set(CART_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 24 * 60 * 60 * 365, // 1 year
    });
  }
  return token;
}

export type CartLine = {
  id: number;
  productId: number;
  quantity: number;
  name: string;
  slug: string;
  image: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
};

export async function getCartLines(token: string): Promise<CartLine[]> {
  const rows = await db
    .select({
      id: cartItems.id,
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      name: products.name,
      slug: products.slug,
      image: products.image,
      price: products.price,
      compareAtPrice: products.compareAtPrice,
      stock: products.stock,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.cartToken, token));

  return rows.map((r) => ({ ...r }));
}

export function cartSubtotal(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.quantity, 0);
}
