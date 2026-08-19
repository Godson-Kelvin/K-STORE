import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Sign in required" }, { status: 401 });

  const userOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, user.id))
    .orderBy(desc(orders.createdAt));

  let items: typeof orderItems.$inferSelect[] = [];
  if (userOrders.length > 0) {
    items = await db
      .select()
      .from(orderItems)
      .where(inArray(orderItems.orderId, userOrders.map((o) => o.id)));
  }

  const byOrder = new Map<number, typeof items>();
  for (const it of items) {
    const arr = byOrder.get(it.orderId) ?? [];
    arr.push(it);
    byOrder.set(it.orderId, arr);
  }

  return Response.json({
    orders: userOrders.map((o) => ({ ...o, items: byOrder.get(o.id) ?? [] })),
  });
}
