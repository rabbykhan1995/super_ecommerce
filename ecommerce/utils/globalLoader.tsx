"use client";
import loadingStore from "@/zustand/loading.store";
import { Loader2 } from "lucide-react";

export default function FullScreenLoader() {
  const { globalLoader } = loadingStore();

  if (!globalLoader) return null;

  return (
    <>
      {/* 🔥 Top Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-[200]">
        <div className="h-[3px] bg-blue-100 dark:bg-slate-800 overflow-hidden">
          <div className="h-full bg-blue-600 origin-left animate-progress-bar" />
        </div>
      </div>

      {/* 🔥 Glass Overlay */}
      <div className="fixed inset-0 z-[190] flex items-center justify-center bg-white/30 dark:bg-black/30 backdrop-blur-sm animate-fade-in pointer-events-auto cursor-wait">
        {/* Center Spinner */}
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm text-slate-700 dark:text-slate-300 font-medium tracking-wide">
            Processing...
          </p>
        </div>
      </div>
    </>
  );
}
