import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import Helper from "../../utils/helper";
import toast from "react-hot-toast";

export default function GoogleCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      toast.error("Authentication failed. No token received.");
      navigate("/login", { replace: true });
      return;
    }

    Helper.setToken(token);
    toast.success("Google login successful");
    navigate("/", { replace: true });
  }, [searchParams, navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
}
