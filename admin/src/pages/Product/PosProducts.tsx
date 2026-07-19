import { useEffect, useState } from 'react'
import type { Product, SearchParams, SelectOption } from '../../types/type';
import api from '../../lib/axios';
import Table from '../../components/tables/Table';
import Helper from '../../utils/helper';
import { Infinity, Trash2 } from "lucide-react";
import Select from "react-select";
import { getReactSelectStyles } from '../../utils/reactSelectStyles';
import ToggleSwitch from '../../components/buttons/ToggleSwitch';
import toast from 'react-hot-toast';

const PosProducts = () => {
    const [posProducts, setPosProducts] = useState<Product[]>([]);
    const [products, setProducts] = useState<SelectOption<Product>[]>([]);
    const [productParams, setProductParams] = useState<SearchParams>({ search: "", page: 1, limit: 50 });
    const [selectedProduct, setSelectedProduct] = useState<SelectOption<Product> | null>(null);

    const fetchPosProducts = async () => {
        const res = await api("/product/getPosProducts");
        if (res.data.success) setPosProducts(res.data.data);
    };

    const fetchProducts = async () => {
        const res = await api("/product/list", {
            params: { search: productParams.search, limit: productParams.limit, page: productParams.page },
        });
        if (res.data.success) {
            const posIds = posProducts.map((p) => p.id);
            setProducts(
                res.data.data.items
                    .filter((p: Product) => !posIds.includes(p.id))
                    .map((p: Product) => ({
                        value: String(p.id),
                        label: `${p.name} stock-${!p.manageStock ? " ∞" : p.stock}`,
                        ...p,
                    }))
            );
        }
    };

    useEffect(() => { fetchPosProducts(); }, []);

    useEffect(() => {
        const timer = setTimeout(() => fetchProducts(), 400);
        return () => clearTimeout(timer);
    }, [productParams.search]);

    useEffect(() => {
        fetchProducts();
    }, [posProducts]);

    const handleUpdatePosProduct = async (id: number) => {
        const res = await api(`/product/updatePosProduct/${id}`);
        if (res.data.success) {
            setSelectedProduct(null);
            await fetchPosProducts();
        }
    };

    return (
        <div className="space-y-4">

                <h2 className="text-lg font-semibold mb-3">POS Products</h2>

                <div className="flex lg:flex-row flex-col w-full mb-4">
                    <div className="flex flex-col w-full">
                        <label className="block text-sm font-medium mb-1">Products</label>
                        <Select
                            options={products}
                            value={null}
                            onChange={(val) => {
                                if (val?.manageWarranty) {
                                    return toast.error("Manage Warranty Product is not acceptable as pos product");
                                }
                                setSelectedProduct(val as SelectOption<Product>);
                            }}
                            onInputChange={(e) => setProductParams((prev) => ({ ...prev, search: e }))}
                            placeholder="Select Product"
                            isClearable
                            filterOption={() => true}
                            styles={getReactSelectStyles<SelectOption<Product>>()}
                        />
                    </div>
                    <div className="w-full p-5">
                        {!selectedProduct ? null : (
                            <div className="flex justify-between items-center">
                                <div>
                                    <h1 className="font-medium">{selectedProduct.name}</h1>
                                    <p className="text-xs text-gray-500">
                                        Price: ${selectedProduct.salePrice.toFixed(2)} | Stock: {selectedProduct.stock}
                                    </p>
                                    <ToggleSwitch
                                        label="Enable POS"
                                        value={selectedProduct.inPosList}
                                        onChange={() => handleUpdatePosProduct(selectedProduct.id)}
                                    />
                                </div>
                                <button onClick={() => setSelectedProduct(null)} className="global_button_red">X</button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">Total: {posProducts.length}</span>
                </div>

                <Table
                    data={posProducts}
                    keyExtractor={(row) => String(row.id)}
                    columns={[
                        { header: "#", accessor: (_, i) => (i ?? 0) + 1, className: "w-10 text-center", headerClassName: "text-center" },
                        { header: "Name", accessor: "name", headerClassName: "min-w-[200px]" },
                        { header: "Barcode", accessor: "barcode", className: "text-center" },
                        {
                            header: "P. Price", accessor: (row) =>
                                <span className="flex justify-center">{Helper.formatLongNumber(row.purchasePrice)}</span>,
                            className: "text-center",
                        },
                        {
                            header: "S. Price", accessor: (row) =>
                                <span className="flex justify-center">{Helper.formatLongNumber(row.salePrice)}</span>,
                            className: "text-center",
                        },
                        {
                            header: "Stock", className: "text-center", headerClassName: "text-center",
                            accessor: (row) =>
                                row.manageStock ? (
                                    <span>{row.stock} {row.unitName}</span>
                                ) : (
                                    <span className="flex justify-center"><Infinity size={14} /></span>
                                ),
                        },
                        { header: "Brand", accessor: "brandName", className: "text-center" },
                        { header: "Category", accessor: "categoryName", className: "text-center" },
                        {
                            header: "Action", headerClassName: "text-right", className: "text-right",
                            accessor: (row) => (
                                <div className="flex gap-2 justify-end">
                                    <button onClick={() => handleUpdatePosProduct(row.id)} className="global_edit">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ),
                        },
                    ]}
                />
    
        </div>
    );
};

export default PosProducts;
