import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import api from "../../lib/axios";
import type { Brand, Category, SearchParams, SelectOption, Unit, Variant, VariantPayload } from "../../types/type";
import Select from "react-select";
import { getReactSelectStyles } from "../../utils/reactSelectStyles";
import ToggleSwitch from "../../components/buttons/ToggleSwitch";
import { updateProductSchema } from "../../validators/product.validator";
import toast from "react-hot-toast";
import AttributeCell from "../../components/modals/AttributeCell";
import Table from "../../components/tables/Table";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [units, setUnits] = useState<SelectOption<Unit>[]>([]);
  const [brands, setBrands] = useState<SelectOption<Brand>[]>([]);
  const [categories, setCategories] = useState<SelectOption<Category>[]>([]);
  const [oldData, setOldData] = useState(null);
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
  const [variants, setVariants] = useState<Variant[] | VariantPayload[] | []>([]);
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
      setCategories(categoriesRes.data.data.map((c: Category) => ({ value: c.id, label: c.name, ...c })));
    if (unitsRes.data.success)
      setUnits(unitsRes.data.data.map((u: Unit) => ({ value: u.id, label: u.name, ...u })));
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
          value: b.id,
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
    if (p.brand) setSelectedBrand({ value: p.brand.id, label: p.brand.name, id: p.brand.id, name: p.brand.name });
    if (p.unit) setSelectedUnit({ value: p.unit.id, label: p.unit.name, id: p.unit.id, name: p.unit.name });
    if (p.category) setSelectedCategory({ value: p.category.id, label: p.category.name, id: p.category.id, name: p.category.name });
    
    setVariants(p.variants);
    setOldData(p)

  };

  useEffect(() => {
    Promise.all([fetchOptions(), fetchProduct()])
  }, [id]);

  const updateProduct = async () => {
 
 const oldVariantMap = new Map(oldData!.variants!.map(v => [v.id, v]));

  // শুধু পরিবর্তিত ভ্যারিয়েন্ট ফিল্টার
  const updatedVariants = variants.filter(v => {
    const old = oldVariantMap.get(v.id);
    if (!old) return false;
    return JSON.stringify(old) !== JSON.stringify(v);
  });

  // নতুন ভ্যারিয়েন্ট (যাদের id নেই)
  const newVariants = variants.filter(v => !v.id);

  // সব পরিবর্তিত ভ্যারিয়েন্ট একত্রিত
  const changedVariants = [...updatedVariants, ...newVariants];

  // payload এর জন্য ফরম্যাট
  const formattedVariant = changedVariants.map(v => ({
    ...v,
    barcode: v.barcode || undefined
  }));

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
    variants: formattedVariant // শুধু পরিবর্তিত + নতুন
  };

    const result = updateProductSchema.safeParse(payload);
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }

    const res = await api.put(`/product/update2/${id}`, result.data);
    if (res.data.success) navigate("/product/list");
  };
  useEffect(() => {
    const timer = setTimeout(() => fetchBrands(), 400);
    return () => clearTimeout(timer);
  }, [brandParams.search]);
  // if (loading) return <div className="global_container">Loading...</div>;
  const handleAddVariant = () => {
    const newVariant: VariantPayload = {
      salePrice: 0,
      barcode: "",
      weight: 0,
      attributes: [] // ফাঁকা অ্যারে
    }

    setVariants(prev => [...prev, newVariant]);
  };

  const changeVariant = (index: number, field: keyof VariantPayload, value: any) => {
  setVariants(prev => {
    const updated = [...prev];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    return updated;
  });
};

  const handleRemoveVariant = (indexToRemove: number) => {
    setVariants(prev => prev.filter((_, index) => index !== indexToRemove));
  };
  return (
    <div className="grid lg:grid-cols-3 grid-cols-1 gap-2 space-y-4">
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

            <div className="col-span-3">
   <Table data={variants}
          keyExtractor={(_, i) => i} columns={[
            { header: "#", accessor: (_, i) => (i ?? 0) + 1, className: "w-10 text-center", headerClassName: "text-center", },
            {
              header: "attribute*", accessor: (row, i) =>
                <>
                  <h1 className="flex flex-wrap">
                    {row.attributes.map(a => (<span>({a.name} : {a.value})</span>))}
                  </h1>
                  <AttributeCell
                    variant={row}
                    index={i as number}
                    variants={variants}
                    setVariants={setVariants}
                  /></>

              , className: "text-center"
            },

            {
              header: "barcode", accessor: (row,i) =>
                <input
                  type="string"
                  value={row.barcode}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.preventDefault();
                  }}
                  onChange={(e) => changeVariant(i as number,"barcode",e.target.value,)}
                  placeholder="Barcode"
                  className="global_input"
                />

              , className: "text-center"
            },
            {
              header: "weight", accessor: (row,i) =>
                <input
                  type="number"
                  value={row.weight}
                  onChange={(e) => changeVariant(i as number,"weight" ,e.target.value)}
                  placeholder="weight"
                  className="global_input"
                />

              , className: "text-center"
            },
            {
              header: "sale price", accessor: (row,i) =>
                <input
                  type="number"
                  value={row.salePrice || 0}
                  onChange={(e) => changeVariant(i as number,"salePrice" ,e.target.value)}
                  placeholder="sale price"
                  className="global_input"
                />

              , className: "text-center"
            },

            {
              header: "Action", accessor: (row, i) =>
                variants.length > 1 && !row.id && <button onClick={() => handleRemoveVariant(i as number)}>Remove</button>

              , className: "text-center"
            },

          ]} />
           <button className="global_button my-2" onClick={() => handleAddVariant()}>Add Variant</button>
            </div>

      <div className="col-span-3 flex gap-3">
        <button onClick={updateProduct} className="global_button">Update Product</button>
        <button type="button" onClick={() => navigate("/product/list")} className="global_button_red">Cancel</button>
      </div>
    </div>
  );
}