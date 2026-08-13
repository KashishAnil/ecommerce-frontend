type Props = {
  type?: "error" | "success" | "info";
  message: string;
  className?: string;
};

const styles = {
  error: "bg-[var(--danger-soft)] text-[var(--danger)] border-red-200",
  success: "bg-[var(--success-soft)] text-[var(--success)] border-emerald-200",
  info: "bg-[var(--brand-soft)] text-[var(--brand-deep)] border-[var(--line)]",
};

export default function Alert({ type = "info", message, className = "" }: Props) {
  return (
    <div
      role="alert"
      className={`rounded-xl border px-3.5 py-3 text-sm ${styles[type]} ${className}`}
    >
      {message}
    </div>
  );
}
