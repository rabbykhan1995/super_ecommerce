import { checkoutOrderSchema } from "@/validation/validation";
import { useStripe } from "@stripe/stripe-react-native";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
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
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "", area: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleOrder = async () => {
    const result = checkoutOrderSchema.safeParse({
      shipping: form,
      paymentMethod,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
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
      // Step 1: Backend e order create korুন, PaymentIntent client secret niন
      const res = await api.post("/order/checkout-mobile", {
        shipping: {
          name: form.name,
          phone: form.phone,
          address: form.address,
          city: form.city || undefined,
          area: form.area || undefined,
        },
        paymentMethod: "stripe",
      });

      const { orderId, clientSecret } = res.data.data;

      // Step 2: PaymentSheet initialize korুন
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: "Super Ecommerce", // apnar store er actual name diয়ে replace korুন
        paymentIntentClientSecret: clientSecret,
        allowsDelayedPaymentMethods: false,
      });

      if (initError) {
        Toast.show({ type: "error", text1: "Payment setup failed", text2: initError.message });
        setLoading(false);
        return;
      }

      // Step 3: PaymentSheet show korুন — user card diye pay korবে
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        // user cancel korলে ba payment fail hoile eikhane ashবে
        if (presentError.code !== "Canceled") {
          Toast.show({ type: "error", text1: "Payment failed", text2: presentError.message });
        }
        setLoading(false);
        return;
      }

      // Step 4: Payment successful — cart clear korুন, success screen e যান
      await clearCart();
      Toast.show({ type: "success", text1: "Payment successful!" });
      router.replace({ pathname: "/order/success", params: { orderId } });
    } catch (err: any) {
      // Error handled by interceptor (backend/network error)
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
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