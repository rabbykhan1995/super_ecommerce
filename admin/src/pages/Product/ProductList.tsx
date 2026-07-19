import { useEffect, useState } from "react";
import api from "../../lib/axios";
import Table from "../../components/tables/Table";
import TableFilterBar from "../../components/filters/TableFilterBar";
import Pagination from "../../components/filters/Pagination";
import { Clipboard, Edit, Infinity } from "lucide-react";
import { Link } from "react-router";
import type { PaginatedResult, Product, VariantListItem } from "../../types/type";
import Helper from "../../utils/helper";
import InventoryListModal from "../../components/modals/InventoryListModal";




export default function ProductList() {
  const [data, setData] = useState<PaginatedResult<VariantListItem>>({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
  });
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [modalProduct, setModalProduct] = useState<VariantListItem | null>(null);
  const [invenotoryModal, setInventoryModal] = useState<boolean>(false);

  const fetchProducts = async () => {
    const res = await api("/product/variant-list", {
      params: { search, limit, page },
    });
    if (res.data.success) setData(res.data.data);
  };

  useEffect(() => {
    fetchProducts();
  }, [limit, page]);

  useEffect(() => {
    const timer = setTimeout(() => { fetchProducts() }, 400)
    return () => clearTimeout(timer);
  }, [search]);

  const totalPages = Math.ceil(data.total / data.limit);

  return (
    <div className=" space-y-4">
      <TableFilterBar
        title="Products"
        subtitle={`Total: ${data.total}`}
        search={search}
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        addHref="/product/new"
        addLabel="New Product"
        limit={limit}
        onLimitChange={(val) => { setLimit(val); setPage(1); }}
      />

      <Table
        data={data.items}
        keyExtractor={(row) => row.id}
        columns={[
          { header: "#", accessor: (_, i) => (i ?? 0) + 1, className: "w-10 text-center", headerClassName: "text-center", },
          { header: "Name", accessor: (row) =>

              <h1 className="max-w-[200px]">{row.product.name} ({row.attributes.map(a=> <span>{a.name}-{a.value}</span>)})</h1>, headerClassName: "min-w-[200px]" },
          { header: "Barcode", accessor: "barcode", className: "text-center" },
   
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
              row.product.manageStock ? (
                <span>{row.stock} {row.product.unit.name}</span>
              ) : (
                <h1 className="flex justify-center"><Infinity size={14} /></h1>
              ),
          },

                    {
            header: "Weight",
            className: "text-center",
            headerClassName: "text-center",
            accessor: (row) =>

                <span>{row.weight} KG</span>
           
          },
          { header: "Brand", accessor: (row) =>
           
                <span>{row.product.brand.name}</span>, className: "text-center" },
          { header: "Category", accessor: (row) =>
           
                <span>{row.product.category.name}</span>, className: "text-center" },

                      { header: "Featured", accessor: (row) =>
           row.product.featured? <span className="text-green-400 text-xs">Yes</span>: <span className="text-red-400 text-xs">No</span>
               , className: "text-center" },
          {
            header: "Action",
            headerClassName: "text-right",
            className: "text-right",
            accessor: (row) => (
              <div className="flex gap-2 justify-end">
                {row.product.manageStock && <button onClick={() => {
                  const product = row;
                  setModalProduct(product);
                  setInventoryModal(true);
                }} className="global_button bg-blue-400">
                  <Clipboard size={18} />
                </button>}
                <Link to={`/product/edit/${row.product.id}`}
                  className="global_button"
                >
                  <Edit size={18} />
                </Link>
              </div>
            ),
          },
        ]}
      />

      {/* Pagination */}
      <Pagination
        total={data.total}
        page={page}
        limit={limit}
        onPageChange={setPage}
      />
      <InventoryListModal close={() => setInventoryModal(false)} isOpen={invenotoryModal} variant={modalProduct!} />
    </div>
  );
}