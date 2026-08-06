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
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          {title}
        </h2>
        <p className="text-xs text-slate-500 font-semibold mt-1">
          {description}
        </p>
      </div>

      {/* Placeholder Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-10 shadow-2xs text-center flex flex-col items-center justify-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
          <Sliders className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-900">
          {title} Settings & Controls
        </h3>
        <p className="text-xs text-slate-500 max-w-md font-medium leading-relaxed">
          Configure rule policies, automated calculations, and custom preferences for {title.toLowerCase()} operations.
        </p>
      </div>
    </div>
  );
};
