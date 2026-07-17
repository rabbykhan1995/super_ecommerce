import { useEffect, useState } from "react";
import api from "../../lib/axios";
import Table from "../../components/tables/Table";
import TableFilterBar from "../../components/filters/TableFilterBar";
import Pagination from "../../components/filters/Pagination";
import { Clipboard, Edit, Infinity } from "lucide-react";
import { Link } from "react-router";
import type { EcomProductListItem, PaginatedResult, Product, VariantListItem } from "../../types/type";
import Helper from "../../utils/helper";
import ToggleSwitch from "../../components/buttons/ToggleSwitch";

export default function EcomProductList() {
  const [data, setData] = useState<PaginatedResult<EcomProductListItem>>({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
  });
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);

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

  const handleProductPublishChange = async (
    productID: number,
    isPublished: boolean
  ) => {
    const res = await api.put(`/product/update/${productID}`, {
      isPublished,
    });

    if (res.data.success) {
      await fetchProducts();
    }
  };

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
          {
            header: "Name", accessor: (row) =>

              <h1 className="max-w-[200px]">{row.name}</h1>, headerClassName: "min-w-[200px]"
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
                <span>{row.stock} {row.unit.name}</span>
              ) : (
                <h1 className="flex justify-center"><Infinity size={14} /></h1>
              ),
          },

          {
            header: "Brand", accessor: (row) =>

              <span>{row.brand?.name}</span>, className: "text-center"
          },
          {
            header: "Category", accessor: (row) =>

              <span>{row.category?.name}</span>, className: "text-center"
          },
          {
            header: "Ecom",
            className: "text-center",
            headerClassName: "text-center",
            accessor: (row) => (
              <ToggleSwitch
                label=""
                value={row.isPublished}
                onChange={(val) => handleProductPublishChange(row.id, val)}
              />
            ),
          },
          {
            header: "Action",
            headerClassName: "text-right",
            className: "text-right",
            accessor: (row) => (
              <div className="flex gap-2 justify-end">
                <Link to={`/ecom/edit-product/${row.id}`}
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

    </div>
  );
}