import { useEffect, useState } from "react";
import api from "../../lib/axios";
import Table from "../../components/tables/Table";
import TableFilterBar from "../../components/filters/TableFilterBar";
import Pagination from "../../components/filters/Pagination";
import { Edit } from "lucide-react";
import type { PaginatedResult, Brand } from "../../types/type";
import { toast } from "sonner";

export default function BrandList() {
  const [data, setData] = useState<PaginatedResult<Brand>>({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
  });
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  
  // Create/Edit states
  const [editID, setEditID] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const fetchBrands = async () => {
    const res = await api("/brand/list", {
      params: { search, limit, page },
    });
    if (res.data.success) setData(res.data.data);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      if (editID) {
        await api.put(`/brand/update/${editID}`, { name });
        
      } else {
        await api.post("/brand/create", { name });
        
      }
      setName("");
      setEditID(null);
      await fetchBrands();
    } catch (error) {
      toast.error(editID ? "Failed to update brand" : "Failed to create brand");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (brand: Brand) => {
    setEditID(brand._id);
    setName(brand.name);
  };

  const handleDelete = async (id: string) => {
    toast("Are you sure?", {
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await api.delete(`/brand/delete/${id}`);
            
            
            // Check if current page has items after delete
            if (data.items.length === 1 && page > 1) {
              setPage(page - 1);
            } else {
              await fetchBrands();
            }
          } catch (error) {
            toast.error("Failed to delete brand");
          }
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  const handleCancel = () => {
    setEditID(null);
    setName("");
  };

  useEffect(() => {
    fetchBrands();
  }, [limit, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchBrands();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="space-y-4">

           {/* Create/Edit Form */}
      <div className="flex items-center gap-3 p-4  rounded-lg">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Brand name"
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
      <TableFilterBar
        title="Brands"
        subtitle={`Total: ${data.total}`}
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        addHref="/brand/new"
        addLabel="New Brand"
        limit={limit}
        onLimitChange={(val) => {
          setLimit(val);
          setPage(1);
        }}
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
          {
            header: "Name",
            accessor: "name",
            headerClassName: "min-w-[200px]",
          },
          {
            header: "Action",
            headerClassName: "text-right",
            className: "text-right",
            accessor: (row) => (
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => handleEdit(row)}
                  className="global_edit"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(row._id)}
                  className="global_button_red"
                >
                  Delete
                </button>
              </div>
            ),
          },
        ]}
      />

      <Pagination
        total={data.total}
        page={page}
        limit={limit}
        onPageChange={setPage}
      />
    </div>
  );
}