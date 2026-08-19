"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { cn } from "@/lib/utils";

export default function WishlistButton({
  productId,
  className,
  iconOnly = false,
}: {
  productId: number;
  className?: string;
  iconOnly?: boolean;
}) {
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await fetch("/api/me");
        if (!me.ok) {
          if (!cancelled) setChecked(true);
          return;
        }
        const res = await fetch("/api/wishlist");
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) {
            setActive(data.ids.includes(productId));
            setChecked(true);
          }
        }
      } catch {
        if (!cancelled) setChecked(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  async function toggle() {
    if (loading) return;
    setLoading(true);
    try {
      const me = await fetch("/api/me");
      if (!me.ok) {
        toast("Sign in to save items to your wishlist", "info");
        router.push("/login?next=/products");
        return;
      }
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setActive(data.active);
      toast(data.active ? "Saved to wishlist" : "Removed from wishlist", data.active ? "success" : "info");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not update wishlist", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-full border border-neutral-200 bg-white/90 text-sm font-medium text-neutral-700 transition hover:border-neutral-300 hover:text-neutral-900",
        iconOnly ? "h-9 w-9" : "px-4 py-2.5",
        className
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        className={cn("h-4.5 w-4.5", loading && "animate-pulse", active && "text-rose-500")}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
        />
      </svg>
      {!iconOnly && <span>{active ? "Saved" : "Save"}</span>}
      {!checked && !iconOnly && !active && <span className="sr-only">Loading</span>}
    </button>
  );
}
