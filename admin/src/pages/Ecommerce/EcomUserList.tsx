import { useEffect, useState } from "react";
import api from "../../lib/axios";
import Table from "../../components/tables/Table";
import TableFilterBar from "../../components/filters/TableFilterBar";
import Pagination from "../../components/filters/Pagination";
import { Clipboard, Edit, Infinity } from "lucide-react";
import { Link } from "react-router";
import type { PaginatedResult, User } from "../../types/type";
import Helper from "../../utils/helper";
import InventoryListModal from "../../components/modals/InventoryListModal";
import TimeAgo from "../../components/Ui/TimeAgo";




export default function EcomUserList() {
  const [data, setData] = useState<PaginatedResult<User>>({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
  });
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  // const [modalProduct, setModalProduct] = useState<VariantListItem | null>(null);
  // const [invenotoryModal, setInventoryModal] = useState<boolean>(false);

  const fetchUsers = async () => {
    const res = await api("/auth/all-users-list", {
      params: { search, limit, page },
    });
    if (res.data.success) setData(res.data.data);
  };

  useEffect(() => {
    fetchUsers();
  }, [limit, page]);

  useEffect(() => {
    const timer = setTimeout(() => { fetchUsers() }, 400)
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
          {
            header: "Name", accessor: (row) =>

              <h1 className="">{row.name}</h1>, headerClassName: "min-w-[200px] text-start", className:"text-start"
          },
          {
            header: "Address", accessor: (row) =>

              <h1 className="max-w-[200px]">{row?.contact?.address??"---"}</h1>, className: "text-start"
          },

          {
            header: "Mobile", accessor: (row) =>

              <h1 className="flex justify-center">{row?.mobile ?? "---"}</h1>
            , className: "text-center"
          },
          {
            header: "Email",
            className: "text-start",
            headerClassName: "text-start",
            accessor: (row) =>
                <span>{row.email} </span>
          },
              {
            header: "Joined",
            className: "text-center",
            headerClassName: "text-center",
            accessor: (row) =>
                <h1 className="flex flex-col text-sm"><TimeAgo date={row.createdAt}  /> <span className="text-xs">{Helper.formatDate(row.createdAt)}</span> </h1>
          },
              {
            header: "Balance", accessor: (row) =>

              <h1 className="flex justify-center">{Helper.formatLongNumber(row?.contact?.balance || 0)}</h1>
            , className: "text-center"
          },
          {
            header: "Action",
            headerClassName: "text-right",
            className: "text-right",
            accessor: (row) => (
              <div className="flex gap-2 justify-end">
                {/* {row.product.manageStock && <button onClick={() => {
                  const product = row;
                  setModalProduct(product);
                  setInventoryModal(true);
                }} className="global_button bg-blue-400">
                  <Clipboard size={18} />
                </button>} */}
                {/* <Link to={`/product/edit/${row.product.id}`}
                  className="global_button"
                >
                  <Edit size={18} />
                </Link> */}
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
      {/* <InventoryListModal close={() => setInventoryModal(false)} isOpen={invenotoryModal} variant={modalProduct!} /> */}
    </div>
  );
}