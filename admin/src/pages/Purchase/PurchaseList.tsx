import { useEffect, useState } from "react";
import api from "../../lib/axios";
import Table from "../../components/tables/Table";
import TableFilterBar from "../../components/filters/TableFilterBar";
import Pagination from "../../components/filters/Pagination";
import { Trash, Undo2 } from "lucide-react";
import { Link } from "react-router";
import type { PaginatedResult, PurchaseListItem } from "../../types/type";
import TimeAgo from "../../components/Ui/TimeAgo";
import { toast } from "sonner";
import Helper from "../../utils/helper";




export default function PurchaseList() {
  const [data, setData] = useState<PaginatedResult<PurchaseListItem>>({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
  });
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);

  const fetchProducts = async () => {
    const res = await api("/purchase/list", {
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


  const handleDelete = async (id: string) => {

    toast("Are you sure?", {
      action: {
        label: "Delete",
        onClick: async () => {
          await api.delete(`/purchase/delete/${id}`);
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
            header: "Invoice", accessor: (row) => (

              <Link to={`/purchase/invoice/${row._id}`}
                className="text-sm"
              >
                {row.invoiceNo}
              </Link>

            ), className: "text-start", headerClassName: "text-start",
          },
          { header: "Supplier", accessor: "supplierName", headerClassName: "text-start" },
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
              <span> {Helper.formatLongNumber(row.totalAmount + row.balanceBefore)}</span>

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
                  {row.balanceAfter > 0 ? "Due" : "Advance"} {Helper.formatLongNumber(Number(Math.abs(row.balanceAfter)))}
                </h1>
              </div>
            ), className: "text-center"
          },

          {
            header: "Date",
            className: "text-center",
            headerClassName: "text-center min-w-20",
            accessor: (row) => (

              <TimeAgo date={row.PurchaseDate} />

            )

          },

          {
            header: "Action",
            headerClassName: "text-right",
            className: "text-right",
            accessor: (row) => (
              <div className="flex gap-2 justify-end">
                {row.deletable && <button onClick={() => handleDelete(row._id)} title="Delete"
                  className="global_button_red"
                >
                  <Trash size={15} />
                </button>}
                <Link to={`/purchase/return/${row._id}`} className="global_button"><Undo2 size={15} /></Link>


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