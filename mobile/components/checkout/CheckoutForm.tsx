import { useUserStore } from "@/store/user.store";
import { useEffect } from "react";
import { Text, View } from "react-native";
import Input from "../ui/Input";

interface CheckoutFormProps {
  form: {
    name: string;
    phone: string;
    address: string;
    city: string;
    area: string;
  };
  setForm: (form: any) => void;
  errors: Record<string, string>;
}

export default function CheckoutForm({
  form,
  setForm,
  errors,
}: CheckoutFormProps) {
  const { user } = useUserStore();

  useEffect(() => {
    if (!user) return;

    setForm({
      ...form,
      name: user.contact?.name || user.name || "",
      phone: user.contact?.mobile || "",
      address: user.contact?.address || user.address || "",
    });
  }, [user]);

  const update = (key: string, value: string) => {
    setForm({
      ...form,
      [key]: value,
    });
  };

  return (
    <View>
      <Text className="text-lg font-bold mb-4">
        Shipping Details
      </Text>

      <Input
        label="Full Name"
        value={form.name}
        onChangeText={(v) => update("name", v)}
        placeholder="John Doe"
        error={errors.name}
      />

      <Input
        label="Phone"
        value={form.phone}
        onChangeText={(v) => update("phone", v)}
        placeholder="+880 1XXXXXXXXX"
        keyboardType="phone-pad"
        error={errors.phone}
      />

      <Input
        label="Address"
        value={form.address}
        onChangeText={(v) => update("address", v)}
        placeholder="123 Main Street"
        error={errors.address}
      />

      <Input
        label="City"
        value={form.city}
        onChangeText={(v) => update("city", v)}
        placeholder="Dhaka"
        error={errors.city}
      />

      <Input
        label="Area"
        value={form.area}
        onChangeText={(v) => update("area", v)}
        placeholder="Dhanmondi"
        error={errors.area}
      />
    </View>
  );
}