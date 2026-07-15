import { useEffect, useState } from "react";
import api from "../../lib/axios";
import type { Brand, Category, SearchParams, SelectOption, Unit, VariantPayload } from "../../types/type";
import Select from "react-select";
import { getReactSelectStyles } from "../../utils/reactSelectStyles";
import ToggleSwitch from "../../components/buttons/ToggleSwitch";
import { createProductSchema } from "../../validators/product.validator";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import Table from "../../components/tables/Table";

import AttributeCell from "../../components/modals/AttributeCell";
import ImageUploader from "../../components/Ui/ImageUploader";

export default function NewProduct() {
  const navigate = useNavigate();
  const [units, setUnits] = useState<SelectOption<Unit>[]>([]);
  const [categories, setCategories] = useState<SelectOption<Category>[]>([]);
  const [name, setName] = useState<string>("");
  const [alertQty, setAlertQty] = useState<number | "">("");
  const [selectedBrand, setSelectedBrand] = useState<SelectOption<Brand> | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<SelectOption<Unit> | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<SelectOption<Category> | null>(null);
  const [manageStock, setManageStock] = useState<boolean>(true);
  const [manageWarranty, setManageWarranty] = useState<boolean>(false);
  const [decimal, setDecimal] = useState<boolean>(false);
  const [stock, setStock] = useState<number | "">("");
  const [purchasePrice, setPurchasePrice] = useState<number | "">("");
  const [salePrice, setSalePrice] = useState<number | "">("");
  const [variants, setVariants] = useState<VariantPayload[]>([{ salePrice: 0, barcode: "", weight: 0, attributes: [{ name: "base", value: "none" }], images: [] }]);
  const [brandParams, setBrandParams] = useState<SearchParams>({
    search: "",
    page: 1,
    limit: 50,
  });
  const [brands, setBrands] = useState<SelectOption<Brand>[]>([]);
  const fetchCategories = async () => {
    const res = await api("/category/list");
    if (res.data.success)
      setCategories(
        res.data.data.map((c: Category) => ({ value: c.id, label: c.name, ...c }))
      );
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


  const fetchUnits = async () => {
    const res = await api("/unit/list");
    if (res.data.success)
      setUnits(
        res.data.data.map((u: Unit) => ({ value: u.id, label: u.name, ...u }))
      );
  };



  useEffect(() => {
    Promise.all([fetchBrands(), fetchCategories(), fetchUnits()]);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchBrands(), 400);
    return () => clearTimeout(timer);
  }, [brandParams.search]);


  const createProduct = async () => {
  
    if (!selectedUnit) {
      toast.error("Unit is required");
      return;
    }
    if (!manageStock && !purchasePrice && !salePrice) {
      toast.error("Sale price and purchase price must include");
      return;
    }

    if (!manageStock && stock) {
      toast.error("You can't provide intial stock after disable manage stock");
      return;
    }

    if (!!manageWarranty && !!stock) {
      toast.error("Disable manage warranty or remove all the initial stock");
      return;
    }

    if (!!manageWarranty && !!decimal) {
      toast.error("Disable manage warranty or decimal");
      return;
    }
    

    const formattedVariant = variants.map(v => {
      if (v.barcode === "") {
        const { barcode, ...rest } = v;
        return rest;
      }
      return v;
    });

    const payload = {
      name,
      alertQty: alertQty === "" ? 0 : alertQty,
      manageStock,
      ...(selectedBrand && { brandID: selectedBrand.id }),
      unitID: selectedUnit.value,
      ...(selectedCategory && { categoryID: selectedCategory.id }),
      decimal,
      salePrice: salePrice === "" ? 0 : Number(salePrice),
      purchasePrice: purchasePrice === "" ? 0 : Number(purchasePrice),
      manageWarranty,
      ...(stock && !!manageStock && { stock }),
      variants:formattedVariant,
    };
    const result = createProductSchema.safeParse(payload);
    if (!result.success) {
      const firstError = result.error.issues[0];
      toast.error(firstError.message);
      return;
    }
    const res = await api.post("/product/create", result.data);
    if (res.data.success === true) {
      return navigate('/product/list')
    }
  };

  useEffect(() => {
    if (manageWarranty) {
      setStock("");
    }
  }, [manageWarranty])


  const handleAddVariant = () => {
    const newVariant: VariantPayload = {
      salePrice: 0,
      barcode: "",
      weight: 0,
      attributes: [],
      images: []
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
      <h2 className="global_heading">New Product</h2>

      {/* Name */}
      <div className="col-span-3">
        <label className="block text-sm font-medium mb-1">
          Product Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Product name"
          className="global_input"
        />
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 col-span-3">
        {/* Brand */}
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

        {/* Unit */}
        <div className="flex flex-col">
          <label className="block text-sm font-medium mb-1">
            Unit <span className="text-red-500">*</span>
          </label>
          <Select
            options={units}
            value={selectedUnit}
            onChange={(val) => setSelectedUnit(val as SelectOption<Unit> | null)}
            placeholder="Select Unit"
            isClearable
            styles={getReactSelectStyles<SelectOption<Unit>>()}
          />
        </div>

        {/* Category */}
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
        {/* Alert Qty */}
        <div className="">
          <label className="block text-sm font-medium mb-1">Alert Quantity</label>
          <input
            type="number"
            value={alertQty}
            onChange={(e) => setAlertQty(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="Alert quantity"
            className="global_input"
          />
        </div>
        {/* Initial Stock */}
        <div>
          <label className="block text-sm font-medium mb-1">Initial Stock</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="Stock quantity"
            className="global_input"
            disabled={!!manageWarranty}
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
          />
        </div>
        {/* Sale Price */}
        <div>
          <label className="block text-sm font-medium mb-1">Sale Price{!manageStock && <span className="text-red-500">*</span>} </label>
          <input
            type="number"
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="Stock quantity"
            className="global_input"
            required={!manageStock}
          />
        </div>
      </div>



      {/* Manage Stock + Warranty + Decimal */}
      <div className="flex items-center gap-5 col-span-3 lg:col-span-2 justify-between">
        <ToggleSwitch
          label="Manage Stock"
          value={manageStock}
          onChange={setManageStock}
        />
        <ToggleSwitch
          label="Manage Warranty"
          value={manageWarranty}
          onChange={setManageWarranty}
        />
        <ToggleSwitch
          label="Decimal"
          value={decimal}
          onChange={setDecimal}
        />
      </div>



      {/* Variants */}
      <div className="w-full col-span-3">
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
              header: "images", accessor: (row,i) =>
                <ImageUploader
                  id={`variant-image-${i}`}
                  value={row.images || []}
                  multiple
                  label="Variant Images"
                  maxFiles={5}
                  onChange={(val) => changeVariant(i as number, "images", val)}
                />

              , className: "text-center"
            },

            {
              header: "Action", accessor: (_, i) =>
                variants.length > 1 && <button onClick={() => handleRemoveVariant(i as number)}>Remove</button>

              , className: "text-center"
            },

          ]} />
        <button className="global_button my-2" onClick={() => handleAddVariant()}>Add Variant</button>
      </div>



      <button onClick={createProduct} className="global_button">Create Product</button>
    </div>
  );
}


