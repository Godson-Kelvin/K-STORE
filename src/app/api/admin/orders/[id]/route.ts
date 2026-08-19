import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const VALID_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Admin only" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const status = String(body.status ?? "");

  if (!VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
    return Response.json({ error: "Invalid status" }, { status: 400 });
  }

  const [order] = await db
    .update(orders)
    .set({ status: status as (typeof VALID_STATUSES)[number] })
    .where(eq(orders.id, Number(id)))
    .returning();

  if (!order) return Response.json({ error: "Order not found" }, { status: 404 });
  return Response.json({ order });
}
