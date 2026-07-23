"use client";

import { CreditCard, Banknote } from "lucide-react";

type Props = {
  value: "stripe" | "cod";
  onChange: (method: "stripe" | "cod") => void;
};

const PaymentMethod = ({ value, onChange }: Props) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-5">Payment Method</h2>

      <div className="space-y-3">
        <label
          className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${
            value === "stripe"
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            value="stripe"
            checked={value === "stripe"}
            onChange={() => onChange("stripe")}
            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
          />
          <CreditCard
            size={20}
            className={value === "stripe" ? "text-blue-600" : "text-gray-400"}
          />
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Stripe (Card Payment)
            </p>
            <p className="text-xs text-gray-500">
              Pay securely with your credit or debit card
            </p>
          </div>
        </label>

        <label
          className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${
            value === "cod"
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            value="cod"
            checked={value === "cod"}
            onChange={() => onChange("cod")}
            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
          />
          <Banknote
            size={20}
            className={value === "cod" ? "text-blue-600" : "text-gray-400"}
          />
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Cash on Delivery
            </p>
            <p className="text-xs text-gray-500">
              Pay when you receive your order
            </p>
          </div>
        </label>
      </div>
    </div>
  );
};

export default PaymentMethod;
