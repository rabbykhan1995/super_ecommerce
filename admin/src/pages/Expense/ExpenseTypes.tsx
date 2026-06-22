import { useEffect, useState } from "react";
import api from "../../lib/axios";
import Table from "../../components/tables/Table";
import { toast } from "sonner";
import type { ExpenseType} from "../../types/type";
import { Delete, Edit } from "lucide-react";

export default function ExpenseTypes() {
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
  const [editID, setEditID] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const fetchExpenseType = async () => {
    const res = await api("/expense/all-expenseTypes");
    if (res.data.success) setExpenseTypes(res.data.data);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      if (editID) {
        await api.put(`/expense/update-expenseType/${editID}`, { name });
      } else {
        await api.post("/expense/create-expenseType", { name });
      }
      setName("");
      setEditID(null);
      await fetchExpenseType();
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (unit: ExpenseType) => {
    setEditID(unit._id);
    setName(unit.name);
  };


  const handleDelete = async (id: string) => {
    toast("Are you sure?", {
      action: {
        label: "Delete",
        onClick: async () => {
          await api.delete(`/expense/delete-expenseType/${id}`);
          await fetchExpenseType();
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => { },
      },
    });
  };


  const handleCancel = () => {
    setEditID(null);
    setName("");
  };

  useEffect(() => {
    fetchExpenseType();
  }, []);

  return (
    <div className="space-y-5">
      <h2 className="">Expense Type</h2>

      {/* Form */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="ExpenseType name"
          className="global_input"
        />
        <button onClick={handleSubmit} disabled={loading} className="global_button">
          {loading ? "Saving..." : editID ? "Update" : "Create"}
        </button>
        {editID && (
          <button onClick={handleCancel} className="global_button_red">
            Cancel
          </button>
        )}
      </div>

      {/* Table */}
      <Table
        data={expenseTypes}
        keyExtractor={(row) => row._id}
        columns={[
          { header: "#", accessor: (_, i) => i as number + 1, className: "w-10 text-center" },
          {
            header: "Name", accessor: "name", headerClassName: "text-center", className: "text-center"
          },
          {
            header: "Action", className: "text-right", headerClassName: "text-right",
            accessor: (row) => (
              <div className="flex gap-2 justify-end">
          <button onClick={() => handleEdit(row)} className="global_edit">
                  <Edit size={18} />
                </button>
                <button onClick={() => handleDelete(row._id)} className="global_button_red">
                  <Delete size={18} />
                </button>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}