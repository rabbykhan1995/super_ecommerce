import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router"
import api from "../../lib/axios";
import Helper from "../../utils/helper";
import { printInvoice } from "../../utils/globalPrinter";


const TransactionDetails = () => {
    const printRef= useRef(null);
    const { id } = useParams();
    const [data, setData] = useState<any>(null);

    const fetchTransactionDetails = async () => {
        const res = await api(`/transaction/detailsbyID/${id}`);
        if (res.data.success) {
            setData(res.data.data);  // পুরো data object
        }
    }

    useEffect(() => { fetchTransactionDetails() }, [id]);
    const contact = data?.contact;
    const accounts = data?.accounts;
    if (!data) return <div>Loading...</div>;
    const handlePrint = ()=>{
        printInvoice(printRef);
    }
    const isCredit = data.type === "deposit" || data.type === "credit";
    const finalBal = contact?.balance;

    return (
        <div className="px-5 space-y-5" ref={printRef}>
            {/* Header */}
            <div className="flex justify-center items-start">
                <div>
                    <p className="font-medium">Payment Receipt</p>
                    <p className="text-sm">{Helper.formatDate(data.date)}</p>
                    <p>Shokher Bazar</p>
                </div>
              
            </div>
          
            {/* Body */}
            <div className="space-y-3">
                {/* Contact */}
                <h1 className="border-y">Contact Details</h1>
                <div className="flex justify-between text-sm">
                    <span className="">Name</span>
                    <span className="font-medium">{contact?.name}</span>
                </div>
                    <div className="flex justify-between text-sm">
                    <span className="">Address</span>
                    <span className="font-medium max-w-[200px]">{contact?.address}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="">Mobile</span>
                    <span className="font-medium">{contact?.mobile}</span>
                </div>
                <h1 className="border-y">Transaction Accounts</h1>
                {/* Accounts */}
                <div className="space-y-2">
                    {accounts?.map((acc: any, i: number) => (
                        <div key={i} className="flex justify-between py-2 rounded-lg text-sm">
                            <span className="">{isCredit ? acc.toAccount?.name : acc.fromAccount?.name}</span>
                            <span className="font-medium">৳ {acc.amount}</span>
                        </div>
                    ))}
                </div>

                {/* Total + Balance */}
                <div className="flex justify-between text-lg font-medium pt-2 border-t">
                    <span>Total</span>
                    <span>৳ {data.totalAmount}</span>
                </div>
     {/* Total + Balance */}
                <div className="flex justify-between text-lg font-medium pt-2 border-t">
                    <span>Prev. Balance({data?.balanceBefore>0?"Payable":"Recievable"}) </span>
                    <span>৳ {data.balanceBefore}</span>
                </div>

                {/* Balance status */}
                <div className={`rounded-lg flex justify-between text-sm font-medium ${finalBal < 0 ? " text-green-800" : "text-red-800"}`}>
                    <span>{finalBal < 0 ? "Recievable" : "Payable"}</span>
                    <span>৳ {Math.abs(finalBal)}</span>
                </div>
{/* Signature */}
                <div className="flex justify-between mt-10">
                   <div>
                    <h1>Authority Signature</h1>
                    <h1 className="border-b py-5 max-w-[300px]"></h1>
                   </div>
                     <div>
                    <h1>Reciever Signature</h1>
                    <h1 className="border-b py-5 max-w-[300px]"></h1>
                   </div>
                </div>

                <button id="no-print" onClick={handlePrint} className="global_button">
                    Print Receipt
                </button>
            </div>
        </div>
    );
}

export default TransactionDetails