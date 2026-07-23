"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cartStore } from "@/zustand/cart.store";
import { createOrder } from "@/utils/checkoutApi";
import CheckoutForm from "./CheckoutForm";
import OrderSummary from "./OrderSummary";
import PaymentMethod from "./PaymentMethod";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

type ShippingInfo = {
  name: string;
  phone: string;
  address: string;
  city: string;
  area: string;
};

const CheckoutPage = () => {
  const router = useRouter();
  const { cart, cartTotal, isFetching } = cartStore();
  const [shipping, setShipping] = useState<ShippingInfo>({
    name: "",
    phone: "",
    address: "",
    city: "",
    area: "",
  });
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "cod">("stripe");
  const [submitting, setSubmitting] = useState(false);

  const effectiveCartTotal = cart.reduce((sum, item) => {
    const ep =
      item.discountPrice && item.discountPrice > 0 && item.discountPrice < item.price
        ? item.discountPrice
        : item.price;
    return sum + ep * item.quantity;
  }, 0);

  const totalDiscount = cart.reduce((sum, item) => {
    if (item.discountPrice && item.discountPrice > 0 && item.discountPrice < item.price) {
      return sum + (item.price - item.discountPrice) * item.quantity;
    }
    return sum;
  }, 0);

  if (isFetching && cart.length === 0) {
    return (
      <div className="container_custom py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 h-96 bg-gray-100 rounded-xl" />
            <div className="h-64 bg-gray-100 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container_custom py-16">
        <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <ShoppingCart size={40} className="text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Your cart is empty
          </h1>
          <p className="text-gray-500 mb-8">
            Add some items before checking out.
          </p>
          <Link
            href="/products"
            className="global_button flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!shipping.name.trim()) return toast.error("Full name is required");
    if (!shipping.phone.trim()) return toast.error("Phone number is required");
    if (!shipping.address.trim()) return toast.error("Address is required");

    setSubmitting(true);
    try {
      const result = await createOrder({
        shipping: {
          name: shipping.name.trim(),
          phone: shipping.phone.trim(),
          address: shipping.address.trim(),
          city: shipping.city.trim() || undefined,
          area: shipping.area.trim() || undefined,
        },
        note: note.trim() || undefined,
        paymentMethod,
      });

      if (paymentMethod === "stripe" && result.sessionUrl) {
        window.location.href = result.sessionUrl;
      } else {
        router.push(`/order/success?orderNo=${result.orderNo}`);
      }
    } catch {
      // toast handled by interceptor
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container_custom py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/cart"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Checkout
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <CheckoutForm shipping={shipping} onChange={setShipping} />
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Order Note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Any special instructions..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
          <PaymentMethod value={paymentMethod} onChange={setPaymentMethod} />
        </div>

        <div className="lg:col-span-1">
          <OrderSummary
            cart={cart}
            subtotal={effectiveCartTotal}
            discount={totalDiscount}
            onPlaceOrder={handleSubmit}
            submitting={submitting}
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:hidden z-50">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-500">Total</span>
          <span className="text-lg font-bold text-gray-900">
            {effectiveCartTotal} TK
          </span>
        </div>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="block w-full text-center global_button py-3 disabled:opacity-50"
        >
          {submitting ? "Placing Order..." : "Place Order"}
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;
