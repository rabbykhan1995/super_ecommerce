import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Permissions, Role } from "../../types/type";
import api from "../../lib/axios";

type PermissionModalProps = {
  role: Role | null;
  close: () => void;
  allPermissions: Permissions[];
};

export default function PermissionModal({
  role,
  close,
  allPermissions,
}: PermissionModalProps) {

  const [selectedPermissionIDs, setSelectedPermissionIDs] = useState<string[]>(
    []
  );
  const [loading, setLoading] = useState(false);

  const fetchRolePermissions = async (roleID: string) => {
    try {
      const res = await api.get(`/admin/role-permissions/${roleID}`);

      if (res.data.success) {
        const permissions: any[] = res.data.data;

        setSelectedPermissionIDs(
  permissions.map((permission) => permission.permissionID)
);
      }
    } catch (error) {
      console.error("Failed to fetch role permissions:", error);
    }
  };

  useEffect(() => {
    if (role) {
      fetchRolePermissions(role.id);
    }
  }, [role]);

  if (!role) {
    return null;
  }

  const handlePermissionChange = (permissionID: string) => {
    setSelectedPermissionIDs((prev) => {
      if (prev.includes(permissionID)) {
        return prev.filter((id) => id !== permissionID);
      }

      return [...prev, permissionID];
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const res = await api.post("/admin/assign-role-permissions", {
        roleID: role.id,
        permissionIDs: selectedPermissionIDs,
      });

      if (res.data.success) {
        close();
      }
    } catch (error) {
      console.error("Failed to assign permissions:", error);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div
      onClick={close}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 lg:p-4 p-2"
    >
      <div
        className="bg-[#dbdbdb] dark:bg-[#1E2939] text-black dark:text-white rounded-lg lg:p-6 p-2 max-w-xl w-full lg:mx-2 overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-1">
          Permissions
        </h2>

        <p className="mb-4">
          Role: <strong>{role.name}</strong>
        </p>

        <div className="grid grid-cols-2 gap-1">
          {allPermissions.map((permission) => (
            <div key={permission.id} className="border dark:border-gray-400 border-gray-400 p-1">
              <label>
                <input
                  type="checkbox"
                  checked={selectedPermissionIDs.includes(permission.id)}
                  onChange={() =>
                    handlePermissionChange(permission.id)
                  }
                />

                <span className="ml-2 text-sm">
                  {permission.name}
                </span>
              </label>

              <details className="ml-6 mb-2 text-xs">
                <summary>Description</summary>
                <p>{permission.description}</p>
              </details>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="global_button"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>

          <button
            onClick={close}
            className="global_button_red"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}