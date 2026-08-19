export function StarIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden>
      <path
        fillRule="evenodd"
        d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function Stars({
  rating,
  className = "",
  size = "h-3.5 w-3.5",
}: {
  rating: number;
  className?: string;
  size?: string;
}) {
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
  const stars = [0, 1, 2, 3, 4];
  return (
    <div className={`relative inline-flex ${className}`} aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
      <div className="flex gap-0.5 text-neutral-300">
        {stars.map((i) => (
          <StarIcon key={i} className={size} />
        ))}
      </div>
      <div
        className="absolute inset-0 flex gap-0.5 overflow-hidden text-amber-400"
        style={{ width: `${pct}%` }}
      >
        {stars.map((i) => (
          <StarIcon key={i} className={`${size} shrink-0`} />
        ))}
      </div>
    </div>
  );
}
