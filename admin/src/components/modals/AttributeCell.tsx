import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { VariantPayload } from '../../types/type';

interface AttributeCellProps {
  variant: VariantPayload;
  index: number;
  variants: VariantPayload[];
  setVariants: React.Dispatch<React.SetStateAction<VariantPayload[]>>;
}

function AttributeCell({
  variant,
  index,
  variants,
  setVariants,
}: AttributeCellProps) {
  const [open, setOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    // Handle escape key to close modal
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  const updateAttribute = (attrIndex: number, field: "name" | "value", val: string) => {
    const updated = [...variants];
    updated[index] = {
      ...updated[index],
      attributes: updated[index].attributes.map((attr, i) =>
        i === attrIndex ? { ...attr, [field]: val } : attr
      ),
    };
    setVariants(updated);
  };

  const addAttribute = () => {
    const updated = [...variants];
    updated[index] = {
      ...updated[index],
      attributes: [...updated[index].attributes, { name: "", value: "" }],
    };
    setVariants(updated);
  };

  const removeAttribute = (attrIndex: number) => {
    const updated = [...variants];
    updated[index] = {
      ...updated[index],
      attributes: updated[index].attributes.filter((_, i) => i !== attrIndex),
    };
    setVariants(updated);
  };

  return (
    <>
   
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="global_button text-sm px-3 py-1"
      >
        +
      </button>

      {open && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          {/* Modal */}
          <div
            ref={modalRef}
            className="relative w-[500px] max-w-[90vw] max-h-[80vh] bg-[#e2e2e2] dark:bg-[#3a3a3a] rounded-lg shadow-2xl border border-gray-300 dark:border-gray-700"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-300 dark:border-gray-700">
              <h3 className="text-lg font-semibold dark:text-white">
                Attributes ({variant.attributes.length})
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto max-h-[50vh]">
              {variant.attributes.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No attributes added yet
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {variant.attributes.map((attr, attrIndex) => (
                    <div key={attrIndex} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={attr.name}
                        onChange={(e) => updateAttribute(attrIndex, "name", e.target.value)}
                        placeholder="Attribute name"
                        className="global_input flex-1"
                      />
                      <input
                        type="text"
                        value={attr.value}
                        onChange={(e) => updateAttribute(attrIndex, "value", e.target.value)}
                        placeholder="Attribute value"
                        className="global_input flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => removeAttribute(attrIndex)}
                        className="text-red-500 hover:text-red-700 text-lg px-2 py-1"
                        title="Remove attribute"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-4 border-t border-gray-300 dark:border-gray-700">
              <button
                type="button"
                onClick={addAttribute}
                className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                + Add Attribute
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default AttributeCell;