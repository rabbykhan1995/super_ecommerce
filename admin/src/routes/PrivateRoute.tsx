import { useEffect } from "react";
import { Navigate } from "react-router";
import Helper from "../utils/helper";
import { userStore } from "../stores/user.store";
import { permissionStore } from "../stores/permission.store";

export default function PrivateRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = Helper.getToken();

  const {
    user,
    isLoading: userLoading,
    isInitialized: userInitialized,
    fetchUser,
  } = userStore();

  const {
    isLoading: permissionLoading,
    fetchPermissions,
  } = permissionStore();

  useEffect(() => {
    if (!token) return;

    Promise.all([
      fetchUser(),
      fetchPermissions(),
    ]);
  }, [token]);

  // Token নেই → login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // এখনো API call শেষ হয়নি → loading
  if (!userInitialized || userLoading || permissionLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  // API call শেষ হওয়ার পরেও user না থাকলে → login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}