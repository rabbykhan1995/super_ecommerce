import { useEffect, useState } from "react";
import api from "../../lib/axios";
import Table from "../../components/tables/Table";
import TableFilterBar from "../../components/filters/TableFilterBar";
import Pagination from "../../components/filters/Pagination";
import { Delete, DeleteIcon, Infinity, LucideDelete, RemoveFormatting, Trash, Undo2 } from "lucide-react";
import { Link } from "react-router";
import type { PaginatedResult, SaleReturnListItem } from "../../types/type";
import TimeAgo from "../../components/Ui/TimeAgo";
import { toast } from "sonner";
import Helper from "../../utils/helper";




export default function SaleReturnList() {
  const [data, setData] = useState<PaginatedResult<SaleReturnListItem>>({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
  });
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);

  const fetchProducts = async () => {
    const res = await api("/sale-return/list", {
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

  const handleDelete = async (id: string) => {

    toast("Are you sure?", {
      action: {
        label: "Delete",
        onClick: async () => {
          await api.delete(`/sale-return/delete/${id}`);
          await fetchProducts();
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => { },
      },
    });
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
        keyExtractor={(row) => row._id}
        columns={[
          {
            header: "No", accessor: (row,i) => (

              <Link to={`/sale/invoice/${row._id}`}
                className="text-sm"
              >
                 {(i ?? 0) + 1}
              </Link>

            ), className: "text-center", headerClassName: "text-center",
          },
          { header: "Supplier", accessor: "customerName", headerClassName: "text-start" },
          {
            header: "Other Cost", accessor: (row) =>

              <h1 className="flex justify-center">{Helper.formatLongNumber(row?.otherCost ?? 0)}</h1>, className: "text-center"
          },
          {
            header: "Discount", accessor: (row) =>

              <h1 className="flex justify-center">{Helper.formatLongNumber(row.discount)}</h1>, className: "text-center"
          },
          {
            header: "Prev. S. Due", accessor: (row) => (
              <div className="flex gap-2 justify-center">
                <h1
                  className=""
                >
                  {Helper.formatLongNumber(Number(row.balanceBefore < 0 ? Math.abs(row.balanceBefore) : 0))} { }
                </h1>
              </div>
            ), className: "text-center"
          },
          {
            header: "Payable", accessor: (row) => (
              <span> {Helper.formatLongNumber(row.totalAmount)}</span>

            ), className: "text-center"
          },

          {
            header: "Paid", accessor: (row) =>

              <h1 className="flex justify-center">{Helper.formatLongNumber(row.paid)}</h1>, className: "text-center"
          },

          {
            header: "Advance / Due", accessor: (row) => (
              <div className="flex gap-2 justify-center">
                <h1
                  className=""
                >
                  {(row.totalAmount - row.paid) > 0 ? "Due" : "Advance"} {Helper.formatLongNumber(Number(Math.abs(row.totalAmount - row.paid)))}
                </h1>
              </div>
            ), className: "text-center"
          },

          {
            header: "Date",
            className: "text-center",
            headerClassName: "text-center min-w-20",
            accessor: (row) => (

              <TimeAgo date={row.date} />

            )

          },

          {
            header: "Action",
            headerClassName: "text-right",
            className: "text-right",
            accessor: (row) => (
              <div className="flex gap-2 justify-end">
                <button onClick={() => handleDelete(row._id)} title="Delete"
                  className="global_button_red"
                >
                  <Trash size={15} />
                </button>

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