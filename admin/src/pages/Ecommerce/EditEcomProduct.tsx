import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import api from "../../lib/axios";
import type { Brand, Category, SearchParams, SelectOption, Unit, VariantPayload } from "../../types/type";
import Select from "react-select";
import { getReactSelectStyles } from "../../utils/reactSelectStyles";
import ToggleSwitch from "../../components/buttons/ToggleSwitch";
import { updateProductSchema } from "../../validators/product.validator";
import toast from "react-hot-toast";
import AttributeCell from "../../components/modals/AttributeCell";
import Table from "../../components/tables/Table";
import ImageUploader from "../../components/Ui/ImageUploader";
import Editor from "../../components/mdx/MDXEditor";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

export default function EditEcomProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [units, setUnits] = useState<SelectOption<Unit>[]>([]);
  const [brands, setBrands] = useState<SelectOption<Brand>[]>([]);
  const [categories, setCategories] = useState<SelectOption<Category>[]>([]);
  const [oldData, setOldData] = useState<any>(null);
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [alertQty, setAlertQty] = useState<number | "">("");
  const [selectedBrand, setSelectedBrand] = useState<SelectOption<Brand> | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<SelectOption<Unit> | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<SelectOption<Category> | null>(null);
  const [manageStock, setManageStock] = useState(false);
  const [manageWarranty, setManageWarranty] = useState(false);
  const [decimal, setDecimal] = useState(false);
  const [productThumbnail, setProductThumbnail] = useState<string>("");
  const [productThumbnailFileId, setProductThumbnailFileId] = useState<string>("");
  const [video, setVideo] = useState("");
  const [purchasePrice, setPurchasePrice] = useState<number | "">("");
  const [salePrice, setSalePrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState<string>("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [inPosList, setInPosList] = useState(false);
  const [status, setStatus] = useState("active");
  const [featured, setFeatured] = useState(false);
  const [showStock, setShowStock] = useState(true);
  const [sortOrder, setSortOrder] = useState<number | "">(0);
  const [variants, setVariants] = useState<any[]>([]);
  const [brandParams, setBrandParams] = useState<SearchParams>({
    search: "",
    page: 1,
    limit: 50,
  });

  const fetchOptions = async () => {
    const [categoriesRes, unitsRes] = await Promise.all([
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
    setSku(p.sku ?? "");
    setAlertQty(p.alertQty ?? "");
    setManageStock(p.manageStock ?? false);
    setManageWarranty(p.manageWarranty ?? false);
    setDecimal(p.decimal ?? false);
    setPurchasePrice(p.purchasePrice);
    setSalePrice(p.salePrice);
    setStock(p.stock ?? "");
    setProductThumbnail(p.thumbnail ?? "");
    setProductThumbnailFileId(p.thumbnailFileId ?? "");
    setVideo(p.video ?? "");
    setShortDescription(p.shortDescription ?? "");
    setDescription(p.description ?? "");
    setMetaTitle(p.metaTitle ?? "");
    setMetaDescription(p.metaDescription ?? "");
    setKeywords(p.keywords ?? []);
    setIsPublished(p.isPublished ?? false);
    setInPosList(p.inPosList ?? false);
    setStatus(p.status ?? "active");
    setFeatured(p.featured ?? false);
    setShowStock(p.showStock ?? true);
    setSortOrder(p.sortOrder ?? 0);

    if (p.brand) setSelectedBrand({ value: p.brand.id, label: p.brand.name, id: p.brand.id, name: p.brand.name });
    if (p.unit) setSelectedUnit({ value: p.unit.id, label: p.unit.name, id: p.unit.id, name: p.unit.name });
    if (p.category) setSelectedCategory({ value: p.category.id, label: p.category.name, id: p.category.id, name: p.category.name });

    setVariants(p.variants);
    setOldData(p);
  };

  useEffect(() => {
    Promise.all([fetchOptions(), fetchProduct()]);
  }, [id]);

  const addKeyword = () => {
    const trimmed = keywordInput.trim();
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords(prev => [...prev, trimmed]);
    }
    setKeywordInput("");
  };

  const removeKeyword = (kw: string) => {
    setKeywords(prev => prev.filter(k => k !== kw));
  };

  const updateProduct = async () => {
    if (!oldData) return;

    const productFields: Record<string, any> = {};

    if (name !== oldData.name) productFields.name = name;
    if (sku !== (oldData.sku ?? "")) productFields.sku = sku || null;
    if (alertQty !== (oldData.alertQty ?? "")) productFields.alertQty = alertQty === "" ? 0 : alertQty;
    if (manageStock !== oldData.manageStock) productFields.manageStock = manageStock;
    if (manageWarranty !== oldData.manageWarranty) productFields.manageWarranty = manageWarranty;
    if (decimal !== oldData.decimal) productFields.decimal = decimal;
    if (selectedUnit?.value !== oldData.unit?.id) productFields.unitID = selectedUnit?.value;
    if ((selectedBrand?.value ?? null) !== (oldData.brand?.id ?? null)) productFields.brandID = selectedBrand?.value ?? null;
    if ((selectedCategory?.value ?? null) !== (oldData.category?.id ?? null)) productFields.categoryID = selectedCategory?.value ?? null;

    if (!manageStock) {
      if (salePrice !== (oldData.salePrice ?? "")) productFields.salePrice = salePrice;
      if (purchasePrice !== (oldData.purchasePrice ?? "")) productFields.purchasePrice = purchasePrice;
    }

    if (stock !== (oldData.stock ?? "")) productFields.stock = stock === "" ? 0 : stock;
    if (productThumbnail !== (oldData.thumbnail ?? "")) productFields.thumbnail = productThumbnail || null;
    if (productThumbnailFileId !== (oldData.thumbnailFileId ?? "")) productFields.thumbnailFileId = productThumbnailFileId || null;
    if (video !== (oldData.video ?? "")) productFields.video = video || null;
    if (shortDescription !== (oldData.shortDescription ?? "")) productFields.shortDescription = shortDescription || null;
    if (description !== (oldData.description ?? "")) productFields.description = description || null;
    if (metaTitle !== (oldData.metaTitle ?? "")) productFields.metaTitle = metaTitle || null;
    if (metaDescription !== (oldData.metaDescription ?? "")) productFields.metaDescription = metaDescription || null;
    if (JSON.stringify(keywords) !== JSON.stringify(oldData.keywords ?? [])) productFields.keywords = keywords;
    if (isPublished !== oldData.isPublished) productFields.isPublished = isPublished;
    if (inPosList !== oldData.inPosList) productFields.inPosList = inPosList;
    if (status !== (oldData.status ?? "active")) productFields.status = status;
    if (featured !== oldData.featured) productFields.featured = featured;
    if (showStock !== oldData.showStock) productFields.showStock = showStock;
    if (sortOrder !== (oldData.sortOrder ?? 0)) productFields.sortOrder = sortOrder === "" ? 0 : sortOrder;

    const oldVariantMap = new Map(oldData.variants!.map((v: any) => [v.id, v]));
    const changedVariants: any[] = [];

    for (const v of variants) {
      if (v.id) {
        const old: any = oldVariantMap.get(v.id);
        if (!old) continue;

        const fields: Record<string, any> = { id: v.id };
        let changed = false;

        if (v.barcode !== old.barcode) { fields.barcode = v.barcode || undefined; changed = true; }
        if (v.weight !== old.weight) { fields.weight = v.weight; changed = true; }
        if (v.salePrice !== old.salePrice) { fields.salePrice = v.salePrice; changed = true; }
        if (JSON.stringify(v.attributes) !== JSON.stringify(old.attributes)) { fields.attributes = v.attributes; changed = true; }
        if (JSON.stringify(v.images) !== JSON.stringify(old.images)) { fields.images = v.images; changed = true; }
        if (JSON.stringify(v.imageFileIds) !== JSON.stringify(old.imageFileIds)) { fields.imageFileIds = v.imageFileIds; changed = true; }

        if (changed) changedVariants.push(fields);
      } else {
        changedVariants.push({
          salePrice: v.salePrice,
          barcode: v.barcode || undefined,
          weight: v.weight,
          attributes: v.attributes,
          images: v.images,
          imageFileIds: v.imageFileIds,
        });
      }
    }

    const payload: Record<string, any> = { ...productFields };
    if (changedVariants.length > 0) {
      payload.variants = changedVariants;
    }

    if (Object.keys(payload).length === 0) {
      toast.error("No changes to update");
      return;
    }

    const result = updateProductSchema.safeParse(payload);
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }

    const res = await api.put(`/product/update/${id}`, result.data);
    if (res.data.success) {
      toast.success("Product updated successfully");
      navigate("/ecom/product-list");
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchBrands(), 400);
    return () => clearTimeout(timer);
  }, [brandParams.search]);

  const handleAddVariant = () => {
    const newVariant: VariantPayload = {
      salePrice: 0,
      barcode: "",
      weight: 0,
      attributes: [],
      images: [],
      imageFileIds: []
    };
    setVariants(prev => [...prev, newVariant]);
  };

  const changeVariant = (index: number, field: keyof VariantPayload, value: any) => {
    setVariants(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveVariant = (indexToRemove: number) => {
    setVariants(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="grid lg:grid-cols-3 grid-cols-1 gap-2">
      <h2 className="global_heading col-span-3">Edit Product</h2>

      {/* Name */}
      <div className="col-span-3">
        <label className="block text-sm font-medium mb-1">Product Name <span className="text-red-500">*</span></label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Product name" className="global_input" />
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
        {/* SKU */}
        <div>
          <label className="block text-sm font-medium mb-1">SKU</label>
          <input
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="SKU"
            className="global_input"
          />
        </div>
        {/* Alert Quantity */}
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
        {/* Stock */}
        <div>
          <label className="block text-sm font-medium mb-1">Stock</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="Stock quantity"
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
            placeholder="Purchase price"
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
            placeholder="Sale price"
            className="global_input"
            disabled={manageStock}
          />
        </div>
        {/* Sort Order */}
        <div>
          <label className="block text-sm font-medium mb-1">Sort Order</label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="Sort order"
            className="global_input"
          />
        </div>
        {/* Thumbnail */}
        <ImageUploader
          value={productThumbnail}
          fileIds={productThumbnailFileId ? [productThumbnailFileId] : []}
          label="Product Thumbnail"
          onChange={(val) => setProductThumbnail(typeof val === 'string' ? val : val[0] || '')}
          onFileIdsChange={(ids) => setProductThumbnailFileId(ids[0] || '')}
        />
        {/* Video URL */}
        <div>
          <label className="block text-sm font-medium mb-1">Video URL</label>
          <input
            type="text"
            value={video}
            onChange={(e) => setVideo(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="global_input"
          />
        </div>
        {/* Status */}
        <div className="flex flex-col">
          <label className="block text-sm font-medium mb-1">Status</label>
          <Select
            options={statusOptions}
            value={statusOptions.find(s => s.value === status)}
            onChange={(val) => setStatus(val?.value ?? "active")}
            placeholder="Select Status"
            styles={getReactSelectStyles()}
          />
        </div>
      </div>

      {/* Short Description */}
      <div className="col-span-3">
        <label className="block text-sm font-medium mb-1">Short Description</label>
        <textarea
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          placeholder="Brief product description"
          className="global_input"
          rows={2}
        />
      </div>

      {/* Full Description */}
      <div className="col-span-full">
        <label className="block text-sm font-medium mb-1">Full Description</label>
        {oldData && <Editor key={id} markdown={description} onChange={(v) => setDescription(v)} />}
      </div>

      {/* Toggles */}
      <div className="flex flex-wrap items-center gap-5 col-span-3">
        <ToggleSwitch disabled={true} label="Manage Stock" value={manageStock} onChange={setManageStock} />
        <ToggleSwitch disabled={true} label="Manage Warranty" value={manageWarranty} onChange={setManageWarranty} />
        <ToggleSwitch disabled={true} label="Decimal" value={decimal} onChange={setDecimal} />
        <ToggleSwitch label="Published" value={isPublished} onChange={setIsPublished} />
        <ToggleSwitch label="Featured" value={featured} onChange={setFeatured} />
        <ToggleSwitch label="Show Stock" value={showStock} onChange={setShowStock} />
        <ToggleSwitch label="In POS List" value={inPosList} onChange={setInPosList} />
      </div>

      {/* SEO / Meta */}
      <div className="col-span-3">
        <h3 className="text-sm font-semibold mb-2 mt-2">SEO / Meta Tags</h3>
      </div>
      {/* meta title */}
      <div className="col-span-3">
        <label className="block text-sm font-medium mb-1">Meta Title</label>
        <input
          type="text"
          value={metaTitle}
          onChange={(e) => setMetaTitle(e.target.value)}
          placeholder="SEO meta title"
          className="global_input"
        />
      </div>
      {/* meta description */}
      <div className="col-span-3">
        <label className="block text-sm font-medium mb-1">Meta Description</label>
        <textarea
          value={metaDescription}
          onChange={(e) => setMetaDescription(e.target.value)}
          placeholder="SEO meta description"
          className="global_input"
          rows={2}
        />
      </div>

      {/* Keywords / Tags */}
      <div className="col-span-3">
        <label className="block text-sm font-medium mb-1">Keywords / Tags</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); addKeyword(); }
            }}
            placeholder="Type keyword and press Enter"
            className="global_input flex-1"
          />
          <button type="button" onClick={addKeyword} className="global_button">Add</button>
        </div>
        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {keywords.map((kw) => (
              <span key={kw} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded">
                {kw}
                <button type="button" onClick={() => removeKeyword(kw)} className="text-blue-600 hover:text-blue-900">&times;</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Variants */}
      <div className="col-span-3">
        <Table data={variants}
          keyExtractor={(_, i) => i} columns={[
            { header: "#", accessor: (_, i) => (i ?? 0) + 1, className: "w-10 text-center", headerClassName: "text-center" },
            {
              header: "attribute*", accessor: (row, i) =>
                <>
                  <h1 className="flex flex-wrap">
                    {row.attributes.map((a: any) => (<span>({a.name} : {a.value})</span>))}
                  </h1>
                  <AttributeCell
                    variant={row}
                    index={i as number}
                    variants={variants}
                    setVariants={setVariants}
                  />
                </>
              , className: "text-center"
            },
            {
              header: "barcode", accessor: (row, i) =>
                <input
                  type="string"
                  value={row.barcode}
                  onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
                  onChange={(e) => changeVariant(i as number, "barcode", e.target.value)}
                  placeholder="Barcode"
                  className="global_input"
                />
              , className: "text-center"
            },
            {
              header: "weight", accessor: (row, i) =>
                <input
                  type="number"
                  value={row.weight}
                  onChange={(e) => changeVariant(i as number, "weight", e.target.value)}
                  placeholder="weight"
                  className="global_input"
                />
              , className: "text-center"
            },
            {
              header: "sale price", accessor: (row, i) =>
                <input
                  type="number"
                  value={row.salePrice || 0}
                  onChange={(e) => changeVariant(i as number, "salePrice", e.target.value)}
                  placeholder="sale price"
                  className="global_input"
                />
              , className: "text-center"
            },
            {
              header: "images", accessor: (row, i) =>
                <ImageUploader
                  id={`variant-image-edit-${i}`}
                  value={row.images || []}
                  fileIds={row.imageFileIds || []}
                  multiple
                  label="Variant Images"
                  maxFiles={5}
                  onChange={(val) => changeVariant(i as number, "images", val)}
                  onFileIdsChange={(ids) => changeVariant(i as number, "imageFileIds", ids)}
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

      <div className="col-span-3 flex gap-3 my-5">
        <button onClick={updateProduct} className="global_button">Update Product</button>
        <button type="button" onClick={() => navigate("/ecom/product-list")} className="global_button_red">Cancel</button>
      </div>
    </div>
  );
}
