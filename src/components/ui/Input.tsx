import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

const fieldClass =
  "w-full h-10 px-3 rounded-xl border border-[var(--line)] bg-white text-[var(--ink)] text-sm " +
  "placeholder:text-[var(--muted)] transition shadow-sm " +
  "focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/25 focus:border-[var(--brand)] " +
  "disabled:bg-[var(--surface-2)] disabled:cursor-not-allowed";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export function Input({ label, error, id, className = "", ...rest }: InputProps) {
  const inputId = id || rest.name;
  return (
    <label className="block space-y-1.5">
      {label && (
        <span className="text-sm font-medium text-[var(--ink-soft)]">{label}</span>
      )}
      <input id={inputId} className={`${fieldClass} ${className}`} {...rest} />
      {error && <span className="text-xs text-[var(--danger)]">{error}</span>}
    </label>
  );
}

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
};

export function TextArea({ label, id, className = "", ...rest }: TextAreaProps) {
  const inputId = id || rest.name;
  return (
    <label className="block space-y-1.5">
      {label && (
        <span className="text-sm font-medium text-[var(--ink-soft)]">{label}</span>
      )}
      <textarea
        id={inputId}
        className={`${fieldClass} h-auto py-2.5 min-h-[88px] resize-y ${className}`}
        {...rest}
      />
    </label>
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
};

export function Select({
  label,
  options,
  placeholder,
  id,
  className = "",
  ...rest
}: SelectProps) {
  const inputId = id || rest.name;
  return (
    <label className="block space-y-1.5">
      {label && (
        <span className="text-sm font-medium text-[var(--ink-soft)]">{label}</span>
      )}
      <select id={inputId} className={`${fieldClass} ${className}`} {...rest}>
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

type NumberInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: string;
  onValueChange?: (value: number) => void;
};

export function NumberInput({
  label,
  onValueChange,
  onChange,
  className = "",
  id,
  ...rest
}: NumberInputProps) {
  const inputId = id || rest.name;
  return (
    <label className={`block space-y-1.5 ${label ? "" : "inline-block"}`}>
      {label && (
        <span className="text-sm font-medium text-[var(--ink-soft)]">{label}</span>
      )}
      <input
        id={inputId}
        type="number"
        className={`${fieldClass} ${className}`}
        {...rest}
        onChange={(e) => {
          onChange?.(e);
          onValueChange?.(Number(e.target.value));
        }}
      />
    </label>
  );
}
