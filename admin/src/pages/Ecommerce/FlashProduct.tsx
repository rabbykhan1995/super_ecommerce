import { useEffect, useState } from "react";
import type { FlashSaleListItem, FlashSaleProductItem, Product, SelectOption, PaginatedResult } from "../../types/type";
import api from "../../lib/axios";
import Table from "../../components/tables/Table";
import Select from "react-select";
import { getReactSelectStyles } from "../../utils/reactSelectStyles";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

export default function FlashProducts() {
  const [flashSales, setFlashSales] = useState<SelectOption<FlashSaleListItem>[]>([]);
  const [selectedSale, setSelectedSale] = useState<SelectOption<FlashSaleListItem> | null>(null);

  const [products, setProducts] = useState<SelectOption<Product>[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<SelectOption<Product> | null>(null);

  const [discountPrice, setDiscountPrice] = useState<number>(0);
  const [sortOrder, setSortOrder] = useState<number>(0);

  const [saleProducts, setSaleProducts] = useState<FlashSaleProductItem[]>([]);

  const fetchFlashSales = async () => {
    const res = await api("/ecom/flash-sale/list", { params: { limit: 100 } });
    if (res.data.success) {
      setFlashSales(
        res.data.data.items.map((s: FlashSaleListItem) => ({
          value: String(s.id),
          label: `${s.name} (${new Date(s.startDate).toLocaleDateString()} - ${new Date(s.endDate).toLocaleDateString()})`,
          ...s,
        }))
      );
    }
  };

  const fetchProducts = async () => {
    const res = await api("/product/list", { params: { search: productSearch, limit: 20 } });
    if (res.data.success) {
      setProducts(
        res.data.data.items.map((p: Product) => ({
          value: String(p.id),
          label: `${p.name} - stock: ${p.stock}`,
          ...p,
        }))
      );
    }
  };

  const fetchSaleProducts = async (saleId: number) => {
    const res = await api(`/ecom/flash-sale/products/${saleId}`);
    if (res.data.success) setSaleProducts(res.data.data);
  };

  useEffect(() => { fetchFlashSales(); }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchProducts(), 400);
    return () => clearTimeout(timer);
  }, [productSearch]);

  useEffect(() => {
    if (selectedSale) fetchSaleProducts(selectedSale.id);
  }, [selectedSale]);

  const handleAddProduct = async () => {
    if (!selectedSale || !selectedProduct) {
      toast.error("Select a flash sale and a product");
      return;
    }
    if (discountPrice <= 0) {
      toast.error("Discount price must be greater than 0");
      return;
    }
    const res = await api.post("/ecom/flash-sale/add-product", {
      flashSaleID: selectedSale.id,
      productID: selectedProduct.id,
      discountPrice,
      sortOrder,
    });
    if (res.data.success) {
      toast.success("Product added to flash sale");
      setSelectedProduct(null);
      setDiscountPrice(0);
      setSortOrder(0);
      fetchSaleProducts(selectedSale.id);
    }
  };

  const handleRemoveProduct = async (productId: number) => {
    toast("Remove product from flash sale?", {
      action: {
        label: "Remove",
        onClick: async () => {
          await api.delete(`/ecom/flash-sale/remove-product/${productId}`);
          if (selectedSale) fetchSaleProducts(selectedSale.id);
        },
      },
      cancel: { label: "Cancel" },
    });
  };

  const handleSaleChange = (option: SelectOption<FlashSaleListItem> | null) => {
    setSelectedSale(option);
    setSaleProducts([]);
  };

  return (
    <div className="space-y-4">
      <div className="global_container p-4 space-y-4">
        <h2 className="text-lg font-semibold">Assign Products to Flash Sale</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Flash Sale</label>
            <Select
              options={flashSales}
              value={selectedSale}
              onChange={handleSaleChange}
              placeholder="Select Flash Sale"
              isClearable
              filterOption={() => true}
              styles={getReactSelectStyles<SelectOption<FlashSaleListItem>>()}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Product</label>
            <Select
              options={products}
              value={selectedProduct}
              onChange={(val) => {
                setSelectedProduct(val as SelectOption<Product> | null);
                if (val) setDiscountPrice((val as SelectOption<Product>).salePrice || 0);
              }}
              onInputChange={(e) => setProductSearch(e)}
              placeholder="Search and select product"
              isClearable
              filterOption={() => true}
              styles={getReactSelectStyles<SelectOption<Product>>()}
            />
          </div>
        </div>

        {selectedSale && selectedProduct && (
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Discount Price</label>
              <input
                className="global_input w-40"
                type="number"
                min={0}
                step={0.01}
                value={discountPrice || ""}
                onChange={(e) => setDiscountPrice(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sort Order</label>
              <input
                className="global_input w-24"
                type="number"
                min={0}
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
              />
            </div>
            <button className="global_button flex items-center gap-1" onClick={handleAddProduct}>
              <Plus size={16} /> Add
            </button>
          </div>
        )}
      </div>

      {selectedSale && (
        <div className="global_container p-4">
          <h3 className="font-semibold mb-3">
            Products in "{selectedSale.name}" ({saleProducts.length})
          </h3>

          {saleProducts.length > 0 ? (
            <Table
              data={saleProducts}
              keyExtractor={(row) => row.id}
              columns={[
                { header: "#", accessor: (_, i) => (i ?? 0) + 1, className: "w-10 text-center", headerClassName: "text-center" },
                { header: "Product", accessor: (row) => row.productName, headerClassName: "min-w-[200px]" },
                { header: "Sale Price", accessor: (row) => <span>${row.productSalePrice.toFixed(2)}</span>, className: "text-center", headerClassName: "text-center" },
                { header: "Discount Price", accessor: (row) => <span className="text-red-600 font-semibold">${row.discountPrice.toFixed(2)}</span>, className: "text-center", headerClassName: "text-center" },
                { header: "Stock", accessor: (row) => <span className="text-center">{row.productStock}</span>, className: "text-center", headerClassName: "text-center" },
                { header: "Order", accessor: (row) => <span className="text-center">{row.sortOrder}</span>, className: "text-center", headerClassName: "text-center" },
                {
                  header: "Action", headerClassName: "text-right", className: "text-right",
                  accessor: (row) => (
                    <button onClick={() => handleRemoveProduct(row.id)} className="global_button_red">
                      <Trash2 size={14} />
                    </button>
                  ),
                },
              ]}
            />
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No products assigned yet</p>
          )}
        </div>
      )}
    </div>
  );
}
