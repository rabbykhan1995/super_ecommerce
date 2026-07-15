import { useEffect, useState } from "react";
import api from "../../lib/axios";
import Table from "../../components/tables/Table";
import TableFilterBar from "../../components/filters/TableFilterBar";
import Pagination from "../../components/filters/Pagination";
import { Trash } from "lucide-react";
import type { PaginatedResult, WarrantyListItem, WarrantyStatus } from "../../types/type";
import TimeAgo from "../../components/Ui/TimeAgo";
import { toast } from "sonner";
import Helper from "../../utils/helper";
import WarrantyClaimModal from "../../components/modals/warrantyModals/ClaimModal";
import { Dropdown } from "../../components/Ui/Dropdown";
import SendToSupplierModal from "../../components/modals/warrantyModals/SendToSupplierModal";
import SupplierActionModal from "../../components/modals/warrantyModals/SupplierActionModal";


export default function WarrantyList() {
  const [data, setData] = useState<PaginatedResult<WarrantyListItem>>({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
  });
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [selectedWarranty, setSelectedWarranty] = useState<WarrantyListItem | null>(null);
  const [openClaimModal, setOpenClaimModal] = useState(false);
  const [openSendToSupplierModal, setOpenSendToSupplierModal] = useState(false);

  const [openSupplierActionModal, setOpenSupplierActionModal] = useState(false);

  const [openReturnedToCustomerModal, setOpenReturnedToCustomerModal] = useState(false);
  const [openRefundModal, setOpenRefundModal] = useState(false);
  const fetchWarranties = async () => {
    const res = await api("/warranty/list", {
      params: { search, limit, page },
    });
    if (res.data.success) setData(res.data.data);
  };

  useEffect(() => {
    fetchWarranties();
  }, [limit, page]);

  useEffect(() => {
    const timer = setTimeout(() => { fetchWarranties() }, 400)
    return () => clearTimeout(timer);
  }, [search]);
  const handleRecieveFromSupplier = async (warranty: WarrantyListItem) => {
    const payload = {
      status: "received_from_supplier",
      receivedDate: new Date()
    }
    const res = await api.post(`/warranty/recieve-from-supplier/${warranty.id}`, payload);

    if (res.data.success) {
      toast.success(res.data.msg);
    }
  }

  const handleReturnToCustomer = async (warranty: WarrantyListItem) => {
    const payload = {
      status: "returned_to_customer",
      resolvedDate: new Date(),
    }
    const res = await api.post(`/warranty/return-to-customer/${warranty.id}`, payload);

    if (res.data.success) {
      toast.success(res.data.msg);
    }
  }
  const getDropDownOptions = (warranty: WarrantyListItem) => {
    const statusOptions: Record<WarrantyStatus, { label: string; value: WarrantyStatus }[]> = {
      sold: [
        { label: "Claim", value: "claimed" },
      ],
      claimed: [
        { label: "Send To Supplier", value: "sent_to_supplier" },
      ],
      sent_to_supplier: [
        { label: "Supplier Action", value: "supplier_action" as WarrantyStatus },
      ],

      // সাপ্লায়ার অ্যাকশন নেওয়ার পর প্রথম কাজ হলো দোকানদারের পণ্যটি রিসিভ করা
      repaired: [
        { label: "Receive From Supplier", value: "received_from_supplier" },
      ],
      replaced: [
        { label: "Receive From Supplier", value: "received_from_supplier" },
      ],
      rejected: [
        { label: "Receive From Supplier", value: "received_from_supplier" },
      ],
      refunded: [
        { label: "Receive From Supplier", value: "received_from_supplier" },
      ],

      // সাপ্লায়ার থেকে রিসিভ করার পর এবার দোকানদার কাস্টমারকে অপশন দেবে
      received_from_supplier: [
        { label: "Return To Customer", value: "returned_to_customer" },
      ],

      // এগুলো এন্ড স্টেট (End States), তাই এখানে ড্রপডাউন খালি থাকবে
      returned_to_customer: [],
    };

    return statusOptions[warranty.status] || [];
  };
  const handleStatusChange = async (row: WarrantyListItem, status: WarrantyStatus) => {

    setSelectedWarranty(row);

    switch (status) {
      case "claimed":
        setOpenClaimModal(true);
        break;
      case "sent_to_supplier":
        setOpenSendToSupplierModal(true);
        break;

      case "supplier_action" as any:
        setOpenSupplierActionModal(true);
        break;
      case "received_from_supplier":
        await handleRecieveFromSupplier(row);
        await fetchWarranties();
        break;
      case "returned_to_customer":
        await handleReturnToCustomer(row);
        await fetchWarranties();
        break;
      default:
        break;
    }
  };

  const closeAllModals = async () => {
    setOpenClaimModal(false);
    setOpenSendToSupplierModal(false);
    // setOpenReceivedFromSupplierModal(false);
    setOpenSupplierActionModal(false);
    setOpenReturnedToCustomerModal(false);
    setOpenRefundModal(false);
    await fetchWarranties();
  };

  const getStatusStyle = (status: WarrantyStatus): { label: string; className: string } => {
    const styles: Record<WarrantyStatus, { label: string; className: string }> = {
      sold: { label: "Sold", className: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300" },
      claimed: { label: "Claimed", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" },
      sent_to_supplier: { label: "Sent To Supplier", className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
      received_from_supplier: { label: "Received From Supplier", className: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300" },
      repaired: { label: "Repaired", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" },
      replaced: { label: "Replaced", className: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300" },
      rejected: { label: "Rejected", className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
      returned_to_customer: { label: "Returned To Customer", className: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
      refunded: { label: "Refunded", className: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" },
    };

    return styles[status];
  };

  return (
    <div className=" space-y-4">
      <TableFilterBar
        title="Warranty List"
        subtitle={`Total: ${data.total}`}
        search={search}
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        limit={limit}
        onLimitChange={(val) => { setLimit(val); setPage(1); }}
      />

      <Table
        data={data.items}
        keyExtractor={(row) => row.id}
        columns={[
          {
            header: "Status", accessor: (row) => (
              <h1
                className="text-sm"
              >
                <span className={`text-[11px] font-medium px-1 py-1 rounded-full ${getStatusStyle(row.status).className}`}>
                  {getStatusStyle(row.status).label}
                </span>
              </h1>
            ), className: "text-start", headerClassName: "text-start",
          },
          {
            header: "Product", accessor: (row) => (

              <h1
                className="text-sm"
              >
                {row.product?.name} (SN:{row.serial})
              </h1>

            ), className: "text-start", headerClassName: "text-start",
          },

          { header: "Customer", accessor: (row) => row.customer?.name ?? "-", headerClassName: "text-start" },
          { header: "Supplier", accessor: (row) => row.supplier?.name ?? "-", headerClassName: "text-start" },
          {
            header: "S.Price", accessor: (row) => (
              <span> {Helper.formatLongNumber(row.salePrice || 0)}</span>

            ), className: "text-center"
          },
          {
            header: "Sale Date",
            className: "text-center",
            headerClassName: "text-center min-w-20",
            accessor: (row) => (
              <TimeAgo date={row.saleDate} />
            )

          },

          {
            header: "Expire",
            className: "text-center",
            headerClassName: "text-center min-w-20",
            accessor: (row) => (
              <TimeAgo date={row.expireDate} />
            )

          },

          {
            header: "Action",
            headerClassName: "text-right",
            className: "text-right",
            accessor: (row) => (row.status !== "returned_to_customer" &&
              <Dropdown
                value={row.status}
                options={getDropDownOptions(row).map((o) => o.label)}
                onChange={(selectedLabel) => {
                  const option = getDropDownOptions(row).find((o) => o.label === selectedLabel);
                  if (option) handleStatusChange(row, option.value);
                }}

                usePortal
              />
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

      <WarrantyClaimModal isOpen={openClaimModal} close={closeAllModals} warranty={selectedWarranty!} />
      <SendToSupplierModal isOpen={openSendToSupplierModal} close={closeAllModals} warranty={selectedWarranty!} />
      <SupplierActionModal isOpen={openSupplierActionModal} close={closeAllModals} warranty={selectedWarranty!} />
    </div>
  );
}