import { useEffect, useState } from "react";
import api from "../../lib/axios";
import type { PaginatedResult, SaleForParcel, SelectOption, SearchParams } from "../../types/type";
import Select from "react-select";
import { getReactSelectStyles } from "../../utils/reactSelectStyles";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { Calendar } from "lucide-react";
import DatePicker from "react-datepicker";
import { createPortal } from "react-dom";
import "react-datepicker/dist/react-datepicker.css";
import Helper from "../../utils/helper";

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

export default function CreateParcel() {
  const navigate = useNavigate();

  const [saleParams, setSaleParams] = useState<SearchParams>({
    search: "",
    page: 1,
    limit: 50,
  });
  const [saleOptions, setSaleOptions] = useState<SelectOption<SaleForParcel>[]>([]);
  const [selectedSale, setSelectedSale] = useState<SelectOption<SaleForParcel> | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [address, setAddress] = useState("");
  const [useCustomAddress, setUseCustomAddress] = useState(false);

  const [parcelType, setParcelType] = useState<SelectOption | null>(
    PARCEL_TYPE_OPTIONS[0]
  );
  const [selectedCourier, setSelectedCourier] = useState<SelectOption | null>(null);
  const [customCourier, setCustomCourier] = useState("");
  const [thirdPartyTrackingNo, setThirdPartyTrackingNo] = useState("");
  const [localParcelNo, setLocalParcelNo] = useState("");
  const [note, setNote] = useState("");
  const [parcelDate, setParcelDate] = useState<Date>(new Date());
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [codAmount, setCodAmount] = useState<number>(0);
  const [dueAmount, setDueAmount] = useState<number>(0);

  const fetchSales = async () => {
    const res = await api("/sale/list", {
      params: { search: saleParams.search, limit: saleParams.limit, page: saleParams.page },
    });
    if (res.data.success) {
      const items = res.data.data.items;
      setSaleOptions(
        items.map((s: any) => ({
          value: s.id,
          label: `Invoice #${s.invoiceNo} - ${s.customer?.name || "Walking Customer"}`,
          ...s,
        }))
      );
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchSales(), 400);
    return () => clearTimeout(timer);
  }, [saleParams.search]);

  const handleSaleChange = async (val: SelectOption<SaleForParcel> | null) => {
    setSelectedSale(val);
    if (val && val.customerID) {
      try {
        const res = await api(`/contact/contactByID/${val.customerID}`);
        if (res.data.success) {
          const c = res.data.data;
          setCustomerName(c.name || "");
          setCustomerMobile(c.mobile || "");
          if (c.address && !useCustomAddress) {
            setAddress(c.address);
          }
        }
      } catch {
        setCustomerName("");
        setCustomerMobile("");
      }
    } else {
      setCustomerName("");
      setCustomerMobile("");
      setAddress("");
    }
  };

  const courierName =
    selectedCourier?.value === "Custom" ? customCourier : selectedCourier?.value || "";

  const createParcel = async () => {
    if (!selectedSale) {
      return toast.error("Please select a sale");
    }
    if (!address.trim()) {
      return toast.error("Address is required");
    }
    if (!parcelType) {
      return toast.error("Please select parcel type");
    }

    const payload = {
      saleID: selectedSale.value,
      address: address.trim(),
      parcelType: parcelType.value,
      courierName: courierName || null,
      thirdPartyTrackingNo: thirdPartyTrackingNo || null,
      localParcelNo: localParcelNo || null,
      note: note || null,
      shippingCost: Number(shippingCost) || 0,
      codAmount: Number(codAmount) || 0,
      dueAmount: Number(dueAmount) || 0,
      parcelDate,
    };

    try {
      const res = await api.post("/parcel/create", payload);
      if (res.data.success === true) {
        toast.success(res.data.msg || "Parcel created successfully!");
        navigate("/parcel/list");
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Error creating parcel";
      toast.error(errorMsg);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Sale Select */}
        <div className="flex flex-col">
          <label className="block text-sm font-medium mb-1">
            Select Sale <span className="text-red-500">*</span>
          </label>
          <Select
            options={saleOptions}
            value={selectedSale}
            onChange={handleSaleChange}
            onInputChange={(e) => setSaleParams((prev) => ({ ...prev, search: e }))}
            placeholder="Search by invoice number..."
            filterOption={() => true}
            isClearable
            styles={getReactSelectStyles<SelectOption<SaleForParcel>>()}
          />
        </div>

        {/* Parcel Type */}
        <div className="flex flex-col">
          <label className="block text-sm font-medium mb-1">
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

        {/* Customer Name (auto-filled) */}
        <div className="flex flex-col">
          <label className="block text-sm font-medium mb-1">Customer Name</label>
          <input
            value={customerName}
            readOnly
            className="global_input bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
            placeholder="Auto-filled from sale"
          />
        </div>

        {/* Customer Mobile */}
        <div className="flex flex-col">
          <label className="block text-sm font-medium mb-1">Customer Mobile</label>
          <input
            value={customerMobile}
            readOnly
            className="global_input bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
            placeholder="Auto-filled from sale"
          />
        </div>

        {/* Address */}
        <div className="flex flex-col lg:col-span-2">
          <div className="flex items-center gap-2 mb-1">
            <label className="block text-sm font-medium">
              Delivery Address <span className="text-red-500">*</span>
            </label>
            {customerName && (
              <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!useCustomAddress}
                  onChange={() => {
                    setUseCustomAddress(false);
                    // re-fetch address if needed
                  }}
                  className="rounded"
                />
                Use contact address
              </label>
            )}
          </div>
          <textarea
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              setUseCustomAddress(true);
            }}
            className="global_input"
            rows={3}
            placeholder="Enter delivery address"
          />
        </div>

        {/* Courier Name */}
        <div className="flex flex-col">
          <label className="block text-sm font-medium mb-1">Courier Name</label>
          <Select
            options={COURIER_OPTIONS}
            value={selectedCourier}
            onChange={(val) => setSelectedCourier(val as SelectOption | null)}
            placeholder="Select courier"
            isClearable
            styles={getReactSelectStyles<SelectOption>()}
          />
        </div>

        {/* Custom Courier (if Custom selected) */}
        {selectedCourier?.value === "Custom" && (
          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-1">Custom Courier Name</label>
            <input
              value={customCourier}
              onChange={(e) => setCustomCourier(e.target.value)}
              className="global_input"
              placeholder="Enter courier name"
            />
          </div>
        )}

        {/* Third Party Tracking No */}
        <div className="flex flex-col">
          <label className="block text-sm font-medium mb-1">Third Party Tracking No</label>
          <input
            value={thirdPartyTrackingNo}
            onChange={(e) => setThirdPartyTrackingNo(e.target.value)}
            className="global_input"
            placeholder="e.g., SF-123456789"
          />
        </div>

        {/* Local Parcel No */}
        <div className="flex flex-col">
          <label className="block text-sm font-medium mb-1">Local Parcel No</label>
          <input
            value={localParcelNo}
            onChange={(e) => setLocalParcelNo(e.target.value)}
            className="global_input"
            placeholder="Internal parcel number"
          />
        </div>

        {/* Parcel Date */}
        <div className="relative w-full">
          <label className="block text-sm font-medium mt-1 mb-1">Parcel Date</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Calendar className="w-4 h-4 text-gray-400" />
            </div>
            <DatePicker
              selected={parcelDate}
              onChange={(date: Date | null) => setParcelDate(date as Date)}
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

        {/* Spacer for grid alignment */}
        <div></div>

        {/* Shipping Cost */}
        <div className="flex flex-col">
          <label className="block text-sm font-medium mb-1">Shipping Cost</label>
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
          <label className="block text-sm font-medium mb-1">COD Amount</label>
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
          <label className="block text-sm font-medium mb-1">Due Amount</label>
          <input
            type="number"
            value={dueAmount || ""}
            onChange={(e) => setDueAmount(Number(e.target.value))}
            className="global_input"
            placeholder="0"
            min={0}
          />
        </div>

        {/* Note */}
        <div className="flex flex-col lg:col-span-2">
          <label className="block text-sm font-medium mb-1">Note</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="global_input"
            rows={2}
            placeholder="Optional note"
          />
        </div>
      </div>

      <div>
        <button type="button" className="global_button" onClick={createParcel}>
          Create Parcel
        </button>
      </div>
    </div>
  );
}
