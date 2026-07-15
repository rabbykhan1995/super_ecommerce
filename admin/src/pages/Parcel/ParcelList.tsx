import { useEffect, useState } from "react";
import api from "../../lib/axios";
import Table from "../../components/tables/Table";
import TableFilterBar from "../../components/filters/TableFilterBar";
import Pagination from "../../components/filters/Pagination";
import { Trash, ChevronDown } from "lucide-react";
import type { PaginatedResult, ParcelListItem, ParcelStatus } from "../../types/type";
import TimeAgo from "../../components/Ui/TimeAgo";
import Helper from "../../utils/helper";
import toast from "react-hot-toast";
import { Dropdown } from "../../components/Ui/Dropdown";

const STATUS_OPTIONS: ParcelStatus[] = [
  "pending",
  "picked",
  "in_transit",
  "delivered",
  "returned",
  "cancelled",
];

const STATUS_COLORS: Record<ParcelStatus, string> = {
  pending: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  picked: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  in_transit: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  delivered: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  returned: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

const STATUS_LABELS: Record<ParcelStatus, string> = {
  pending: "Pending",
  picked: "Picked",
  in_transit: "In Transit",
  delivered: "Delivered",
  returned: "Returned",
  cancelled: "Cancelled",
};

export default function ParcelList() {
  const [data, setData] = useState<PaginatedResult<ParcelListItem>>({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
  });
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);

  const fetchParcels = async () => {
    const res = await api("/parcel/list", {
      params: { search, limit, page },
    });
    if (res.data.success) setData(res.data.data);
  };

  useEffect(() => {
    fetchParcels();
  }, [limit, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchParcels();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleStatusChange = async (parcelID: number, newStatus: ParcelStatus) => {
    try {
      const res = await api.put(`/parcel/update-status/${parcelID}`, {
        status: newStatus,
      });
      if (res.data.success) {
        toast.success(`Status updated to ${STATUS_LABELS[newStatus]}`);
        await fetchParcels();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleDelete = async (id: number) => {
    toast("Are you sure you want to delete this parcel?", {
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            const res = await api.delete(`/parcel/delete/${id}`);
            if (res.data.success) {
              toast.success("Parcel deleted successfully");
              await fetchParcels();
            }
          } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to delete parcel");
          }
        },
      },
      cancel: { label: "Cancel", onClick: () => {} },
    });
  };

  const totalPages = Math.ceil(data.total / data.limit);

  return (
    <div className="space-y-4">
      <TableFilterBar
        title="Parcels"
        subtitle={`Total: ${data.total}`}
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        addHref="/parcel/create"
        addLabel="New Parcel"
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
            header: "Invoice",
            accessor: (row) => (
              <span className="text-sm font-medium">
                #{row.sale?.invoiceNo || "N/A"}
              </span>
            ),
            headerClassName: "text-start",
          },
          {
            header: "Customer",
            accessor: (row) => (
              <span className="text-sm">
                {row.customer?.name || "N/A"}
                {row.customer?.mobile && (
                  <span className="text-gray-500 block text-xs">
                    {row.customer.mobile}
                  </span>
                )}
              </span>
            ),
            headerClassName: "text-start",
          },
          {
            header: "Type",
            accessor: (row) => (
              <span className="text-xs uppercase font-medium px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700">
                {row.parcelType}
              </span>
            ),
            className: "text-center",
            headerClassName: "text-center",
          },
          {
            header: "Address",
            accessor: (row) => (
              <span className="text-sm max-w-[200px] truncate block" title={row.address}>
                {row.address}
              </span>
            ),
            headerClassName: "text-start",
          },
          {
            header: "Courier",
            accessor: (row) => (
              <span className="text-sm">
                {row.courierName || "-"}
                {row.thirdPartyTrackingNo && (
                  <span className="text-gray-500 block text-xs">
                    {row.thirdPartyTrackingNo}
                  </span>
                )}
              </span>
            ),
            headerClassName: "text-start",
          },
          {
            header: "Local No",
            accessor: (row) => (
              <span className="text-sm">{row.localParcelNo || "-"}</span>
            ),
            className: "text-center",
            headerClassName: "text-center",
          },
          {
            header: "Cost/Due",
            accessor: (row) => (
              <div className="text-xs text-center space-y-0.5">
                {row.shippingCost > 0 && (
                  <div>Ship: {Helper.formatLongNumber(row.shippingCost)}</div>
                )}
                {row.codAmount > 0 && (
                  <div>COD: {Helper.formatLongNumber(row.codAmount)}</div>
                )}
                {row.dueAmount > 0 && (
                  <div className="text-red-500">Due: {Helper.formatLongNumber(row.dueAmount)}</div>
                )}
                {row.shippingCost === 0 && row.codAmount === 0 && row.dueAmount === 0 && (
                  <span>-</span>
                )}
              </div>
            ),
            className: "text-center",
            headerClassName: "text-center",
          },
          {
            header: "Status",
            accessor: (row) => (
              <div className="relative group inline-block">
                <button
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer ${STATUS_COLORS[row.status]}`}
                >
                  {STATUS_LABELS[row.status]}
                  <ChevronDown size={12} />
                </button>
                <div className="absolute right-0 top-full mt-1 z-50 hidden group-hover:block bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[130px]">
                  {STATUS_OPTIONS.map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(row.id, status)}
                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        row.status === status
                          ? "font-bold text-blue-600 dark:text-blue-400"
                          : ""
                      }`}
                    >
                      {STATUS_LABELS[status]}
                    </button>
                  ))}
                </div>
              </div>
            ),
            className: "text-center",
            headerClassName: "text-center",
          },
          {
            header: "Date",
            accessor: (row) => <TimeAgo date={row.parcelDate} />,
            className: "text-center",
            headerClassName: "text-center min-w-20",
          },
          {
            header: "Action",
            headerClassName: "text-right",
            className: "text-right",
            accessor: (row) => (
              <div className="flex gap-2 justify-end">
                {row.deletable && (
                  <button
                    onClick={() => handleDelete(row.id)}
                    className="global_button_red"
                  >
                    <Trash size={15} />
                  </button>
                )}
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
