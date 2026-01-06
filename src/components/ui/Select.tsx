"use client";

type Option = Readonly<{ value: string; label: string }>;

type SelectProps = Readonly<{
  label?: string;
  value: string;
  onChange: (v: string) => void;
  options: ReadonlyArray<Option>;
}>;

export default function Select({ label, value, onChange, options }: SelectProps) {
  return (
    <label className="block w-full">
      {label ? <div className="text-xs text-zinc-500 mb-1">{label}</div> : null}
      <select
        className="w-full h-10 px-3 rounded-xl border border-zinc-200 bg-white text-sm outline-none focus:ring-2 focus:ring-zinc-900/10"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
