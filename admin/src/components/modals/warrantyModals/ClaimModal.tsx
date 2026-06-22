import { Calendar } from "lucide-react";
import { useState } from "react";
import DatePicker from "react-datepicker";
import { createPortal } from "react-dom";
import type { WarrantyListItem } from "../../../types/type";
import api from "../../../lib/axios";
import toast from "react-hot-toast";

type WarrantyClaimModalProps = {
    isOpen: boolean;
    close: () => void;
    warranty: WarrantyListItem;
}

export default function WarrantyClaimModal({ isOpen, close, warranty }: WarrantyClaimModalProps) {
    const [claimDate, setClaimDate] = useState<Date>(new Date());
    const [issue, setIssue] = useState<string | null>("");

    const handleClaim = async () => {

        const payload = {
            claimDate, issueDesciption: issue,
        }
        const res = await api.post(`/warranty/claim/${warranty._id}`, payload);

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
                className="bg-white dark:bg-[#1E2939] text-black dark:text-white rounded-lg p-6 max-w-md w-full mx-2 overflow-y-auto max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-lg font-semibold mb-4">Claim</h2>
                <div>
                    <h1 className="font-bold text-lg uppercase">{warranty.productName}. s/n : {warranty.serial}</h1>
                    <h1 className="font-semibold text-sm uppercase">Supplier : {warranty.supplierName}</h1>
                    <h1 className="font-semibold text-sm uppercase">Customer : {warranty.customerName}</h1>
                </div>
                {/* Date */}
                <div className="relative w-full">
                    <label className="block text-sm font-medium mt-1 mb-1">
                        Select Claim Date
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <Calendar className="w-4 h-4 text-gray-400" />
                        </div>
                        <DatePicker
                            selected={claimDate}
                            onChange={(date: Date | null) => setClaimDate(date as Date)}
                            dateFormat="dd-MM-yyyy"
                            className="global_input pl-10 w-full"
                            popperPlacement="bottom"
                            popperClassName="z-[9999]"
                            calendarClassName="react-datepicker-custom"
                            withPortal
                        />
                    </div>
                </div>

                <div className="py-5">
                    <label className="block mb-2 font-medium">Issue Description</label>
                    <textarea
                        value={issue ?? ""}
                        onChange={(e) => setIssue(e.target.value)}
                        className="global_input min-h-[150px] w-full"
                    />
                </div>

                <div className="flex justify-end gap-2">
                    <button onClick={close} className="global_button_red">
                        Cancel
                    </button>
                    <button
                        onClick={handleClaim}
                        className="global_button"
                    >
                        Claim Submit
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}