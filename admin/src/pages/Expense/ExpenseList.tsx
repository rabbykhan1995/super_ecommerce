import { useEffect, useState } from "react";
import api from "../../lib/axios";
import Table from "../../components/tables/Table";
import TableFilterBar from "../../components/filters/TableFilterBar";
import Pagination from "../../components/filters/Pagination";
import { Trash } from "lucide-react";
import type { ExpenseListItem, PaginatedResult } from "../../types/type";
import TimeAgo from "../../components/Ui/TimeAgo";
import Helper from "../../utils/helper";
import toast from "react-hot-toast";

export default function ExpenseList() {
  const [data, setData] = useState<PaginatedResult<ExpenseListItem>>({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
  });
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);

  const fetchExpenses = async () => {
    const res = await api("/expense/list", {
      params: { search, limit, page },
    });
    if (res.data.success) setData(res.data.data);
  };

  useEffect(() => {
    fetchExpenses();
  }, [limit, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchExpenses();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDelete = async (id: string) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2">
          <span>Delete this expense?</span>
          <div className="flex gap-2">
            <button
              className="global_button_red text-sm px-3 py-1"
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  const res = await api.delete(`/expense/delete/${id}`);
                  if (res.data.success) {
                    toast.success("Expense deleted");
                    await fetchExpenses();
                  }
                } catch (err: any) {
                  toast.error(err?.response?.data?.message ?? "Delete failed");
                }
              }}
            >
              Delete
            </button>
            <button
              className="global_button text-sm px-3 py-1"
              onClick={() => toast.dismiss(t.id)}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: 10000 },
    );
  };

  return (
    <div className="space-y-4">
      <TableFilterBar
        title="Expenses"
        subtitle={`Total: ${data.total}`}
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        addHref="/expense/create"
        addLabel="New Expense"
        limit={limit}
        onLimitChange={(val) => {
          setLimit(val);
          setPage(1);
        }}
      />

      <Table
        data={data.items}
        keyExtractor={(row) => row.id}
        columns={[
          {
            header: "#",
            accessor: (_, i) => (i ?? 0) + 1,
            className: "w-10 text-center",
            headerClassName: "text-center",
          },
          {
            header: "Type",
            accessor: (row) => (
              < >
                {row.expenseType.name}
              </>
            ),
            headerClassName: "text-start min-w-[160px]",
          },
          {
            header: "Paid",
            accessor: (row) => (
              <span className="flex justify-center">
                {Helper.formatLongNumber(row.paid)}
              </span>
            ),
            className: "text-center",
          },
          {
            header: "Note",
            accessor: (row) => row.note || "—",
            headerClassName: "text-start",
          },
          {
            header: "Date",
            className: "text-center",
            headerClassName: "text-center min-w-20",
            accessor: (row) => <TimeAgo date={row.expenseDate} />,
          },
          {
            header: "Action",
            headerClassName: "text-right",
            className: "text-right",
            accessor: (row) => (
              <button
                onClick={() => handleDelete(String(row.id))}
                title="Delete"
                className="global_button_red"
              >
                <Trash size={15} />
              </button>
            ),
          },
        ]}
      />

      <Pagination
        total={data.total}
        page={page}
        limit={limit}
        onPageChange={setPage}
      />
    </div>
  );
}
