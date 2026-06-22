import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import api from "../../lib/axios";
import Helper from "../../utils/helper";
import { printPOS } from "../../utils/globalPrinter";

type SaleInvoiceModalProps = {
    isOpen: boolean;
    close: () => void;
    saleID: string;
    printSize?: number;
}

export default function SaleInvoiceModal({ isOpen, close, saleID, printSize = 58 }: SaleInvoiceModalProps) {
    const [data, setData] = useState<any>(null);
    const printRef = useRef<HTMLDivElement>(null);

    const fetchSaleDetails = async () => {
        const res = await api(`/sale/saleByID/${saleID}`)
        if (res.data.success === true) {
            setData(res.data.data);
        }
    }

    useEffect(() => {
        if (saleID) {
            fetchSaleDetails()
        }
    }, [saleID]);

    if (!isOpen) {
        return null
    }
    const handlePrint = () => {
        const size = printSize === 58 ? "58mm" : "88mm"
        return printPOS(printRef, size as any);
    }
    return createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            {/* Modal Container */}
            <div ref={printRef} style={{ maxWidth: printSize === 58 ? "58mm" : "80mm" }} className="bg-white dark:bg-[#202020] dark:text-white text-black rounded-lg shadow-xl max-w-md w-full mx-2 overflow-hidden flex flex-col max-h-[90vh] p-2">


                {/* Print Content Area */}
                <div className="overflow-y-auto flex-1">
                    <div

                        className="mx-auto text-xs font-mono leading-relaxed"

                    >
                        {/* Shop Header */}
                        <div className="text-center mb-4">
                            <h2 className="text-base font-bold uppercase tracking-wider">Shokher bajar</h2>
                            <p className="text-[11px] text-gray-600">Nobinagar notun mosjid</p>
                            <p className="text-[11px]">Mobile: 01769546456</p>
                            <div className="text-[10px] mt-1 text-left border-b border-dashed border-gray-400 pb-1">
                                <div>Invoice: {data?.invoiceNo || "N/A"}</div>
                                <div>Date: {data?.SaleDate ? new Date(data.SaleDate).toLocaleDateString() : ""}</div>
                            </div>
                        </div>

                        {/* Product List Header */}
                        <div className="flex justify-between font-bold border-b border-dashed border-gray-400 pb-1 mb-1">
                            <span className="w-1/2">Item Description</span>
                            <span className="w-1/3 text-end">Total</span>
                        </div>

                        {/* Product Items */}
                        <div className="space-y-2 mb-2">
                            {data?.products?.map((row: any, i: number) => (
                                <div key={row._id || i} className="text-[12px]">
                                    <p className="font-medium">
                                        {i + 1}. {row.product?.name} 
                                    </p>
                                    {/* {row.serial && (
                                        <div className="text-[10px] text-gray-600 ml-3">SN: {row.serial}</div>
                                    )} */}
                                    <div className="flex justify-between">
                                        {/* <span>
                                            {row.warranty > 0 ? `[W: ${row.warranty} Days]` : ""}
                                        </span> */}
                                        <div className="flex gap-2">
                                            <span className="">{row.soldQty} {row.product?.unit?.name}</span>
                                            <span>X</span>
                                            <span className="">{Helper.formatLongNumber(row.salePrice)}</span>
                                        </div>
                                        <div>{Helper.formatLongNumber(row.salePrice*row.soldQty)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Calculation Summary */}
                        <div className="border-t border-dashed border-gray-400 pt-1 space-y-0.5 text-[11px]">
                            <div className="flex justify-between">
                                <span>Sub Total:</span>
                                <span>{Helper.formatLongNumber(data?.totalProductPrice || 0)}</span>
                            </div>

                            {!!data?.otherCost && (
                                <div className="flex justify-between">
                                    <span>{data?.costName || "Other Cost"}:</span>
                                    <span>{Helper.formatLongNumber(data.otherCost)}</span>
                                </div>
                            )}

                            {!!data?.discount && (
                                <div className="flex justify-between">
                                    <span>Discount:</span>
                                    <span>-{Helper.formatLongNumber(data.discount)}</span>
                                </div>
                            )}

                            {data?.balanceBefore !== undefined && (
                                <div className="flex justify-between">
                                    <span>{data.balanceBefore < 0 ? "Prev. Due:" : "Paid By Balance:"}</span>
                                    <span>{Helper.formatLongNumber(Math.abs(data.balanceBefore))}</span>
                                </div>
                            )}

                            <div className="flex justify-between font-bold border-t border-dashed border-gray-400 pt-0.5 text-xs">
                                <span>Total Payable:</span>
                                <span>{Helper.formatLongNumber((data?.totalAmount || 0) - (data?.balanceBefore || 0))}</span>
                            </div>

                            {!!data?.paid && (
                                <div className="flex justify-between font-medium">
                                    <span>Total Paid:</span>
                                    <span>{Helper.formatLongNumber(data.paid)}</span>
                                </div>
                            )}

                            {data?.balanceAfter !== undefined && (
                                <div className="flex justify-between font-bold border-t border-dotted border-gray-400 pt-0.5">
                                    <span>{data.balanceAfter < 0 ? "Current Due:" : "Advanced:"}</span>
                                    <span>{Helper.formatLongNumber(Math.abs(data.balanceAfter))}</span>
                                </div>
                            )}
                        </div>

                        {/* Payment History */}
                        {data?.accounts && data.accounts.length > 0 && (
                            <div className="mt-3 text-[10px]">
                                <div className="font-bold border-b border-dotted border-gray-400 pb-0.5 mb-1">Payment Breakdown</div>
                                {data.accounts.map((a: any, i: number) => (
                                    <div key={i} className="flex justify-between text-gray-700">
                                        <span>• {a.name}</span>
                                        <span>{Helper.formatLongNumber(a?.amount)}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Exchange History */}
                        {data?.exchangeAccounts && data.exchangeAccounts.length > 0 && (
                            <div className="mt-2 text-[10px]">
                                <div className="font-bold border-b border-dotted border-gray-400 pb-0.5 mb-1">Exchange History</div>
                                {data.exchangeAccounts.map((a: any, i: number) => (
                                    <div key={i} className="flex justify-between text-gray-700">
                                        <span>• {a.name}</span>
                                        <span>{Helper.formatLongNumber(a?.amount)}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Notes */}
                        {!!data?.note && (
                            <div className="mt-3 text-[10px] bg-gray-50 p-1 rounded border border-dashed border-gray-300">
                                <span className="font-bold">Note:</span> {data.note}
                            </div>
                        )}

                        {/* Footer Message */}
                        <div className="text-center mt-5 text-[10px] tracking-wider border-t border-dashed border-gray-400 pt-2">
                            Thank You For Shopping!
                        </div>
                    </div>
                </div>
                <div id="no-print" className="flex gap-2 mt-2">
                    <button
                        onClick={close}
                        className="global_button_red w-1/2"
                    >
                        Close
                    </button>

                    <button
                        onClick={handlePrint}
                        className="global_button w-1/2"
                    >
                        Print
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}