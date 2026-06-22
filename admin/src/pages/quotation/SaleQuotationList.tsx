import { useEffect, useState } from "react";
import api from "../../lib/axios";
import Table from "../../components/tables/Table";
import TableFilterBar from "../../components/filters/TableFilterBar";
import Pagination from "../../components/filters/Pagination";
import type { PaginatedResult, QuotationListItem } from "../../types/type";
import TimeAgo from "../../components/Ui/TimeAgo";
import { toast } from "sonner";
import Helper from "../../utils/helper";
import { Dropdown } from "../../components/Ui/Dropdown";
// import ApproveQuotationModal from "../../components/modals/ApproveQuotationModal";
import { useNavigate } from "react-router";

export default function SaleQuotationList() {
  const navigate = useNavigate();
  const [data, setData] = useState<PaginatedResult<QuotationListItem>>({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
  });
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  // const [approveModal, setApproveModal] = useState<boolean>(false);
  // const [modalQuotation, setModalQuotation] = useState<QuotationListItem | null>(null);
  const fetchQuotations = async () => {
    const res = await api("/quotation/list-sale-quotation", {
      params: { search, limit, page },
    });
    if (res.data.success) setData(res.data.data);
  };

  useEffect(() => {
    fetchQuotations();
  }, [limit, page]);

  useEffect(() => {
    const timer = setTimeout(() => { fetchQuotations() }, 400)
    return () => clearTimeout(timer);
  }, [search]);


  const handleDelete = async (id: string) => {

    toast("Are you sure?", {
      action: {
        label: "Delete",
        onClick: async () => {
          await api.delete(`/sale/delete/${id}`);
          await fetchQuotations();
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => { },
      },
    });
  };


  const handleActionChange = (val: string, row: QuotationListItem) => {
    switch (val) {
      // case "Details":
      //   setModalQuotation(row);
      //   setTimeout(() => setApproveModal(true), 50);
      //   break;
      case "Delete":
        handleDelete(row._id); // আপনার তৈরি করা handleDelete ফাংশন
        break;
      case "Details":
        navigate(`/quotation/sale-quotation-invoice/${row._id}`)
        break;
      case "Cancel":
        console.log("Cancelling ID:", row._id); // আপনার তৈরি করা handleDelete ফাংশন
        break;
      default:
        break;
    }
  };


  const getQuotationActions = (status: string): string[] => {
    const currentStatus = (status || "").toLowerCase();

    switch (currentStatus) {
      case "pending":
        return ["Details", "Cancel", "Delete"];
      case "cancel":
        return ["Delete"];
      case "approve":
      default:
        return []; // approved বা অন্য কিছু হলে কোনো অপশন দেখাবে না
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
        keyExtractor={(row) => row._id}
        columns={[
          {
            header: "Status", accessor: (row) => {
              const statusConfig = getQuotationStatusStyle(row.status);

              return (
                <span className={statusConfig.className}>
                  {statusConfig.label}
                </span>
              );
            }, className: "text-start", headerClassName: "text-start",
          },
          { header: "Customer", accessor: "customerName", headerClassName: "text-start" },
          {
            header: "Other Cost", accessor: (row) => (
              <span> {Helper.formatLongNumber(row.otherCost || 0)}</span>

            ), className: "text-center"
          },
          {
            header: "Discount", accessor: (row) => (
              <span> {Helper.formatLongNumber(row.discount)}</span>

            ), className: "text-center"
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
              <span> {Helper.formatLongNumber((row.totalAmount - row.balanceBefore) > 0 ? (row.totalAmount - row.balanceBefore) : 0)}</span>

            ), className: "text-center"
          },

          {
            header: "Paid", accessor: (row) => (
              <span> {Helper.formatLongNumber(row.paid)}</span>

            ), className: "text-center"
          },

          {
            header: "Advance / Due", accessor: (row) => (
              <div className="flex gap-2 justify-center">
                <h1
                  className=""
                >
                  {row.balanceAfter < 0 ? "Due" : "Advance"} {Helper.formatLongNumber(Number(Math.abs(row.balanceAfter)))}
                </h1>
              </div>
            ), className: "text-center"
          },

          {
            header: "Date",
            className: "text-center",
            headerClassName: "text-center min-w-20",
            accessor: (row) => (

              <TimeAgo date={row.SaleDate} />

            )

          },

          {
            header: "Action",
            headerClassName: "text-right",
            className: "text-right",
            accessor: (row) => {
              // বাইরে তৈরি করা ফাংশন থেকে অপশনগুলো নিয়ে আসলাম
              const currentOptions = getQuotationActions(row.status);

              // যদি কোনো অপশন না থাকে (যেমন: Approved)
              if (currentOptions.length === 0) {
                return <span className="text-xs text-gray-400 dark:text-gray-500 pr-2">No Action</span>;
              }

              // ড্রপডাউন সিলেক্ট করলে কী হবে

              return (
                <div className="flex gap-2 justify-end">
                  <Dropdown
                    // @ts-ignore
                    onChange={(status: string) => handleActionChange(status, row)}
                    options={currentOptions}
                    placeholder="Actions"
                    usePortal
                  />
                </div>
              );
            },
          }
        ]}
      />

      {/* Pagination */}
      <Pagination
        total={data.total}
        page={page}
        limit={limit}
        onPageChange={setPage}
      />

      {/* <ApproveQuotationModal close={() => {
        setModalQuotation(null);
        setApproveModal(false);
        fetchQuotations();
      }} isOpen={approveModal} quotation={modalQuotation!} /> */}
    </div>
  );
}


const getQuotationStatusStyle = (status: string) => {
  const currentStatus = (status || "").toLowerCase();

  switch (currentStatus) {
    case "pending":
      return {
        label: "Pending",
        className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 font-medium px-2 py-1 rounded text-xs"
      };
    case "approve":
    case "approved": // ব্যাকএন্ডে approve বা approved যাই থাকুক
      return {
        label: "Approved",
        className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-medium px-2 py-1 rounded text-xs"
      };
    case "cancel":
    case "cancelled":
      return {
        label: "Cancelled",
        className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 font-medium px-2 py-1 rounded text-xs"
      };
    default:
      return {
        label: status || "Unknown",
        className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 font-medium px-2 py-1 rounded text-xs"
      };
  }
};