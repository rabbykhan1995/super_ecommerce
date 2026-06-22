import { createPortal } from "react-dom";
import { type SelectOption, type Account, type Contact, type AccountOption, type SearchParams } from "../../types/type";
import { useEffect, useState } from "react";
import { Dropdown } from "../Ui/Dropdown";
import toast from "react-hot-toast";
import api from "../../lib/axios";
import PaymentOption from '../Ui/PaymentOption';
import Select from 'react-select';
import { getReactSelectStyles } from "../../utils/reactSelectStyles";
import { useNavigate } from "react-router";

type TransactionModalProps = {
    contact: Contact | null;
    open: boolean;
    onClose: () => void;
    type: String | null;
}

export default function TransactionModal({ contact, open, onClose, type }: TransactionModalProps) {
    const navigate = useNavigate();
    const AnyDropdown = Dropdown as any;
    const [selectedAccounts, setSelectedAccounts] = useState<AccountOption[]>([]);
    const [accounts, setAccounts] = useState<AccountOption[] | []>([]);
    const [selectedContact, setSelectedContact] = useState<SelectOption<Contact> | null>(null);
    const [transactionType, setTransactionType] = useState<"credit" | "debit" | "">("");
    const [note, setNote] = useState<string | null | "">(null);
    const [params, setParams] = useState<SearchParams>({
        search: "",
        page: 1,
        limit: 20,
    });

    const [contacts, setContacts] = useState<SelectOption<Contact>[]>([]);
    const fetchContacts = async () => {
        const res = await api("/contact/list", {
            params: { search: params.search, limit: params.limit, page: params.page, type: type },
        });
        if (res.data.success) setContacts(
            res.data.data.items.map((u: Contact) => ({ value: u._id, label: `${u.name} balance(${u.balance})`, ...u }))
        );;
    };
    useEffect(() => {
        const timer = setTimeout(() => fetchContacts(), 400);
        return () => clearTimeout(timer);
    }, [params.search]);

    useEffect(() => {
        fetchContacts();
    }, [params.limit, params.page]);

    const fetchAccount = async () => {
        const res = await api("/account/list");
        if (res.data.success) {
            const formatted: AccountOption[] = res.data.data.map((a: Account) => ({ ...a, label: a.name, value: a._id, amount: 0, type: "Credit" }));
            setAccounts(formatted);
        }
    };

    useEffect(() => {
        fetchAccount();
    }, []);
    const prevBal = selectedContact?.balance || 0;

    const totalPaid = selectedAccounts.reduce((acc, a) => acc + (a.amount || 0), 0);

    const currentBal = (() => {
        if (transactionType === "credit") {
            // আপনার account এ টাকা ঢুকছে (সে দিচ্ছে)
            // তার balance কমবে (সে কম দেনাদার হবে, বা বেশি পাওনাদার হবে)
            return prevBal + totalPaid;
        } else {
            // আপনার account থেকে টাকা যাচ্ছে (আপনি দিচ্ছেন)
            // তার balance বাড়বে (সে বেশি দেনাদার হবে, বা কম পাওনাদার হবে)
            return prevBal - totalPaid;
        }
    })();

    const handleTransaction = async () => {
        if (!selectedContact) {
            return toast.error("Select One contact");
        }

           const accounts = selectedAccounts.map(a => ({
            accountID: a.value,
            amount: a.amount,
        }));

        const payload = {
            accounts,
            transaction: {
                contactID: selectedContact.value,
                balanceBefore: prevBal,
                balanceAfter: currentBal,
                amount: totalPaid,
                note: note,
                type:transactionType==="credit"?"Credit":"Debit",
            }
        };

        const res = await api.post('/transaction/create', payload);
        if (res.status === 201) {
            navigate(`/account/transaction-details/${res.data.data[0]._id}`)
            return onClose();
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
                <h2 className="text-lg font-semibold mb-4">Transaction</h2>
                <div className="mb-5">
                    <label htmlFor="customer">Select <span className="capitalize">{type}</span> <span className="text-red-400">*</span></label>
                    <Select
                        options={contacts}
                        value={selectedContact}
                        onChange={(val) => setSelectedContact(val as SelectOption<Contact> | null)}
                        onInputChange={(e) => setParams(prev => ({ ...prev, search: e }))}
                        placeholder="Select Contact"
                        isClearable
                        styles={getReactSelectStyles<SelectOption<Contact>>()}
                    />
                </div>

                <div>
                    <label htmlFor="name">
                        Select Transiction Type <span className="text-red-400">*</span>
                    </label>
                    <AnyDropdown
                        value={transactionType}
                        options={[
                            { _id: "credit", name: `Credit from ${type}` },
                            { _id: "debit", name: `Debit to ${type}` }
                        ]}
                        onChange={(id: string) => setTransactionType(id as "credit" | "debit")}
                        idKey="_id"
                        labelKey="name"
                    />
                </div>


                <PaymentOption
                    accounts={accounts}
                    setAccounts={setAccounts}
                    selectedAccounts={selectedAccounts}
                    setSelectedAccounts={setSelectedAccounts} />

                <h1 className="pt-5 capitalize flex justify-between"><span>total {transactionType} </span> {totalPaid || 0}</h1>

                <h1 className="py-5 capitalize flex justify-between"><span>Customer Bal. Will be :  </span> {currentBal}</h1>

                <div className="">
                    <label htmlFor="note">Note</label>
                    <textarea name="note" id="note" onChange={(e) => setNote(e.target.value)} className="global_input" placeholder="Your Note"></textarea>

                </div>
                <div className="flex justify-end gap-2 mt-5">
                    <button onClick={onClose} className="global_button_red">
                        Cancel
                    </button>
                    <button
                        onClick={handleTransaction}
                        // disabled={!selectedFrom || !selectedTo || amount <= 0}
                        className="global_button disabled:opacity-50"
                        disabled={!selectedContact}
                    >
                        Create Transaction
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}