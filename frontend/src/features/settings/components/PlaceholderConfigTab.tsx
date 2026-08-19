import React from "react";
import { Settings, Sliders } from "lucide-react";

interface PlaceholderConfigTabProps {
  title: string;
  description: string;
}

export const PlaceholderConfigTab: React.FC<PlaceholderConfigTabProps> = ({
  title,
  description,
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-brand-primary tracking-tight">
          {title}
        </h2>
        <p className="text-xs text-slate-500 font-semibold mt-1">
          {description}
        </p>
      </div>

      {/* Placeholder Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-10 shadow-2xs text-center flex flex-col items-center justify-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-brand-primary text-brand-btn-text flex items-center justify-center font-bold shadow-2xs">
          <Sliders className="w-7 h-7 text-brand-btn-text" />
        </div>
        <h3 className="text-base font-bold text-brand-primary">
          {title} Settings & Controls
        </h3>
        <p className="text-xs text-slate-500 max-w-md font-medium leading-relaxed">
          Configure rule policies, automated calculations, and custom preferences for {title.toLowerCase()} operations.
        </p>
      </div>
    </div>
  );
};
