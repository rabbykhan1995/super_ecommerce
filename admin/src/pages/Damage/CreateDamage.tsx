import { useEffect, useState } from "react";
import api from "../../lib/axios";
import type { Batch, DamageProduct, SaleProduct, SelectOption } from "../../types/type";
import Select from "react-select";
import { getReactSelectStyles, smallReactStyle, smallReactStyleMulti } from "../../utils/reactSelectStyles";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import type { Product, SearchParams } from "../../types/type";
import { Calendar } from "lucide-react";
import DatePicker from "react-datepicker";
import { createPortal } from "react-dom";
import "react-datepicker/dist/react-datepicker.css";
import Table from "../../components/tables/Table";
import { useSignal } from "@preact/signals-react";
import { useSignals } from "@preact/signals-react/runtime";
import Helper from "../../utils/helper";
import { Dropdown } from "../../components/Ui/Dropdown";
import { createDamageSchema } from "../../validators/damage.validator";




export default function CreateDamage() {
    useSignals();
    const navigate = useNavigate();

    const [productParams, setProductParams] = useState<SearchParams>({
        search: "",
        page: 1,
        limit: 50,
    });
    const [barcode, setBarcode] = useState<string>("");
    const [products, setProducts] = useState<SelectOption<Product>[]>([]);

    const [saleDate, setSaleDate] = useState<Date>(new Date());
    const selectedProducts = useSignal<DamageProduct[]>([]);

    const [note, setNote] = useState<string | null>("");
    const reasonOptions: string[] = ["expired", "manual"
    ];
    const fetchProducts = async () => {
        const res = await api("/product/list", {
            params: { search: productParams.search, limit: productParams.limit, page: productParams.page },
        });
        if (res.data.success)
            setProducts(
                res.data.data.items.map((u: Product) => ({ value: u._id, label: `${u.name} stock-${!u.manageStock ? " ∞" : u.stock}`, ...u }))
            );
    };

    const fetchSaleProduct = async (id: string) => {
        const res = await api(`/product/getSaleProduct/${id}`);
        if (res.data.success) {
            return res.data.data
        }

    };

    const fetchProductWithBarcode = async (barcode: string) => {
        const res = await api("/product/productByBarcode", {
            params: { barcode },
        });
        if (res.data.success) {
            const p = res.data.data;

            const product = { value: p._id, label: p.name, ...p };
            return handleAddProduct(product)
        } else {
            return toast.error("No Product Found with This barcode")
        }

    };

    const handleAddProduct = async (p: SelectOption<Product>) => {
        if (!p.manageStock) {
            const existing = selectedProducts.value.find(
                product => product._id === p._id
            );

            if (existing) {
                existing.soldQty++;
            } else {
                selectedProducts.value.push({
                    ...p,
                    soldQty: 1,
                    warranty: 0,
                    serials: [],
                    selectedSerials: [],
                    batches: [],
                    selectedBatch: null,
                    reason: "expired",
                });
            }

            return;
        }

        // only warranty product
        if (p.manageStock && p.manageWarranty) {
            const isExist = selectedProducts.value.find(product => product._id === p._id);
            if (isExist) {
                return toast.error("Product already exists");
            }

            const product: DamageProduct = await fetchSaleProduct(p._id);
            if (product?.serials.length === 0) {
                return toast.error("No Serial Available");
            }
            return selectedProducts.value = [...selectedProducts.value, { ...product, reason: "expired" }];
        }

        // only batches/non-warranty/stock product
        if (p.manageStock && !p.manageWarranty) {
            const existingRows = selectedProducts.value.filter(product => product._id === p._id);

            if (existingRows.length > 0) {
                // ✅ সবার শেষের row টা নিন (last added)
                const lastRow = existingRows[existingRows.length - 1];

                if (!lastRow.selectedBatch) {
                    return toast.error("No batch selected");
                }

                // ✅ Check করুন last row এর batch এ আরো qty available আছে কিনা
                const currentlyUsed = selectedProducts.value
                    .filter(prod =>
                        prod._id === p._id &&
                        prod.selectedBatch?._id === lastRow.selectedBatch?._id
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
                    .map(row => row.selectedBatch?._id)
                    .filter(Boolean) as string[];

                const availableBatches = lastRow.batches.filter(
                    b => !usedBatchIds.includes(b._id)
                );

                if (availableBatches.length === 0) {
                    return toast.error("No more stock available");
                }

                // ✅ নতুন row তৈরি করুন পরের batch দিয়ে
                const newEntry: DamageProduct = {
                    ...lastRow,
                    selectedBatch: availableBatches[0],
                    purchaseID: availableBatches[0].purchaseID,
                    purchasePrice: availableBatches[0].purchasePrice,
                    salePrice: availableBatches[0].salePrice,
                    soldQty: 1,
                    batches: availableBatches, // ✅ শুধু available batches
                    selectedSerials: [],
                    reason: "expired"
                };

                selectedProducts.value = [...selectedProducts.value, newEntry];
                return;
            }

            // ✅ First time adding this product
            const product: DamageProduct = await fetchSaleProduct(p._id);

            if (product?.batches.length === 0) {
                return toast.error("No Stock Available");
            }

            selectedProducts.value = [...selectedProducts.value, { ...product, reason: "expired" }];
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

        const newProduct: DamageProduct = {
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

    const selectBatch = (selectedBatch: SelectOption<Batch> | null, productId: string, currentIndex: number) => {
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
        if (currentProduct.soldQty > 1 && currentProduct.selectedBatch?._id !== selectedBatch._id) {

            // ✅ Collect all already selected batch IDs from all rows of this product
            const alreadySelectedBatchIds = selectedProducts.value
                .filter(p => p._id === productId)
                .map(p => p.selectedBatch?._id)
                .filter(Boolean) as string[];

            // ✅ Add the newly selected batch to the list
            alreadySelectedBatchIds.push(selectedBatch._id);

            // ✅ Filter out all selected batches from available batches
            const availableBatches = currentProduct.batches.filter(
                b => !alreadySelectedBatchIds.includes(b._id)
            );

            // Current row এ নতুন batch, qty = 1
            const updatedCurrentRow: DamageProduct = {
                ...currentProduct,
                soldQty: 1,
                selectedBatch,
                purchaseID: selectedBatch.purchaseID,
                purchasePrice: selectedBatch.purchasePrice,
                salePrice: selectedBatch.salePrice,
                batches: availableBatches, // ✅ শুধু available batches
            };

            // New row তে পুরানো batch, বাকি qty
            const newRow: DamageProduct = {
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
        Promise.all([fetchProducts()]);
    }, []);




    useEffect(() => {
        const timer = setTimeout(() => fetchProducts(), 400);
        return () => clearTimeout(timer);
    }, [productParams.search]);

    const handleProductChange = (
        idx: number,
        field: string,
        value: any
    ) => {
        const updated = [...selectedProducts.value];

        updated[idx] = {
            ...updated[idx],
            [field]: value,
        };

        selectedProducts.value = updated;
    };

    const handleRemoveProduct = (idx: number) => {
        selectedProducts.value = selectedProducts.value.filter((_, i) => i !== idx);
    };

    const totalProductPrice = selectedProducts.value.reduce(
        (acc, p) => acc + (p.salePrice || 0) * (p.soldQty || 0), 0
    );


    const createDamage = async () => {
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
                    productID: p._id,
                    batchID: serial.value, // serial batch id
                    damageQty: 1,
                    purchasePrice: p.salePrice,
                    reason: p.reason,
                }));
            }

            // Normal batch product
            return [{
                productID: p._id,
                batchID: p.selectedBatch?._id || null,
                damageQty: p.soldQty,
                purchasePrice: p.purchasePrice,
                reason: p.reason,
            }];
        });

    

  

        // ✅ Sale object - backend অনুযায়ী
        const damage = {
            note: note || null,
            DamageDate: saleDate, // ✅ Date object
        };

        // ✅ Validate
        const damageResult = createDamageSchema.safeParse({
            
            ...damage  ,  items: products
            ,
        });

        if (!damageResult.success) {
            const firstError = damageResult.error.issues[0];
            toast.error(firstError.message);
            console.error(damageResult.error.issues);
            return;
        }

        try {
            const res = await api.post('/damage/create', damageResult.data);

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

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* Products */}
                <div className="flex flex-col">
                    <label className="block text-sm font-medium mb-1">Products </label>
                    <Select
                        options={products}
                        value={null}
                        onChange={(val) => handleAddProduct(val as SelectOption<Product>)}
                        onInputChange={(e) => setProductParams(prev => ({ ...prev, search: e }))}
                        placeholder="Select Product"
                        isClearable
                        styles={getReactSelectStyles<SelectOption<Product>>()}
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
                keyExtractor={(row, i) => `${row._id}-${i}`}
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
                                                row._id,
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
                    // Reason
                    {
                        header: "Reason",
                        headerClassName: "text-right",
                        className: "text-right",
                        accessor: (row, i) => (
                            <div className="min-w-32">
                                <Dropdown
                                    value={row.reason}
                                    options={reasonOptions}
                                    onChange={(value) => {

                                        handleProductChange(i as number, "reason", value);
                                    }}
                                    usePortal
                                />
                            </div>
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




            <div>
                <button type="button" className="global_button" onClick={createDamage}>create</button>
            </div>

        </div>
    );
}
