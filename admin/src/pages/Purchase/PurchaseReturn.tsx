import { useEffect, useState } from "react";
import api from "../../lib/axios";
import type { Account, AccountOption, PurchaseReturnProduct } from "../../types/type";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router";
import { Calendar } from "lucide-react";
import DatePicker from "react-datepicker";
import { createPortal } from "react-dom";
import "react-datepicker/dist/react-datepicker.css";
import Table from "../../components/tables/Table";
import PaymentByAccounts from "../../components/Ui/PaymentOption";
import { useSignal } from "@preact/signals-react";
import { useSignals } from "@preact/signals-react/runtime";

export default function PurchaseReturn() {
  useSignals();
  const selectedProducts = useSignal<PurchaseReturnProduct[]>([]);
  const { id } = useParams();
  const navigate = useNavigate();

  const [purchase, setPurchase] = useState<any | null>(null);
  const [purchaseReturnDate, setPurchaseReturnDate] = useState<Date>(new Date());
  const [note, setNote] = useState<string>("");
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<AccountOption[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPurchase = async () => {
    const purchaseRes = await api(`/purchase/purchaseInvoiceByID/${id}`);

    if (purchaseRes.data.success) {
      const data = purchaseRes.data.data;
      setPurchase(data);

      selectedProducts.value = (data.batches || []).map((b: any) => ({
        ...b,
        name: b.product?.name ?? "",
        qty: 1,
        selected: false,
        serials: b.serial ? [b.serial] : [],
        selectedSerials: [],
      }));
    }
  };

  const fetchAccounts = async () => {
    const res = await api("/account/list");
    if (res.data.success) {
      const formatted: AccountOption[] = res.data.data.map((a: Account) => ({
        ...a,
        label: a.name,
        value: String(a.id),
        amount: 0,
      }));
      const defaultAccount = formatted.find((a) => a.default === true);
      const rest = formatted.filter((a) => a.default !== true);
      setAccounts(rest);
      if (defaultAccount) setSelectedAccounts([defaultAccount]);
    }
  };

  useEffect(() => {
    Promise.all([fetchPurchase(), fetchAccounts()]);
  }, [id]);

  // checkbox toggle
  const toggleSelect = (id: number) => {
    selectedProducts.value = selectedProducts.value.map((p) =>
      p.id === id ? { ...p, selected: !p.selected } : p
    );
  };

  // qty change
  const handleQtyChange = (id: number, value: number) => {
    selectedProducts.value = selectedProducts.value.map((p) =>
      p.id === id ? { ...p, qty: value } : p
    );
  };

  // calculated values
  const selectedOnly = selectedProducts.value.filter((p) => p.selected);

  const totalReturnAmount = selectedOnly.reduce(
    (acc, p) => acc + p.qty * p.cost, 0
  );
  const paid = selectedAccounts.reduce((acc, a) => acc + (a.amount || 0), 0);
  const supplierBalance = purchase?.supplier?.balance ?? 0;

  const handleSubmit = async () => {
    if (selectedOnly.length === 0) return toast.error("Please select at least one product");

    for (const p of selectedOnly) {
      if (p.qty <= 0) return toast.error(`Return qty must be greater than 0 for ${p.name}`);
      if (p.qty > p.remainingQty) return toast.error(`Max returnable qty is ${p.remainingQty} for ${p.name}`);
    }
    

    const payload = {
      purchaseID: id as string,
      note,
      paid,
      discount: 0,
      date: purchaseReturnDate,
      batches: selectedOnly.map((p) => ({
        batchID: p.id,
        purchaseReturnQty: p.qty,
      })),
      accounts: selectedAccounts.map((a) => ({
        accountID: a.value,
        amount: a.amount,
      })),
    };

    try {
      setLoading(true);
      const res = await api.post("/purchase-return/create", payload);
      if (res.data.success) {
        toast.success("Purchase return successful");
        navigate(`/purchase/return/invoice/${res.data.data.id}`);
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!purchase) return <div className="p-6 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Supplier</label>
          <input
            type="text"
            value={purchase?.supplier?.name ?? ""}
            disabled
            className="global_input w-full cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Original Invoice</label>
          <input
            type="text"
            value={purchase?.invoiceNo ?? ""}
            disabled
            className="global_input w-full cursor-not-allowed"
          />
        </div>
        <div className="relative w-full">
          <label className="block text-sm font-medium mb-1">Return Date</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Calendar className="w-4 h-4 text-gray-400" />
            </div>
            <DatePicker
              selected={purchaseReturnDate}
              onChange={(date: Date | null) => setPurchaseReturnDate(date as Date)}
              dateFormat="dd-MM-yyyy"
              className="global_input pl-10 w-full"
              popperPlacement="bottom"
              popperClassName="z-[9999]"
              calendarClassName="react-datepicker-custom"
              popperContainer={(props) => createPortal(<div {...props} />, document.body)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <Table
        data={selectedProducts.value}
        keyExtractor={(row) => row.id}
        columns={[
          {
            header: "Select",
            className: "w-10 text-center",
            headerClassName: "text-center",
            accessor: (row) => (
              <input
                type="checkbox"
                checked={!!row.selected}
                onChange={() => toggleSelect(row.id)}
                className="w-4 h-4 cursor-pointer"
              />
            ),
          },
          {
            header: "Name",
            className: "",
            headerClassName: "",
            accessor: (row) => <h1>{row.product?.name} {!!row.serial && <span>{row.serial}</span>}</h1>,
          },
          {
            header: "Purchase Price",
            className: "text-center",
            headerClassName: "text-center",
            accessor: (row) => <span>৳{row.cost}</span>,
          },
          {
            header: "Purchased",
            className: "text-center",
            headerClassName: "text-center",
            accessor: (row) => <span>{row.purchasedQty}</span>,
          },
          {
            header: "Returnable",
            className: "text-center",
            headerClassName: "text-center",
            accessor: (row) => (
              <span className="text-green-600 font-medium">{row.remainingQty}</span>
            ),
          },
          {
            header: "Return Qty",
            className: "text-center",
            headerClassName: "text-center",
            accessor: (row) => {
              if (!row.selected) return <span className="text-gray-300">—</span>;
              // serial product হলে qty fixed = serials count
              if (row.serial) return <span>{row.qty}</span>;
              return (
                <input
                  type="number"
                  value={row.qty === 0 ? "" : row.qty}
                  onChange={(e) => {
                    const val = e.target.value === "" ? 0 : Number(e.target.value);
                    if (val > row.remainingQty) return toast.error(`Max returnable qty is ${row.remainingQty}`);
                    handleQtyChange(row.id, val);
                  }}
                  max={row.remainingQty}
                  min={1}
                  className="global_input text-center w-20"
                />
              );
            },
          },
          {
            header: "Total",
            className: "text-center",
            headerClassName: "text-center",
            accessor: (row) => {
              if (!row.selected) return <span className="text-gray-300">—</span>;
              return <span>৳{(row.qty * row.cost).toFixed(2)}</span>;
            },
          },
        ]}
      />

      {/* Summary + Note */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <label className="block mb-2 font-medium">Note</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="global_input min-h-[150px] w-full"
            placeholder="Optional note..."
          />
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex justify-between">
            <label>Total Return Amount:</label>
            <input type="number" value={totalReturnAmount.toFixed(2)} disabled
              className="global_input w-40 cursor-not-allowed text-right" />
          </div>

          {supplierBalance > 0 && (
            <div className="flex justify-between">
              <label>My Due to Supplier:</label>
              <input type="number" value={supplierBalance.toFixed(2)} disabled
                className="global_input w-40 cursor-not-allowed text-right text-red-500" />
            </div>
          )}
          {supplierBalance < 0 && (
            <div className="flex justify-between">
              <label>Advance (Receivable):</label>
              <input type="number" value={Math.abs(supplierBalance).toFixed(2)} disabled
                className="global_input w-40 cursor-not-allowed text-right text-green-500" />
            </div>
          )}

          <PaymentByAccounts
            accounts={accounts}
            setAccounts={setAccounts}
            selectedAccounts={selectedAccounts}
            setSelectedAccounts={setSelectedAccounts}
          />

          <div className="flex justify-between">
            <label>Paying Now:</label>
            <input type="number" value={paid.toFixed(2)} disabled
              className="global_input w-40 cursor-not-allowed text-right text-green-500" />
          </div>

          {(() => {
            const remaining = totalReturnAmount - paid;
            if (remaining > 0) return (
              <div className="flex justify-between font-semibold border-t pt-2">
                <label>Supplier Still Owes:</label>
                <input type="number" value={remaining.toFixed(2)} disabled
                  className="global_input w-40 cursor-not-allowed text-right text-orange-500" />
              </div>
            );
            if (remaining < 0) return (
              <div className="flex justify-between font-semibold border-t pt-2">
                <label>Overpaid:</label>
                <input type="number" value={Math.abs(remaining).toFixed(2)} disabled
                  className="global_input w-40 cursor-not-allowed text-right text-green-500" />
              </div>
            );
            return null;
          })()}
        </div>
      </div>

      <div>
        <button
          type="button"
          className="global_button"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Processing..." : "Confirm Return"}
        </button>
      </div>
    </div>
  );
}