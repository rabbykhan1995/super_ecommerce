import { Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { createPortal } from "react-dom";
import type { Account, AccountOption, Contact, QuotationListItem } from "../../types/type";
import toast from "react-hot-toast";
import PaymentByAccounts from "../Ui/PaymentOption";
import type { } from "../../types/type";
import api from "../../lib/axios";
import { approveSaleQuotationSchema } from "../../validators/quotation.validator";
import { useNavigate } from "react-router";

type ApproveQuotationModal = {
    isOpen: boolean;
    close: () => void;
    quotation: QuotationListItem;
}

export default function ApproveQuotationModal({ isOpen, close, quotation }: ApproveQuotationModal) {
    const navigate = useNavigate();
    const [saleDate, setSaleDate] = useState<Date>(new Date());
    const [accounts, setAccounts] = useState<AccountOption[]>([]);
    const [fullQuotation, setFullQuotation] = useState<any>(null);
    const [selectedAccounts, setSelectedAccounts] = useState<AccountOption[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<null | Contact>(null);
    const [isExchanging, setIsExchanging] = useState<boolean>(false);
    const [exchangeAccounts, setExchangeAccounts] = useState<AccountOption[]>([]);
    const [selectedExchangeAccounts, setSelectedExchangeAccounts] = useState<AccountOption[]>([]);

    const fetchAccount = async () => {
        const res = await api("/account/list");
        if (res.data.success) {
            const formatted: AccountOption[] = res.data.data.map((a: Account) => ({
                ...a,
                label: a.name,
                value: a._id,
                amount: 0,
                type: "Debit"
            }));

            // default account আলাদা করো
            const defaultAccount = formatted.find((a) => a.default === true);
            const rest = formatted.filter((a) => a.default !== true);

            setAccounts(rest);
            setExchangeAccounts(rest);
            if (defaultAccount) {
                setSelectedAccounts([defaultAccount]);
                setSelectedExchangeAccounts([defaultAccount])
            };
        }
    };

    const fetchContact = async (customerID: string) => {
        const res = await api(`/contact/contactByID/${customerID}`);
        if (res.data.success) {
            setSelectedCustomer(res.data.data);
        }
    };

    const fetchFullQuotation = async () => {
        const res = await api(`/quotation/full-quotation/${quotation?._id}`);
        if (res.data.success) {
            setFullQuotation(res.data.data);
            setSaleDate(res.data.data.SaleDate);
            return res.data.data;
        }
    };

    const totalProductPrice = fullQuotation?.totalProductPrice || 0;

    const prevBalance = selectedCustomer?.balance ?? 0;

    const prevDue = prevBalance < 0 ? -prevBalance : 0;
    const usableBalance = prevBalance > 0 ? prevBalance : 0;

    const basePayable = totalProductPrice - fullQuotation?.discount + fullQuotation?.otherCost;

    const totalPayableAmount =
        basePayable + prevDue - usableBalance;

    const paidWithAcc = selectedAccounts?.reduce(
        (acc, a) => acc + (a.amount || 0),
        0
    );

    const adjustedPayable = basePayable - prevBalance;
    const currentBalance = paidWithAcc - adjustedPayable;

    // totalPaid ta hobe account er payment ar balance payment, but balance payment tokhon count hobe jokhon old balance + a thakbe.
    const exchangeAmount = selectedExchangeAccounts?.reduce(
        (acc, a) => acc + (a.amount || 0),
        0
    );
    useEffect(() => {
        const fetchData = async () => {
            try {
                const promises = [fetchAccount()];
                if (quotation?._id) {
                    promises.push(fetchFullQuotation());
                }
                await Promise.all(promises);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [quotation?._id]);

    useEffect(() => {
        if (fullQuotation && fullQuotation?.customerID) {
            fetchContact(fullQuotation.customerID);
        }

    }, [fullQuotation]);



    useEffect(() => {
        // jodi customer select na hoi ar paid beshi hoi
        if (!selectedCustomer && (currentBalance > 0)) {
            setIsExchanging(true);
            return setSelectedExchangeAccounts((prev) => {
                const updated = prev.map((a) =>
                    a.default
                        ? {
                            ...a,
                            amount: currentBalance,
                        }
                        : a
                );
                return updated;
            });
        }
        // jodi customer select na hoi ar paid, amount er soman ba kom hoi
        if (!selectedCustomer && (currentBalance <= 0)) {
            return setIsExchanging(false)
        }
        //  // jodi customer select na hoi ar advance hoi ar exchange na hoi tokhon automatic exchange hobe,
        if (!selectedCustomer && (currentBalance > 0) && !isExchanging) {
            setIsExchanging(true);
            setSelectedExchangeAccounts((prev) => {
                const updated = prev.map((a) =>
                    a.default
                        ? {
                            ...a,
                            amount: currentBalance,
                        }
                        : a
                );
                return updated;
            });
            toast.error("Exchange must occur in this situation");
            return;
        }
        // jodi customer select hoi ar due hoi, ar exchange o hoi tokhon exchanging desable hoye jabe
        if (selectedCustomer && (currentBalance < 0) && isExchanging) {
            setIsExchanging(false);
            return;
        }
        // jodi customer select hoi ar advance hoi, ar exchange o hoi tokhon exchanging desable hoye jabe
        if (selectedCustomer && (currentBalance > 0) && isExchanging) {
            setSelectedExchangeAccounts((prev) => {
                const updated = prev.map((a) =>
                    a.default
                        ? {
                            ...a,
                            amount: currentBalance,
                        }
                        : a
                );
                return updated;
            });
            return;
        }

    }, [selectedCustomer, currentBalance, isExchanging]);

  
    useEffect(() => {
        if (!isExchanging) {
            setExchangeAccounts((prev) => [
                ...prev,
                ...selectedExchangeAccounts,
            ]);

            setSelectedExchangeAccounts([]);
            return;
        }

        if (isExchanging) {
            setSelectedExchangeAccounts((prev) => {
                const defaultAccount = exchangeAccounts.find((a) => a.default);

                if (!defaultAccount) return prev;

                const updated = prev.some((a) => a._id === defaultAccount._id)
                    ? prev
                    : [
                        {
                            ...defaultAccount,
                            amount: currentBalance,
                        },
                    ];

                return updated;
            });
        }
    }, [isExchanging]);

    const handleApprove = async () => {
        // ✅ Accounts structure
        const accounts = selectedAccounts.map(a => ({
            accountID: a.value,
            amount: a.amount,
        }));

        const exchangeAccounts = selectedExchangeAccounts.map(a => ({
            accountID: a.value,
            amount: a.amount,
        }));
        if (!selectedCustomer && paidWithAcc < totalPayableAmount) {
            return toast.error(`You must have to pay ${totalPayableAmount} TK`)
        }
        if (isExchanging && (currentBalance > 0) && (exchangeAmount !== currentBalance) && (exchangeAmount <= 0)) {
            return toast.error("You must have return the full exchange amount, not less or more.");
        }
        // ektu problem er karone, exchange accounts jodi selected thake and seta jodi fill up na hoi, tokhon seta disable korar upai nai, tai ei logic kora, jeno exchange amount 0 hole, ar exchange accounts selected thakle seta automatic disble hoye jabe..
        if(exchangeAmount===0 && selectedExchangeAccounts.length>0){
                   setExchangeAccounts((prev) => [
                ...prev,
                ...selectedExchangeAccounts,
            ]);

            setSelectedExchangeAccounts([]);
        }

        // ✅ Sale object - backend অনুযায়ী
        const quotation = {
            paid: paidWithAcc,
            saleDate,
            totalProductPrice,
            exchangeAmount,
            totalAmount: basePayable,
            balanceBefore: selectedCustomer?.balance || 0,
            balanceAfter: currentBalance,
            accounts,
            exchangeAccounts,
        };

        // ✅ Validate
        const result = approveSaleQuotationSchema.safeParse(quotation);

        if (!result.success) {
            const firstError = result.error.issues[0];
            toast.error(firstError.message);
            console.error("Validation errors:", result.error.issues);
            return;
        }

        try {
            const res = await api.post(`/quotation/approve-sale-quotation/${fullQuotation._id}`, result.data);

            if (res.data.success === true) {
                toast.success(res.data.msg || "Sale created successfully!");
                navigate(`/sale/invoice/${res.data.data._id}`);
            } else {
                toast.error(res.data.message || "Failed to create sale");
            }
        } catch (error: any) {
            console.error("Sale creation error:", error);
            const errorMsg = error.response?.data?.message || "Error creating sale";
            toast.error(errorMsg);
        }
    };

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
                <h2 className="text-lg font-semibold mb-4">Approve Quotation</h2>
                <div className="flex flex-col lg:flex-row gap-6">
        
                    {/* Summary */}
                    <div className="flex-1 space-y-3">
                    {!selectedCustomer ? <h1>Selling to no customer</h1>:<h1>Customer Name: {selectedCustomer?.name} | Address: {selectedCustomer?.address}</h1>}
                                    {/* Date */}
                    <div className="relative w-full">
                        <label className="block text-sm font-medium mt-1 mb-1">
                            Select Date
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                <Calendar className="w-4 h-4 text-gray-400" />
                            </div>
                            <DatePicker
                                selected={saleDate}
                                onChange={(date: Date | null) => setSaleDate(date as Date)}
                                dateFormat="dd-MM-yyyy"
                                className="global_input pl-10 w-full"
                                popperPlacement="bottom"
                                popperClassName="z-[9999]"
                                calendarClassName="react-datepicker-custom"
                                withPortal
                            />
                        </div>
                    </div>

                        {/* Total Product Price */}
                        <div className="flex justify-between">
                            <label>Total Product Price:</label>
                            <input type="number" value={totalProductPrice.toFixed(2)} disabled
                                className="global_input w-40 rounded-sm cursor-not-allowed text-right" />
                        </div>

                        {/* Discount Amount */}
                        <div className="flex justify-between">
                            <label>Discount Amount:</label>
                            <input
                                type="number"
                                value={fullQuotation?.discount}
                                className="global_input w-40 rounded-sm text-right" min="0"
                            />
                        </div>
                        {/* Total Amount */}
                        <div className="flex justify-between font-medium border-t pt-2">
                            <label>Total Amount:</label>
                            <input type="number" value={basePayable.toFixed(2)} disabled
                                className="global_input w-40 rounded-sm cursor-not-allowed text-right" />
                        </div>
                        {/* Previous Due */}
                        {selectedCustomer && prevDue > 0 && (
                            <div className="flex justify-between">
                                <label>Customer Prev Due:</label>
                                <input type="number" value={prevDue.toFixed(2)} disabled
                                    className="global_input w-40 rounded-sm cursor-not-allowed text-right text-red-500" />
                            </div>
                        )}
                        {/* Advance */}
                        {selectedCustomer && usableBalance > 0 && (
                            <div className="flex justify-between">
                                <label>Adv. Paid from Bal.</label>
                                <input type="number" value={prevBalance.toFixed(2)} disabled
                                    className="global_input w-40 rounded-sm cursor-not-allowed text-right text-green-500" />
                            </div>
                        )}
                        {/* Payable */}
                        <div className="flex justify-between font-medium">
                            <label>Payable:</label>
                            {basePayable - (usableBalance) > 0 ?
                                <input type="number" value={(totalPayableAmount).toFixed(2)} disabled
                                    className="global_input w-40 rounded-sm cursor-not-allowed text-right" />
                                :
                                <input type="number" value={0} disabled
                                    className="global_input w-40 rounded-sm cursor-not-allowed text-right" />}
                        </div>

                        {/* Payment By */}
                        <PaymentByAccounts
                            accounts={accounts}
                            setAccounts={setAccounts}
                            selectedAccounts={selectedAccounts}
                            setSelectedAccounts={setSelectedAccounts}
                        />

                        {/* Paid */}
                        <div className="flex justify-between">
                            <label>Total Paid:</label>
                            <input type="number" value={paidWithAcc.toFixed(2)} disabled
                                className="global_input w-40 rounded-sm cursor-not-allowed text-right text-green-500" />
                        </div>
                        {(() => {

                            // CUrrent Due
                            if (currentBalance < 0) return (
                                <div className="flex justify-between font-semibold border-t pt-2">
                                    <label>Cus. Due Will Be:</label>
                                    <input type="number" value={Math.abs(currentBalance).toFixed(2)} disabled
                                        className="global_input w-40 rounded-sm cursor-not-allowed text-right text-red-500" />
                                </div>
                            );
                            // Advance Paid
                            if (!isExchanging && (currentBalance > 0)) return (
                                <div className="flex justify-between font-semibold border-t pt-2">
                                    <label>Cus. Bal. Will Be:</label>
                                    <input type="number" value={Math.abs(currentBalance).toFixed(2)} disabled
                                        className="global_input w-40 rounded-sm cursor-not-allowed text-right text-green-500" />
                                </div>
                            );

                            return null;
                        })()}

                        {/* Exchange button */}
                        {(currentBalance > 0) && (
                            <div className="flex justify-between font-semibold border-t pt-2">
                                <button className="global_button" onClick={() => setIsExchanging(!isExchanging)}>{isExchanging ? `Exchanging - ${exchangeAmount}` : "Not Exchanging"}</button>
                            </div>
                        )}

                        {/* Exchange Payment By */}
                        {!!isExchanging && <PaymentByAccounts
                            title="Exchange by"
                            accounts={exchangeAccounts}
                            setAccounts={setExchangeAccounts}
                            selectedAccounts={selectedExchangeAccounts}
                            setSelectedAccounts={setSelectedExchangeAccounts}
                        />}

                        <button
                            onClick={handleApprove}
                            className="global_button w-full">Approve</button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}