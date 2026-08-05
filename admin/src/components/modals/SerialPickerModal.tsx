import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Batch, SelectOption } from "../../types/type";
import api from "../../lib/axios";
import toast from "react-hot-toast";

type SerialPickerModalProps = {
  productID: number;
  variantID: number;
  productName: string;
  requiredQty: number;
  selectedBatchIDs: number[];
  onSave: (selected: SelectOption<Batch>[]) => void;
  onClose: () => void;
};

export default function SerialPickerModal({
  productID,
  variantID,
  productName,
  requiredQty,
  selectedBatchIDs,
  onSave,
  onClose,
}: SerialPickerModalProps) {
  const [serials, setSerials] = useState<SelectOption<Batch>[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productID && variantID) {
      fetchSerials();
    }
    document.body.classList.add("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
  }, [productID, variantID]);

  const fetchSerials = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/product/getSaleProduct/${productID}/${variantID}`);
      if (res.data.success) {
        const product = res.data.data;
        const serialBatches: SelectOption<Batch>[] = product.serials || [];
        setSerials(serialBatches);
      }
    } catch {
      toast.error("Failed to load serials");
    } finally {
      setLoading(false);
    }
  };

  const toggleSerial = (batchId: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(batchId)) {
        next.delete(batchId);
      } else {
        next.add(batchId);
      }
      return next;
    });
  };

  const handleSave = () => {
    const selectedList = serials.filter((s) => selected.has(s.value as unknown as number));
    if (selectedList.length < requiredQty) {
      toast.error(`Please select at least ${requiredQty} serial(s)`);
      return;
    }
    onSave(selectedList.slice(0, requiredQty));
    onClose();
  };

  const available = serials.filter((s) => !selectedBatchIDs.includes(s.value as unknown as number));

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div
        className="bg-white dark:bg-[#1E2939] text-black dark:text-white rounded-lg p-6 max-w-lg w-full mx-2 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-1">
          Select Serial for: {productName}
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Required: {requiredQty} &nbsp;|&nbsp; Selected: {selected.size}
        </p>

        {loading ? (
          <div className="py-8 text-center text-gray-500">Loading serials...</div>
        ) : available.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No available serials found</div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-1 mb-4">
            {available.map((s) => {
              const batchId = s.value as unknown as number;
              const isSelected = selected.has(batchId);
              return (
                <label
                  key={batchId}
                  className={`flex items-center gap-3 p-3 rounded cursor-pointer border transition-colors ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSerial(batchId)}
                    className="rounded"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium">{s.serial || "No Serial"}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      Remaining: {s.remainingQty}
                    </span>
                    {s.warranty > 0 && (
                      <span className="text-xs text-blue-500 ml-2">
                        Warranty: {s.warranty}d
                      </span>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        )}

        <div className="flex justify-between items-center pt-2 border-t">
          <span className="text-sm text-gray-500">
            {selected.size} of {requiredQty} selected
          </span>
          <div className="flex gap-2">
            <button onClick={onClose} className="global_button_red">
              Cancel
            </button>
            <button onClick={handleSave} className="global_button">
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
