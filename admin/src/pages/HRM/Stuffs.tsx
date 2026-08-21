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
  roleID: string;

};

const defaultForm: FormType = {
  userID: "",
  designation: "",
  department: "",
  roleID: "",

};

export default function Stuffs() {
  const [staffs, setStaffs] = useState<StaffProfile[]>([]);
  const [form, setForm] = useState<FormType>(defaultForm);
  const [editID, setEditID] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [userOptions, setUserOptions] = useState<SelectOption<User>[]>([]);
  const [roleOptions, setRoleOptions] = useState<SelectOption<Role>[] | []>([]);
  const [selectedUserOption, setSelectedUserOption] = useState<SelectOption | null>(null);
  const [selectedRoleOption, setSelectedRoleOption] = useState<SelectOption<Role> | null>(null);
  const [userSearch, setUserSearch] = useState("");

  const fetchAllStaff = async () => {
    const res = await api("/admin/get-all-staff");
    if (res.data.success) setStaffs(res.data.data);
  };

  const fetchRoles = async () => {
    const res = await api("/admin/role-list");
    if (res.data.success) {
      setRoleOptions(
        res.data.data.map((r: Role) => ({ value: r.id, label: r.name, ...r }))
      );
    }
  };

  const fetchUsers = async () => {
    const res = await api("/auth/all-users-list", {
      params: { search: userSearch, limit: 40, page: 1 },
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
  }

  const fetchUserRole = async (userID: string) => {
  
    const res = await api(`/admin/user/${userID}/role`);
    if (res.data.success && res.data.data) {
       console.log(res.data.data)
      const role = res.data.data.role;

      const formattedRole = {
        ...role, value: role.id,
        label: role.name,
      }

      setSelectedRoleOption(formattedRole);
      setForm((prev) => ({
        ...prev,
        roleID: formattedRole.value,
      }));
    } else {
      setSelectedRoleOption(null);
      setForm((prev) => ({ ...prev, roleID: "" }));
    }
  };

  useEffect(() => {
    Promise.allSettled([fetchAllStaff(), fetchRoles()]);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(), 400);
    return () => clearTimeout(timer);
  }, [userSearch]);

  const handleUserSelect = (option: SelectOption<User> | null) => {
    setSelectedUserOption(option);
    if (option) {
      setForm((prev) => ({
        ...prev,
        userID: option.value,
        designation: (option as any).designation || "",
        department: (option as any).department || "",
      }));
      fetchUserRole(option.value);
    } else {
      setForm(defaultForm);
      setSelectedRoleOption(null);
    }
  };

  const handleRoleChange = (option: SelectOption<Role>) => {
    setSelectedRoleOption(option);
    setForm((prev) => ({
      ...prev,
      roleID: option.id,
    }));
  };

  const handleEdit = (staff: StaffProfile) => {
    // @ts-ignore
    const role = staff.user.userRole.role;
    setEditID(staff.id);
    setForm({
      userID: staff.userID,
      designation: staff.designation || "",
      department: staff.department || "",
      roleID: role.id,
    });
    if (staff.userID) {
      setSelectedUserOption({
        value: staff?.userID,
        label: `${staff?.user?.name} (${staff?.user?.email || staff?.user?.mobile || "no contact"})`,
        ...staff.user
      });
    }
    fetchUserRole(staff.userID);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setEditID(null);
    setForm(defaultForm);
    setSelectedUserOption(null);
    setSelectedRoleOption(null);
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

      if (form.roleID) {
        api.post("/admin/role/assign-user", {
          userID: form.userID,
          roleID: form.roleID,
        })


      }

      setEditID(null);
      setForm(defaultForm);
      setSelectedUserOption(null);
      setSelectedRoleOption(null);
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
            isDisabled={!!editID}
            onChange={(val) => handleUserSelect(val as SelectOption<User> | null)}
            onInputChange={(val) => setUserSearch(val)}
            placeholder="Search and select user..."
            styles={getReactSelectStyles<SelectOption<User>>()}
            isClearable
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
            options={roleOptions}
            value={selectedRoleOption}
            onChange={(val) => handleRoleChange(val as SelectOption<Role>)}
            placeholder="Assign roles..."
            styles={getReactSelectStyles<SelectOption<Role>>()}

          />
        </div>
        {selectedUserOption && <div>
          <h1>ID : {selectedUserOption.value}</h1>
          {/* @ts-ignore */}
          <h1>Name : {selectedUserOption.name}</h1><h1>Address : {selectedUserOption.address}</h1>
              {/* @ts-ignore */}
          <h1>Email : {selectedUserOption.email}</h1></div>}
        <div className="flex gap-3 pt-2 col-span-full">
          {<button type="submit" disabled={loading} className="global_button">
            {loading ? "Saving..." : editID ? "Update Staff" : "Create Staff"}
          </button>}
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
            header: "Role",
            // @ts-ignore
            accessor: (row) => row.user.userRole.role.name || "—",
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
