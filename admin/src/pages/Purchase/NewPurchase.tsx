import { useEffect, useState } from "react";
import api from "../../lib/axios";
import type { Account, Contact, PurchaseProduct, SelectOption, VariantListItem } from "../../types/type";
import Select from "react-select";
import { getReactSelectStyles } from "../../utils/reactSelectStyles";

import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import type { SearchParams, AccountOption } from "../../types/type";
import { Calendar } from "lucide-react";
import DatePicker from "react-datepicker";
import { createPortal } from "react-dom";
import "react-datepicker/dist/react-datepicker.css";
import Table from "../../components/tables/Table";
import { useSignal } from "@preact/signals-react";
import { useSignals } from "@preact/signals-react/runtime";
import SerialModal from "../../components/modals/SerialModal";
import { createPurchaseSchema } from "../../validators/purchase.validator";
import PaymentByAccounts from "../../components/Ui/PaymentOption";

export default function NewPurchase() {
    useSignals();
    const navigate = useNavigate();
    const [contactParams, setContactParams] = useState<SearchParams>({
        search: "",
        page: 1,
        limit: 50,
    });
    const [productParams, setProductParams] = useState<SearchParams>({
        search: "",
        page: 1,
        limit: 50,
    });
    const [barcode, setBarcode] = useState<string>("");
    const [variants, setVariants] = useState<SelectOption<VariantListItem>[]>([]);
    const [suppliers, setSuppliers] = useState<SelectOption<Contact>[]>([]);
    const [selectedSupplier, setSelectedSupplier] = useState<SelectOption<Contact> | null>(null);
    const [purchaseDate, setPurchaseDate] = useState<Date>(new Date());
    const selectedProducts = useSignal<PurchaseProduct[]>([]);
    // serial is open with index, if index exist it open
    const [serialModal, setSerialModal] = useState<number | null>(null);
    const [costName, setCostName] = useState<string | null>("");
    const [otherCost, setOtherCost] = useState<number>(0);
    const [discount, setDiscount] = useState<number>(0);
    const [discountPercent, setDiscountPercent] = useState<number>(0);
    const [note, setNote] = useState<string | null>("");
    const [accounts, setAccounts] = useState<AccountOption[]>([]);
    const [selectedAccounts, setSelectedAccounts] = useState<AccountOption[]>([]);
    const [isExchanging, setIsExchanging] = useState<boolean>(false);
    const [exchangeAccounts, setExchangeAccounts] = useState<AccountOption[]>([]);
    const [selectedExchangeAccounts, setSelectedExchangeAccounts] = useState<AccountOption[]>([]);

    const fetchVariants = async () => {
        const res = await api("/product/variant-list", {
            params: { search: productParams.search, limit: productParams.limit, page: productParams.page },
        });

        if (res.data.success)
            setVariants(
                res.data.data.items.map((u: VariantListItem) => ({ value: u.id, label: `${u.product.name}(${u.attributes.map(a=> `${a.name}-${a.value}`)})`, ...u }))
            );
    };
    const fetchContacts = async () => {
        const res = await api("/contact/list", {
            params: { search: contactParams.search, limit: contactParams.limit, page: contactParams.page, type: "supplier" },
        });
        if (res.data.success) setSuppliers(
            res.data.data.items.map((u: Contact) => ({ value: u.id, label: `${u.name} balance(${u.balance})`, ...u }))
        );;
    };
    const fetchAccount = async () => {
        const res = await api("/account/list");
        if (res.data.success) {
            const formatted: AccountOption[] = res.data.data.map((a: Account) => ({
                ...a,
                label: a.name,
                value: a.id,
                amount: 0,
                type: "Debit"
            }));

            // default account আলাদা করো
            const defaultAccount = formatted.find((a) => a.isDefault === true);
            const rest = formatted.filter((a) => a.isDefault !== true);

            setAccounts(rest);
            setExchangeAccounts(rest);
            if (defaultAccount) {
                setSelectedAccounts([defaultAccount]);
                setSelectedExchangeAccounts([defaultAccount])
            };
        }
    };
    const fetchProductWithBarcode = async (barcode: string) => {
        const res = await api("/product/productByBarcode", {
            params: { barcode },
        });
        if (res.data.success) {
            const p = res.data.data;

            const product = { value: p.id, label: p.name, ...p };
            return handleAddProduct(product)
        } else {
            return toast.error("No Product Found with This barcode")
        }

    };
   const handleAddProduct = (p: SelectOption<VariantListItem>) => {
    // if product's manage stock is disabled, means manageStock === false;
    if (!p.product.manageStock) {
        return toast.error("No need to buy, manage stock is disabled");
    }

    // if product's warranty is enabled, then enable the serial field...and enable the warranty date...
    if (p.product.manageWarranty) {
        const already = selectedProducts.value.find((item) => item.variantID === p.id);
        if (already) {
            return toast.error("Please Add serials now");
        }

        selectedProducts.value = [...selectedProducts.value, {
            id: p.id,
                productID:p.productID,
            variantID: p.id,
            name: p.label, // or p.label if you prefer
            barcode: p.barcode,
            stock: p.stock,
            unitName: p.product.unit?.name, // adjust based on your actual structure
            brandName: p.product.brand?.name, // adjust based on your actual structure
            categoryName: p.product.category?.name, // adjust based on your actual structure
            manageStock: p.product.manageStock,
            createdAt: p.createdAt,
            purchasePrice: p.product.purchasePrice, // or p.salePrice depending on your logic
            salePrice: p.salePrice,
            purchaseQty: 0,
            warranty: 0,
            manageWarranty: p.product.manageWarranty,
            serials: [],
            expireDate: null
        }];
        return;
    }

    const already = selectedProducts.value.find((item) => item.id === p.id);
    if (already) {
        selectedProducts.value = selectedProducts.value.map((item) =>
            item.variantID === p.id ? { ...item, purchaseQty: item.purchaseQty + 1 } : item
        );
        return;
    }

    selectedProducts.value = [...selectedProducts.value, {
        id: p.id,
        productID:p.productID,
        variantID: p.id,
        name: p.label, // or p.label
        barcode: p.barcode,
        stock: p.stock,
        unitName: p.product.unit?.name, // adjust based on your actual structure
        brandName: p.product.brand?.name, // adjust based on your actual structure
        categoryName: p.product.category?.name, // adjust based on your actual structure
        manageStock: p.product.manageStock,
        createdAt: p.createdAt,
        purchasePrice: p.product.purchasePrice, // or p.salePrice depending on your logic
        salePrice: p.salePrice,
        purchaseQty: 1,
        warranty: 0,
        manageWarranty: p.product.manageWarranty,
        serials: [],
        expireDate: null
    }];
};


    useEffect(() => {
        Promise.all([fetchVariants(), fetchContacts(), fetchAccount()]);
    }, []);


    useEffect(() => {
        const timer = setTimeout(() => fetchContacts(), 400);
        return () => clearTimeout(timer);
    }, [contactParams.search]);

    useEffect(() => {
        const timer = setTimeout(() => fetchVariants(), 400);
        return () => clearTimeout(timer);
    }, [productParams.search]);

    const handleProductChange = (id: number, field: string, value: number | Date | null) => {
        selectedProducts.value = selectedProducts.value.map((p) =>
            p.id === id ? { ...p, [field]: value } : p
        );
    };

    const handleRemoveProduct = (idx: number) => {
        selectedProducts.value = selectedProducts.value.filter((_, i) => i !== idx);
    };
    const totalProductPrice = selectedProducts.value.reduce(
        (acc, p) => acc + (p.purchasePrice || 0) * (p.purchaseQty || 0), 0
    );
    const myPrevDue = selectedSupplier && selectedSupplier.balance > 0 ? selectedSupplier?.balance : 0;
    const supplierPrevDue = selectedSupplier && selectedSupplier.balance < 0 ? -selectedSupplier!.balance : 0;
    const basePayable = totalProductPrice - discount + otherCost;
    const totalPayableAmount = basePayable + myPrevDue - (supplierPrevDue);
    const paid = selectedAccounts.reduce((acc, a) => acc + (a.amount || 0), 0)
    const exchangeAmount = selectedExchangeAccounts.reduce(
        (acc, a) => acc + (a.amount || 0),
        0
    );

    const currentBalance = totalPayableAmount - paid;

  useEffect(() => {
    // jodi customer select na hoi ar paid beshi hoi
    if (!selectedSupplier && (currentBalance > 0)) {
      setIsExchanging(true);
      return setSelectedExchangeAccounts((prev) => {
        const updated = prev.map((a) =>
          a.isDefault
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
    if (!selectedSupplier && (currentBalance <= 0)) {
      return setIsExchanging(false)
    }
    //  // jodi customer select na hoi ar advance hoi ar exchange na hoi tokhon automatic exchange hobe,
    if (!selectedSupplier && (currentBalance > 0) && !isExchanging) {
      setIsExchanging(true);
      setSelectedExchangeAccounts((prev) => {
        const updated = prev.map((a) =>
          a.isDefault
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
    if (selectedSupplier && (currentBalance > 0) && isExchanging) {
      setIsExchanging(false);
      return;
    }
    // jodi customer select hoi ar advance hoi, ar exchange o hoi tokhon exchanging desable hoye jabe
    if (selectedSupplier && (currentBalance > 0) && isExchanging) {
      setSelectedExchangeAccounts((prev) => {
        const updated = prev.map((a) =>
          a.isDefault
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
  }, [selectedSupplier, currentBalance, isExchanging]);


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
                const defaultAccount = exchangeAccounts.find((a) => a.isDefault);

                if (!defaultAccount) return prev;

                const updated = prev.some((a) => a.id === defaultAccount.id)
                    ? prev
                    : [
                        {
                            ...defaultAccount,
                            amount: -currentBalance,
                        },
                    ];

                return updated;
            });
        }
    }, [isExchanging])


    const createPurchase = async () => {
        if (!selectedSupplier) return toast.error("Please select a supplier");

        if (selectedProducts.value.length === 0) return toast.error("Please add at least one product");

        const purchase = {
            supplierID: selectedSupplier.value,
            paid,
            ...(costName ? { costName, otherCost } : {}),
            totalProductPrice,
            discount,
            exchangeAmount,
            totalPayableAmount,
            note,
            purchaseDate,
            balanceBefore: selectedSupplier?.balance,
            balanceAfter: isExchanging?0: currentBalance
        };

        const accounts = selectedAccounts.map((a) => ({
            accountID: a.value,
            amount: a.amount,
        }));

        const exchangeAccounts = selectedExchangeAccounts.map(a => ({
            accountID: a.value,
            amount: a.amount,
        }));

        const products = selectedProducts.value.flatMap(p => {
            if (p.serials && p.serials.length > 0) {
                return p.serials.map((serial: string) => ({
                    productID: p.productID,
                    serial: serial as string | null,
                    purchasedQty: 1,
                       variantID:p.variantID,
                    purchasePrice: p.purchasePrice,
                    salePrice: p.salePrice,
                    warranty: p.warranty,
                    expireDate: p.expireDate ?? null, // ✅
                }));
            }
            return [{
                productID: p.productID,
                variantID:p.variantID,
                serial: null as string | null,
                purchasedQty: p.purchaseQty,
                purchasePrice: p.purchasePrice,
                salePrice: p.salePrice,
                expireDate: p.expireDate ?? null, // ✅
            }];
        });
  
        const purchaseResult = createPurchaseSchema.safeParse({ purchase, products, accounts, exchangeAccounts });
 
        if (!purchaseResult.success) {
            const firstError = purchaseResult.error.issues[0];
            console.log(firstError);
            toast.error(firstError.message);
            return;
        }

        const res = await api.post('/purchase/create', purchaseResult.data);
        if (res.data.success === true) {
            navigate(`/purchase/invoice/${res.data.data.id}`);
            return;
        }


    };


    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Supplier */}
                <div className="flex flex-col">
                    <label className="block text-sm font-medium mb-1">Suppliers</label>
                    <Select
                        options={suppliers}
                        onChange={(val) => setSelectedSupplier(val as SelectOption<Contact> | null)}
                        onInputChange={(e) => setContactParams(prev => ({ ...prev, search: e }))}
                        placeholder="Select Supplier"

                        isClearable

                        styles={getReactSelectStyles<SelectOption<Contact>>()}
                    />
                </div>
                {/* Products */}
                <div className="flex flex-col">
                    <label className="block text-sm font-medium mb-1">Products</label>
                    <Select
                        options={variants}
                        value={null}
                        onChange={(val) => handleAddProduct(val as SelectOption<VariantListItem>)}
                        onInputChange={(e) => setProductParams(prev => ({ ...prev, search: e }))}
                        placeholder="Select Product"
                        isClearable
                        styles={getReactSelectStyles<SelectOption<VariantListItem>>()}
                    />
                </div>
                {/* Product With Barcode */}
                <div className="flex flex-col">
                    <label className="block text-sm font-medium mb-1">Search With Barcode</label>
                    <input
                        value={barcode}
                        onChange={(e) => {
                            setBarcode(e.target.value);
                        }}
                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                fetchProductWithBarcode((e.target as HTMLInputElement).value);
                            }
                        }}
                        className="global_input"
                        placeholder="Search Product With Barcode"
                    />
                </div>
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
                            selected={purchaseDate}
                            onChange={(date: Date | null) => setPurchaseDate(date as Date)}
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
            </div>
            {/* Table */}
            <Table
                data={selectedProducts.value}
                keyExtractor={(row) => row.id}
                columns={[
                    {
                        header: "#",
                        accessor: (_, i) => (i ?? 0) + 1,
                        className: "w-10 text-center",
                        headerClassName: "text-center"
                    },
                    {
                        header: "Name",
                              accessor: (row, i) => (
                            <>  {row.name}</>

                        ),
                        headerClassName: "min-w-[200px]"
                    },
                    {
                        header: "Warranty",
                        className: "text-center",
                        headerClassName: "text-center",
                        accessor: (row) => (
                            <>  {row.manageWarranty && <input
                                type="number"
                                value={row.warranty === 0 ? "" : row.warranty}
                                onChange={(e) => handleProductChange(row.id, "warranty", e.target.value === "" ? 0 : Number(e.target.value))}
                                placeholder="Days"
                                className="global_input text-center w-24"

                            />}</>

                        ),
                    },
                    {
                        header: "Serials",
                        className: "text-center",
                        headerClassName: "text-center",
                        accessor: (row, i) => (
                            <>  {row.manageWarranty && <button onClick={() => { setSerialModal(Number(i)) }} className="global_button">
                                {row.serials?.length ? `${row.serials.length} Serials` : "Add Serials"}</button>}</>

                        ),
                    },

                    {
                        header: "Purchase Price",
                        className: "text-center",
                        headerClassName: "text-center",
                        accessor: (row) => (
                            <input
                                type="number"
                                value={row.purchasePrice === 0 ? "" : row.purchasePrice}
                                onChange={(e) => handleProductChange(row.id, "purchasePrice", e.target.value === "" ? 0 : Number(e.target.value))}
                                className="global_input text-center w-24"
                            />
                        ),
                    },
                    {
                        header: "Sale Price",
                        className: "text-center",
                        headerClassName: "text-center",
                        accessor: (row) => (
                            <input
                                type="number"
                                value={row.salePrice === 0 ? "" : row.salePrice}
                                onChange={(e) => handleProductChange(row.id, "salePrice", e.target.value === "" ? 0 : Number(e.target.value))}
                                className="global_input text-center w-24"
                            />
                        ),
                    },
                    {
                        header: "Qty",
                        className: "text-center",
                        headerClassName: "text-center",
                        accessor: (row) => (
                            <input
                                type="number"
                                value={row.purchaseQty === 0 ? "" : row.purchaseQty}
                                onChange={(e) => handleProductChange(row.id, "purchaseQty", e.target.value === "" ? 0 : Number(e.target.value))}
                                disabled={row.manageWarranty}
                                className="global_input text-center w-20"
                            />
                        ),
                    },
                    {
                        header: "Total",
                        className: "text-center",
                        headerClassName: "text-center",
                        accessor: (row) => (
                            <span>{(row.purchasePrice * row.purchaseQty).toFixed(2)}</span>
                        ),
                    },
                    {
                        header: "Action",
                        headerClassName: "text-right",
                        className: "text-right",
                        accessor: (_, i) => (
                            <button
                                onClick={() => handleRemoveProduct(i as number)}
                                className="global_button_red"
                            >
                                Remove
                            </button>
                        ),
                    },
                    {
                        header: "Expire Date",
                        className: "text-center",
                        headerClassName: "text-center",
                        accessor: (row) => (
                            <DatePicker
                                selected={row.expireDate ? new Date(row.expireDate) : null}
                                onChange={(date: Date | null) =>
                                    handleProductChange(row.id, "expireDate", date)
                                }
                                dateFormat="dd-MM-yyyy"
                                className="global_input min-w-[140px]"
                                popperPlacement="bottom-start"
                                popperClassName="z-[9999]"
                                calendarClassName="react-datepicker-custom"
                                isClearable
                                placeholderText="DD-MM-YYYY"
                                popperContainer={(props) =>
                                    createPortal(<div {...props} />, document.body)
                                }
                            />
                        ),
                    },
                ]}
            />

            {/* Purchase Summary + Note */}

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Note */}
                <div className="flex-1">
                    <label className="block mb-2 font-medium">Note</label>
                    <textarea
                        value={note ?? ""}
                        onChange={(e) => setNote(e.target.value)}
                        className="global_input min-h-[150px] w-full"
                    />
                    {/* Other Cost */}
                    <div className="mt-3 flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <label>Cost Name:</label>
                            <input
                                type="text"
                                value={costName ?? ""}
                                onChange={(e) => setCostName(e.target.value)}
                                className="global_input w-40 text-right"
                                placeholder="e.g. Transport"
                            />
                        </div>
                        <div className="flex justify-between items-center">
                            <label>Other Cost:</label>
                            <input
                                type="number"
                                value={otherCost === 0 ? "" : otherCost}
                                onChange={(e) => setOtherCost(e.target.value === "" ? 0 : Number(e.target.value))}
                                className="global_input w-40 text-right"
                            />
                        </div>
                    </div>
                </div>

                {/* Summary */}
                <div className="flex-1 space-y-3">
                    {/* Total Product Price */}
                    <div className="flex justify-between">
                        <label>Total Product Price:</label>
                        <input type="number" value={totalProductPrice.toFixed(2)} disabled
                            className="global_input w-40 rounded-sm cursor-not-allowed text-right" />
                    </div>
                    {/* Discount % */}
                    <div className="flex justify-between">
                        <label>Discount %:</label>
                        <input
                            type="number"
                            value={discountPercent === 0 ? "" : discountPercent}
                            onChange={(e) => {
                                const percent = e.target.value === "" ? 0 : Number(e.target.value);
                                setDiscountPercent(percent);
                                setDiscount(parseFloat(((percent / 100) * totalProductPrice).toFixed(2)));
                            }}
                            className="global_input w-40 rounded-sm text-right" min="0" max="100"
                        />
                    </div>
                    {/* Discount Amount */}
                    <div className="flex justify-between">
                        <label>Discount Amount:</label>
                        <input
                            type="number"
                            value={discount === 0 ? "" : discount}
                            onChange={(e) => {
                                const val = e.target.value === "" ? 0 : Number(e.target.value);
                                setDiscount(val);
                                setDiscountPercent(totalProductPrice > 0 ? parseFloat(((val / totalProductPrice) * 100).toFixed(2)) : 0);
                            }}
                            className="global_input w-40 rounded-sm text-right" min="0"
                        />
                    </div>
                    {/* Total Amount */}
                    <div className="flex justify-between font-medium  pt-2">
                        <label>Total Amount:</label>
                        <input type="number" value={basePayable.toFixed(2)} disabled
                            className="global_input w-40 rounded-sm cursor-not-allowed text-right" />
                    </div>
                    {/* Previous Due */}
                    {selectedSupplier && (selectedSupplier as SelectOption<Contact>).balance > 0 && (
                        <div className="flex justify-between">
                            <label>My Previous Due:</label>
                            <input type="number" value={Math.abs((selectedSupplier as SelectOption<Contact>).balance).toFixed(2)} disabled
                                className="global_input w-40 rounded-sm cursor-not-allowed text-right text-red-500" />
                        </div>
                    )}
                    {/* Advance */}
                    {selectedSupplier && (selectedSupplier as SelectOption<Contact>).balance < 0 && (
                        <div className="flex justify-between">
                            <label>Advance (Receivable):</label>
                            <input type="number" value={Math.abs((selectedSupplier as SelectOption<Contact>).balance).toFixed(2)} disabled
                                className="global_input w-40 rounded-sm cursor-not-allowed text-right text-green-500" />
                        </div>
                    )}
                    {/* Payable */}
                    <div className="flex justify-between font-medium">
                        <label>Payable:</label>
                        <input type="number" value={(totalPayableAmount).toFixed(2)} disabled
                            className="global_input w-40 rounded-sm cursor-not-allowed text-right" />
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
                        <label>Paid:</label>
                        <input type="number" value={paid.toFixed(2)} disabled
                            className="global_input w-40 rounded-sm cursor-not-allowed text-right text-green-500" />
                    </div>
                    {(() => {


                        if (currentBalance > 0) return (
                            <div className="flex justify-between font-semibold border-t pt-2">
                                <label>My Current Due:</label>
                                <input type="number" value={currentBalance.toFixed(2)} disabled
                                    className="global_input w-40 rounded-sm cursor-not-allowed text-right text-red-500" />
                            </div>
                        );

                        // Advance Paid
                        if (!isExchanging && (currentBalance < 0) && !!selectedSupplier) return (
                            <div className="flex justify-between font-semibold border-t pt-2">
                                <label>Supp. Due. Will Be:</label>
                                <input type="number" value={Math.abs(currentBalance).toFixed(2)} disabled
                                    className="global_input w-40 rounded-sm cursor-not-allowed text-right text-green-500" />
                            </div>
                        );

                        return null;
                    })()}

                    {/* Exchange button */}
                    {(currentBalance < 0) && (
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
              { !!selectedSupplier &&       <button type="button" className="global_button w-full" onClick={createPurchase}>Purchase</button>}
                </div>
            </div>

            <SerialModal idx={serialModal}
                selectedProduct={selectedProducts.value[serialModal!]}
                onClose={() => setSerialModal(null)}
                onSave={(updated) => {
                    selectedProducts.value = selectedProducts.value.map((p, i) =>
                        i === serialModal ? updated : p
                    );
                    setSerialModal(null);
                }} />
        </div>
    );
}