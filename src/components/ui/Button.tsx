import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../utils/cn";
import { Spinner } from "./Spinner";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "danger-ghost" | "link";
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
    "bg-forest text-cream shadow-sm hover:bg-forest-hover disabled:hover:bg-forest",
  secondary:
    "bg-cream text-ink border border-line hover:border-forest/30 hover:bg-white",
  ghost: "bg-transparent text-ink hover:bg-forest/10",
  danger:
    "bg-terra text-white shadow-sm hover:bg-terra-hover disabled:hover:bg-terra",
  "danger-ghost": "bg-transparent text-terra hover:bg-error-bg",
  link: "bg-transparent text-forest px-0 hover:underline underline-offset-4",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  block = false,
  className,
  disabled,
  children,
  type = "button",
  ...props
}: Props) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide transition-all duration-200",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest",
        "disabled:cursor-not-allowed disabled:opacity-55",
        variants[variant],
        variant !== "link" && sizes[size],
        block && "w-full",
        className,
      )}
      {...props}
    >
      {loading && <Spinner size="sm" className="border-current" />}
      {children}
    </button>
  );
}
