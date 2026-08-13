import { cn } from "../../utils/cn";

type Props = {
  value: number;
  min?: number;
  max?: number;
  disabled?: boolean;
  onChange: (value: number) => void;
  className?: string;
};

export function QuantityInput({
  value,
  min = 1,
  max,
  disabled,
  onChange,
  className,
}: Props) {
  const clamp = (next: number) => {
    const lo = min;
    const hi = max ?? Number.POSITIVE_INFINITY;
    return Math.min(hi, Math.max(lo, next));
  };

  return (
    <div
      className={cn(
        "inline-flex h-10 items-center rounded-full border border-line bg-cream",
        disabled && "opacity-55",
        className,
      )}
    >
      <button
        type="button"
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
        className="grid h-10 w-10 place-items-center rounded-l-full text-lg text-muted transition hover:text-ink disabled:opacity-40"
        onClick={() => onChange(clamp(value - 1))}
      >
        −
      </button>
      <input
        type="number"
        min={min}
        max={max}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(clamp(Number(e.target.value) || min))}
        className="h-10 w-12 border-0 bg-transparent text-center text-sm font-medium text-ink focus:outline-none"
      />
      <button
        type="button"
        disabled={disabled || (max != null && value >= max)}
        aria-label="Increase quantity"
        className="grid h-10 w-10 place-items-center rounded-r-full text-lg text-muted transition hover:text-ink disabled:opacity-40"
        onClick={() => onChange(clamp(value + 1))}
      >
        +
      </button>
    </div>
  );
}
