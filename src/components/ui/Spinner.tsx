import { cn } from "../../utils/cn";

export function Spinner({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dim = size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-8 w-8" : "h-5 w-5";
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block rounded-full border-2 border-forest/25 border-t-forest",
        dim,
        className,
      )}
      style={{ animation: "spin 0.7s linear infinite" }}
    />
  );
}

export function PageSpinner() {
  return (
    <div className="flex justify-center py-16">
      <Spinner size="lg" />
    </div>
  );
}
