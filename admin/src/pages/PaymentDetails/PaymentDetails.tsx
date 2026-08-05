import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router"
import api from "../../lib/axios";
import Helper from "../../utils/helper";
import { printInvoice } from "../../utils/globalPrinter";

const paymentTypeLabel: Record<string, string> = {
    customer_receive: "Customer Receive",
    customer_pay: "Customer Pay",
    supplier_pay: "Supplier Pay",
    supplier_receive: "Supplier Receive",
};

const PaymentDetails = () => {
    const printRef = useRef(null);
    const { id } = useParams();
    const [data, setData] = useState<any>(null);

    const fetchPaymentDetails = async () => {
        const res = await api(`/payment/${id}`);
        if (res.data.success) {
            setData(res.data.data);
        }
    }

    useEffect(() => { fetchPaymentDetails() }, [id]);

    if (!data) return <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">Loading...</div>;

    const contact = data?.contact;
    const transactions = data?.transactions;
    const finalBal = data.balanceAfter;
    const handlePrint = () => { printInvoice(printRef); }

    return (
        <div className="w-full p-2" ref={printRef}>
            {/* Header */}
            <div className="text-center mb-6">
                <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Payment Receipt</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{Helper.formatDate(data.paymentDate)}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Shokher Bazar</p>
            </div>

            <hr className="border-gray-200 dark:border-gray-700 mb-6" />

            {/* Contact */}
            <div className="mb-6">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-2">Contact</p>
                <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Name</span>
                        <span className="text-gray-900 dark:text-gray-100">{contact?.name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Address</span>
                        <span className="text-gray-900 dark:text-gray-100">{contact?.address || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Mobile</span>
                        <span className="text-gray-900 dark:text-gray-100">{contact?.mobile}</span>
                    </div>
                </div>
            </div>

            {/* Accounts */}
            <div className="mb-6">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-2">Accounts</p>
                <div className="text-sm space-y-1">
                    {transactions?.map((tx: any, i: number) => (
                        <div key={i} className="flex justify-between">
                            <span className="text-gray-700 dark:text-gray-300">{tx.account?.name}</span>
                            <span className="text-gray-900 dark:text-gray-100">৳ {Helper.formatLongNumber(tx.amount)}</span>
                        </div>
                    ))}
                </div>
            </div>

            <hr className="border-gray-200 dark:border-gray-700 mb-4" />

            {/* Summary */}
            <div className="text-sm space-y-1 mb-4">
                <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Total</span>
                    <span className="text-gray-900 dark:text-gray-100">৳ {Helper.formatLongNumber(data.amount)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Prev. Balance ({data?.balanceBefore > 0 ? "Payable" : "Receivable"})</span>
                    <span className="text-gray-700 dark:text-gray-300">৳ {Helper.formatLongNumber(Math.abs(data.balanceBefore))}</span>
                </div>
            </div>

            <div className="flex justify-between items-center py-2 px-3 rounded bg-gray-100 dark:bg-gray-700/50 text-sm font-medium mb-6">
                <span className="text-gray-700 dark:text-gray-300">{finalBal > 0 ? "Payable" : "Receivable"}</span>
                <span className={finalBal > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}>
                    ৳ {Helper.formatLongNumber(Math.abs(finalBal))}
                </span>
            </div>

            {/* Signatures */}
            <div className="flex justify-between pt-6">
                <div className="text-center">
                    <div className="border-b border-gray-300 dark:border-gray-600 w-36 mb-1"></div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Authority</p>
                </div>
                <div className="text-center">
                    <div className="border-b border-gray-300 dark:border-gray-600 w-36 mb-1"></div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Receiver</p>
                </div>
            </div>

            {/* Print */}
            <div className="text-center mt-6">
                <button
                    id="no-print"
                    onClick={handlePrint}
                    className="px-5 py-2 bg-[#238b95] hover:bg-[#1d757e] text-white text-sm rounded transition-colors"
                >
                    Print
                </button>
            </div>
        </div>
    );
}

export default PaymentDetails;
