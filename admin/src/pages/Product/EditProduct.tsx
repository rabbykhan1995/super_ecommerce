import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import api from "../../lib/axios";
import type { Brand, Category, SearchParams, SelectOption, Unit } from "../../types/type";
import Select from "react-select";
import { getReactSelectStyles } from "../../utils/reactSelectStyles";
import ToggleSwitch from "../../components/buttons/ToggleSwitch";
import { updateProductSchema } from "../../validators/product.validator";
import toast from "react-hot-toast";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [units, setUnits] = useState<SelectOption<Unit>[]>([]);
  const [brands, setBrands] = useState<SelectOption<Brand>[]>([]);
  const [categories, setCategories] = useState<SelectOption<Category>[]>([]);

  const [name, setName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [alertQty, setAlertQty] = useState<number | "">("");
  const [selectedBrand, setSelectedBrand] = useState<SelectOption<Brand> | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<SelectOption<Unit> | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<SelectOption<Category> | null>(null);
  const [manageStock, setManageStock] = useState(false);
  const [manageWarranty, setManageWarranty] = useState(false);
  const [decimal, setDecimal] = useState(false);
  // const [loading, setLoading] = useState(true);
  const [purchasePrice, setPurchasePrice] = useState<number | "">("");
  const [salePrice, setSalePrice] = useState<number | "">("");
  const [brandParams, setBrandParams] = useState<SearchParams>({
    search: "",
    page: 1,
    limit: 50,
  });
  const fetchOptions = async () => {
    const [ categoriesRes, unitsRes] = await Promise.all([
      
      api("/category/list"),
      api("/unit/list"),
    ]);
    
    if (categoriesRes.data.success)
      setCategories(categoriesRes.data.data.map((c: Category) => ({ value: c._id, label: c.name, ...c })));
    if (unitsRes.data.success)
      setUnits(unitsRes.data.data.map((u: Unit) => ({ value: u._id, label: u.name, ...u })));
  };


  const fetchBrands = async () => {
    const res = await api("/brand/list", {
      params: {
        search: brandParams.search,
        limit: brandParams.limit,
        page: brandParams.page
      },
    });
    if (res.data.success) {
      setBrands(
        res.data.data.items.map((b: Brand) => ({
          value: b._id,
          label: b.name,
          ...b
        }))
      );
    }
  };

  const fetchProduct = async () => {
    const res = await api(`/product/productByID/${id}`);
    if (!res.data.success) return;

    const p = res.data.data;
    setName(p.name ?? "");
    setBarcode(p.barcode ?? "");
    setAlertQty(p.alertQty ?? "");
    setManageStock(p.manageStock ?? false);
    setManageWarranty(p.manageWarranty ?? false);
    setDecimal(p.decimal ?? false);
    setPurchasePrice(p.purchasePrice);
    setSalePrice(p.salePrice);
    // Select values set হবে options load হওয়ার পরে
    if (p.brand) setSelectedBrand({ value: p.brand._id, label: p.brand.name, _id: p.brand._id, name: p.brand.name });
    if (p.unit) setSelectedUnit({ value: p.unit._id, label: p.unit.name, _id: p.unit._id, name: p.unit.name });
    if (p.category) setSelectedCategory({ value: p.category._id, label: p.category.name, _id: p.category._id, name: p.category.name });
  };

  useEffect(() => {
    Promise.all([fetchOptions(), fetchProduct()])
  }, [id]);

  const updateProduct = async (e: React.SubmitEvent) => {
    e.preventDefault();

    const payload = {
      name,
      barcode: barcode || undefined,
      alertQty: alertQty === "" ? 0 : alertQty,
      manageStock,
      manageWarranty,
      decimal,
      unitID: selectedUnit?.value,
      brandID: selectedBrand?.value ?? null,
      categoryID: selectedCategory?.value ?? null,
      ...(!manageStock ? { salePrice, purchasePrice } : {}),
    };

    const result = updateProductSchema.safeParse(payload);
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }

    const res = await api.put(`/product/update/${id}`, result.data);
    if (res.data.success) navigate("/product/list");
  };
  useEffect(() => {
    const timer = setTimeout(() => fetchBrands(), 400);
    return () => clearTimeout(timer);
  }, [brandParams.search]);
  // if (loading) return <div className="global_container">Loading...</div>;

  return (
    <form onSubmit={updateProduct} className="grid lg:grid-cols-3 grid-cols-1 gap-2 space-y-4">
      <h2 className="global_heading col-span-3">Edit Product</h2>

      {/* Name */}
      <div className="col-span-3">
        <label className="block text-sm font-medium mb-1">Product Name <span className="text-red-500">*</span></label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Product name" className="global_input" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 col-span-3">
        <div className="flex flex-col">
          <label className="block text-sm font-medium mb-1">Brand</label>
          <Select
            options={brands}
            value={selectedBrand}
            onChange={(val) => setSelectedBrand(val as SelectOption<Brand> | null)}
            onInputChange={(e) => setBrandParams(prev => ({ ...prev, search: e }))}
            placeholder="Select Brand"
            isClearable
            styles={getReactSelectStyles<SelectOption<Brand>>()}
          />
        </div>

        <div className="flex flex-col">
          <label className="block text-sm font-medium mb-1">Unit <span className="text-red-500">*</span></label>
          <Select
            options={units}
            value={selectedUnit}
            onChange={(val) => setSelectedUnit(val as SelectOption<Unit> | null)}
            placeholder="Select Unit"
  
            isClearable
            
            styles={getReactSelectStyles<SelectOption<Unit>>()}
          />
        </div>

        <div className="flex flex-col">
          <label className="block text-sm font-medium mb-1">Category</label>
          <Select
            options={categories}
            value={selectedCategory}
            onChange={(val) => setSelectedCategory(val as SelectOption<Category> | null)}
            placeholder="Select Category"
            
            isClearable
            
            styles={getReactSelectStyles<SelectOption<Category>>()}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 col-span-3">
        <div>
          <label className="block text-sm font-medium mb-1">Alert Quantity</label>
          <input
            type="number"
            value={alertQty}
            onChange={(e) => setAlertQty(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="Alert quantity"
            className="global_input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Barcode</label>
          <input
            type="text"
            value={barcode}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.preventDefault();
            }}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="Barcode"
            className="global_input"
          />
        </div>
        {/* Purchase Price */}
        <div>
          <label className="block text-sm font-medium mb-1">Purchase Price</label>
          <input
            type="number"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="Stock quantity"
            className="global_input"
            disabled={manageStock}
          />
        </div>
        {/* Sale Price */}
        <div>
          <label className="block text-sm font-medium mb-1">Sale Price</label>
          <input
            type="number"
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="Stock quantity"
            className="global_input"
            disabled={manageStock}
          />
        </div>

      </div>

      <div className="flex items-center gap-5 col-span-3 lg:col-span-2 justify-between">
        <ToggleSwitch disabled={true} label="Manage Stock" value={manageStock} onChange={setManageStock} />
        <ToggleSwitch disabled={true} label="Manage Warranty" value={manageWarranty} onChange={setManageWarranty} />
        <ToggleSwitch disabled={true} label="Decimal" value={decimal} onChange={setDecimal} />
      </div>

      <div className="col-span-3 flex gap-3">
        <button type="submit" className="global_button">Update Product</button>
        <button type="button" onClick={() => navigate("/product/list")} className="global_button_red">Cancel</button>
      </div>
    </form>
  );
}