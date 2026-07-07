import { useEffect, useState } from "react";
import api from "../../lib/axios";
import Table from "../../components/tables/Table";
import { toast } from "sonner";
import type { Account } from "../../types/type";
import ToggleSwitch from "../../components/buttons/ToggleSwitch";
import BalanceTransferModal from "../../components/modals/BalanceTransferModal";
import { Link } from "react-router";
import { History,ArrowLeftRight, Edit, Delete } from "lucide-react";

export default function Account() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [editID, setEditID] = useState<number | null>(null);
  const [name, setName] = useState<string>("");
  const [number, setNumber] = useState<string>("");
  const [branch, setBranch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isDefault, setIsDefault] = useState<boolean>(false);
  const [fromAccount, setFromAccount] = useState<Account | null>(null);
  const [balanceTransferModal, setBalanceTransferModal] = useState<Boolean>(false);
  const fetchAccount = async () => {
    const res = await api("/account/list");
    if (res.data.success) setAccounts(res.data.data);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return toast.error("Account name is required");
    setLoading(true);
    try {
      if (editID) {
        await api.put(`/account/update/${editID}`, { default: isDefault, name, number, ...(branch ? { branch } : {}) });
      } else {
        await api.post("/account/create", { default: isDefault, name, number, ...(branch ? { branch } : {}) });
      }
      setName("");
      setNumber("");
      setBranch("");
      setEditID(null);
      setIsDefault(false);
      await fetchAccount();
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (account: Account) => {
    setEditID(account.id);
    setName(account.name);
    setNumber(account.number ?? "");
    setBranch(account.branch ?? "");
    setIsDefault(account.default);
  };

  const handleDelete = async (id: number) => {
    toast("Are you sure?", {
      action: {
        label: "Delete",
        onClick: async () => {
          await api.delete(`/account/delete/${id}`);
          await fetchAccount();
        },
      },
      cancel: { label: "Cancel", onClick: () => { } },
    });
  };

  const handleCancel = () => {
    setEditID(null);
    setName("");
    setNumber("");
    setBranch("");
    setIsDefault(false);
  };
   const closeBalanceTransferModal = async ()=>{
    setBalanceTransferModal(false);
    await fetchAccount();
   }
  useEffect(() => {
    fetchAccount();
  }, []);

  return (
    <div className="space-y-5">
      <h2>Account</h2>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Account name"
          className="global_input"
        />
        <input
          type="text"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder="Account number (optional)"
          className="global_input"
        />
        <input
          type="text"
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
          placeholder="Branch (optional)"
          className="global_input"
        />
        <ToggleSwitch label="Default" value={isDefault} onChange={() => setIsDefault(!isDefault)} />
        <div className="flex gap-2 col-span-1">
          <button onClick={handleSubmit} disabled={loading} className="global_button">
            {loading ? "Saving..." : editID ? "Update" : "Create"}
          </button>
          {editID && (
            <button onClick={handleCancel} className="global_button_red">
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <Table
        data={accounts}
        keyExtractor={(row) => row.id}
        columns={[
          { header: "#", accessor: (_, i) => (i as number) + 1, className: "w-10 text-center" },
          {
            header: "Name", headerClassName: "text-center", className: "text-center", accessor: (row) => (
              <div className="flex items-center justify-center gap-2">
                <span>{row.name}</span>
                {row.default && (
                  <span className="text-xs text-green-500">default</span>
                )}
              </div>
            ),
          },
          { header: "Number", accessor: "number", headerClassName: "text-center", className: "text-center" },
          { header: "Branch", accessor: "branch", headerClassName: "text-center", className: "text-center" },
          {
            header: "Balance",
            accessor: (row) => row.balance?.toLocaleString() ?? 0,
            headerClassName: "text-center",
            className: "text-center",
          },
          {
            header: "Action",
            className: "text-right",
            headerClassName: "text-right",
            accessor: (row) => (
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setFromAccount(row);
                    setBalanceTransferModal(true)
                  }}
                  className="global_button"
                >
                  <ArrowLeftRight size={18} />
                </button>
                <button onClick={() => handleEdit(row)} className="global_button">
                  <Edit size={18} />
                </button>
                <button onClick={() => handleDelete(row.id)} className="global_button_red">
                   <Delete size={18} />
                </button>

                <Link to={`/account/transaction/${row.id}`} className="global_button">
                <History size={18} /></Link>
              </div>
            ),
          },
        ]}
      />
     {balanceTransferModal && <BalanceTransferModal accounts={accounts} fromAccount={fromAccount} onClose={() => closeBalanceTransferModal()} />}
    </div>
  );
}