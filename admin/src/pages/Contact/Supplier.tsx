import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import { toast as sonnerToast } from "sonner";
import TableFilterBar from "../../components/filters/TableFilterBar";
import Table from "../../components/tables/Table";
import Pagination from "../../components/filters/Pagination";
import type { Contact, PaginatedResult, SearchParams, SelectOption } from "../../types/type";
import { Dropdown } from "../../components/Ui/Dropdown";
import { Delete, Edit, History, Wallet } from "lucide-react";
import TransactionModal from "../../components/modals/TransactionModal";

type FormType = {
  name: string;
  mobile: string;
  email: string;
  address: string;
  balance: number;
  type: "supplier" | "both";
};

const defaultForm: FormType = {
  name: "",
  mobile: "",
  email: "",
  address: "",
  balance: 0,
  type: "supplier",
};

const typeOptions: string[] = [
  "supplier", "both"
];

export default function Supplier() {
  const [data, setData] = useState<PaginatedResult<Contact>>({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
  });

  const [params, setParams] = useState<SearchParams>({
    search: "",
    page: 1,
    limit: 20,
  })

  const [form, setForm] = useState<FormType>(defaultForm);
  const [editID, setEditID] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
    const [openTransactionModal, setOpenTransactionModal] = useState<boolean>(false);
     const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const fetchContacts = async () => {
    const res = await api("/contact/list", {
      params: { search: params.search, limit: params.limit, page: params.page, type: "supplier" },
    });
    if (res.data.success) setData(res.data.data);
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchContacts(), 400);
    return () => clearTimeout(timer);
  }, [params.search]);

  useEffect(() => {
    fetchContacts();
  }, [params.limit, params.page]);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const onDropdownChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };
  const handleEdit = (contact: Contact) => {
    setEditID(contact._id);
    setForm({
      name: contact.name,
      mobile: contact.mobile,
      email: contact.email ?? "",
      address: contact.address ?? "",
      balance: contact.balance,
      type: contact.type === "customer" ? "supplier" : contact.type,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setEditID(null);
    setForm(defaultForm);
  };

  const handleDelete = (id: string) => {
    sonnerToast("Are you sure?", {
      action: {
        label: "Delete",
        onClick: async () => {
          await api.delete(`/contact/delete/${id}`);
          fetchContacts();
        },
      },
      cancel: { label: "Cancel", onClick: () => { } },
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    if (!form.mobile.trim()) { toast.error("Mobile is required"); return; }

    setLoading(true);
    try {
      if (editID) {
        await api.put(`/contact/update/${editID}`, form);
      } else {
        await api.post("/contact/create", form);
      }
      setEditID(null);
      setForm(defaultForm);
      fetchContacts();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Form */}
      <form onSubmit={onSubmit} className="grid lg:grid-cols-2 grid-cols-1 gap-4">
        <h2 className="global_heading col-span-full">
          {editID ? "Edit Customer" : "New Customer"}
        </h2>

        <div>
          <label className="block text-sm font-medium mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder="Supplier name"
            className="global_input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Mobile <span className="text-red-500">*</span>
          </label>
          <input
            name="mobile"
            value={form.mobile}
            onChange={onChange}
            placeholder="Mobile number"
            className="global_input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            placeholder="Email address"
            className="global_input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Address</label>
          <input
            name="address"
            value={form.address}
            onChange={onChange}
            placeholder="Address"
            className="global_input"
          />
        </div>

        {!editID && <div>
          <label className="block text-sm font-medium mb-1">
            Opening Balance
          </label>
          <input
            name="balance"
            type="number"
            value={form.balance}
            onChange={(e) => setForm({ ...form, balance: Number(e.target.value) })}
            placeholder="0"
            className="global_input"
            disabled={!!editID}
          />
        </div>}
     <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <Dropdown
            onChange={(value) => onDropdownChange("type", value)}
            options={typeOptions}
            value={form.type}
          />
        </div>

        <div className="flex gap-3 pt-2 col-span-full">
          <button type="submit" disabled={loading} className="global_button">
            {loading ? "Saving..." : editID ? "Update Customer" : "Create Customer"}
          </button>
          {editID && (
            <button
              type="button"
              onClick={handleCancel}
              className="global_button_red"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Table */}

      <TableFilterBar
        title="Customers"
        subtitle={`Total: ${data.total}`}
        search={params.search}
        onSearchChange={(val) => { setParams(prev => ({ ...prev, search: val, page: 1 })); }}
        addHref=""
        addLabel="New Customer"
        limit={params.limit}
        onLimitChange={(val) => { setParams(prev => ({ ...prev, limit: val, page: 1 })); }}
      />

      <Table
        data={data.items}
        keyExtractor={(row) => row._id}
        columns={[
          {
            header: "#",
            accessor: (_, i) => (i ?? 0) + 1,
            className: "w-10 text-center",
            headerClassName: "text-center",
          },
          { header: "Name", accessor: "name" },
          { header: "Mobile", accessor: "mobile" },
          { header: "Email", accessor: (row) => row.email || "—" },
          { header: "Address", accessor: (row) => row.address || "—" },
          {
            header: "Balance",
            className: "text-center",
            headerClassName: "text-center",
            accessor: (row) => (
              <span className={`${row.balance < 0 ? "text-green-500 text-nowrap" : "text-red-500"} whitespace-nowrap`}>
                {row.balance < 0 ? "Recievable " : "Payable :"}{row.balance}
              </span>
            ),
          },
          {
            header: "Type",
            className: "text-center",
            headerClassName: "text-center",
            accessor: (row) => (
              <span className="text-xs capitalize">{row.type}</span>
            ),
          },
          {
            header: "Action",
            headerClassName: "text-right",
            className: "text-right",
            accessor: (row) => (
              <div className="flex gap-2 justify-end">
                       <button onClick={() => {
                  setSelectedContact(row);
                  setOpenTransactionModal(true);
                }
                } className="global_button">
                  <Wallet size={18} />
                </button>
                <button onClick={() => handleEdit(row)} className="global_button">
                  <Edit size={18} />
                </button>
                <button onClick={() => handleDelete(row._id)} className="global_button_red">
                  <Delete size={18} />
                </button>
                <Link to={`/contact/supplier-ledger/${row._id}`} className="global_button bg-green-400">
                  <History size={18} />
                </Link>
              </div>
            ),
          },
        ]}
      />

      <Pagination
        total={data.total}
        page={params.page}
        limit={params.limit}
        onPageChange={(page) => setParams(prev => ({ ...prev, page }))}
      />
      {!!openTransactionModal && <TransactionModal contact={selectedContact} open={openTransactionModal} onClose={() => setOpenTransactionModal(false)} type={"supplier"} />}
    </div>
  );
}