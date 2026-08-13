import { useState, type ReactNode } from "react";
import Button from "./Button";

type Props = {
  title: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
  children: ReactNode;
};

/** Lightweight confirm UI. */
export default function ConfirmButton({
  title,
  description,
  confirmLabel = "Confirm",
  onConfirm,
  loading,
  children,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-flex flex-col items-end gap-2">
      <div onClick={() => setOpen(true)}>{children}</div>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-64 rounded-2xl border border-[var(--line)] bg-white p-3 shadow-[var(--shadow)] animate-fade-up">
          <p className="text-sm font-semibold text-[var(--ink)]">{title}</p>
          {description && (
            <p className="mt-1 text-xs text-[var(--muted)]">{description}</p>
          )}
          <div className="mt-3 flex justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              type="button"
              loading={loading}
              onClick={async (e) => {
                e.stopPropagation();
                await onConfirm();
                setOpen(false);
              }}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
