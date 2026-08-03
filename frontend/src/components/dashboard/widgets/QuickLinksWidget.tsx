"use client";

import React from "react";
import { Link2 } from "lucide-react";

export const QuickLinksWidget: React.FC = () => {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex flex-col justify-between">
      <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-4">
        Quick Links
      </h3>

      <div className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 min-h-[140px]">
        <Link2 className="w-6 h-6 mb-2 text-gray-300" />
        <span className="text-xs font-medium text-gray-500">No Quick Links!</span>
      </div>
    </div>
  );
};
