import { useEffect, useState } from "react";
import api from "../../lib/axios";
import Table from "../../components/tables/Table";
import TableFilterBar from "../../components/filters/TableFilterBar";
import Pagination from "../../components/filters/Pagination";
import { Delete, DeleteIcon, Heading1, Infinity, LucideDelete, RemoveFormatting, Trash } from "lucide-react";
import { Link, useParams } from "react-router";
import type { LedgerListItem, PaginatedResult, SaleListItem } from "../../types/type";
import TimeAgo from "../../components/Ui/TimeAgo";
import { toast } from "sonner";
import Helper from "../../utils/helper";




export default function CustomerLedger() {
  const [data, setData] = useState<PaginatedResult<LedgerListItem>>({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
  });
  const { id } = useParams<{ id: string }>();
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);

  const fetchLedger = async () => {

    const res = await api("/ledger/list", {
      params: { contactID: id, limit, page },
    });
    if (res.data.success) setData(res.data.data);
  };

  useEffect(() => {
    fetchLedger();
  }, [limit, page]);


  const totalPages = Math.ceil(data.total / data.limit);

  // const handleDelete = async (id: string) => {

  //   toast("Are you sure?", {
  //     action: {
  //       label: "Delete",
  //       onClick: async () => {
  //         await api.delete(`/sale/delete/${id}`);
  //         await fetchProducts();
  //       },
  //     },
  //     cancel: {
  //       label: "Cancel",
  //       onClick: () => { },
  //     },
  //   });
  // };

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
            header: "Type", accessor: (row) => (

              <h1>{row?.type}</h1>

            ), className: "text-start", headerClassName: "text-start",
          },

          {
            header: "Payable", accessor: (row) => (

              <h1>{row?.amount}</h1>

            ), className: "text-center"
          },
          { header: "Discount", accessor: "discount", className: "text-center" },
          {
            header: "Due", accessor: (row) => (
              <div className="flex gap-2 justify-center">
                <h1
                  className=""
                >
                  {row.dueAmount}
                </h1>
              </div>
            ), className: "text-center"
          },


          { header: "Paid", accessor: "paidAmount", className: "text-center" },

          {
            header: "Balance",
            className: "text-center",
            headerClassName: "text-center min-w-20",
            accessor: (row) => (

              <h1>{`${row?.balanceAfter > 0 ? "Dibo" : "Pabo"} - ${Helper.formatLongNumber(Math.abs(row?.balanceAfter))}`}</h1>

            )

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
                {row.type === "sale" ? (
                  <Link to={`/sale/invoice/${row?.typeID}`} className="global_button bg-[#238b95]">Sale</Link>
                ) : row.type === "sale_return" ? (
                  <Link to={`/sale/invoice/${row?.typeID}`} className="global_button bg-[#e07b39]">Sale Return</Link>
                ) : row.type === "purchase" ? (
                  <Link to={`/purchase/${row?.typeID}`} className="global_button bg-[#7b52ab]">Purchase</Link>
                ) : row.type === "purchase_return" ? (
                  <Link to={`/purchase/${row?.typeID}`} className="global_button bg-[#c0392b]">Purchase Return</Link>
                ) : row.type === "payment_in" || row.type === "payment_out" ? (
                  <Link to={`/account/transaction-details/${row?.typeID}`} className="global_button bg-[#38ad51]">Transaction</Link>
                ) : ""}

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