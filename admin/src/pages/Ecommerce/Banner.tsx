import { useEffect, useState } from "react";
import api from "../../lib/axios";
import Table from "../../components/tables/Table";
import TableFilterBar from "../../components/filters/TableFilterBar";
import Pagination from "../../components/filters/Pagination";
import { Edit, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import type { BannerListItem, PaginatedResult } from "../../types/type";
import ToggleSwitch from "../../components/buttons/ToggleSwitch";

export default function Banner() {
  const [data, setData] = useState<PaginatedResult<BannerListItem>>({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
  });
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<BannerListItem | null>(null);
  const [form, setForm] = useState({ title: "", photo: "", link: "", sortOrder: 0, isActive: true });

  const fetchData = async () => {
    const res = await api("/ecom/banner/list", { params: { search, limit, page } });
    if (res.data.success) setData(res.data.data);
  };

  useEffect(() => { fetchData(); }, [limit, page]);
  useEffect(() => {
    const timer = setTimeout(() => { fetchData(); }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const resetForm = () => {
    setForm({ title: "", photo: "", link: "", sortOrder: 0, isActive: true });
    setEditItem(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.photo.trim()) {
      toast.error("Title and photo are required");
      return;
    }
    if (editItem) {
      const res = await api.put(`/ecom/banner/update/${editItem.id}`, form);
      if (res.data.success) { resetForm(); fetchData(); }
    } else {
      const res = await api.post("/ecom/banner/create", form);
      if (res.data.success) { resetForm(); fetchData(); }
    }
  };

  const handleEdit = (item: BannerListItem) => {
    setForm({ title: item.title, photo: item.photo, link: item.link || "", sortOrder: item.sortOrder, isActive: item.isActive });
    setEditItem(item);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    toast("Are you sure?", {
      action: {
        label: "Delete",
        onClick: async () => {
          await api.delete(`/ecom/banner/delete/${id}`);
          fetchData();
        },
      },
      cancel: { label: "Cancel" },
    });
  };

  const handleActiveToggle = async (id: number, isActive: boolean) => {
    await api.put(`/ecom/banner/update/${id}`, { isActive });
    fetchData();
  };

  return (
    <div className="space-y-4">
      <TableFilterBar
        title="Banners"
        subtitle={`Total: ${data.total}`}
        search={search}
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        limit={limit}
        onLimitChange={(val) => { setLimit(val); setPage(1); }}
        disableSearch={showForm}
      />

      {showForm && (
        <div className="global_container p-4 space-y-3">
          <h2 className="text-lg font-semibold">{editItem ? "Edit Banner" : "Add Banner"}</h2>
          <input className="global_input" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className="global_input" placeholder="Photo URL" value={form.photo} onChange={(e) => setForm({ ...form, photo: e.target.value })} />
          <input className="global_input" placeholder="Link (optional)" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
          <input className="global_input" type="number" placeholder="Sort Order" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
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
          <Plus size={16} /> Add Banner
        </button>
      )}

      <Table
        data={data.items}
        keyExtractor={(row) => row.id}
        columns={[
          { header: "#", accessor: (_, i) => (i ?? 0) + 1, className: "w-10 text-center", headerClassName: "text-center" },
          { header: "Photo", accessor: (row) => <img src={row.photo} alt={row.title} className="w-16 h-10 object-cover rounded" /> },
          { header: "Title", accessor: (row) => <span>{row.title}</span> },
          { header: "Link", accessor: (row) => <span className="text-xs text-gray-500 truncate max-w-[150px]">{row.link || "-"}</span> },
          { header: "Order", accessor: (row) => <span className="text-center">{row.sortOrder}</span>, className: "text-center", headerClassName: "text-center" },
          { header: "Active", accessor: (row) => <ToggleSwitch label="" value={row.isActive} onChange={(val) => handleActiveToggle(row.id, val)} />, className: "text-center", headerClassName: "text-center" },
          {
            header: "Action", headerClassName: "text-right", className: "text-right",
            accessor: (row) => (
              <div className="flex gap-2 justify-end">
                <button onClick={() => handleEdit(row)} className="global_button"><Edit size={16} /></button>
                <button onClick={() => handleDelete(row.id)} className="global_button_red"><Trash2 size={16} /></button>
              </div>
            ),
          },
        ]}
      />

      <Pagination total={data.total} page={page} limit={limit} onPageChange={setPage} />
    </div>
  );
}
