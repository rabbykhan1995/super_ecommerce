import { useEffect, useState } from "react";
import api from "../../lib/axios";
import Table from "../../components/tables/Table";
import TableFilterBar from "../../components/filters/TableFilterBar";
import Pagination from "../../components/filters/Pagination";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import type { FeaturedProductItem, PaginatedResult } from "../../types/type";

export default function FeatureProduct() {
  const [data, setData] = useState<PaginatedResult<FeaturedProductItem>>({ items: [], total: 0, page: 1, limit: 10 });
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [productSearch, setProductSearch] = useState("");
  const [productOptions, setProductOptions] = useState<{ id: number; name: string; salePrice: number }[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<number>(0);

  const fetchData = async () => {
    const res = await api("/ecom/featured-product/list", { params: { limit, page } });
    if (res.data.success) setData(res.data.data);
  };

  useEffect(() => { fetchData(); }, [limit, page]);

  const searchProducts = async (q: string) => {
    setProductSearch(q);
    if (q.length < 2) { setProductOptions([]); return; }
    const res = await api("/product/list", { params: { search: q, limit: 20 } });
    if (res.data.success) setProductOptions(res.data.data.items.map((p: any) => ({ id: p.id, name: p.name, salePrice: p.salePrice })));
  };

  const handleAdd = async () => {
    if (!selectedProduct) { toast.error("Select a product"); return; }
    const res = await api.post("/ecom/featured-product/add", { productID: selectedProduct });
    if (res.data.success) {
      setSelectedProduct(0);
      setProductSearch("");
      setProductOptions([]);
      fetchData();
    }
  };

  const handleRemove = async (id: number) => {
    toast("Remove featured product?", {
      action: { label: "Remove", onClick: async () => { await api.delete(`/ecom/featured-product/remove/${id}`); fetchData(); } },
      cancel: { label: "Cancel" },
    });
  };

  return (
    <div className="space-y-4">
      <TableFilterBar
        title="Featured Products"
        subtitle={`Total: ${data.total}`}
        limit={limit}
        onLimitChange={(val) => { setLimit(val); setPage(1); }}
        disableSearch
      />

      <div className="global_container p-4">
        <h2 className="text-lg font-semibold mb-3">Add Featured Product</h2>
        <div className="flex gap-2 items-end flex-wrap">
          <input className="global_input flex-1 min-w-[200px]" placeholder="Search product..." value={productSearch} onChange={(e) => searchProducts(e.target.value)} />
          {productOptions.length > 0 && (
            <select className="global_input" value={selectedProduct} onChange={(e) => setSelectedProduct(Number(e.target.value))}>
              <option value={0}>Select product</option>
              {productOptions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}
          <button className="global_button flex items-center gap-1" onClick={handleAdd}>
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      <Table
        data={data.items}
        keyExtractor={(row) => row.id}
        columns={[
          { header: "#", accessor: (_, i) => (i ?? 0) + 1, className: "w-10 text-center", headerClassName: "text-center" },
          {
            header: "Product", accessor: (row) => (
              <div className="flex items-center gap-3">
                {row.product.thumbnail && <img src={row.product.thumbnail} alt="" className="w-10 h-10 object-cover rounded" />}
                <div>
                  <p className="font-medium">{row.product.name}</p>
                  <p className="text-xs text-gray-500">Stock: {row.product.stock}</p>
                </div>
              </div>
            ),
          },
          { header: "Price", accessor: (row) => <span>${row.product.salePrice.toFixed(2)}</span>, className: "text-center", headerClassName: "text-center" },
          { header: "Order", accessor: (row) => <span className="text-center">{row.sortOrder}</span>, className: "text-center", headerClassName: "text-center" },
          { header: "Published", accessor: (row) => <span className={row.product.isPublished ? "text-green-600" : "text-red-600"}>{row.product.isPublished ? "Yes" : "No"}</span>, className: "text-center", headerClassName: "text-center" },
          {
            header: "Action", headerClassName: "text-right", className: "text-right",
            accessor: (row) => <button onClick={() => handleRemove(row.id)} className="global_button_red"><Trash2 size={14} /></button>,
          },
        ]}
      />

      <Pagination total={data.total} page={page} limit={limit} onPageChange={setPage} />
    </div>
  );
}
