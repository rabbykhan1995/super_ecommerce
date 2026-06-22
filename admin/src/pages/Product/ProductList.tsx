import { useEffect, useState } from "react";
import api from "../../lib/axios";
import Table from "../../components/tables/Table";
import TableFilterBar from "../../components/filters/TableFilterBar";
import Pagination from "../../components/filters/Pagination";
import { Clipboard, Edit, Infinity } from "lucide-react";
import { Link } from "react-router";
import type { PaginatedResult, Product } from "../../types/type";
import Helper from "../../utils/helper";
import InventoryListModal from "../../components/modals/InventoryListModal";




export default function ProductList() {
  const [data, setData] = useState<PaginatedResult<Product>>({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
  });
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [invenotoryModal, setInventoryModal] = useState<boolean>(false);

  const fetchProducts = async () => {
    const res = await api("/product/list", {
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
                {row.manageStock && <button onClick={() => {
                  const product = row;
                  setModalProduct(product);
                  setInventoryModal(true);
                }} className="global_button bg-blue-400">
                  <Clipboard size={18} />
                </button>}
                <Link to={`/product/edit/${row._id}`}
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
      <InventoryListModal close={() => setInventoryModal(false)} isOpen={invenotoryModal} product={modalProduct!} />
    </div>
  );
}