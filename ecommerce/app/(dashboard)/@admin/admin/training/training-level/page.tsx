"use client";
import api from "@/utils/apiconfig";
import { useEffect, useState } from "react";

interface Level {
  _id: string;
  name: string;
}

export default function Page() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchLevels = async () => {
    const res = await api("/training/level-list");
    setLevels(res.data.data);
  };

  useEffect(() => {
    fetchLevels();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      await api.put(`/training/update-level/${editingId}`, { name });
      setEditingId(null);
    } else {
      await api.post(`/training/create-level`, { name });
    }

    setName("");
    fetchLevels();
  };

  const handleEdit = (level: Level) => {
    setName(level.name);
    setEditingId(level._id);
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/training/delete-level/${id}`);
    fetchLevels();
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* FORM */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter level name"
          className="border p-2 flex-1"
          required
        />
        <button className="bg-blue-500 text-white px-4">
          {editingId ? "Update" : "Create"}
        </button>
      </form>

      {/* LIST */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Name</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {levels.map((level) => (
            <tr key={level._id}>
              <td className="border p-2">{level.name}</td>
              <td className="border p-2 space-x-2">
                <button
                  onClick={() => handleEdit(level)}
                  className="bg-yellow-500 text-white px-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(level._id)}
                  className="bg-red-500 text-white px-2"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
