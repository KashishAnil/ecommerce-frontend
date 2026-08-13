import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "link";
type Size = "sm" | "md" | "lg";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  block?: boolean;
  children: ReactNode;
};

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--brand)] text-white hover:bg-[var(--brand-deep)] shadow-sm disabled:opacity-60",
  secondary:
    "bg-white text-[var(--ink)] border border-[var(--line)] hover:bg-[var(--surface-2)]",
  ghost: "bg-transparent text-[var(--ink)] hover:bg-[var(--brand-soft)]",
  danger:
    "bg-[var(--danger-soft)] text-[var(--danger)] border border-red-200 hover:bg-red-100",
  link: "bg-transparent text-[var(--brand)] hover:text-[var(--brand-deep)] px-0!",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs rounded-lg",
  md: "h-10 px-4 text-sm rounded-xl",
  lg: "h-12 px-5 text-base rounded-xl",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  block = false,
  disabled,
  className = "",
  children,
  ...rest
}: Props) {
  return (
    <button
      className={[
        "inline-flex items-center justify-center gap-2 font-medium transition-all duration-150",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]",
        "disabled:cursor-not-allowed",
        variants[variant],
        variant === "link" ? "h-auto" : sizes[size],
        block ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && (
        <span className="size-3.5 border-2 border-current border-t-transparent rounded-full animate-spin-slow" />
      )}
      {children}
    </button>
  );
}
