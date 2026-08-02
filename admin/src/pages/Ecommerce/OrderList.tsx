import { useEffect, useState } from "react";
import api from "../../lib/axios";
import Table from "../../components/tables/Table";
import TableFilterBar from "../../components/filters/TableFilterBar";
import Pagination from "../../components/filters/Pagination";
import type { Order, OrderStatus, PaginatedResult } from "../../types/type";
import TimeAgo from "../../components/Ui/TimeAgo";
import Helper from "../../utils/helper";
import toast from "react-hot-toast";
import { Dropdown } from "../../components/Ui/Dropdown";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirm: "Confirmed",
  parcel: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  returned: "Returned",
  cancelled: "Cancelled",
  hold: "Hold",
};

type TransitionAction = {
  label: string;
  status: OrderStatus;
  isConfirmSale?: boolean;
};

const getStatusTransitions = (status: OrderStatus, paymentMethod: string | null): TransitionAction[] => {
  const transitions: Record<OrderStatus, TransitionAction[]> = {
    pending: [
      { label: "Confirm", status: "confirm", isConfirmSale: paymentMethod === "cod" },
      { label: "Hold", status: "hold" },
      { label: "Cancel", status: "cancelled" },
    ],
    confirm: [
      { label: "Parcel", status: "parcel" },
      { label: "Hold", status: "hold" },
      { label: "Cancel", status: "cancelled" },
    ],
    parcel: [
      { label: "Shipped", status: "shipped" },
      { label: "Returned", status: "returned" },
      { label: "Hold", status: "hold" },
    ],
    shipped: [
      { label: "Delivered", status: "delivered" },
      { label: "Returned", status: "returned" },
      { label: "Hold", status: "hold" },
    ],
    delivered: [
      { label: "Returned", status: "returned" },
    ],
    returned: [],
    cancelled: [],
    hold: [
      { label: "Pending", status: "pending" },
      { label: "Confirm", status: "confirm", isConfirmSale: paymentMethod === "cod" },
      { label: "Cancel", status: "cancelled" },
    ],
  };
  return transitions[status] || [];
};

export default function OrderList() {
  const [data, setData] = useState<PaginatedResult<Order>>({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
  });
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);

  const fetchOrders = async () => {
    const res = await api("/order/all-orders", {
      params: { search, limit, page },
    });
    if (res.data.success) setData(res.data.data);
  };

  useEffect(() => {
    fetchOrders();
  }, [limit, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);
  // ------------Note-----------
// --------ekhane onek kichu hobe, confirm hole ekta api, hold hole arekta, parcel hole,  
  const handleStatusChange = async (row: Order, transition: TransitionAction) => {
    try {
      if (transition.isConfirmSale) {
        const saleRes = await api.post(`/order/confirm-sale/${row.id}`);
        if (!saleRes.data.success) {
          toast.error("Failed to create sale record");
          return;
        }
      }

      const res = await api.post(`/order/update-status/${row.id}`, {
        status: transition.status,
      });
      if (res.data.success) {
        toast.success(`Status updated to ${transition.label}`);
        await fetchOrders();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

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
            header: "No",
            accessor: (row) => (
              <span className="text-sm font-medium">
                {row.id}
              </span>
            ),
            headerClassName: "font-center",
            className: "text-center",
          },
          {
            header: "Ecom User",
            accessor: (row) => (
              <span className="text-sm">
                {row.user?.name || "N/A"}
                {row.user?.mobile && (
                  <span className="text-gray-500 block text-xs">
                    {row.user.mobile}
                  </span>
                )}
              </span>
            ),
            headerClassName: "text-sm text-start",
          },
          {
            header: "Shipping Addr.",
            accessor: (row) => (
              <span className="text-xs uppercase font-medium px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700">
                {row.shippingAddress}
              </span>
            ),
            className: "text-center",
            headerClassName: "text-center",
          },
          {
            header: "P. Method",
            accessor: (row) =>
              row.paymentMethod === "stripe" ? (
                <span className="text-green-500 block text-xs">{row.paymentMethod}</span>
              ) : (
                <span className="text-red-500 block text-xs">{row.paymentMethod}</span>
              ),
            headerClassName: "text-center",
            className: "text-center",
          },
          {
            header: "Total",
            accessor: (row) => (
              <span className="text-sm">{Helper.formatLongNumber(row.totalAmount)}</span>
            ),
            className: "text-center",
            headerClassName: "text-center",
          },
          {
            header: "Discount",
            accessor: (row) => (
              <span className="text-sm">{Helper.formatLongNumber(row.discount)}</span>
            ),
            className: "text-center",
            headerClassName: "text-center",
          },
          {
            header: "Date",
            accessor: (row) => (
              <h1 className="flex flex-col">
                <TimeAgo date={row.createdAt} />{" "}
                <span className="text-xs">{Helper.formatDate(row.createdAt)}</span>
              </h1>
            ),
            className: "text-center",
            headerClassName: "text-center min-w-23",
          },
          {
            header: "Status",
            accessor: (row) => {
              const actions = getStatusTransitions(row.status, row.paymentMethod);
              return (
                <div className="flex items-center justify-start gap-2">
                  {actions.length > 0 && (
                    <Dropdown
                      value={STATUS_LABELS[row.status]}
                      options={[STATUS_LABELS[row.status], ...actions.map((a) => a.label)]}
                      onChange={(selectedLabel) => {
                        if (selectedLabel === STATUS_LABELS[row.status]) return;
                        const action = actions.find((a) => a.label === selectedLabel);
                        if (action) handleStatusChange(row, action);
                      }}
                      usePortal
                    />
                  )}
                </div>
              );
            },
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
