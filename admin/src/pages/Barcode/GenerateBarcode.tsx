import { useEffect, useRef, useState, useCallback } from "react"; // useCallback যোগ করা হয়েছে
import api from "../../lib/axios";
import { toast } from "sonner";
import type { Product, SearchParams, SelectOption } from "../../types/type";
import { getReactSelectStyles } from "../../utils/reactSelectStyles";
import Select from "react-select";
import Barcode from "react-barcode";
import { RangeSlider } from "../../components/Ui/RangeSlider";
import ToggleSwitch from "../../components/buttons/ToggleSwitch";
import { printBarcodeSticker } from "../../utils/globalPrinter";

const BUSINESS_NAME = "শখের বাজার";

type FieldFontSizes = {
    businessName: number;
    productName: number;
    barcodeValue: number;
    mrp: number;
    expDate: number;
    stock: number;
};

// ১. FieldControl কে মেইন কম্পোনেন্টের বাইরে নিয়ে আসা হয়েছে পারফরম্যান্স স্মুথ করার জন্য
const FieldControl = ({
    label,
    toggleValue,
    onToggle,
    fontSize,
    onFontSizeChange,
    disabled,
}: {
    label: string;
    toggleValue: boolean;
    onToggle: (v: boolean) => void;
    fontSize: number;
    onFontSizeChange: (val: number) => void;
    disabled?: boolean;
}) => (
    <div className="flex items-center gap-4 py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
        <div className="w-40 shrink-0">
            <ToggleSwitch
                label={label}
                value={toggleValue}
                onChange={onToggle}
                disabled={disabled}
            />
        </div>
        <div className="flex-1">
            <RangeSlider
                value={fontSize}
                onChange={onFontSizeChange}
                min={7}
                max={20}
                step={0.1}
                unit="px"
                showTicks={false}
            />
        </div>
    </div>
);

