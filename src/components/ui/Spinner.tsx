export default function Spinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-[var(--muted)]">
      <span className="size-8 border-[3px] border-[var(--line)] border-t-[var(--brand)] rounded-full animate-spin-slow" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
