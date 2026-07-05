import { useEffect, useState } from "react";
import api from "../../lib/axios";
import Table from "../../components/tables/Table";
import { toast } from "sonner";
import type { Unit } from "../../types/type";
import { Delete, Edit } from "lucide-react";

export default function Unit() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [editID, setEditID] = useState<number | null>(null);
  const [name, setName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const fetchUnit = async () => {
    const res = await api("/unit/list");
    if (res.data.success) setUnits(res.data.data);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      if (editID) {
        await api.put(`/unit/update/${editID}`, { name });
      } else {
        await api.post("/unit/create", { name });
      }
      setName("");
      setEditID(null);
      await fetchUnit();
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (unit: Unit) => {
    setEditID(unit.id);
    setName(unit.name);
  };


  const handleDelete = async (id: number) => {
    toast("Are you sure?", {
      action: {
        label: "Delete",
        onClick: async () => {
          await api.delete(`/unit/delete/${id}`);
          await fetchUnit();
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
    fetchUnit();
  }, []);

  return (
    <div className="space-y-5">
      <h2 className="">Unit</h2>

      {/* Form */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Unit name"
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
        data={units}
        keyExtractor={(row) => row.id}
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
                <button onClick={() => handleDelete(row.id)} className="global_button_red">
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