import { useEffect, useState, useCallback } from "react";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import { toast as sonnerToast } from "sonner";
import Table from "../../components/tables/Table";
import type { Role, SelectOption, StaffProfile, User } from "../../types/type";
import { Edit } from "lucide-react";
import Select from "react-select";
import { getReactSelectStyles } from "../../utils/reactSelectStyles";

type FormType = {
  userID: string;
  designation: string;
  department: string;
  roleIDs: string[];
};

const defaultForm: FormType = {
  userID: "",
  designation: "",
  department: "",
  roleIDs: [],
};

export default function Stuffs() {
  const [staffs, setStaffs] = useState<StaffProfile[]>([]);
  const [form, setForm] = useState<FormType>(defaultForm);
  const [editID, setEditID] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [userOptions, setUserOptions] = useState<SelectOption[]>([]);
  const [roleOptions, setRoleOptions] = useState<SelectOption[]>([]);
  const [selectedUserOption, setSelectedUserOption] = useState<SelectOption | null>(null);
  const [selectedRoleOptions, setSelectedRoleOptions] = useState<SelectOption[]>([]);
  const [userSearch, setUserSearch] = useState("");

  const fetchAllStaff = async () => {
    const res = await api("/admin/get-all-staff");
    if (res.data.success) setStaffs(res.data.data);
  };

  const fetchRoles = async () => {
    const res = await api("/admin/role-list");
    if (res.data.success) {
      setRoleOptions(
        res.data.data.map((r: Role) => ({ value: r.id, label: r.name }))
      );
    }
  };

  const fetchUsers = useCallback(async (search: string) => {
    const res = await api("/auth/all-users-list", {
      params: { search, limit: 20, page: 1 },
    });
    if (res.data.success) {
      const staffUserIDs = staffs.map((s) => s.userID);
      setUserOptions(
        res.data.data.items
          .filter((u: User) => !staffUserIDs.includes(u.id))
          .map((u: User) => ({
            value: u.id,
            label: `${u.name} (${u.email || u.mobile || "no contact"})`,
            ...u,
          }))
      );
    }
  }, [staffs]);

  const fetchUserRoles = async (userID: string) => {
    const res = await api(`/admin/user/${userID}/roles`);
    if (res.data.success && res.data.data.length > 0) {
      const roles = res.data.data.map((r: { role: Role }) => ({
        value: r.role.id,
        label: r.role.name,
      }));
      setSelectedRoleOptions(roles);
      setForm((prev) => ({
        ...prev,
        roleIDs: roles.map((r: SelectOption) => r.value),
      }));
    } else {
      setSelectedRoleOptions([]);
      setForm((prev) => ({ ...prev, roleIDs: [] }));
    }
  };

  useEffect(() => {
    Promise.allSettled([fetchAllStaff(), fetchRoles()]);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(userSearch), 400);
    return () => clearTimeout(timer);
  }, [userSearch, fetchUsers]);

  const handleUserSelect = (option: SelectOption | null) => {
    setSelectedUserOption(option);
    if (option) {
      setForm((prev) => ({
        ...prev,
        userID: option.value,
        designation: (option as any).designation || "",
        department: (option as any).department || "",
      }));
      fetchUserRoles(option.value);
    } else {
      setForm(defaultForm);
      setSelectedRoleOptions([]);
    }
  };

  const handleRoleChange = (options: readonly SelectOption[]) => {
    const selected = Array.from(options);
    setSelectedRoleOptions(selected);
    setForm((prev) => ({
      ...prev,
      roleIDs: selected.map((r) => r.value),
    }));
  };

  const handleEdit = (staff: StaffProfile) => {
    setEditID(staff.id);
    setForm({
      userID: staff.userID,
      designation: staff.designation || "",
      department: staff.department || "",
      roleIDs: [],
    });
    if (staff.user) {
      setSelectedUserOption({
        value: staff.userID,
        label: `${staff.user.name} (${staff.user.email || staff.user.mobile || "no contact"})`,
      });
    }
    fetchUserRoles(staff.userID);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setEditID(null);
    setForm(defaultForm);
    setSelectedUserOption(null);
    setSelectedRoleOptions([]);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.userID) {
      toast.error("Please select a user");
      return;
    }

    setLoading(true);
    try {
      if (editID) {
        await api.post(`/admin/update-staff/${editID}`, {
          userID: form.userID,
          designation: form.designation || null,
          department: form.department || null,
        });
      } else {
        await api.post("/admin/create-staff", {
          userID: form.userID,
          designation: form.designation || null,
          department: form.department || null,
        });
      }

      if (form.roleIDs.length > 0) {
        await Promise.all(
          form.roleIDs.map((roleID) =>
            api.post("/admin/role/assign-user", {
              userID: form.userID,
              roleID,
            })
          )
        );
      }

      setEditID(null);
      setForm(defaultForm);
      setSelectedUserOption(null);
      setSelectedRoleOptions([]);
      fetchAllStaff();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Form */}
      <form onSubmit={onSubmit} className="grid lg:grid-cols-2 grid-cols-1 gap-4">
        <h2 className="global_heading col-span-full">
          {editID ? "Edit Staff" : "New Staff"}
        </h2>

        <div>
          <label className="block text-sm font-medium mb-1">
            User <span className="text-red-500">*</span>
          </label>
          <Select
            options={userOptions}
            value={selectedUserOption}
            onChange={handleUserSelect}
            onInputChange={(val) => setUserSearch(val)}
            isClearable
            isDisabled={!!editID}
            placeholder="Search and select user..."
            styles={getReactSelectStyles()}
            classNamePrefix="react-select"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Designation</label>
          <input
            name="designation"
            value={form.designation}
            onChange={(e) => setForm({ ...form, designation: e.target.value })}
            placeholder="Designation"
            className="global_input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Department</label>
          <input
            name="department"
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            placeholder="Department"
            className="global_input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Roles</label>
          <Select
            isMulti
            options={roleOptions}
            value={selectedRoleOptions}
            onChange={handleRoleChange}
            placeholder="Assign roles..."
            styles={getReactSelectStyles()}
            classNamePrefix="react-select"
          />
        </div>

        <div className="flex gap-3 pt-2 col-span-full">
          <button type="submit" disabled={loading} className="global_button">
            {loading ? "Saving..." : editID ? "Update Staff" : "Create Staff"}
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
      <Table
        data={staffs}
        keyExtractor={(row) => row.id}
        columns={[
          {
            header: "#",
            accessor: (_, i) => (i ?? 0) + 1,
            className: "w-10 text-center",
            headerClassName: "text-center",
          },
          {
            header: "Name",
            accessor: (row) => row.user?.name || "—",
          },
          {
            header: "Email",
            accessor: (row) => row.user?.email || "—",
          },
          {
            header: "Employee Code",
            accessor: (row) => row.employeeCode,
            className: "text-center",
            headerClassName: "text-center",
          },
          {
            header: "Designation",
            accessor: (row) => row.designation || "—",
          },
          {
            header: "Department",
            accessor: (row) => row.department || "—",
          },
          {
            header: "Action",
            headerClassName: "text-right",
            className: "text-right",
            accessor: (row) => (
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => handleEdit(row)}
                  className="global_button"
                >
                  <Edit size={18} />
                </button>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
