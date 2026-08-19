import type { Metadata } from "next";
import AccountClient from "@/components/AccountClient";

export const metadata: Metadata = { title: "My account" };

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  return <AccountClient initialTab={tab || "profile"} />;
}
