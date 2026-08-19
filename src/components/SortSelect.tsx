"use client";

export default function SortSelect({
  value,
  options,
}: {
  value: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <select
      name="sort"
      defaultValue={value}
      onChange={(e) => e.currentTarget.form?.submit()}
      className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium outline-none focus:border-neutral-900"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
