import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

type DropdownProps<T> = {
    value: T;
    options: T[];
    onChange: (value: T) => void;
    title?: string | null;
    idKey?: string;
    labelKey?: string;
    usePortal?: boolean;
};

export function Dropdown<T>({
    value,
    options,
    onChange,
    title = null,
    idKey = "id",
    labelKey = "name",
    usePortal = false,
}: DropdownProps<T>) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

    // close outside click
    useEffect(() => {
        const handleOutside = (e: MouseEvent) => {
            const target = e.target as Node;

            if (ref.current && !ref.current.contains(target)) {
                setOpen(false);
            }
        };
        document.addEventListener("click", handleOutside);
        return () => document.removeEventListener("click", handleOutside);
    }, []);

    // portal position
    useEffect(() => {
        if (open && usePortal && ref.current) {
            const rect = ref.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + window.scrollY + 4,
                left: rect.left + window.scrollX,
                width: rect.width,
            });
        }
    }, [open, usePortal]);

    // label resolve
    const getLabel = (opt: any) => {
        if (opt && typeof opt === "object") {
            return opt[labelKey] ?? opt.name ?? opt.id;
        }
        return opt;
    };

    const getValue = (opt: any) => {
        if (opt && typeof opt === "object") {
            return opt[idKey] ?? opt.value ?? opt.id;
        }
        return opt;
    };

    const selectedLabel =
        options.find((opt: any) => getValue(opt) === value)
            ? getLabel(options.find((opt: any) => getValue(opt) === value))
            : "Select...";

    const renderDropdown = () => (
        <div
            className={`${usePortal ? "fixed" : "absolute w-full"
                } right-0 mt-1 bg-white dark:bg-[#1c1d22] border-2 border-green-600 rounded-sm shadow-lg overflow-y-auto max-h-60 z-[99999]`}
            style={
                usePortal
                    ? {
                        top: `${position.top}px`,
                        left: `${position.left}px`,
                        width: `${position.width}px`,
                    }
                    : {}
            }
        >
            {options.map((opt: any, idx) => {
                const optValue = getValue(opt);
                const optLabel = getLabel(opt);

                return (
                    <button
                        key={idx}
                        type="button"
                        onClick={() => {
                            onChange(optValue);
                            setOpen(false);
                        }}
                        className={`w-full text-left dark:text-white px-4 py-2 text-sm transition ${optValue === value
                                ? "bg-[#7c7ce0]"
                                : "hover:bg-orange-500"
                            }`}
                    >
                        {optLabel}
                    </button>
                );
            })}
        </div>
    );

    return (
        <>
            <div ref={ref} className="relative w-full">
                <button
                    type="button"
                    onClick={() => setOpen((p) => !p)}
                    className="flex items-center justify-between w-full px-3 py-[6px] border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-[#343A3F] text-sm"
                >
                    <span className="text-gray-700 dark:text-white">
                        {selectedLabel}
                        {title && <span className="opacity-50 ml-1">{title}</span>}
                    </span>

                    <ChevronDown
                        size={14}
                        className={`transition-transform ${open ? "rotate-180" : ""}`}
                    />
                </button>

                {!usePortal && open && renderDropdown()}
            </div>

            {usePortal &&
                open &&
                typeof document !== "undefined" &&
                createPortal(renderDropdown(), document.body)}
        </>
    );
}