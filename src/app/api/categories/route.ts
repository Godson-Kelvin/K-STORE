import { getCategories } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const categories = await getCategories();
  return Response.json({ categories });
}
