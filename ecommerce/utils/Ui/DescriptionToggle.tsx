"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function DescriptionToggle({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-6 border rounded-lg border-slate-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center px-4 py-3 font-semibold text-left bg-black text-white rounded-t-lg"
      >
        View Description
        <span className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="px-4 py-4 overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}