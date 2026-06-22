import { Navigate } from "react-router";
import Helper from "../utils/helper";

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = Helper.getToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}