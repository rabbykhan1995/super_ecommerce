import { useEffect, useState } from 'react'
import type { Product, SearchParams, SelectOption } from '../../types/type';
import api from '../../lib/axios';
import Table from '../../components/tables/Table';
import Helper from '../../utils/helper';
import {  Infinity, LucideDelete } from "lucide-react";
import Select from "react-select";
import { getReactSelectStyles } from '../../utils/reactSelectStyles';
import ToggleSwitch from '../../components/buttons/ToggleSwitch';
import toast from 'react-hot-toast';

const PosProducts = () => {
    const [posProducts, setPosProducts] = useState<Product[] | []>([]);
    const [products, setProducts] = useState<SelectOption<Product>[]>([]);
    const [productParams, setProductParams] = useState<SearchParams>({
        search: "",
        page: 1,
        limit: 50,
    });

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const fetchPosProducts = async () => {
        const res = await api("/product/getPosProducts");
        if (res.data.success) setPosProducts(res.data.data);
    };

    const fetchProducts = async () => {
        const res = await api("/product/list", {
            params: { search: productParams.search, limit: productParams.limit, page: productParams.page },
        });
        if (res.data.success)
            setProducts(
                res.data.data.items.map((u: Product) => ({ value: u._id, label: `${u.name} stock-${!u.manageStock ? " ∞" : u.stock}`, ...u }))
            );
    };
    useEffect(() => { fetchPosProducts() }, []);
    useEffect(() => {
        const timer = setTimeout(() => fetchProducts(), 400);
        return () => clearTimeout(timer);
    }, [productParams.search]);


    const handleUpdatePosProduct = async (id: string) => {
        const res = await api(`/product/updatePosProduct/${id}`);
        if (res.data.success) {
            setSelectedProduct(null);
            await Promise.all([fetchPosProducts(), fetchProducts()]);
        }
    }
    return (
        <div>Pos Products

            <div className='flex lg:flex-row flex-col w-full  mb-6'>
                {/* Products */}
                <div className="flex flex-col w-full">
                    <label className="block text-sm font-medium mb-1">Products </label>
                    <Select
                        options={products}
                        value={null}
                        onChange={(val) => {
                            // @ts-ignore
                             if(val.manageWarranty){
                                return toast.error("Manage Warranty Product is not acceptable as pos product")
                             }
                            setSelectedProduct(val as SelectOption<Product>);}}
                        onInputChange={(e) => setProductParams(prev => ({ ...prev, search: e }))}
                        placeholder="Select Product"
                        isClearable
                        styles={getReactSelectStyles<SelectOption<Product>>()}
                    />
                </div>
                <div className='w-full p-5'>
                    {!selectedProduct ? null : (<div className='flex justify-between'><div><h1>{selectedProduct.name}</h1>  <ToggleSwitch  label="Enable Pos" value={selectedProduct.posEnabled} onChange={() => handleUpdatePosProduct(selectedProduct._id)} /> </div>   <button onClick={()=>setSelectedProduct(null)} className='global_button_red'>X</button></div>)}
                
                </div>
            </div>


            <Table
                data={posProducts}
                keyExtractor={(row) => row._id}
                columns={[
                    { header: "#", accessor: (_, i) => (i ?? 0) + 1, className: "w-10 text-center", headerClassName: "text-center", },
                    { header: "Name", accessor: "name", headerClassName: "min-w-[200px]" },
                    { header: "Barcode", accessor: "barcode", className: "text-center" },
                    {
                        header: "P. Price", accessor: (row) =>

                            <h1 className="flex justify-center">{Helper.formatLongNumber(row.purchasePrice)}</h1>, className: "text-center"
                    },
                    {
                        header: "S. Price", accessor: (row) =>

                            <h1 className="flex justify-center">{Helper.formatLongNumber(row.salePrice)}</h1>
                        , className: "text-center"
                    },
                    {
                        header: "Stock",
                        className: "text-center",
                        headerClassName: "text-center",
                        accessor: (row) =>
                            row.manageStock ? (
                                <span>{row.stock} {row.unitName}</span>
                            ) : (
                                <h1 className="flex justify-center"><Infinity size={14} /></h1>
                            ),
                    },
                    { header: "Brand", accessor: "brandName", className: "text-center" },
                    { header: "Category", accessor: "categoryName", className: "text-center" },
                    {
                        header: "Action",
                        headerClassName: "text-right",
                        className: "text-right",
                        accessor: (row) => (
                            <div className="flex gap-2 justify-end">
                                <button onClick={()=>handleUpdatePosProduct(row._id)} 
                                    className="global_edit"
                                >
                                    <LucideDelete size={18} />
                                </button>
                            </div>
                        ),
                    },
                ]}
            />
        </div>
    )
}

export default PosProducts