export default function GenerateBarcode() {
    const [products, setProducts] = useState<SelectOption<Product>[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [barcode, setBarcode] = useState<string>("");
    const [printCount, setPrintCount] = useState<number>(1);

    const [barcodeWidth, setBarcodeWidth] = useState<number>(1);
    const [barcodeHeight, setBarcodeHeight] = useState<number>(30);

    const [fs, setFs] = useState<FieldFontSizes>({
        businessName: 12,
        productName: 10,
        barcodeValue: 10,
        mrp: 10,
        expDate: 10,
        stock: 10,
    });

    // ২. useCallback ব্যবহার করা হয়েছে যেন স্লাইড করার সময় বারবার মেমোরি অ্যাড্রেস চেঞ্জ না হয়
    const handleFieldFsChange = useCallback((field: keyof FieldFontSizes) => {
        return (val: number) => {
            setFs((prev) => ({ ...prev, [field]: val }));
        };
    }, []);

    const [showBusinessName, setShowBusinessName] = useState(true);
    const [showProductName, setShowProductName] = useState(true);
    const [showBarcode, setShowBarcode] = useState(true);
    const [showBarcodeValue, setShowBarcodeValue] = useState(true);
    const [showMRP, setShowMRP] = useState(true);
    const [showExpDate, setShowExpDate] = useState(true);
    const [showStock, setShowStock] = useState(false);

    const [productParams, setProductParams] = useState<SearchParams>({
        search: "",
        page: 1,
        limit: 50,
    });

    const printRef = useRef<HTMLDivElement>(null);

    const fetchProducts = async () => {
        const res = await api("/product/list", {
            params: {
                search: productParams.search,
                limit: productParams.limit,
                page: productParams.page,
            },
        });
        if (res.data.success)
            setProducts(
                res.data.data.items.map((u: Product) => ({
                    value: u._id,
                    label: u.name,
                    ...u,
                }))
            );
    };

    const fetchProductWithBarcode = async (barcodeVal: string) => {
        const res = await api("/product/productByBarcode", {
            params: { barcode: barcodeVal },
        });
        if (res.data.success) {
            const p = res.data.data;
            setSelectedProduct({ value: p._id, label: p.name, ...p });
        } else {
            toast.error("No Product Found with This barcode");
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => fetchProducts(), 400);
        return () => clearTimeout(timer);
    }, [productParams.search]);



    const BarcodeCard = () => (
        <div
            className="barcode-card inline-flex flex-col items-center border border-gray-300 rounded p-2 bg-white"
            style={{ gap: "2px" }}
        >
            {showBusinessName && (
                <p
                    className="font-bold text-black text-center leading-tight"
                    style={{ fontSize: `${fs.businessName}px` }}
                >
                    {BUSINESS_NAME}
                </p>
            )}

            {showProductName && selectedProduct?.name && (
                <p
                    className="text-black text-center leading-tight"
                    style={{ fontSize: `${fs.productName}px` }}
                >
                    {selectedProduct.name}
                </p>
            )}

            {showBarcode && selectedProduct && (
                <Barcode
                    value={selectedProduct.barcode || "Bar565555"}
                    width={barcodeWidth}
                    height={barcodeHeight}
                    displayValue={showBarcodeValue}
                    fontSize={fs.barcodeValue}
                    background="white"
                    lineColor="black"
                />
            )}

            <div className="w-full flex flex-wrap justify-center gap-x-3 gap-y-0.5 text-black">
                {showMRP && selectedProduct?.salePrice != null && (
                    <span style={{ fontSize: `${fs.mrp}px` }}>
                        <span className="font-semibold">MRP:</span> ৳{selectedProduct.salePrice}
                    </span>
                )}
                {showExpDate && selectedProduct?.expireDate && (
                    <span style={{ fontSize: `${fs.expDate}px` }}>
                        <span className="font-semibold">Exp:</span>{" "}
                        {new Date(selectedProduct.expireDate).toLocaleDateString("en-GB")}
                    </span>
                )}
            </div>
        </div>
    );

    return (
        <div className="flex flex-col lg:flex-row">
            {/* Search */}
            <div className="w-full lg:w-1/2 h-full">
                {/* products */}
                <div className="flex flex-col">
                    <label className="block text-sm font-medium mb-1">Products</label>
                    <Select
                        options={products}
                        value={null}
                        onChange={(val) => setSelectedProduct(val as SelectOption<Product>)}
                        onInputChange={(e) =>
                            setProductParams((prev) => ({ ...prev, search: e }))
                        }
                        placeholder="Select Product"
                        isClearable
                        filterOption={() => true}
                        styles={getReactSelectStyles<SelectOption<Product>>()}
                    />
                </div>
                {/* barcode search */}
                <div className="flex flex-col">
                    <label className="block text-sm font-medium mb-1">Search With Barcode</label>
                    <input
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                fetchProductWithBarcode((e.target as HTMLInputElement).value);
                            }
                        }}
                        className="global_input"
                        placeholder="Scan or type barcode, press Enter"
                    />
                </div>
                {/* Barcode Strip Size */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg px-4 pt-3 pb-1 my-5">
                    <RangeSlider
                        onChange={setBarcodeWidth}
                        value={barcodeWidth}
                        label="Barcode Width"
                        max={3}
                        min={0.5}
                        step={0.1}
                        showTicks
                    />
                    <RangeSlider
                        onChange={setBarcodeHeight}
                        value={barcodeHeight}
                        label="Barcode Height"
                        max={80}
                        min={20}
                        step={1}
                        showTicks
                    />
                </div>

                {/* Fields + Individual Font Sizes */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg px-4 pt-3 pb-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
                        Fields &amp; Font Sizes
                    </p>

                    <FieldControl
                        label="Business Name"
                        toggleValue={showBusinessName}
                        onToggle={setShowBusinessName}
                        fontSize={fs.businessName}
                        onFontSizeChange={handleFieldFsChange("businessName")}
                    />
                    <FieldControl
                        label="Product Name"
                        toggleValue={showProductName}
                        onToggle={setShowProductName}
                        fontSize={fs.productName}
                        onFontSizeChange={handleFieldFsChange("productName")}
                    />
                    <FieldControl
                        label="Barcode Strip"
                        toggleValue={showBarcode}
                        onToggle={setShowBarcode}
                        fontSize={fs.barcodeValue}
                        onFontSizeChange={handleFieldFsChange("barcodeValue")}
                    />
                    {/* Show Code — nested */}
                    <div className="flex items-center gap-4 py-2 pl-2 border-b border-gray-100 dark:border-gray-800">
                        <div className="w-40 shrink-0 pl-4">
                            <ToggleSwitch
                                label="Show Code No."
                                value={showBarcodeValue}
                                onChange={setShowBarcodeValue}
                                disabled={!showBarcode}
                            />
                        </div>
                    </div>
                    <FieldControl
                        label="MRP"
                        toggleValue={showMRP}
                        onToggle={setShowMRP}
                        fontSize={fs.mrp}
                        onFontSizeChange={handleFieldFsChange("mrp")}
                    />
                    <FieldControl
                        label="Exp Date"
                        toggleValue={showExpDate}
                        onToggle={setShowExpDate}
                        fontSize={fs.expDate}
                        onFontSizeChange={handleFieldFsChange("expDate")}
                    />
                    <FieldControl
                        label="Stock"
                        toggleValue={showStock}
                        onToggle={setShowStock}
                        fontSize={fs.stock}
                        onFontSizeChange={handleFieldFsChange("stock")}
                    />
                </div>

                {/* Print Count */}
                <div className="flex items-center gap-3 mt-2">
                    <label className="text-sm font-medium whitespace-nowrap">Print Count</label>
                    <input
                        type="number"
                        min={1}
                        max={500}
                        value={printCount}
                        onChange={(e) => setPrintCount(Math.max(1, Number(e.target.value)))}
                        className="global_input w-24 text-center"
                    />
                </div>

                {/* Print Button */}
                {selectedProduct && (
                    <button
                        onClick={() => printBarcodeSticker(printRef, {
                            title: `Barcode-${selectedProduct?.name}`,
                            paperWidth: "50mm",  // আপনার থার্মাল স্টিকারের রোল সাইজ অনুযায়ী পরিবর্তন করতে পারবেন
                            paperHeight: "30mm"  // আপনার থার্মাল স্টিকারের রোল সাইজ অনুযায়ী পরিবর্তন করতে পারবেন
                        })}
                        className="global_button px-6 py-2 text-sm font-medium rounded mt-5"
                    >
                        Print {printCount} {printCount === 1 ? "copy" : "copies"}
                    </button>
                )}
            </div>



            {/* Preview */}
            {selectedProduct && (
                <div className="space-y-2 w-full lg:w-1/2 h-full">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
                        Preview
                    </p>
                    {/* flex-wrap এবং gap দিয়ে কার্ডগুলোকে পাশাপাশি এবং নিচে সুন্দরভাবে সাজানো হয়েছে */}
                    <div ref={printRef} 
                     className="grid col-span-auto border border-dashed border-gray-200 dark:border-gray-700 rounded-lg max-h-screen overflow-y-auto">
                        {Array.from({ length: printCount }).map((_, i) => (
                            <BarcodeCard key={`preview-${i}`} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}