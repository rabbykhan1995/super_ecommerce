import { Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { createPortal } from "react-dom";
import type { Account, AccountOption, WarrantyListItem, WarrantyStatus } from "../../../types/type";
import api from "../../../lib/axios";
import toast from "react-hot-toast";
import PaymentOption from "../../Ui/PaymentOption";
import { Dropdown } from "../../Ui/Dropdown";

type SupplierActionModal = {
    isOpen: boolean;
    close: () => void;
    warranty: WarrantyListItem;
}

export default function SupplierActionModal({ isOpen, close, warranty }: SupplierActionModal) {
    // const [sentDate, setSentDate] = useState<Date>(new Date());
    // const [selectedAccounts, setSelectedAccounts] = useState<AccountOption[]>([]);
    // const [accounts, setAccounts] = useState<AccountOption[] | []>([]);
    const [selectedAction, setSelectedAction] = useState<WarrantyStatus | null>(null);
    const [supplierNote, setSupplierNote] = useState<string>("");
    const actions = ["repaired", "replaced", "rejected", "refunded"]
    const [replacedSerial, setReplacedSerial] = useState<string>("");
    const [refundedAmount, setRefundedAmount] = useState<number | "">("");
    const checkSerialExists = async (serial: string): Promise<boolean> => {
        try {
            const res = await api.get(`/product/batchBySerial?serial=${serial}`);
            return res.data.exists
        } catch (error) {
            console.error("Error checking serial:", error);
            return false;
        }
    };
    const handleSerialInput = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            const serial = replacedSerial.trim();
            if (!serial) return;

            // api call — serial দিয়ে batch খোঁজো
            try {
                const exist = await checkSerialExists(serial);
                if (exist) {
                    toast.error("Try with a different Serial Number");
                    setReplacedSerial("");
                    return;
                }
                // batch found, set করো

            } catch {
                toast.error("Something went wrong");
            }
        }
    };

    const handleUpdateSupplierAction = async () => {

        if (selectedAction === "replaced" && !replacedSerial) {
            return toast.error("Please assign a serial number to continue");
        }
         if (selectedAction === "refunded" && !refundedAmount) {
            return toast.error("Please refund some amount to continue");
        }

        const payload = {
            status: selectedAction,
            supplierNote,
            ...(selectedAction === "replaced" && { replacedSerial }),
            ...(selectedAction === "refunded" && { refundedAmount })
        }
        const res = await api.post(`/warranty/supplier-action-update/${warranty._id}`, payload);

        if (res.data.success) {
            toast.success(res.data.msg);
            return close();
        }
    }


    if (!isOpen) {
        return null
    }
    return createPortal(
        <div
            onClick={close}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
            <div
                className="bg-white dark:bg-[#1E2939] text-black dark:text-white rounded-lg p-2 lg:p-6 max-w-md w-full mx-2 overflow-y-auto max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-lg font-semibold mb-4">Supplier Action</h2>
                <div className="py-5">
                    <h1 className="font-bold text-lg uppercase">{warranty.productName}. s/n : {warranty.serial}</h1>
                    <h1 className="font-semibold text-sm uppercase">Supplier : {warranty.supplierName}</h1>
                    <h1 className="font-semibold text-sm uppercase">Customer : {warranty.customerName}</h1>
                </div>
                {/* status action */}
                <div className="py-5">
                    <label htmlFor="">Select Action <span className="text-red-500">*</span></label>
                    <Dropdown onChange={(a) => setSelectedAction(a as any)} options={actions} value={selectedAction} title={""} usePortal />
                </div>
                {/* if replaced then new serial */}
                {selectedAction === "replaced" && <div className="py-5">
                    <label htmlFor="">New Serial<span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        className="global_input"
                        value={replacedSerial}
                        onChange={(e) => setReplacedSerial(e.target.value)}
                        onKeyDown={handleSerialInput}
                        placeholder="Scan or type serial..."
                    />
                </div>}

                {/* if refunded then refund amount */}
                {selectedAction === "refunded" && <div className="py-5">
                    <label htmlFor="">Refund Amount<span className="text-red-500">*</span></label>
                    <input
                        type="number"
                        className="global_input"
                        value={refundedAmount === 0 ? "" : refundedAmount}
                        onChange={(e) => setRefundedAmount(Number(e.target.value))}
                        placeholder="Refund Amount"
                    />
                </div>}

                {/* note */}
                <div className="py-5">
                    <label className="block mb-2 font-medium">Note</label>
                    <textarea
                        value={supplierNote ?? ""}
                        onChange={(e) => setSupplierNote(e.target.value)}
                        className="global_input min-h-[150px] w-full"
                    />
                </div>
                <div className="flex justify-end gap-2">
                    <button onClick={close} className="global_button_red">
                        Cancel
                    </button>
                    <button
                        onClick={handleUpdateSupplierAction}
                        className="global_button"
                    >
                        Send To Supp.
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}