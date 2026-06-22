import type { StylesConfig } from "react-select";
import type { SelectOption } from "../types/type";
import { useState, useEffect } from "react";

const isDark = () => document.documentElement.classList.contains("dark");

export const getReactSelectStyles = <T extends SelectOption = SelectOption>(): StylesConfig<T> => {
  const [dark, setDark] = useState(isDark());

  useEffect(() => {
    const observer = new MutationObserver(() => setDark(isDark()));
    observer.observe(document.documentElement, { attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return {
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    input: (base) => ({ ...base, color: dark ? "#ffffff" : "#111827" }),
    singleValue: (base) => ({ ...base, color: dark ? "#ffffff" : "#111827" }),
    placeholder: (base) => ({ ...base, color: dark ? "#9ca3af" : "#6b7280" }),
    control: (base) => ({
      ...base,
      backgroundColor: dark ? "#343a3f" : "#ffffff",
      borderColor: dark ? "#374151" : "#d1d5db",
    }),
    menu: (base) => ({ ...base, backgroundColor: dark ? "#343a3f" : "#ffffff" }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? (dark ? "#374151" : "#e5e7eb") : "transparent",
      color: dark ? "#ffffff" : "#111827",
    }),
    indicatorSeparator: (base) => ({
      ...base,
      display: "none",
    }),
  };
};


export const smallReactStyle = <T,>(): StylesConfig<T, false> => ({
  control: (base) => ({
    ...base,
    backgroundColor: document.documentElement.classList.contains("dark")
      ? "#111827"
      : "#ffffff",
    borderColor: document.documentElement.classList.contains("dark")
      ? "#374151"
      : "#d1d5db",
    color: document.documentElement.classList.contains("dark")
      ? "#ffffff"
      : "#111827",
    minHeight: '30px', // optional: compact height
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: document.documentElement.classList.contains("dark")
      ? "#374151"
      : "#ffffff",
    zIndex: 9999,
    fontSize: '11px'
  }),
  option: (base, state) => ({
    ...base,

    backgroundColor: state.isFocused
      ? document.documentElement.classList.contains("dark")
        ? "#4b5563"
        : "#f3f4f6"
      : document.documentElement.classList.contains("dark")
        ? "#374151"
        : "#ffffff",
    color: document.documentElement.classList.contains("dark")
      ? "#ffffff"
      : "#111827",
    fontSize: '11px',
    padding: '2px 4px',
  }),
  input: (base) => ({
    ...base,
    color: document.documentElement.classList.contains("dark")
      ? "#ffffff"
      : "#111827",
  }),
  singleValue: (base) => ({
    ...base,
    color: document.documentElement.classList.contains("dark")
      ? "#ffffff"
      : "#111827",
  }),
  placeholder: (base) => ({
    ...base,
    color: document.documentElement.classList.contains("dark")
      ? "#9ca3af"
      : "#6b7280",
  }),
  // ✅ Hide dropdown arrow
  dropdownIndicator: (base) => ({
    ...base,
    display: "none",
  }),
  // ✅ Hide separator between input and arrow
  indicatorSeparator: (base) => ({
    ...base,
    display: "none",
  }),
  // ✅ Hide clear (X) button
  clearIndicator: (base) => ({
    ...base,
    display: "none",
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999
  }),
});


export const smallReactStyleMulti = <T,>(): StylesConfig<T, true> => ({
  control: (base) => ({
    ...base,
    backgroundColor: document.documentElement.classList.contains("dark")
      ? "#111827"
      : "#ffffff",
    borderColor: document.documentElement.classList.contains("dark")
      ? "#374151"
      : "#d1d5db",
    color: document.documentElement.classList.contains("dark")
      ? "#ffffff"
      : "#111827",
    minHeight: '30px',
    fontSize: '11px',
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: document.documentElement.classList.contains("dark")
      ? "#374151"
      : "#ffffff",
    zIndex: 9999,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused
      ? document.documentElement.classList.contains("dark")
        ? "#4b5563"
        : "#f3f4f6"
      : document.documentElement.classList.contains("dark")
        ? "#374151"
        : "#ffffff",
    color: document.documentElement.classList.contains("dark")
      ? "#ffffff"
      : "#111827",
    fontSize: '11px',
    padding: '2px 4px',
  }),
  input: (base) => ({
    ...base,
    color: document.documentElement.classList.contains("dark")
      ? "#ffffff"
      : "#111827",
    fontSize: '11px',
  }),
  placeholder: (base) => ({
    ...base,
    color: document.documentElement.classList.contains("dark")
      ? "#9ca3af"
      : "#6b7280",
    fontSize: '11px',
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: document.documentElement.classList.contains("dark")
      ? "#4b5563"
      : "#e5e7eb",
    fontSize: '11px',
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: document.documentElement.classList.contains("dark")
      ? "#ffffff"
      : "#111827",
    fontSize: '11px',
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: document.documentElement.classList.contains("dark")
      ? "#9ca3af"
      : "#6b7280",
    ':hover': {
      backgroundColor: document.documentElement.classList.contains("dark")
        ? "#ef4444"
        : "#fca5a5",
      color: '#ffffff',
    },
  }),
  dropdownIndicator: (base) => ({
    ...base,
    display: "none",
  }),
  indicatorSeparator: (base) => ({
    ...base,
    display: "none",
  }),
  clearIndicator: (base) => ({
    ...base,
    display: "none",
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999
  }),
});