"use client";

import { useId, type ComponentProps } from "react";
import { cn } from "@/lib/cn";

type FieldProps = { label: string; helper?: string; error?: string; hideLabel?: boolean };
const control = "w-full rounded-lg border bg-field px-3 text-body text-ink placeholder:text-muted transition-colors disabled:opacity-50 aria-[invalid=true]:border-bad";

function ids(id: string | undefined, helper?: string, error?: string) {
  const base = id as string;
  const describedBy = [error ? `${base}-error` : null, helper ? `${base}-help` : null].filter(Boolean).join(" ") || undefined;
  return { helpId: `${base}-help`, errorId: `${base}-error`, describedBy };
}

function Wrapper({ label, hideLabel, htmlFor, helper, error, helpId, errorId, children }: FieldProps & { htmlFor: string; helpId: string; errorId: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className={cn("text-label text-ink", hideLabel && "sr-only")}>{label}</label>
      {children}
      {helper && !error ? <p id={helpId} className="text-small text-muted">{helper}</p> : null}
      {error ? <p id={errorId} className="text-small text-bad">{error}</p> : null}
    </div>
  );
}

export function TextField({ label, helper, error, hideLabel, className, id, ...props }: ComponentProps<"input"> & FieldProps) {
  const uid = useId();
  const fid = id ?? uid;
  const { helpId, errorId, describedBy } = ids(fid, helper && !error ? helper : undefined, error);
  return (
    <Wrapper {...{ label, helper, error, hideLabel, helpId, errorId }} htmlFor={fid}>
      <input id={fid} aria-invalid={error ? true : undefined} aria-describedby={describedBy} className={cn(control, "h-10 pointer-coarse:h-11", error ? "border-bad" : "border-control-border", className)} {...props} />
    </Wrapper>
  );
}

export function TextareaField({ label, helper, error, hideLabel, className, id, rows = 4, ...props }: ComponentProps<"textarea"> & FieldProps) {
  const uid = useId();
  const fid = id ?? uid;
  const { helpId, errorId, describedBy } = ids(fid, helper && !error ? helper : undefined, error);
  return (
    <Wrapper {...{ label, helper, error, hideLabel, helpId, errorId }} htmlFor={fid}>
      <textarea id={fid} rows={rows} aria-invalid={error ? true : undefined} aria-describedby={describedBy} className={cn(control, "py-2", error ? "border-bad" : "border-control-border", className)} {...props} />
    </Wrapper>
  );
}

export function SelectField({ label, helper, error, hideLabel, className, id, children, ...props }: ComponentProps<"select"> & FieldProps) {
  const uid = useId();
  const fid = id ?? uid;
  const { helpId, errorId, describedBy } = ids(fid, helper && !error ? helper : undefined, error);
  return (
    <Wrapper {...{ label, helper, error, hideLabel, helpId, errorId }} htmlFor={fid}>
      <select id={fid} aria-invalid={error ? true : undefined} aria-describedby={describedBy} className={cn(control, "h-10 pointer-coarse:h-11", error ? "border-bad" : "border-control-border", className)} {...props}>
        {children}
      </select>
    </Wrapper>
  );
}

/** Native checkbox with a large clickable label. */
export function Checkbox({ label, className, id, ...props }: Omit<ComponentProps<"input">, "type"> & { label: string }) {
  const uid = useId();
  const fid = id ?? uid;
  return (
    <label htmlFor={fid} className={cn("flex min-h-11 cursor-pointer items-center gap-3 text-body text-ink", className)}>
      <input id={fid} type="checkbox" className="size-5 shrink-0 accent-brand" {...props} />
      <span>{label}</span>
    </label>
  );
}

type SwitchProps = { checked: boolean; onCheckedChange: (checked: boolean) => void; label: string; disabled?: boolean; className?: string; id?: string };
/** On/off toggle. Exposed as `role="switch"`; Space and Enter toggle it. */
export function Switch({ checked, onCheckedChange, label, disabled, className, id }: SwitchProps) {
  const uid = useId();
  const fid = id ?? uid;
  return (
    <div className={cn("flex min-h-11 items-center gap-3", className)}>
      <button id={fid} type="button" role="switch" aria-checked={checked} disabled={disabled} onClick={() => onCheckedChange(!checked)} className={cn("relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50", checked ? "bg-brand" : "bg-control-border")}>
        <span aria-hidden="true" className={cn("inline-block size-5 rounded-full bg-white shadow transition-transform motion-reduce:transition-none", checked ? "translate-x-[22px]" : "translate-x-0.5")} />
      </button>
      <label htmlFor={fid} className="cursor-pointer text-body text-ink">{label}</label>
    </div>
  );
}
