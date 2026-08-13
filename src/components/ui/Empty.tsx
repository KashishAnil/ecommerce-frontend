import type { ReactNode } from "react";

export default function Empty({ description }: { description: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--line)] bg-white/60 px-6 py-12 text-center text-[var(--muted)]">
      <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)] text-lg font-display">
        ∅
      </div>
      <div className="text-sm">{description}</div>
    </div>
  );
}
