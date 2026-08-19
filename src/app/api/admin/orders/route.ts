import { desc, inArray } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Admin only" }, { status: 401 });

  const all = await db.select().from(orders).orderBy(desc(orders.createdAt));
  let items: typeof orderItems.$inferSelect[] = [];
  if (all.length > 0) {
    items = await db
      .select()
      .from(orderItems)
      .where(inArray(orderItems.orderId, all.map((o) => o.id)));
  }

  const byOrder = new Map<number, typeof items>();
  for (const it of items) {
    const arr = byOrder.get(it.orderId) ?? [];
    arr.push(it);
    byOrder.set(it.orderId, arr);
  }

  return Response.json(all.map((o) => ({ ...o, items: byOrder.get(o.id) ?? [] })));
}
