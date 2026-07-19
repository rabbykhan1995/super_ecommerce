import { useEffect, useState } from "react";
import api from "../../lib/axios";
import TableFilterBar from "../../components/filters/TableFilterBar";
import Pagination from "../../components/filters/Pagination";
import { Edit, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import type { FlashSaleListItem, PaginatedResult } from "../../types/type";
import ToggleSwitch from "../../components/buttons/ToggleSwitch";

export default function FlashSale() {
  const [data, setData] = useState<PaginatedResult<FlashSaleListItem>>({ items: [], total: 0, page: 1, limit: 10 });
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<FlashSaleListItem | null>(null);
  const [form, setForm] = useState({ name: "", startDate: "", endDate: "", isActive: true });

  const fetchData = async () => {
    const res = await api("/ecom/flash-sale/list", { params: { search, limit, page } });
    if (res.data.success) setData(res.data.data);
  };

  useEffect(() => { fetchData(); }, [limit, page]);
  useEffect(() => {
    const timer = setTimeout(() => { fetchData(); }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const resetForm = () => {
    setForm({ name: "", startDate: "", endDate: "", isActive: true });
    setEditItem(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.startDate || !form.endDate) {
      toast.error("Name, start date and end date are required");
      return;
    }
    if (editItem) {
      const res = await api.put(`/ecom/flash-sale/update/${editItem.id}`, form);
      if (res.data.success) { resetForm(); fetchData(); }
    } else {
      const res = await api.post("/ecom/flash-sale/create", form);
      if (res.data.success) { resetForm(); fetchData(); }
    }
  };

  const handleEdit = (item: FlashSaleListItem) => {
    const startDate = new Date(item.startDate).toISOString().slice(0, 16);
    const endDate = new Date(item.endDate).toISOString().slice(0, 16);
    setForm({ name: item.name, startDate, endDate, isActive: item.isActive });
    setEditItem(item);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    toast("Are you sure?", {
      action: { label: "Delete", onClick: async () => { await api.delete(`/ecom/flash-sale/delete/${id}`); fetchData(); } },
      cancel: { label: "Cancel" },
    });
  };

  const handleActiveToggle = async (id: number, isActive: boolean) => {
    await api.put(`/ecom/flash-sale/update/${id}`, { isActive });
    fetchData();
  };

  return (
    <div className="space-y-4">
      <TableFilterBar
        title="Flash Sales"
        subtitle={`Total: ${data.total}`}
        search={search}
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        limit={limit}
        onLimitChange={(val) => { setLimit(val); setPage(1); }}
        disableSearch={showForm}
      />

      {showForm && (
        <div className="global_container p-4 space-y-3">
          <h2 className="text-lg font-semibold">{editItem ? "Edit Flash Sale" : "Add Flash Sale"}</h2>
          <input className="global_input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Start Date</label>
              <input className="global_input" type="datetime-local" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">End Date</label>
              <input className="global_input" type="datetime-local" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ToggleSwitch label="Active" value={form.isActive} onChange={(val) => setForm({ ...form, isActive: val })} />
          </div>
          <div className="flex gap-2">
            <button className="global_button" onClick={handleSubmit}>{editItem ? "Update" : "Create"}</button>
            <button className="global_button_red" onClick={resetForm}>Cancel</button>
          </div>
        </div>
      )}

      {!showForm && (
        <button className="global_button flex items-center gap-2" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus size={16} /> Add Flash Sale
        </button>
      )}

      <div className="space-y-2">
        {data.items.map((sale) => (
          <div key={sale.id} className="global_container">
            <div className="flex items-center justify-between p-3">
              <div>
                <h3 className="font-semibold">{sale.name}</h3>
                <p className="text-xs text-gray-500">
                  {new Date(sale.startDate).toLocaleDateString()} - {new Date(sale.endDate).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <ToggleSwitch label="" value={sale.isActive} onChange={(val) => handleActiveToggle(sale.id, val)} />
                <button onClick={() => handleEdit(sale)} className="global_button"><Edit size={14} /></button>
                <button onClick={() => handleDelete(sale.id)} className="global_button_red"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Pagination total={data.total} page={page} limit={limit} onPageChange={setPage} />
    </div>
  );
}
