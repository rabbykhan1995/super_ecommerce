import { checkoutOrderSchema } from "@/validation/validation";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useState } from "react";
import { KeyboardAvoidingView, Linking, Platform, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import CheckoutForm from "../components/checkout/CheckoutForm";
import OrderSummary from "../components/checkout/OrderSummary";
import PaymentMethod from "../components/checkout/PaymentMethod";
import Button from "../components/ui/Button";
import api from "../lib/api";
import { useCartStore } from "../store/cart.store";

export default function CheckoutScreen() {
  const router = useRouter();
  const { cart, cartTotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "", area: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name) newErrors.name = "Name is required";
    if (!form.phone) newErrors.phone = "Phone is required";
    if (!form.address) newErrors.address = "Address is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOrder = async () => {
    const result = checkoutOrderSchema.safeParse({
      shipping: form,
      paymentMethod,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        // issue.path looks like ["shipping", "name"] — take the last segment as the field key
        const field = issue.path[issue.path.length - 1] as string;
        fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      Toast.show({ type: "error", text1: result.error.issues[0].message });
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const res = await api.post("/order/checkout", {
        shipping: {
          name: form.name,
          phone: form.phone,
          address: form.address,
          city: form.city || undefined,
          area: form.area || undefined,
        },
        paymentMethod: "stripe",
      });
      await clearCart();
      if (res.data?.stripeSessionUrl) {
        Linking.openURL(res.data.stripeSessionUrl);
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
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
          <OrderSummary items={cart} total={cartTotal} />
          <View className="mt-6"><CheckoutForm form={form} setForm={setForm} errors={errors} /></View>
          <View className="mt-6"><PaymentMethod selected={paymentMethod} onSelect={setPaymentMethod} /></View>
          <View className="mt-6 mb-8"><Button title="Place Order" onPress={handleOrder} loading={loading} /></View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
