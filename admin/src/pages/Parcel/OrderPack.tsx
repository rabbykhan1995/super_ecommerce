import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import Select from "react-select";
import { getReactSelectStyles } from "../../utils/reactSelectStyles";
import { Calendar } from "lucide-react";
import DatePicker from "react-datepicker";
import { createPortal } from "react-dom";
import "react-datepicker/dist/react-datepicker.css";
import Helper from "../../utils/helper";
import Table from "../../components/tables/Table";
import PaymentByAccounts from "../../components/Ui/PaymentOption";
import SerialPickerModal from "../../components/modals/SerialPickerModal";
import type {
  AccountOption,
  Batch,
  Order,
  SelectOption,
} from "../../types/type";

const COURIER_OPTIONS = [
  { value: "Steadfast", label: "Steadfast" },
  { value: "Pathao", label: "Pathao" },
  { value: "Paperfly", label: "Paperfly" },
  { value: "Sundarban", label: "Sundarban" },
  { value: "SA Paribahan", label: "SA Paribahan" },
  { value: "Javex", label: "Javex" },
  { value: "Ecourier", label: "Ecourier" },
  { value: "Custom", label: "Custom" },
];

const PARCEL_TYPE_OPTIONS = [
  { value: "local", label: "Local" },
  { value: "international", label: "International" },
];

type EnrichedItem = {
  orderItemID: number;
  productID: number;
  variantID: number;
  productName: string;
  quantity: number;
  salePrice: number;
  lineTotal: number;
  manageWarranty: boolean;
  manageStock: boolean;
  selectedSerials: SelectOption<Batch>[];
  selectedBatch: SelectOption<Batch> | null;
  batches: SelectOption<Batch>[];
  serials: SelectOption<Batch>[];
};

type OrderWithItems = Order & {
  items: {
    id: number;
    orderID: number;
    productID: number;
    variantID: number;
    salePrice: number;
    quantity: number;
    lineTotal: number;
    serial: string | null;
  }[];
};

