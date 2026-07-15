import { Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { createPortal } from "react-dom";
import type { Account, AccountOption, WarrantyListItem, WarrantyStatus } from "../../../types/type";
import api from "../../../lib/axios";
import toast from "react-hot-toast";
import PaymentOption from "../../Ui/PaymentOption";

type SendToSupplierModalProps = {
    isOpen: boolean;
    close: () => void;
    warranty: WarrantyListItem;
}

export default function SendToSupplierModal({ isOpen, close, warranty }: SendToSupplierModalProps) {
    const [sentDate, setSentDate] = useState<Date>(new Date());
    const [selectedAccounts, setSelectedAccounts] = useState<AccountOption[]>([]);
    const [accounts, setAccounts] = useState<AccountOption[] | []>([]);


    const fetchAccount = async () => {
        const res = await api("/account/list");
        if (res.data.success) {
            const formatted: AccountOption[] = res.data.data.map((a: Account) => ({ ...a, label: a.name, value: a.id, amount: 0, type: "Credit" }));
            setAccounts(formatted);
        }
    };
    const handleSendToSupplier = async () => {
        const formattedAccounts = selectedAccounts.map(a => ({ accountID: a.id, amount: a.amount }))
        const payload = {
            sentDate,
            status: "sent_to_supplier" as WarrantyStatus,
            ...(selectedAccounts.length > 0 && { accounts: formattedAccounts }),
            supplierNote: "",
        }
        const res = await api.post(`/warranty/send-to-supplier/${warranty.id}`, payload);

        if (res.data.success) {
            toast.success(res.data.msg);
            return close();
        }
    }

    useEffect(() => {
        fetchAccount();
    }, []);

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
                <h2 className="text-lg font-semibold mb-4">Send To Supplier</h2>
                <div className="py-5">
                    <h1 className="font-bold text-lg uppercase">{warranty.product?.name}. s/n : {warranty.serial}</h1>
                    <h1 className="font-semibold text-sm uppercase">Supplier : {warranty.supplier?.name}</h1>
                    <h1 className="font-semibold text-sm uppercase">Customer : {warranty.customer?.name}</h1>
                </div>
                {/* Date */}
                <div className="relative w-full">
                    <label className="block text-sm font-medium mt-1 mb-1">
                        Select 'Send To Supplier' Date
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <Calendar className="w-4 h-4 text-gray-400" />
                        </div>
                        <DatePicker
                            selected={sentDate}
                            onChange={(date: Date | null) => setSentDate(date as Date)}
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
                    <PaymentOption
                        accounts={accounts}
                        setAccounts={setAccounts}
                        selectedAccounts={selectedAccounts}
                        setSelectedAccounts={setSelectedAccounts} />
                </div>

                <div className="flex justify-end gap-2">
                    <button onClick={close} className="global_button_red">
                        Cancel
                    </button>
                    <button
                        onClick={handleSendToSupplier}
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