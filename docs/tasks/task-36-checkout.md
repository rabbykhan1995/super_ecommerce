# Task 36 — Checkout Screen

> **Phase**: 10 — Cart & Checkout
> **Say**: "generate task 36" or "generate task 36"

## Objective

Create the checkout screen with form, order summary, and payment method.

## Reference

- `/ecommerce/app/(with_footer)/checkout/page.tsx`
- `/ecommerce/app/(with_footer)/checkout/CheckoutForm.tsx`
- `/ecommerce/app/(with_footer)/checkout/OrderSummary.tsx`
- `/ecommerce/app/(with_footer)/checkout/PaymentMethod.tsx`

## Files to Create

### `mobile/components/checkout/CheckoutForm.tsx`

```tsx
import { View, Text } from "react-native";
import Input from "../ui/Input";

interface CheckoutFormProps {
  form: { name: string; phone: string; address: string; city: string; area: string };
  setForm: (form: any) => void;
  errors: Record<string, string>;
}

export default function CheckoutForm({ form, setForm, errors }: CheckoutFormProps) {
  const update = (key: string, value: string) => setForm({ ...form, [key]: value });

  return (
    <View>
      <Text className="text-lg font-bold mb-4">Shipping Details</Text>
      <Input label="Full Name" value={form.name} onChangeText={(v) => update("name", v)} placeholder="John Doe" error={errors.name} />
      <Input label="Phone" value={form.phone} onChangeText={(v) => update("phone", v)} placeholder="+880 1XXXXXXXXX" keyboardType="phone-pad" error={errors.phone} />
      <Input label="Address" value={form.address} onChangeText={(v) => update("address", v)} placeholder="123 Main Street" error={errors.address} />
      <Input label="City" value={form.city} onChangeText={(v) => update("city", v)} placeholder="Dhaka" error={errors.city} />
      <Input label="Area" value={form.area} onChangeText={(v) => update("area", v)} placeholder="Dhanmondi" error={errors.area} />
    </View>
  );
}
```

### `mobile/components/checkout/OrderSummary.tsx`

```tsx
import { View, Text } from "react-native";
import ExpoImage from "expo-image";
import { getImageUrl } from "../../lib/utils";

interface OrderSummaryProps {
  items: any[];
  total: number;
}

export default function OrderSummary({ items, total }: OrderSummaryProps) {
  return (
    <View>
      <Text className="text-lg font-bold mb-4">Order Summary</Text>
      {items.map((item) => (
        <View key={item._id} className="flex-row items-center gap-3 mb-3 pb-3 border-b border-gray-50">
          <ExpoImage source={{ uri: getImageUrl(item.product?.image) }} className="w-12 h-12 rounded" contentFit="contain" />
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-900" numberOfLines={1}>{item.product?.name}</Text>
            <Text className="text-xs text-gray-500">Qty: {item.quantity}</Text>
          </View>
          <Text className="font-semibold text-gray-900">৳{item.price * item.quantity}</Text>
        </View>
      ))}
      <View className="flex-row justify-between mt-2">
        <Text className="text-lg font-bold">Total</Text>
        <Text className="text-lg font-bold text-primary">৳{total}</Text>
      </View>
    </View>
  );
}
```

### `mobile/components/checkout/PaymentMethod.tsx`

```tsx
import { View, Text, Pressable } from "react-native";
import { CreditCard, Banknote } from "lucide-react-native";

interface PaymentMethodProps {
  selected: string;
  onSelect: (method: string) => void;
}

export default function PaymentMethod({ selected, onSelect }: PaymentMethodProps) {
  return (
    <View>
      <Text className="text-lg font-bold mb-4">Payment Method</Text>
      <Pressable
        onPress={() => onSelect("stripe")}
        className={`flex-row items-center gap-3 p-4 rounded-xl border ${selected === "stripe" ? "border-primary bg-primary/5" : "border-gray-200"}`}
      >
        <CreditCard size={22} color={selected === "stripe" ? "#F7311E" : "#6B7280"} />
        <View className="flex-1">
          <Text className="font-medium text-gray-900">Stripe</Text>
          <Text className="text-xs text-gray-500">Pay with card</Text>
        </View>
        <View className={`w-5 h-5 rounded-full border-2 ${selected === "stripe" ? "border-primary" : "border-gray-300"} items-center justify-center`}>
          {selected === "stripe" && <View className="w-3 h-3 rounded-full bg-primary" />}
        </View>
      </Pressable>

      <Pressable
        onPress={() => onSelect("cod")}
        className={`flex-row items-center gap-3 p-4 rounded-xl border mt-3 ${selected === "cod" ? "border-primary bg-primary/5" : "border-gray-200"}`}
      >
        <Banknote size={22} color={selected === "cod" ? "#F7311E" : "#6B7280"} />
        <View className="flex-1">
          <Text className="font-medium text-gray-900">Cash on Delivery</Text>
          <Text className="text-xs text-gray-500">Pay when you receive</Text>
        </View>
        <View className={`w-5 h-5 rounded-full border-2 ${selected === "cod" ? "border-primary" : "border-gray-300"} items-center justify-center`}>
          {selected === "cod" && <View className="w-3 h-3 rounded-full bg-primary" />}
        </View>
      </Pressable>
    </View>
  );
}
```

### `mobile/app/checkout.tsx`

```tsx
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import CheckoutForm from "../components/checkout/CheckoutForm";
import OrderSummary from "../components/checkout/OrderSummary";
import PaymentMethod from "../components/checkout/PaymentMethod";
import Button from "../components/ui/Button";
import { useCartStore } from "../store/cart.store";
import api from "../lib/api";
import Toast from "react-native-toast-message";

export default function CheckoutScreen() {
  const router = useRouter();
  const { items, cartTotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "", area: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name) newErrors.name = "Name is required";
    if (!form.phone) newErrors.phone = "Phone is required";
    if (!form.address) newErrors.address = "Address is required";
    if (!form.city) newErrors.city = "City is required";
    if (!form.area) newErrors.area = "Area is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOrder = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await api.post("/checkout/create-order", {
        shippingAddress: form,
        paymentMethod,
        items: items.map((item) => ({ product: item.product._id, variant: item.variant?._id, quantity: item.quantity, price: item.price })),
      });
      await clearCart();
      if (res.data?.sessionUrl) {
        // Stripe — open in browser
        const { Linking } = require("react-native");
        Linking.openURL(res.data.sessionUrl);
      } else {
        Toast.show({ type: "success", text1: "Order placed successfully!" });
        router.replace("/order/success");
      }
    } catch (err: any) {
      // Error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <ArrowLeft size={24} color="#1F2937" onPress={() => router.back()} />
      </View>
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        <OrderSummary items={items} total={cartTotal} />
        <View className="mt-6"><CheckoutForm form={form} setForm={setForm} errors={errors} /></View>
        <View className="mt-6"><PaymentMethod selected={paymentMethod} onSelect={setPaymentMethod} /></View>
        <View className="mt-6 mb-8"><Button title="Place Order" onPress={handleOrder} loading={loading} /></View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

## Verify

Form validation works, order summary displays, payment selection works, order placement succeeds.
