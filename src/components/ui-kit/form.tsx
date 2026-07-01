import React, { type ReactNode, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Field({
  label,
  hint,
  required,
  children,
  className,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-sm font-semibold text-foreground">
        {label}
        {required && <span className="ml-0.5 text-brand-red">*</span>}
      </span>
      {children}
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

const baseInput =
  "h-12 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(baseInput, props.className)} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(baseInput, "h-auto min-h-[7rem] resize-y py-3 leading-relaxed", props.className)}
    />
  );
}

export function Select({ children, ...props }: InputHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <select {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)} className={cn(baseInput, "appearance-none", props.className)}>
      {children}
    </select>
  );
}

export function NumberStepper({
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  suffix,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  return (
    <div className="flex h-12 items-stretch overflow-hidden rounded-xl border border-input bg-background">
      <button
        type="button"
        onClick={() => onChange(clamp(value - step))}
        className="flex w-12 items-center justify-center text-lg font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Disminuir"
      >
        −
      </button>
      <div className="flex flex-1 items-center justify-center gap-1 border-x border-input">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(clamp(Number(e.target.value)))}
          className="w-full bg-transparent text-center text-sm font-semibold text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        />
        {suffix && <span className="pr-2 text-xs text-muted-foreground">{suffix}</span>}
      </div>
      <button
        type="button"
        onClick={() => onChange(clamp(value + step))}
        className="flex w-12 items-center justify-center text-lg font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Aumentar"
      >
        +
      </button>
    </div>
  );
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; tone?: "success" | "warning" | "red" }[];
}) {
  const toneActive = {
    success: "bg-success text-success-foreground",
    warning: "bg-brand-yellow text-warning-foreground",
    red: "bg-brand-red text-destructive-foreground",
  };
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-xl border border-input bg-muted/50 p-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
              active
                ? o.tone
                  ? toneActive[o.tone]
                  : "bg-primary text-primary-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Card({
  title,
  description,
  icon,
  children,
  className,
}: {
  title?: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-6 shadow-soft", className)}>
      {(title || description) && (
        <div className="mb-5 flex items-start gap-3">
          {icon && (
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {icon}
            </span>
          )}
          <div>
            {title && <h3 className="text-base font-bold text-foreground">{title}</h3>}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
