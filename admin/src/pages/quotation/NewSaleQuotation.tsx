import { useEffect, useState } from "react";
import api from "../../lib/axios";
import type { Batch, Contact, SaleProduct, SelectOption, VariantListItem } from "../../types/type";
import Select from "react-select";
import { getReactSelectStyles, smallReactStyle, smallReactStyleMulti } from "../../utils/reactSelectStyles";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import type { SearchParams } from "../../types/type";
import { Calendar } from "lucide-react";
import DatePicker from "react-datepicker";
import { createPortal } from "react-dom";
import "react-datepicker/dist/react-datepicker.css";
import Table from "../../components/tables/Table";
import { useSignal } from "@preact/signals-react";
import { useSignals } from "@preact/signals-react/runtime";
import { createSaleQuotationSchema } from "../../validators/quotation.validator";


export default function NewSaleQuotation() {
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
    const [products, setProducts] = useState<SelectOption<VariantListItem>[]>([]);
    const [customers, setCustomers] = useState<SelectOption<Contact>[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<SelectOption<Contact> | null>(null);
    const [saleDate, setSaleDate] = useState<Date>(new Date());
    const selectedProducts = useSignal<SaleProduct[]>([]);
    // serial is open with index, if index exist it open
    const [costName, setCostName] = useState<string | null>("");
    const [otherCost, setOtherCost] = useState<number>(0);
    const [discount, setDiscount] = useState<number>(0);
    const [discountPercent, setDiscountPercent] = useState<number>(0);
    const [note, setNote] = useState<string | null>("");


    const fetchProducts = async () => {
        const res = await api("/product/variant-list", {
            params: { search: productParams.search, limit: productParams.limit, page: productParams.page },
        });
        if (res.data.success)
            setProducts(
                res.data.data.items.map((u: VariantListItem) => ({ value: u.id, label: `${u.product.name} stock-${!u.product.manageStock ? " ∞" : u.stock}`, ...u }))
            );
    };

    const fetchSaleProduct = async (productID:number,variantID: number) => {
        const res = await api(`/product/getSaleProduct/${productID}/${variantID}`);
        if (res.data.success) {
            return res.data.data
        }

    };
    const fetchContacts = async () => {
        const res = await api("/contact/list", {
            params: { search: contactParams.search, limit: contactParams.limit, page: contactParams.page, type: "customer" },
        });
        if (res.data.success) setCustomers(
            res.data.data.items.map((u: Contact) => ({ value: u.id, label: `${u.name} balance(${u.balance})`, ...u }))
        );;
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

    const handleAddProduct = async (p: SelectOption<VariantListItem>) => {
        if (!p.product.manageStock) {
            const existing = selectedProducts.value.find(
                product => product.id === p.id
            );

            if (existing) {
                selectedProducts.value = selectedProducts.value.map(product =>
                    product.id === p.id
                        ? { ...product, soldQty: product.soldQty + 1 }
                        : product
                );
            } else {
                selectedProducts.value = [...selectedProducts.value, {
                    ...p.product,
                    id:p.id,
                    productID:p.product.id,
                    name:p.label,
                    soldQty: 1,
                    warranty: 0,
                    serials: [],
                    selectedSerials: [],
                    batches: [],
                    selectedBatch: null,
                    salePrice: p.salePrice
                }];
            }

            return;
        }

        // only warranty product
        if (p.product.manageStock && p.product.manageWarranty) {
            const isExist = selectedProducts.value.find(product => product.id === p.id);
            if (isExist) {
                return toast.error("Product already exists");
            }

            const product: SaleProduct = await fetchSaleProduct(p.productID,p.id);
            if (product?.serials.length === 0) {
                return toast.error("No Serial Available");
            }
            return selectedProducts.value = [...selectedProducts.value, product];
        }

        // only batches/non-warranty/stock product
        if (p.product.manageStock && !p.product.manageWarranty) {
            const existingRows = selectedProducts.value.filter(product => product.id === p.id);

            if (existingRows.length > 0) {
                // ✅ সবার শেষের row টা নিন (last added)
                const lastRow = existingRows[existingRows.length - 1];

                if (!lastRow.selectedBatch) {
                    return toast.error("No batch selected");
                }

                // ✅ Check করুন last row এর batch এ আরো qty available আছে কিনা
                const currentlyUsed = selectedProducts.value
                    .filter(prod =>
                        prod.id === p.id &&
                        prod.selectedBatch?.id === lastRow.selectedBatch?.id
                    )
                    .reduce((sum, prod) => sum + prod.soldQty, 0);

                const remainingQty = lastRow.selectedBatch.remainingQty;

                if (currentlyUsed < remainingQty) {
                    // ✅ Available আছে → last row এ qty বাড়ান
                    selectedProducts.value = selectedProducts.value.map(product =>
                        product === lastRow
                            ? { ...product, soldQty: product.soldQty + 1 }
                            : product
                    );
                    return;
                }

                // ✅ শেষ হয়ে গেছে → নতুন batch খুঁজুন
                const usedBatchIds = existingRows
                    .map(row => row.selectedBatch?.id)
                    .filter(Boolean) as number[];

                const availableBatches = lastRow.batches.filter(
                    b => !usedBatchIds.includes(b.id)
                );

                if (availableBatches.length === 0) {
                    return toast.error("No more stock available");
                }

                // ✅ নতুন row তৈরি করুন পরের batch দিয়ে
                const newEntry: SaleProduct = {
                    ...lastRow,
                    selectedBatch: availableBatches[0],
                    purchaseID: availableBatches[0].purchaseID,
                    purchasePrice: availableBatches[0].purchasePrice,
                    salePrice: availableBatches[0].salePrice,
                    soldQty: 1,
                    batches: availableBatches, // ✅ শুধু available batches
                    selectedSerials: [],
                };

                selectedProducts.value = [...selectedProducts.value, newEntry];
                return;
            }

            // ✅ First time adding this product
            const product: SaleProduct = await fetchSaleProduct(p.productID,p.id);

            if (product?.batches.length === 0) {
                return toast.error("No Stock Available");
            }

            selectedProducts.value = [...selectedProducts.value, product];
        }
    };


    const selectSerial = (selectedSerials: SelectOption<Batch>[] | null, idx: number) => {

        if (!selectedSerials || selectedSerials.length === 0) {
            // Clear selection
            selectedProducts.value = selectedProducts.value.map((product, i) =>
                i === idx
                    ? { ...product, selectedSerials: [], soldQty: 0 }
                    : product
            );
            return;
        }

        const latest = selectedSerials[selectedSerials.length - 1];
        const newPurchaseID = latest.purchaseID;

        // ✅ Check if all selected serials are from same purchaseID
        const allSamePurchase = selectedSerials.every(
            s => s.purchaseID === selectedSerials[0].purchaseID
        );

        const updated = [...selectedProducts.value];
        const oldProduct = { ...updated[idx] };
        const oldPurchaseID = oldProduct.purchaseID;

        // ─────────────────────────────
        // CASE 1 — Same purchaseID
        // ─────────────────────────────
        if (allSamePurchase) {
            updated[idx] = {
                ...oldProduct,
                purchaseID: latest.purchaseID,
                selectedSerials,
                soldQty: selectedSerials.length,
                purchasePrice: latest.purchasePrice,
                salePrice: latest.salePrice,
                warranty: latest.warranty || 0,
            };
            selectedProducts.value = updated;
            return;
        }

        // ─────────────────────────────
        // CASE 2 — Mixed purchaseID → SPLIT
        // ─────────────────────────────

        // 1️⃣ PREPARE GLOBAL LIST OF ALL AVAILABLE SERIALS
        const allSerials = [...oldProduct.serials];
        const alreadySelected = [...oldProduct.selectedSerials];

        // Keep only previous purchaseID in old row
        const oldProductClean = {
            ...oldProduct,
            serials: allSerials.filter(s => s.purchaseID === oldPurchaseID),
            selectedSerials: alreadySelected.filter(s => s.purchaseID === oldPurchaseID),
        };

        oldProductClean.soldQty = oldProductClean.selectedSerials.length;

        updated[idx] = oldProductClean;

        // 2️⃣ NEW ROW SHOULD GET: ALL SERIALS from new purchaseID
        const remainingSerials = allSerials.filter(
            s => s.purchaseID !== oldProductClean.purchaseID
        );

        const newProduct: SaleProduct = {
            ...oldProduct,
            purchaseID: newPurchaseID,
            serials: remainingSerials,
            selectedSerials: [latest],
            soldQty: 1,
            purchasePrice: latest.purchasePrice,
            salePrice: latest.salePrice,
            warranty: latest.warranty || 0,
        };

        selectedProducts.value = [...updated, newProduct];
    };

    const selectBatch = (selectedBatch: SelectOption<Batch> | null, productId: number, currentIndex: number) => {
        if (!selectedBatch) {
            selectedProducts.value = selectedProducts.value.map((product, idx) =>
                idx === currentIndex
                    ? { ...product, selectedBatch: null }
                    : product
            );
            return;
        }

        const currentProduct = selectedProducts.value[currentIndex];
        if (!currentProduct) return;

        // ✅ If soldQty > 1 and changing batch → SPLIT
        if (currentProduct.soldQty > 1 && currentProduct.selectedBatch?.id !== selectedBatch.id) {

            // ✅ Collect all already selected batch IDs from all rows of this product
            const alreadySelectedBatchIds = selectedProducts.value
                .filter(p => p.id === productId)
                .map(p => p.selectedBatch?.id)
                .filter(Boolean) as number[];

            // ✅ Add the newly selected batch to the list
            alreadySelectedBatchIds.push(selectedBatch.id);

            // ✅ Filter out all selected batches from available batches
            const availableBatches = currentProduct.batches.filter(
                b => !alreadySelectedBatchIds.includes(b.id)
            );

            // Current row এ নতুন batch, qty = 1
            const updatedCurrentRow: SaleProduct = {
                ...currentProduct,
                soldQty: 1,
                selectedBatch,
                purchaseID: selectedBatch.purchaseID,
                purchasePrice: selectedBatch.purchasePrice,
                salePrice: selectedBatch.salePrice,
                batches: availableBatches, // ✅ শুধু available batches
            };

            // New row তে পুরানো batch, বাকি qty
            const newRow: SaleProduct = {
                ...currentProduct,
                soldQty: currentProduct.soldQty - 1,
                batches: availableBatches, // ✅ শুধু available batches (same)
                selectedBatch: currentProduct.selectedBatch, // Keep old batch
            };

            // ✅ Current row update + new row ঠিক নিচে insert
            selectedProducts.value = [
                ...selectedProducts.value.slice(0, currentIndex),      // Before current
                updatedCurrentRow,                                     // Updated current (নতুন batch)
                newRow,                                                // ✅ Old batch (ঠিক নিচে)
                ...selectedProducts.value.slice(currentIndex + 1),     // After current
            ];

            toast.success("Row split - different batch selected");
            return;
        }

        // ✅ soldQty === 1 or same batch → simple update
        selectedProducts.value = selectedProducts.value.map((product, idx) =>
            idx === currentIndex
                ? {
                    ...product,
                    selectedBatch,
                    purchaseID: selectedBatch.purchaseID,
                    purchasePrice: selectedBatch.purchasePrice,
                    salePrice: selectedBatch.salePrice,
                }
                : product
        );
    };

    useEffect(() => {
        Promise.all([fetchProducts(), fetchContacts()]);
    }, []);


    useEffect(() => {
        const timer = setTimeout(() => fetchContacts(), 400);
        return () => clearTimeout(timer);
    }, [contactParams.search]);

    useEffect(() => {
        const timer = setTimeout(() => fetchProducts(), 400);
        return () => clearTimeout(timer);
    }, [productParams.search]);

    const handleProductChange = (idx: number, field: string, value: number) => {
        selectedProducts.value = selectedProducts.value.map((p, i) =>
            i === idx ? { ...p, [field]: value } : p
        );
    };

    const handleRemoveProduct = (idx: number) => {
        selectedProducts.value = selectedProducts.value.filter((_, i) => i !== idx);
    };

    const totalProductPrice = selectedProducts.value.reduce(
        (acc, p) => acc + (p.salePrice || 0) * (p.soldQty || 0),
        0
    );

    const prevBalance = selectedCustomer?.balance ?? 0;

    const prevDue = prevBalance < 0 ? -prevBalance : 0;
    const usableBalance = prevBalance > 0 ? prevBalance : 0;

    const basePayable = totalProductPrice - discount + otherCost;

    const createQuotation = async () => {
        if (selectedProducts.value.length === 0) {
            return toast.error("Please add at least one product");
        }


        if (selectedProducts.value.some(p => p.serials.length > 0 && p.selectedSerials.length === 0)) {
            return toast.error("Please select at least one serial or remove the product from the table")
        }


        // ✅ Products structure - backend অনুযায়ী
        const products = selectedProducts.value.flatMap(p => {

            // Serial managed product
            if (p.manageWarranty && p.selectedSerials?.length) {

                return p.selectedSerials.map(serial => ({
                    productID: p.productID,
                    variantID: p.id,
                    batchID: Number(serial.value), // serial batch id
                    soldQty: 1,
                    salePrice: p.salePrice,
                    warranty: p.warranty || 0,
                }));
            }

            // Normal batch product
            return [{
                productID: p.productID,
                variantID: p.id,
                batchID: p.selectedBatch?.id || null,
                soldQty: p.soldQty,
                salePrice: p.salePrice,
                warranty: p.warranty || 0,
            }];
        });



        // ✅ Sale object - backend অনুযায়ী
        const sale = {
            customerID: selectedCustomer?.value || null,
            costName: costName || null,
            otherCost: costName ? otherCost : 0,
            balanceBefore:selectedCustomer?.balance??0,
            balanceAfter:selectedCustomer?.balance??0,
            totalProductPrice,
            discount,
            totalAmount: basePayable,
            note: note || null,
            saleDate, // ✅ Date object
        };

        // ✅ Validate
        const quotationResult = createSaleQuotationSchema.safeParse({
            products:products,
            ...sale
        });

        if (!quotationResult.success) {
            const firstError = quotationResult.error.issues[0];
            toast.error(firstError.message);
            console.error("Validation errors:", quotationResult.error.issues);
            return;
        }

        try {
            const res = await api.post('/quotation/create-sale-quotation', quotationResult.data);

            if (res.data.success === true) {
                toast.success(res.data.msg || "Sale created successfully!");
                navigate(`/quotation/sale-quotation-invoice/${res.data.data.id}`);
            } else {
                toast.error(res.data.message || "Failed to create sale");
            }
        } catch (error: any) {
            console.error("Sale creation error:", error);
            const errorMsg = error.response?.data?.message || "Error creating sale";
            toast.error(errorMsg);
        }
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Customer */}
                <div className="flex flex-col">
                    <label className="block text-sm font-medium mb-1">Customers</label>
                    <Select
                        options={customers}
                        onChange={(val) => setSelectedCustomer(val as SelectOption<Contact> | null)}
                        onInputChange={(e) => setContactParams(prev => ({ ...prev, search: e }))}
                        placeholder="Select Customer"
                        filterOption={() => true}
                        isClearable

                        styles={getReactSelectStyles<SelectOption<Contact>>()}
                    />
                </div>
                {/* Products */}
                <div className="flex flex-col">
                    <label className="block text-sm font-medium mb-1">Products </label>
                    <Select
                        options={products}
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
                            selected={saleDate}
                            onChange={(date: Date | null) => setSaleDate(date as Date)}
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
                keyExtractor={(row, i) => `${row.id}-${i}`}
                columns={[
                    // #
                    {
                        header: "#",
                        accessor: (_, i) => (i ?? 0) + 1,
                        className: "w-10 text-center",
                        headerClassName: "text-center"
                    },
                    // Name
                    {
                        header: "Name",
                        accessor: "name",
                        headerClassName: "min-w-[200px] text-left"
                    },
                    // Warranty
                    {
                        header: "Warranty",
                        className: "text-center",
                        headerClassName: "text-center",
                        accessor: (row, i) => (
                            <>  {row.manageWarranty && <input
                                type="number"
                                value={row.warranty === 0 ? "" : row.warranty}
                                onChange={(e) => handleProductChange(i as number, "warranty", e.target.value === "" ? 0 : Number(e.target.value))}
                                placeholder="Days"
                                className="global_input text-center w-24"

                            />}</>

                        ),
                    },
                    // Serials
                    {
                        header: "Serials",
                        className: "min-w-40",
                        headerClassName: "text-center",
                        accessor: (row, i) => {
                            if (row.manageWarranty) {
                                return (
                                    <Select
                                        options={row.serials || []}
                                        value={row.selectedSerials}
                                        onChange={(selectedSerials) => {
                                            selectSerial(
                                                selectedSerials as SelectOption<Batch>[] | null,
                                                i as number // ✅ index pass করুন
                                            );
                                        }}
                                        styles={smallReactStyleMulti<SelectOption<Batch>>()}
                                        isMulti
                                        menuPortalTarget={document.body}
                                        menuPlacement="auto"
                                        menuPosition="absolute"
                                        placeholder="Select Serials"
                                    />
                                );
                            }

                            // ✅ manageWarranty false hole N/A
                            return (
                                <span className="text-gray-500 dark:text-gray-400 text-sm">
                                    N/A
                                </span>
                            );
                        }
                    },
                    // Batches
                    {
                        header: "Batches",
                        className: "min-w-35",
                        headerClassName: "text-center",
                        accessor: (row, i) => {
                            if (row.manageStock && !row.manageWarranty) {
                                return (
                                    <Select
                                        options={row.batches || []}
                                        value={row.selectedBatch}
                                        onChange={(selectedBatch) => {
                                            selectBatch(
                                                selectedBatch as SelectOption<Batch> | null,
                                                row.id,
                                                i as number // ✅ Pass index
                                            );
                                        }}
                                        styles={smallReactStyle<SelectOption<Batch>>()}
                                        menuPortalTarget={document.body}
                                        menuPlacement="auto"
                                        menuPosition="absolute"
                                        placeholder="Select Batch"
                                    />

                                );
                            }

                            // ✅ manageWarranty true hole
                            return (
                                <span className="text-gray-500 dark:text-gray-400 text-sm">
                                    N/A
                                </span>
                            );
                        }
                    },
                    // Purchase Price
                    {
                        header: "Purchase Price",
                        className: "text-center",
                        headerClassName: "text-center",
                        accessor: (row, i) => (
                            <input
                                type="number"
                                value={row.purchasePrice === 0 ? "" : row.purchasePrice}
                                onChange={(e) => handleProductChange(i as number, "purchasePrice", e.target.value === "" ? 0 : Number(e.target.value))}
                                className="global_input text-center w-24"
                            />
                        ),
                    },
                    // Sale Price
                    {
                        header: "Sale Price",
                        className: "text-center",
                        headerClassName: "text-center",
                        accessor: (row, i) => (
                            <input
                                type="number"
                                value={row.salePrice === 0 ? "" : row.salePrice}
                                onChange={(e) => handleProductChange(i as number, "salePrice", e.target.value === "" ? 0 : Number(e.target.value))}
                                className="global_input text-center w-24"
                            />
                        ),
                    },
                    // Qty
                    {
                        header: "Qty",
                        className: "text-center",
                        headerClassName: "text-center",
                        accessor: (row, i) => (
                            <input
                                type="number"
                                value={row.soldQty === 0 ? "" : row.soldQty}
                                onChange={(e) => {
                                    const value = e.target.value;

                                    // empty হলে 0
                                    if (value === "") {
                                        handleProductChange(i as number, "soldQty", 0);
                                        return;
                                    }

                                    const numValue = Number(value);

                                    // invalid number ignore
                                    if (isNaN(numValue)) return;

                                    // decimal false হলে fractional allow না
                                    if (!row.decimal && !Number.isInteger(numValue)) {
                                        return;
                                    }

                                    // manage stock true হলে remainingQty এর বেশি allow না
                                    if (
                                        row.manageStock &&
                                        row.selectedBatch &&
                                        numValue > row.selectedBatch.remainingQty
                                    ) {
                                        toast.error("You can not increase qty over stock")
                                        return handleProductChange(i as number, "soldQty", row.selectedBatch.remainingQty);
                                    }

                                    handleProductChange(i as number, "soldQty", numValue);
                                }}
                                onKeyDown={(e) => {
                                    // ✅ decimal false hole dot/comma block করো
                                    if (!row.decimal && (e.key === '.' || e.key === ',')) {
                                        e.preventDefault();
                                    }
                                }}
                                step={row.decimal ? "0.01" : "1"} // ✅ decimal true hole 0.01 step
                                disabled={row.manageWarranty}
                                className="global_input text-center w-20"
                            />
                        ),
                    },
                    // Total
                    {
                        header: "Total",
                        className: "text-center",
                        headerClassName: "text-center",
                        accessor: (row) => (
                            <span>{(row.salePrice * row.soldQty).toFixed(2)}</span>
                        ),
                    },
                    // Action
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
                ]}
            />

            {/* Summary + Note */}

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


                </div>
            </div>



            <div>
                <button type="button" className="global_button" onClick={createQuotation}>Create</button>
            </div>

        </div>
    );
}
