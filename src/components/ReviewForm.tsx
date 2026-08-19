"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { StarIcon } from "@/components/Stars";

export default function ReviewForm({ productId }: { productId: number }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      toast("Please select a star rating", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, title, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not submit review");
      toast("Thanks! Your review has been posted");
      setRating(0);
      setTitle("");
      setComment("");
      router.refresh();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not submit review", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-neutral-100 bg-neutral-50 p-6">
      <h3 className="font-bold">Write a review</h3>
      <div className="mt-3 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            type="button"
            key={n}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(n)}
            className={n <= (hover || rating) ? "text-amber-400" : "text-neutral-300"}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
          >
            <StarIcon className="h-7 w-7" />
          </button>
        ))}
      </div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Review title (optional)"
        className="mt-4 w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-neutral-900"
      />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience…"
        rows={3}
        className="mt-3 w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-neutral-900"
      />
      <button
        type="submit"
        disabled={loading}
        className="mt-3 rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:opacity-40"
      >
        {loading ? "Posting…" : "Submit review"}
      </button>
    </form>
  );
}
