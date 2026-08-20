import { useEffect, useState } from "react";
import api from "../../lib/axios";
import { toast as sonnerToast } from "sonner";
import type { Permissions, Role } from "../../types/type";
import Table from "../../components/tables/Table";
import { Edit, Trash } from "lucide-react";
import toast from "react-hot-toast";
import PermissionModal from "../../components/modals/PermissionModal";


type FormType = {
    name: string;
    description: string;
    permissionIds: [string] | [];
};

const defaultForm: FormType = {
    name: "",
    description: "",
    permissionIds: [],
};



export default function Roles() {
    const [roles, setRoles] = useState<Role[] | []>([]);
    const [editID, setEditID] = useState<string | null>(null);
    const [form, setForm] = useState<FormType>(defaultForm);

    const [permissionModal, setPermissionModal] = useState<Role | null>(null)
    const [permissions, setPermissions] = useState<Permissions[] | []>([]);

    const fetchPermissions = async () => {
        const res = await api(`/admin/permissions`);
        if (res.data.success) setPermissions(res.data.data);
    }


    const fetchRoles = async () => {
        const res = await api("/admin/role-list",);
        if (res.data.success) setRoles(res.data.data);
    };

    useEffect(() => {
        Promise.allSettled([fetchRoles(), fetchPermissions()])
    }, []);

    const onChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleCancel = () => {
        setEditID(null);
        setForm(defaultForm);
    };

    const handleDelete = (id: string) => {
        sonnerToast("Are you sure?", {
            action: {
                label: "Delete",
                onClick: async () => {
                    await api.delete(`/admin/role-delete/${id}`);
                    fetchRoles();
                },
            },
            cancel: { label: "Cancel", onClick: () => { } },
        });
    };

    const handleEdit = (role: Role) => {
        setEditID(role.id);
        setForm({ name: role.name,
            // @ts-ignore
             description: role.description });
    }


    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) { toast.error("Name is required"); return; }

        try {
            if (editID) {
                await api.post(`/admin/update-role/${editID}`, form);
            } else {
                await api.post("/admin/create-role", form);
            }
            setEditID(null);
            setForm(defaultForm);
            fetchRoles();
        } finally {

        }
    };

    return (
        <div className="space-y-4">

            {/* Form */}
            <form onSubmit={onSubmit} className="grid lg:grid-cols-2 grid-cols-1 gap-4">
                <h2 className="global_heading col-span-full">
                    {editID ? "Edit Customer" : "New Customer"}
                </h2>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        name="name"
                        value={form.name}
                        onChange={onChange}
                        placeholder="Customer name"
                        className="global_input"
                    />
                </div>



                <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <input
                        name="description"
                        type="text"
                        value={form.description}
                        onChange={onChange}
                        placeholder="Description"
                        className="global_input"
                    />
                </div>




                <div className="flex gap-3 pt-2 col-span-full">
                    <button type="submit" className="global_button">
                        {editID ? "Update Role" : "Create Role"}
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


            <Table
                data={roles}
                keyExtractor={(_, i) => i}
                columns={[
                    {
                        header: "#",
                        accessor: (_, i) => (i ?? 0) + 1,
                        className: "w-10 text-center",
                        headerClassName: "text-center",
                    },
                    {
                        header: "name",
                        accessor: "name",
                        className: "text-left",
                        headerClassName: "text-left",
                    }, {
                        header: "description",
                        accessor: "description",
                        className: "max-w-[300px]",
                        headerClassName: "text-left"

                    }, {
                        header: "Action",
                        accessor: (row) => <div className="flex gap-1 justify-end">
                            {!row.isSuperAdmin && <button onClick={() => {
                                const role = row;
                                setPermissionModal(role)
                            }} className="global_button bg-green-500 p-1">Permissions</button>}
                            <button className="global_button p-1" onClick={() => handleEdit(row)}><Edit size={20} /></button>
                            {!row.isSuperAdmin && <button onClick={() => handleDelete(row.id)} className="global_button bg-red-500 p-1"><Trash size={20} /></button>}


                        </div>,
                        className: "text-right",
                        headerClassName: "text-right",
                    },

                ]}
            />
            <PermissionModal allPermissions={permissions} role={permissionModal} close={()=> {setPermissionModal(null)}} />
        </div>
    );
}