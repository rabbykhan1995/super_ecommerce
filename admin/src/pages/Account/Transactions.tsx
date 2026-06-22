import { useEffect, useState } from "react";
import api from "../../lib/axios";
import Table from "../../components/tables/Table";
import TableFilterBar from "../../components/filters/TableFilterBar";
import Pagination from "../../components/filters/Pagination";
import { Delete, DeleteIcon, Heading1, Infinity, LucideDelete, RemoveFormatting, Trash } from "lucide-react";
import { Link, useParams } from "react-router";
import type { Account, LedgerListItem, PaginatedResult, SaleListItem, TransactionListItem } from "../../types/type";
import TimeAgo from "../../components/Ui/TimeAgo";
import { toast } from "sonner";
import Helper from "../../utils/helper";




export default function Transactions() {
  const [data, setData] = useState<PaginatedResult<TransactionListItem>>({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
  });
  const [account, setAccount] = useState<Account | null>(null);
  const { id } = useParams<{ id: string }>();
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const fetchAccountDetails = async () => {

    const res = await api(`/account/details/${id}`);
    if (res.data.success) setAccount(res.data.data);
  };
  const fetchTransaction = async () => {

    const res = await api("/transaction/account-list", {
      params: { accountID: id, limit, page },
    });
    if (res.data.success) setData(res.data.data);
  };
  useEffect(() => {
    fetchAccountDetails()
  }, [])
  useEffect(() => {
    fetchTransaction();
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
      <div>
        <h1>Name : {account?.name}</h1>
        <h1>Balance : {account?.balance}</h1>
        <h1>Number : {account?.number}</h1>
      </div>


      <TableFilterBar
        title="Transaction"
        subtitle={`Total: ${data.total}`}
        search={search}
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        // addHref="/product/new"
        // addLabel="New Product"
        limit={limit}
        onLimitChange={(val) => { setLimit(val); setPage(1); }}
        disableSearch={true}
      />

      <Table
        data={data.items}
        keyExtractor={(row) => row._id}
        columns={[
          {
            header: "Type", accessor: (row) => (

              <h1 className=" capitalize">{row?.type === "transfer"? `${row.type}red to ${row.toAccountName}` :row?.type}</h1>

            ), className: "text-start", headerClassName: "text-start",
          },

          {
            header: "Amount", accessor: (row) => (

              <h1>{row?.amount}</h1>

            ), className: "text-center"
          },




          {
            header: "Date",
            className: "text-center",
            headerClassName: "text-center min-w-20",
            accessor: (row) => (

              <TimeAgo date={row?.date as Date} />

            )

          },

          {
            header: "Action",
            headerClassName: "text-right",
            className: "text-right",
            accessor: (row) => (
              <div className="flex gap-2 justify-end">
                {row.type === "sale" && <Link to={`/sale/invoice/${row?.typeID}`} className="global_button bg-[#238b95]">Sale Invoice</Link>}

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