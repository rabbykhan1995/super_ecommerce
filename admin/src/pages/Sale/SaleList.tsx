import { useEffect, useState } from "react";
import api from "../../lib/axios";
import Table from "../../components/tables/Table";
import TableFilterBar from "../../components/filters/TableFilterBar";
import Pagination from "../../components/filters/Pagination";
import { Link, useNavigate } from "react-router";
import type { PaginatedResult, SaleListItem } from "../../types/type";
import TimeAgo from "../../components/Ui/TimeAgo";
import { toast } from "sonner";
import Helper from "../../utils/helper";
import { Dropdown } from "../../components/Ui/Dropdown";
import SaleInvoiceModal from "../../components/modals/SaleInvoiceModal";




export default function SaleList() {
  const navigate = useNavigate()
  const [data, setData] = useState<PaginatedResult<SaleListItem>>({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
  });
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [selectedSale, setSelectedSale] = useState<SaleListItem | null>(null);

  const [invoiceModal, setInvoiceModal] = useState<boolean>(false);
  const [printSize, setPrintSize] = useState<number>(58);

  const fetchProducts = async () => {
    const res = await api("/sale/list", {
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
          await api.delete(`/sale/delete/${id}`);
          await fetchProducts();
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => { },
      },
    });
  };



  const handleActionChange = (val: string, row: SaleListItem) => {
    switch (val) {
      case "Print Inv":
        navigate(`/sale/invoice/${row.id}`);

        break;
      case "Print 58mm":
        setPrintSize(58);
        setSelectedSale(row);
        setTimeout(() => {
          setInvoiceModal(true);
        }, 50);
        break;

      case "Print 88mm":
        setPrintSize(88);
        setSelectedSale(row);
        setTimeout(() => {
          setInvoiceModal(true);
        }, 50);
        break;
      case "Delete":
        handleDelete(String(row.id));
        break;

      case "Return":
        navigate(`/sale/return/${row.id}`);
        break;
      default:
        break;
    }
  };


  const getActions = (row: SaleListItem): string[] => {
    switch (row.deletable) {
      case true:
        return ["Print Inv", "Print 58mm", "Print 88mm", "Return", "Delete"];
      case false:
        return ["Print Inv", "Print 58mm", "Print 88mm", "Return"];
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
        keyExtractor={(row) => String(row.id)}
        columns={[
          {
            header: "Invoice", accessor: (row) => (

              <Link to={`/sale/invoice/${row.id}`}
                className="text-sm"
              >
                {row.invoiceNo}
              </Link>

            ), className: "text-start", headerClassName: "text-start",
          },
          { header: "Customer", accessor: (row) => row.customer?.name ?? "", headerClassName: "text-start" },
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

              <TimeAgo date={row.saleDate} />

            )

          },

          {
            header: "Action",
            headerClassName: "text-right",
            className: "text-right",
            accessor: (row) => (
              <Dropdown
                // @ts-ignore
                onChange={(status: string) => handleActionChange(status, row)}
                options={getActions(row)}
                placeholder="Actions"
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
      <SaleInvoiceModal isOpen={invoiceModal} close={() => {
        setInvoiceModal(false);
        setSelectedSale(null);
      }} saleID={selectedSale?.id ? String(selectedSale.id) : ""} printSize={printSize} />
    </div>
  );
}