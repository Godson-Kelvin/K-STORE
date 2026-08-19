"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";

export default function LoginForm({ next }: { next: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const toast = useToast();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      toast(`Welcome back, ${data.user.name.split(" ")[0]}!`);
      router.push(next);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    "w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-900";

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <h1 className="text-3xl font-extrabold tracking-tight">Welcome back</h1>
      <p className="mt-2 text-sm text-neutral-500">Sign in to your K-Store account.</p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-semibold">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-semibold">Password</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={inputCls}
          />
        </div>
        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-neutral-900 py-3.5 text-sm font-bold text-white transition hover:bg-neutral-700 disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="mt-6 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-4 text-xs text-neutral-500">
        <p className="font-bold text-neutral-700">Demo accounts</p>
        <p className="mt-1.5">Customer: <code className="rounded bg-white px-1.5 py-0.5">demo@kstore.com</code> / <code className="rounded bg-white px-1.5 py-0.5">demo123</code></p>
        <p className="mt-1">Admin: <code className="rounded bg-white px-1.5 py-0.5">admin@kstore.com</code> / <code className="rounded bg-white px-1.5 py-0.5">admin123</code></p>
      </div>

      <p className="mt-6 text-center text-sm text-neutral-500">
        New to K-Store?{" "}
        <Link href={`/register?next=${encodeURIComponent(next)}`} className="font-bold text-orange-600 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
