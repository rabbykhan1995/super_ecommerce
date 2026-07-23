"use client";

import { User, Phone, MapPin, Building, AreaChart } from "lucide-react";

type ShippingInfo = {
  name: string;
  phone: string;
  address: string;
  city: string;
  area: string;
};

type Props = {
  shipping: ShippingInfo;
  onChange: (info: ShippingInfo) => void;
};

const CheckoutForm = ({ shipping, onChange }: Props) => {
  const update = (field: keyof ShippingInfo, value: string) => {
    onChange({ ...shipping, [field]: value });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-5">
        Shipping Information
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Full Name *
          </label>
          <div className="relative">
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={shipping.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="John Doe"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Phone Number *
          </label>
          <div className="relative">
            <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="tel"
              value={shipping.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+880 1XXX-XXXXXX"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Address *
          </label>
          <div className="relative">
            <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
            <textarea
              value={shipping.address}
              onChange={(e) => update("address", e.target.value)}
              placeholder="Street address, building, apartment..."
              rows={2}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            City
          </label>
          <div className="relative">
            <Building size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={shipping.city}
              onChange={(e) => update("city", e.target.value)}
              placeholder="Dhaka"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Area
          </label>
          <div className="relative">
            <AreaChart size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={shipping.area}
              onChange={(e) => update("area", e.target.value)}
              placeholder="Gulshan, Banani..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;
