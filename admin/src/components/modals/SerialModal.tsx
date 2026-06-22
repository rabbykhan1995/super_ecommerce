import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { PurchaseProduct } from "../../types/type";
import toast from "react-hot-toast";
import api from "../../lib/axios";


type SerialModalProps = {
    idx: number | null;
    selectedProduct: PurchaseProduct;
    onClose: () => void;
    onSave: (updated: PurchaseProduct) => void;
}

export default function SerialModal({ idx, selectedProduct, onClose, onSave }: SerialModalProps) {
    const [serialInputs, setSerialInputs] = useState<string[]>([""]);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const checkSerialExists = async (serial: string): Promise<boolean> => {
        try {
            const res = await api.get(`/product/batchBySerial?serial=${serial}`);
            return res.data.exists || false;
        } catch (error) {
            console.error("Error checking serial:", error);
            return false;
        }
    };
    useEffect(() => {
        if (idx !== null) {
            document.body.classList.add("overflow-hidden");
            setSerialInputs(selectedProduct?.serials?.length ? selectedProduct.serials : [""]);
        } else {
            document.body.classList.remove("overflow-hidden");
        }
        return () => document.body.classList.remove("overflow-hidden");
    }, [idx]);

    if (idx === null) return null;

    // ✅ Check local duplicates
    const checkLocalDuplicates = (serials: string[]): string[] => {
        const trimmed = serials.map(s => s.trim()).filter(s => s !== "");
        const duplicates = new Set<string>();
        const seen = new Set<string>();

        trimmed.forEach((s) => {
            if (seen.has(s)) duplicates.add(s);
            else seen.add(s);
        });

        return Array.from(duplicates);
    };

    const handleSerialChange = (index: number, value: string) => {
        const updated = [...serialInputs];
        updated[index] = value;
        setSerialInputs(updated);
    };

    const handleSerialKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Enter") {
            e.preventDefault();

            const currentValue = serialInputs[index].trim();

            if (!currentValue) {
                // Empty input, just move to next
                const nextIndex = index + 1;
                if (nextIndex < serialInputs.length) {
                    inputRefs.current[nextIndex]?.focus();
                } else {
                    addSerialInput();
                    setTimeout(() => inputRefs.current[nextIndex]?.focus(), 50);
                }
                return;
            }

            // 1️⃣ Check API for existing serial
            const exists = await checkSerialExists(currentValue);
            if (exists) {
                toast.error(`Serial "${currentValue}" already exists!`);
                // Clear current input
                setSerialInputs((prev) => {
                    const updated = [...prev];
                    updated[index] = "";
                    return updated;
                });
                return;
            }

            // 2️⃣ Check local duplicates
            const isDuplicate = serialInputs.some(
                (val, i) => i !== index && val.trim() === currentValue
            );

            if (isDuplicate) {
                toast.error("Duplicate serial in current list!");
                // Clear current input
                setSerialInputs((prev) => {
                    const updated = [...prev];
                    updated[index] = "";
                    return updated;
                });
                return;
            }

            // ✅ All good, move to next
            const nextIndex = index + 1;
            if (nextIndex < serialInputs.length) {
                inputRefs.current[nextIndex]?.focus();
            } else {
                setSerialInputs((prev) => [...prev, ""]);
                setTimeout(() => inputRefs.current[nextIndex]?.focus(), 50);
            }
        }
    };

    const addSerialInput = () => {
        setSerialInputs([...serialInputs, ""]);
        setTimeout(() => {
            inputRefs.current[serialInputs.length]?.focus();
        }, 50);
    };

    const removeSerialInput = (index: number) => {
        const updated = serialInputs.filter((_, i) => i !== index);
        setSerialInputs(updated.length === 0 ? [""] : updated);
    };

    const handleSave = async () => {
        const serials = serialInputs
            .map(s => s.trim())
            .filter(s => s !== "");

        if (serials.length === 0) {
            toast.error("Please add at least one serial number");
            return;
        }

        // 1️⃣ Check local duplicates
        const localDuplicates = checkLocalDuplicates(serialInputs);
        if (localDuplicates.length > 0) {
            toast.error(`Duplicate serials: ${localDuplicates.join(", ")}`);
            return;
        }

        // 2️⃣ Check all serials against API in parallel
        try {
            const results = await Promise.all(
                serials.map(s => checkSerialExists(s))
            );

            const existingSerials = serials.filter((_, idx) => results[idx]);

            if (existingSerials.length > 0) {
                toast.error(`Serials already exist: ${existingSerials.join(", ")}`);
                return;
            }

            // ✅ All clean, save
            onSave({ ...selectedProduct, serials, purchaseQty: serials.length });
            onClose();

        } catch (error) {
            console.error(error);
            toast.error("Error checking serials");
        }
    };

    return createPortal(
        <div
            onClick={onClose}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
            <div
                className="bg-white dark:bg-[#1E2939] text-black dark:text-white rounded-lg p-6 max-w-md w-full mx-2 overflow-y-auto max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-lg font-semibold mb-4">
                    Add Serial Numbers for {selectedProduct.name}
                </h2>

                {serialInputs.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 mb-2">
                        <input
                            ref={(el) => {
                                inputRefs.current[i] = el;
                            }}
                            type="text"
                            value={s}
                            placeholder={`Serial #${i + 1}`}
                            onChange={(e) => handleSerialChange(i, e.target.value)}
                            onKeyDown={(e) => handleSerialKeyDown(e, i)}
                            className="global_input flex-1"
                            autoFocus={i === 0}
                        />
                        {serialInputs.length > 1 && (
                            <button
                                onClick={() => removeSerialInput(i)}
                                className="global_button_red px-3 py-2"
                            >
                                ×
                            </button>
                        )}
                    </div>
                ))}

                <div className="flex justify-between items-center mt-3 mb-4">
                    <button
                        onClick={addSerialInput}
                        className="text-blue-500 dark:text-blue-400 underline font-medium hover:text-blue-600"
                    >
                        + Add More
                    </button>
                    <span className="text-sm text-gray-500">
                        Total: {serialInputs.filter(s => s.trim()).length}
                    </span>
                </div>

                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="global_button_red">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="global_button">
                        Save ({serialInputs.filter(s => s.trim()).length} serials)
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}