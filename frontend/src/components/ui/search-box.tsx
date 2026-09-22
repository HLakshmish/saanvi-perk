import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}

export const SearchBox = React.forwardRef<HTMLInputElement, SearchBoxProps>(
  ({ value, onChange, placeholder = "Search...", className, inputClassName }, ref) => {
    return (
      <div className={cn("relative w-full flex items-center shadow-2xs rounded-xl", className)}>
        <Search className="absolute left-3.5 h-3.5 w-3.5 text-slate-400 pointer-events-none z-10" />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full pl-9 pr-3.5 py-1.5 border border-slate-300 rounded-xl text-xs sm:text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-medium",
            inputClassName
          )}
        />
      </div>
    );
  }
);

SearchBox.displayName = "SearchBox";
