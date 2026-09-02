import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error, label, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    const renderLabel = () => {
      if (!label) return null;
      const isRequired = props.required || label.includes("*");
      const cleanLabelText = label.replace(/\s*\*/g, "");

      return (
        <label
          htmlFor={inputId}
          className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-0.5"
        >
          <span>{cleanLabelText}</span>
          {isRequired && <span className="text-red-500 font-bold ml-0.5">*</span>}
        </label>
      );
    };

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {renderLabel()}
        <input
          type={type}
          id={inputId}
          className={cn(
            "flex w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-2xs transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-indigo-500/20 dark:focus:border-indigo-500",
            error &&
              "border-rose-500 focus:ring-rose-500/20 focus:border-rose-500 dark:border-rose-500 dark:focus:border-rose-500",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-xs text-rose-500 font-semibold mt-0.5">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
