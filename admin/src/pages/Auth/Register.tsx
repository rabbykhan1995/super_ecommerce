import { useState } from "react";
import { useNavigate } from "react-router";
import api from "../../lib/axios";

type RegisterForm = {
  name: string;
  email: string;
  phone: string;
  address: string;
  password: string;
};

export default function Registration() {
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterForm>({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<RegisterForm>>({});
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: Partial<RegisterForm> = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!form.phone.trim()) newErrors.phone = "Phone is required";
    if (!form.address.trim()) newErrors.address = "Address is required";
    if (!form.password.trim()) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await api.post("/auth/register-manually", form);
      navigate("/login", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const fields: { name: keyof RegisterForm; label: string; type: string; placeholder: string }[] = [
    { name: "name",     label: "Name",     type: "text",     placeholder: "Enter your name" },
    { name: "email",    label: "Email",    type: "email",    placeholder: "Enter your email" },
    { name: "phone",    label: "Phone",    type: "text",     placeholder: "Enter your phone" },
    { name: "address",  label: "Address",  type: "text",     placeholder: "Enter your address" },
    { name: "password", label: "Password", type: "password", placeholder: "Enter your password" },
  ];

  return (
    <div className="flex justify-center items-center min-h-screen bg-white dark:bg-[#1d1d1d]">
      <div className="shadow-2xl rounded-2xl p-8 w-[90%] max-w-md dark:bg-gray-900">
        <h2 className="text-2xl font-bold text-center mb-6 text-indigo-600 dark:text-white">
          Register
        </h2>

        <form onSubmit={onSubmit} className="space-y-4">
          {fields.map(({ name, label, type, placeholder }) => (
            <div key={name}>
              <label className="block font-medium mb-1 capitalize">{label}</label>
              <input
                name={name}
                type={type}
                value={form[name]}
                onChange={onChange}
                placeholder={placeholder}
                className="large_input"
              />
              {errors[name] && (
                <p className="text-red-500 text-sm mt-1">{errors[name]}</p>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="large_button w-full mt-2"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-5 text-sm">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-indigo-600 font-semibold hover:underline cursor-pointer"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}