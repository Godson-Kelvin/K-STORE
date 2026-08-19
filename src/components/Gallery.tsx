"use client";

import { useState } from "react";

export default function Gallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const list = images.length > 0 ? images : [""];

  return (
    <div>
      <div className="overflow-hidden rounded-3xl border border-neutral-100 bg-neutral-100">
        <img
          src={list[active] || "/hero.jpg"}
          alt={name}
          className="aspect-square w-full object-cover"
        />
      </div>
      {list.length > 1 && (
        <div className="mt-3 flex gap-3">
          {list.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`overflow-hidden rounded-xl border-2 transition ${
                i === active ? "border-neutral-900" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <img src={src} alt="" className="h-20 w-20 object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
