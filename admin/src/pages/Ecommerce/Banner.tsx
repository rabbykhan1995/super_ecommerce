import { useEffect, useState } from "react";
import api from "../../lib/axios";
import { Edit, Trash2, Plus, X, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import type { BannerListItem } from "../../types/type";
import ToggleSwitch from "../../components/buttons/ToggleSwitch";
import ImageUploader from "../../components/Ui/ImageUploader";

const MAX_BANNERS = 5;

interface BannerForm {
  title: string;
  photo: string;
  link: string;
  sortOrder: number;
  isActive: boolean;
}

const emptyForm: BannerForm = { title: "", photo: "", link: "", sortOrder: 0, isActive: true };

export default function Banner() {
  const [banners, setBanners] = useState<BannerListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<BannerListItem | null>(null);
  const [form, setForm] = useState<BannerForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchBanners = async () => {
    setLoading(true);
    const res = await api("/ecom/banner/list", { params: { limit: 5, page: 1 } });
    if (res.data.success) setBanners(res.data.data.items);
    setLoading(false);
  };

  useEffect(() => { fetchBanners(); }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditItem(null);
    setShowForm(false);
  };

  const handleEdit = (item: BannerListItem) => {
    setForm({ title: item.title, photo: item.photo, link: item.link || "", sortOrder: item.sortOrder, isActive: item.isActive });
    setEditItem(item);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    if (!form.photo.trim()) { toast.error("Image is required"); return; }
    if (!editItem && banners.length >= MAX_BANNERS) { toast.error(`Maximum ${MAX_BANNERS} banners allowed`); return; }

    setSubmitting(true);
    try {
      if (editItem) {
        const res = await api.put(`/ecom/banner/update/${editItem.id}`, form);
        if (res.data.success) { toast.success("Banner updated"); resetForm(); fetchBanners(); }
      } else {
        const res = await api.post("/ecom/banner/create", { ...form, sortOrder: banners.length });
        if (res.data.success) { toast.success("Banner created"); resetForm(); fetchBanners(); }
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    toast("Delete this banner?", {
      action: { label: "Delete", onClick: async () => { await api.delete(`/ecom/banner/delete/${id}`); fetchBanners(); } },
      cancel: { label: "Cancel" },
    });
  };

  const handleActiveToggle = async (id: number, isActive: boolean) => {
    await api.put(`/ecom/banner/update/${id}`, { isActive });
    fetchBanners();
  };

  const canAdd = banners.length < MAX_BANNERS && !showForm;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Banners</h1>
          <p className="text-sm text-gray-500">{banners.length}/{MAX_BANNERS} banners</p>
        </div>
        {canAdd && (
          <button className="global_button flex items-center gap-2" onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus size={16} /> Add Banner
          </button>
        )}
      </div>

      {showForm && (
        <div className="global_container p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{editItem ? "Edit Banner" : "Add Banner"}</h2>
            <button onClick={resetForm} className="p-1 rounded hover:bg-gray-100"><X size={18} /></button>
          </div>

          <ImageUploader
            value={form.photo}
            onChange={(val) => setForm({ ...form, photo: typeof val === "string" ? val : val[0] || "" })}
            label="Banner Image"
          />

          <input className="global_input" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className="global_input" placeholder="Link (optional)" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
          <div className="flex items-center gap-2">
            <ToggleSwitch label="Active" value={form.isActive} onChange={(val) => setForm({ ...form, isActive: val })} />
          </div>
          <div className="flex gap-2">
            <button className="global_button" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Saving..." : editItem ? "Update" : "Create"}
            </button>
            <button className="global_button_red" onClick={resetForm}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Loading banners...</p>
      ) : banners.length === 0 ? (
        <div className="global_container p-8 text-center text-gray-500">No banners yet. Click "Add Banner" to create one.</div>
      ) : (
        <div className="grid gap-4">
          {banners.map((banner) => (
            <div key={banner.id} className="global_container p-4 flex gap-4 items-start">
              <img src={banner.photo} alt={banner.title} className="w-40 h-24 object-cover rounded-lg flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold truncate">{banner.title}</h3>
                  {!banner.isActive && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">Inactive</span>}
                </div>
                {banner.link && (
                  <a href={banner.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 flex items-center gap-1 mt-1 hover:underline">
                    <ExternalLink size={12} /> {banner.link}
                  </a>
                )}
                <p className="text-xs text-gray-400 mt-1">Order: {banner.sortOrder}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <ToggleSwitch label="" value={banner.isActive} onChange={(val) => handleActiveToggle(banner.id, val)} />
                <button onClick={() => handleEdit(banner)} className="global_button"><Edit size={16} /></button>
                <button onClick={() => handleDelete(banner.id)} className="global_button_red"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
