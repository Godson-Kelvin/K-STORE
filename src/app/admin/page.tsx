import type { Metadata } from "next";
import AdminClient from "@/components/AdminClient";

export const metadata: Metadata = { title: "Admin dashboard" };

export default function AdminPage() {
  return <AdminClient />;
}
