import { createPortal } from "react-dom";
import type { Account } from "../../types/type";
import { useState } from "react";
import { Dropdown } from "../Ui/Dropdown";
import { ArrowLeftRight } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../lib/axios";

type BalanceTransferModalProps = {
    accounts: Account[] | [];
    fromAccount: Account | null;
    onClose: () => void;
}

export default function BalanceTransferModal({ accounts, fromAccount, onClose }: BalanceTransferModalProps) {
    const AnyDropdown = Dropdown as any;
    const [selectedFrom, setSelectedFrom] = useState<Account | null>(fromAccount);
    const [selectedTo, setSelectedTo] = useState<Account | null>(null);
    const [amount, setAmount] = useState<number>(0);

    // from এ যেটা select হবে সেটা to তে দেখাবে না
    const toAccounts = accounts.filter(a => a._id !== selectedFrom?._id);
    // to তে যেটা select হবে সেটা from এ দেখাবে না
    const fromAccounts = accounts.filter(a => a._id !== selectedTo?._id);
    const handleBalanceTransfer = async () => {
        const payload = { selectedFrom:{_id:selectedFrom?._id}, selectedTo:{_id:selectedTo?._id}, amount };
        const res = await api.post('/account/balance-transfer', payload);
        if (res.status === 201) {
            return onClose();
        };
    }
    return createPortal(
        <div
            onClick={onClose}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
            <div
                className="bg-white dark:bg-[#1E2939] text-black dark:text-white rounded-lg p-6 max-w-md w-full mx-2 overflow-y-auto max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-lg font-semibold mb-4">Balance Transfer</h2>

                <div className="flex gap-4 mb-4">
                    {/* From Account */}
                    <div className="flex-1">
                        <label className="text-sm font-medium mb-1 block">From Account</label>
                        
                        <AnyDropdown
                            value={selectedFrom?._id ?? ""}
                            options={fromAccounts}
                            onChange={(id: string) => {
                                const acc = accounts.find(a => a._id === (id as string)) ?? null;
                                setSelectedFrom(acc);
                            }}
                            idKey="_id" as any
                            labelKey="name"

                        />
                    <h1 className="text-green-400">After ={(selectedFrom?.balance || 0) - amount}</h1>
                    </div>
                    <h1 className="flex items-center"><ArrowLeftRight /></h1>
                    {/* To Account */}
                    <div className="flex-1">
                        <label className="text-sm font-medium mb-1 block">To Account</label>
                        <AnyDropdown
                            value={selectedTo?._id ?? ""}
                            options={toAccounts}
                            onChange={(id: string) => {
                                const acc = accounts.find(a => a._id === (id as string)) ?? null;
                                setSelectedTo(acc);
                            }}
                            idKey="_id" as any
                            labelKey="name"

                        />
                         <h1 className="text-green-400">After = {(selectedTo?.balance  || 0)+ amount}</h1>
                    </div>
                </div>

                {/* Amount */}

                <div className="mb-4">
                    <label className="text-sm font-medium mb-1 block">Amount</label>
                    <input
                        type="number"
                        min={1}
                        className="global_input"
                        value={amount === 0 ? "" : amount}
                        onChange={(e) => {
                            let value:number = Number(e.target.value) || 0;
                            
                            if(value<0){
                                return setAmount(0);
                            }

                            if (selectedFrom && value > selectedFrom.balance) {
                                setAmount(selectedFrom.balance);
                                return toast.error("You can not transfer balance more than your current balance");
                            }
                            setAmount(value);
                        }}
                        disabled={(!!selectedTo && !!selectedFrom) ? false : true}
                        placeholder="Enter amount"
                    />
                </div>

                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="global_button_red">
                        Cancel
                    </button>
                    <button
                        onClick={handleBalanceTransfer}
                        disabled={!selectedFrom || !selectedTo || amount <= 0}
                        className="global_button disabled:opacity-50"
                    >
                        Transfer
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}