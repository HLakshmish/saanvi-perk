import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBox = React.forwardRef<HTMLInputElement, SearchBoxProps>(
  ({ value, onChange, placeholder = "Search...", className }, ref) => {
    return (
      <div className={cn("relative w-full flex items-center shadow-2xs rounded-xl", className)}>
        <Search className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none z-10" />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
        />
      </div>
    );
  }
);

SearchBox.displayName = "SearchBox";
