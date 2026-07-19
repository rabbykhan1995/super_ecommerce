import { useEffect, useState } from "react";
import type { Product, SearchParams, SelectOption, FeaturedProductItem, PaginatedResult } from "../../types/type";
import api from "../../lib/axios";
import Table from "../../components/tables/Table";
import Helper from "../../utils/helper";
import { Trash2 } from "lucide-react";
import Select from "react-select";
import { getReactSelectStyles } from "../../utils/reactSelectStyles";
import ToggleSwitch from "../../components/buttons/ToggleSwitch";
import toast from "react-hot-toast";
import Pagination from "../../components/filters/Pagination";

export default function FeatureProduct() {
    const [featuredData, setFeaturedData] = useState<PaginatedResult<FeaturedProductItem>>({ items: [], total: 0, page: 1, limit: 10 });
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const [products, setProducts] = useState<SelectOption<Product>[]>([]);
    const [productParams, setProductParams] = useState<SearchParams>({ search: "", page: 1, limit: 50 });
    const [selectedProduct, setSelectedProduct] = useState<SelectOption<Product> | null>(null);

    const fetchFeatured = async () => {
        const res = await api("/ecom/featured-product/list", { params: { page, limit } });
        if (res.data.success) setFeaturedData(res.data.data);
    };

    const fetchProducts = async () => {
        const res = await api("/product/list", {
            params: { search: productParams.search, limit: productParams.limit, page: productParams.page },
        });
        if (res.data.success) {
            const featuredIds = featuredData.items.map((fp) => fp.productID);
            setProducts(
                res.data.data.items
                    .filter((p: Product) => !featuredIds.includes(p.id))
                    .map((p: Product) => ({
                        value: String(p.id),
                        label: `${p.name} stock-${!p.manageStock ? " ∞" : p.stock}`,
                        ...p,
                    }))
            );
        }
    };

    useEffect(() => { fetchFeatured(); }, [page, limit]);

    useEffect(() => {
        const timer = setTimeout(() => fetchProducts(), 400);
        return () => clearTimeout(timer);
    }, [productParams.search]);

    useEffect(() => {
        if (featuredData.items.length > 0) fetchProducts();
    }, [featuredData]);

    const handleToggle = async (productID: number) => {
        const res = await api(`/ecom/featured-product/toggle/${productID}`);
        if (res.data.success) {
            setSelectedProduct(null);
            await fetchFeatured();
        }
    };

    const handleRemove = async (id: number) => {
        toast("Remove featured product?", {
            action: {
                label: "Remove",
                onClick: async () => {
                    await api.delete(`/ecom/featured-product/remove/${id}`);
                    await fetchFeatured();
                },
            },
            cancel: { label: "Cancel" },
        });
    };

    return (
        <div className="space-y-4">
            <div className="global_container">
                <h2 className="text-lg font-semibold mb-3">Featured Products</h2>

                <div className="flex lg:flex-row flex-col w-full mb-4">
                    <div className="flex flex-col w-full">
                        <label className="block text-sm font-medium mb-1">Products</label>
                        <Select
                            options={products}
                            value={null}
                            onChange={(val) => setSelectedProduct(val as SelectOption<Product>)}
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
                                    <p className="text-xs text-gray-500">Price: ${selectedProduct.salePrice.toFixed(2)} | Stock: {selectedProduct.stock}</p>
                                    <ToggleSwitch
                                        label="Featured"
                                        value={false}
                                        onChange={() => handleToggle(selectedProduct.id)}
                                    />
                                </div>
                                <button onClick={() => setSelectedProduct(null)} className="global_button_red">X</button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">Total: {featuredData.total}</span>
                    <select
                        className="global_input w-auto text-sm"
                        value={limit}
                        onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                    >
                        {[10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                </div>

                <Table
                    data={featuredData.items}
                    keyExtractor={(row) => String(row.id)}
                    columns={[
                        { header: "#", accessor: (_, i) => (i ?? 0) + 1, className: "w-10 text-center", headerClassName: "text-center" },
                        { header: "Name", accessor: (row) => row.product.name, headerClassName: "min-w-[200px]" },
                        {
                            header: "Price", accessor: (row) =>
                                <span className="flex justify-center">{Helper.formatLongNumber(row.product.salePrice)}</span>,
                            className: "text-center",
                        },
                        {
                            header: "Stock", className: "text-center", headerClassName: "text-center",
                            accessor: (row) => <span className="flex justify-center">{row.product.stock}</span>,
                        },
                        {
                            header: "Published", className: "text-center", headerClassName: "text-center",
                            accessor: (row) => (
                                <span className={row.product.isPublished ? "text-green-600" : "text-red-600"}>
                                    {row.product.isPublished ? "Yes" : "No"}
                                </span>
                            ),
                        },
                        {
                            header: "Action", headerClassName: "text-right", className: "text-right",
                            accessor: (row) => (
                                <div className="flex gap-2 justify-end">
                                    <button onClick={() => handleRemove(row.id)} className="global_edit">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ),
                        },
                    ]}
                />

                <Pagination total={featuredData.total} page={page} limit={limit} onPageChange={setPage} />
            </div>
        </div>
    );
}
