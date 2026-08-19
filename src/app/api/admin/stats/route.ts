import { desc, sql } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders, products } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Admin only" }, { status: 401 });

  const revenueResult = await db.execute<{ revenue: number }>(
    sql`SELECT COALESCE(SUM(total),0)::int AS revenue FROM orders WHERE status != 'cancelled'`
  );
  const ordersResult = await db.execute<{ count: number }>(sql`SELECT COUNT(*)::int AS count FROM orders`);
  const productsResult = await db.execute<{ count: number }>(sql`SELECT COUNT(*)::int AS count FROM products`);
  const customersResult = await db.execute<{ count: number }>(
    sql`SELECT COUNT(*)::int AS count FROM users WHERE role = 'customer'`
  );
  const pendingResult = await db.execute<{ count: number }>(
    sql`SELECT COUNT(*)::int AS count FROM orders WHERE status = 'pending'`
  );
  const revenueRow = revenueResult.rows[0];
  const ordersRow = ordersResult.rows[0];
  const productsRow = productsResult.rows[0];
  const customersRow = customersResult.rows[0];
  const pendingRow = pendingResult.rows[0];

  const lowStock = await db
    .select({ id: products.id, name: products.name, stock: products.stock, slug: products.slug })
    .from(products)
    .where(sql`${products.stock} <= 5`)
    .orderBy(ascStock())
    .limit(8);

  const recentOrders = await db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .limit(6);

  const topProducts = await db
    .select({
      name: orderItems.productName,
      sold: sql<number>`SUM(${orderItems.quantity})::int`,
      revenue: sql<number>`SUM(${orderItems.quantity} * ${orderItems.price})::int`,
    })
    .from(orderItems)
    .groupBy(orderItems.productName)
    .orderBy(sql`SUM(${orderItems.quantity}) DESC`)
    .limit(5);

  return Response.json({
    stats: {
      revenue: revenueRow.revenue,
      orders: ordersRow.count,
      products: productsRow.count,
      customers: customersRow.count,
      pending: pendingRow.count,
    },
    lowStock,
    recentOrders,
    topProducts,
  });
}

function ascStock() {
  return sql`${products.stock} ASC`;
}