export default function OrderPack() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<EnrichedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [serialModalIdx, setSerialModalIdx] = useState<number | null>(null);

  const [parcelType, setParcelType] = useState<SelectOption | null>(
    PARCEL_TYPE_OPTIONS[0]
  );
  const [selectedCourier, setSelectedCourier] = useState<SelectOption | null>(
    null
  );
  const [customCourier, setCustomCourier] = useState("");
  const [note, setNote] = useState("");
  const [parcelDate, setParcelDate] = useState<Date>(new Date());
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [codAmount, setCodAmount] = useState<number>(0);
  const [dueAmount, setDueAmount] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);

  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<AccountOption[]>([]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/order/admin-order/${id}`);
      if (res.data.success) {
        const orderData: OrderWithItems = res.data.data;
        setOrder(orderData);
        setDiscount(orderData.discount || 0);

        // Enrich items with product data
        const enriched: EnrichedItem[] = [];
        for (const oi of orderData.items) {
          try {
            const pRes = await api.get(
              `/product/getSaleProduct/${oi.productID}/${oi.variantID}`
            );
            if (pRes.data.success) {
              const productData = pRes.data.data;
              enriched.push({
                orderItemID: oi.id,
                productID: oi.productID,
                variantID: oi.variantID,
                productName: productData.name || `Product #${oi.productID}`,
                quantity: Number(oi.quantity),
                salePrice: Number(oi.salePrice),
                lineTotal: Number(oi.lineTotal),
                manageWarranty: productData.manageWarranty || false,
                manageStock: productData.manageStock ?? true,
                selectedSerials: [],
                selectedBatch: null,
                batches: productData.batches || [],
                serials: productData.serials || [],
              });
            } else {
              enriched.push({
                orderItemID: oi.id,
                productID: oi.productID,
                variantID: oi.variantID,
                productName: `Product #${oi.productID}`,
                quantity: Number(oi.quantity),
                salePrice: Number(oi.salePrice),
                lineTotal: Number(oi.lineTotal),
                manageWarranty: false,
                manageStock: true,
                selectedSerials: [],
                selectedBatch: null,
                batches: [],
                serials: [],
              });
            }
          } catch {
            enriched.push({
              orderItemID: oi.id,
              productID: oi.productID,
              variantID: oi.variantID,
              productName: `Product #${oi.productID}`,
              quantity: Number(oi.quantity),
              salePrice: Number(oi.salePrice),
              lineTotal: Number(oi.lineTotal),
              manageWarranty: false,
              manageStock: true,
              selectedSerials: [],
              selectedBatch: null,
              batches: [],
              serials: [],
            });
          }
        }

        // Auto-select first batch for non-warranty stock items
        for (let i = 0; i < enriched.length; i++) {
          const ei = enriched[i];
          if (ei.manageStock && !ei.manageWarranty && ei.batches.length > 0 && !ei.selectedBatch) {
            enriched[i] = { ...ei, selectedBatch: ei.batches[0] };
          }
        }

        setItems(enriched);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load order");
      navigate("/parcel/pending");
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const res = await api.get("/account/list");
      if (res.data.success) {
        const formatted: AccountOption[] = res.data.data.map(
          (a: any) => ({
            ...a,
            label: a.name,
            value: a.id,
            amount: 0,
            type: "Debit",
          })
        );
        const defaultAcc = formatted.find((a) => a.isDefault === true);
        const rest = formatted.filter((a) => a.isDefault !== true);
        setAccounts(rest);
        if (defaultAcc) {
          setSelectedAccounts([defaultAcc]);
        }
      }
    } catch {
      // silent
    }
  };

  useEffect(() => {
    Promise.all([fetchOrder(), fetchAccounts()]);
  }, [id]);

  const handleSerialSelect = (idx: number, selected: SelectOption<Batch>[]) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === idx ? { ...item, selectedSerials: selected } : item
      )
    );
  };

  const courierName =
    selectedCourier?.value === "Custom"
      ? customCourier
      : selectedCourier?.value || "";

  const totalProductPrice = items.reduce(
    (sum, item) => sum + item.salePrice * item.quantity,
    0
  );

  const paidWithAcc = selectedAccounts.reduce(
    (acc, a) => acc + (a.amount || 0),
    0
  );

  const allValid = items.every((item) => {
    if (item.manageWarranty) return item.selectedSerials.length >= item.quantity;
    if (item.manageStock && !item.manageWarranty) return item.selectedBatch !== null;
    return true;
  });

  const submitOrderPack = async () => {
    if (items.length === 0) {
      return toast.error("No items to pack");
    }

    if (!allValid) {
      return toast.error("Please select serial/batch for all items");
    }

    if (!parcelDate) {
      return toast.error("Parcel date is required");
    }

    const payload = {
      orderID: Number(id),
      items: items.map((item) => {
        const itemPayload: any = {
          productID: item.productID,
          variantID: item.variantID,
          quantity: item.quantity,
          salePrice: item.salePrice,
        };

        if (item.manageWarranty && item.selectedSerials.length > 0) {
          itemPayload.batchID = item.selectedSerials[0].value;
        } else if (item.selectedBatch) {
          itemPayload.batchID = item.selectedBatch.value;
        }

        return itemPayload;
      }),
      paid: paidWithAcc,
      discount,
      note: note || null,
      costName: null,
      accounts: selectedAccounts
        .filter((a) => a.amount > 0)
        .map((a) => ({
          accountID: Number(a.value),
          amount: a.amount,
        })),
      exchangeAccounts: [],
      parcelType: parcelType?.value || "local",
      courierName: courierName || null,
      shippingCost: Number(shippingCost) || 0,
      codAmount: Number(codAmount) || 0,
      dueAmount: Number(dueAmount) || 0,
      parcelDate,
    };

    try {
      const res = await api.post("/parcel/order-pack", payload);
      if (res.data.success) {
        toast.success(res.data.msg || "Order packed successfully!");
        navigate("/parcel/list");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error packing order");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="text-gray-500">Loading order...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="text-red-500">Order not found</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Order Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 bg-white dark:bg-[#1E2939] rounded-lg">
        <div>
          <span className="text-xs text-gray-500">Order ID</span>
          <p className="font-medium">#{order.id}</p>
        </div>
        <div>
          <span className="text-xs text-gray-500">Customer</span>
          <p className="font-medium">{order.user?.name || "N/A"}</p>
        </div>
        <div>
          <span className="text-xs text-gray-500">Shipping Address</span>
          <p className="font-medium text-sm">{order.shippingAddress}</p>
        </div>
        <div>
          <span className="text-xs text-gray-500">Payment Method</span>
          <p className="font-medium capitalize">
            {order.paymentMethod || "N/A"}
          </p>
        </div>
        <div>
          <span className="text-xs text-gray-500">Order Total</span>
          <p className="font-medium">
            {Helper.formatLongNumber(order.totalAmount)}
          </p>
        </div>
        <div>
          <span className="text-xs text-gray-500">Status</span>
          <p className="font-medium">{order.status}</p>
        </div>
      </div>

      {/* Items Table */}
      <div>
        <h3 className="text-sm font-semibold mb-2">Order Items</h3>
        <Table
          data={items}
          keyExtractor={(row, i) => `${row.orderItemID}-${i}`}
          columns={[
            {
              header: "#",
              accessor: (_, i) => (i ?? 0) + 1,
              className: "w-10 text-center",
              headerClassName: "text-center",
            },
            {
              header: "Product",
              accessor: "productName",
              headerClassName: "text-left",
            },
            {
              header: "Qty",
              accessor: "quantity",
              className: "text-center",
              headerClassName: "text-center",
            },
            {
              header: "Price",
              accessor: (row) => Helper.formatLongNumber(row.salePrice),
              className: "text-center",
              headerClassName: "text-center",
            },
            {
              header: "Total",
              accessor: (row) => Helper.formatLongNumber(row.lineTotal),
              className: "text-center",
              headerClassName: "text-center",
            },
            {
              header: "Batch / Serial",
              className: "min-w-44",
              headerClassName: "text-center",
              accessor: (row, i) => {
                // Serial product
                if (row.manageWarranty) {
                  const selectedCount = row.selectedSerials.length;
                  return (
                    <div className="flex flex-col items-center gap-1">
                      <button
                        className="global_button text-xs px-3 py-1"
                        onClick={() => setSerialModalIdx(i as number)}
                      >
                        {selectedCount > 0
                          ? `${selectedCount} selected`
                          : "Select Serial"}
                      </button>
                      {selectedCount > 0 && (
                        <span className="text-xs text-gray-500">
                          {row.selectedSerials
                            .map((s) => s.serial || s.label)
                            .join(", ")}
                        </span>
                      )}
                    </div>
                  );
                }

                // Normal stock product
                if (row.manageStock && !row.manageWarranty) {
                  if (row.batches.length === 0) {
                    return (
                      <span className="text-xs text-red-500">No stock</span>
                    );
                  }
                  return (
                    <span className="text-xs text-green-600">
                      Auto (FIFO)
                    </span>
                  );
                }

                // No stock management
                return (
                  <span className="text-xs text-gray-500">N/A</span>
                );
              },
            },
          ]}
        />
      </div>

      {/* Serial Picker Modal */}
      {serialModalIdx !== null && items[serialModalIdx] && (
        <SerialPickerModal
          productID={items[serialModalIdx].productID}
          variantID={items[serialModalIdx].variantID}
          productName={items[serialModalIdx].productName}
          requiredQty={items[serialModalIdx].quantity}
          selectedBatchIDs={items.flatMap((it) =>
            it.selectedSerials.map((s) => s.value as unknown as number)
          )}
          onSave={(selected) => handleSerialSelect(serialModalIdx, selected)}
          onClose={() => setSerialModalIdx(null)}
        />
      )}

      {/* Summary + Payment + Parcel Details */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Note + Parcel Details */}
        <div className="flex-1 space-y-4">
          {/* Note */}
          <div>
            <label className="block mb-1 font-medium text-sm">Note</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="global_input w-full"
              rows={2}
              placeholder="Optional note"
            />
          </div>

          {/* Parcel Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Parcel Type */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">
                Parcel Type <span className="text-red-500">*</span>
              </label>
              <Select
                options={PARCEL_TYPE_OPTIONS}
                value={parcelType}
                onChange={(val) => setParcelType(val as SelectOption | null)}
                placeholder="Select type"
                isClearable={false}
                styles={getReactSelectStyles<SelectOption>()}
              />
            </div>

            {/* Courier */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Courier</label>
              <Select
                options={COURIER_OPTIONS}
                value={selectedCourier}
                onChange={(val) =>
                  setSelectedCourier(val as SelectOption | null)
                }
                placeholder="Select courier"
                isClearable
                styles={getReactSelectStyles<SelectOption>()}
              />
            </div>

            {selectedCourier?.value === "Custom" && (
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">
                  Custom Courier
                </label>
                <input
                  value={customCourier}
                  onChange={(e) => setCustomCourier(e.target.value)}
                  className="global_input"
                  placeholder="Enter courier name"
                />
              </div>
            )}

            {/* Parcel Date */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Parcel Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Calendar className="w-4 h-4 text-gray-400" />
                </div>
                <DatePicker
                  selected={parcelDate}
                  onChange={(date: Date | null) =>
                    setParcelDate(date as Date)
                  }
                  dateFormat="dd-MM-yyyy"
                  className="global_input pl-10 w-full"
                  popperPlacement="bottom"
                  popperClassName="z-[9999]"
                  calendarClassName="react-datepicker-custom"
                  popperContainer={(props) =>
                    createPortal(<div {...props} />, document.body)
                  }
                />
              </div>
            </div>

            {/* Shipping Cost */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Shipping Cost</label>
              <input
                type="number"
                value={shippingCost || ""}
                onChange={(e) => setShippingCost(Number(e.target.value))}
                className="global_input"
                placeholder="0"
                min={0}
              />
            </div>

            {/* COD Amount */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">COD Amount</label>
              <input
                type="number"
                value={codAmount || ""}
                onChange={(e) => setCodAmount(Number(e.target.value))}
                className="global_input"
                placeholder="0"
                min={0}
              />
            </div>

            {/* Due Amount */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Due Amount</label>
              <input
                type="number"
                value={dueAmount || ""}
                onChange={(e) => setDueAmount(Number(e.target.value))}
                className="global_input"
                placeholder="0"
                min={0}
              />
            </div>
          </div>
        </div>

        {/* Right: Summary + Payment */}
        <div className="flex-1 space-y-3">
          {/* Summary */}
          <div className="flex justify-between">
            <label>Total Product Price:</label>
            <input
              type="number"
              value={totalProductPrice.toFixed(2)}
              disabled
              className="global_input w-40 rounded-sm cursor-not-allowed text-right"
            />
          </div>
          <div className="flex justify-between">
            <label>Discount:</label>
            <input
              type="number"
              value={discount || ""}
              onChange={(e) =>
                setDiscount(Number(e.target.value) || 0)
              }
              className="global_input w-40 rounded-sm text-right"
              min={0}
            />
          </div>
          <div className="flex justify-between font-medium border-t pt-2">
            <label>Total Amount:</label>
            <input
              type="number"
              value={(totalProductPrice - discount).toFixed(2)}
              disabled
              className="global_input w-40 rounded-sm cursor-not-allowed text-right"
            />
          </div>

          {/* Payment */}
          <PaymentByAccounts
            accounts={accounts}
            setAccounts={setAccounts}
            selectedAccounts={selectedAccounts}
            setSelectedAccounts={setSelectedAccounts}
          />

          <div className="flex justify-between">
            <label>Total Paid:</label>
            <input
              type="number"
              value={paidWithAcc.toFixed(2)}
              disabled
              className="global_input w-40 rounded-sm cursor-not-allowed text-right text-green-500"
            />
          </div>

          {/* Submit */}
          <button
            type="button"
            className="global_button w-full mt-4"
            onClick={submitOrderPack}
          >
            Create Parcel (Order Pack)
          </button>
        </div>
      </div>
    </div>
  );
}
