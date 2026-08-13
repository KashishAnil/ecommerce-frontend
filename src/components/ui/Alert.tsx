import { cn } from "../../utils/cn";

type Tone = "error" | "success";

export function Alert({
  type,
  children,
  className,
}: {
  type: Tone;
  children: string;
  className?: string;
}) {
  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={cn(
        "rounded-xl border px-3.5 py-3 text-sm leading-snug",
        type === "error" && "border-error/20 bg-error-bg text-error",
        type === "success" && "border-success/20 bg-success-bg text-success",
        className,
      )}
    >
      {children}
    </div>
  );
}
