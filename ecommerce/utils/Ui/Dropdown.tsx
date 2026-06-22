"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

type DropdownOption = {
  id: string;
  name: string;
};

type Props<T> = {
  value: T extends DropdownOption ? string : T;
  options: T[];
  onChange: (value: T extends DropdownOption ? string : T) => void;
  title?: string | null;
  idKey?: T extends DropdownOption ? keyof T : never;
  labelKey?: T extends DropdownOption ? keyof T : never;
};

export default function Dropdown<T>({
  value,
  options,
  onChange,
  title = null,
  idKey = "id" as any,
  labelKey = "name" as any,
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // Find selected label
  let selectedLabel: any = value as any;
  if (options.length > 0 && typeof options[0] === "object") {
    const found = (options as DropdownOption[]).find(
      (opt) => (opt as any)[idKey] === value
    );
    if (found) selectedLabel = (found as any)[labelKey];
  }

  return (
    <div ref={ref} className="relative w-full">
      {/* {title && <p className="text-sm text-slate-600 mb-1">{title}</p>} */}

      {/* Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm hover:bg-slate-50 transition shadow-sm"
      >
        <span className="text-slate-700">{selectedLabel}</span>
        <ChevronDown
          size={16}
          className={`text-slate-500 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Options */}
      <div
        className={`absolute right-0 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50 transition-all duration-200 ${
          open ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible"
        }`}
      >
        {options.map((opt, idx) => {
          const optValue =
            typeof opt === "object" ? (opt as any)[idKey] : opt;
          const optLabel =
            typeof opt === "object" ? (opt as any)[labelKey] : opt;

          return (
            <button
              key={idx}
              onClick={() => {
                onChange(optValue);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm transition ${
                optValue === value ? "bg-slate-100 font-medium" : "hover:bg-slate-50"
              }`}
            >
              {optLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}