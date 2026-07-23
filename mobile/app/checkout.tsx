import { useState } from "react";
import { ScrollView, View, Linking, KeyboardAvoidingView, Platform } from "react-native";
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
  const { cart, cartTotal, clearCart } = useCartStore();
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
        items: cart.map((item) => ({
          product: item.productID,
          variant: item.variantID,
          quantity: item.quantity,
          price: item.price,
        })),
      });
      await clearCart();
      if (res.data?.sessionUrl) {
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
