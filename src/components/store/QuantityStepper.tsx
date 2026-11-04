"use client";

import { useId, useState } from "react";
import styles from "./QuantityStepper.module.css";

type Props = {
  value: number;
  onChange: (next: number) => void;
  /** Accessible name of the field, e.g. "Quantity of Dhanwantharam Thailam". Ignored when `label` is shown. */
  name: string;
  /** Show a visible <label> above the control. */
  label?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
  busy?: boolean;
};

export function QuantityStepper({ value, onChange, name, label, min = 0, max = 99, disabled, busy }: Props) {
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);
  const invalid = draft !== null && !/^\d+$/.test(draft);

  const commit = () => {
    if (draft === null) return;
    const n = Number(draft);
    setDraft(null);
    if (Number.isInteger(n) && draft.trim() !== "") onChange(Math.max(min, Math.min(max, n)));
  };

  return (
    <div className={styles.root}>
      {label ? (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      ) : null}
      <div className={styles.control} data-disabled={disabled || undefined} aria-busy={busy || undefined}>
        <button type="button" className={styles.step} onClick={() => onChange(Math.max(min, value - 1))} disabled={disabled || value <= min} aria-label={`Decrease: ${name}`}>
          <span aria-hidden="true">&minus;</span>
        </button>
        <input
          id={id}
          className={`${styles.input} num`}
          inputMode="numeric"
          autoComplete="off"
          aria-label={label ? undefined : name}
          aria-invalid={invalid || undefined}
          value={draft ?? String(value)}
          disabled={disabled}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            }
          }}
        />
        <button type="button" className={styles.step} onClick={() => onChange(Math.min(max, value + 1))} disabled={disabled || value >= max} aria-label={`Increase: ${name}`}>
          <span aria-hidden="true">+</span>
        </button>
      </div>
    </div>
  );
}
