import { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import ProductCard from "../product/ProductCard";

interface FlashProductsSliderProps {
  products: any[];
  endDate?: any;
}

function calculateTimeLeft(endDate: string) {
  const difference = new Date(endDate).getTime() - Date.now();

  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      expired: true,
    };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    expired: false,
  };
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export default function FlashProductsSlider({
  products,
  endDate,
}: FlashProductsSliderProps) {
  const [timeLeft, setTimeLeft] = useState(() =>
    endDate
      ? calculateTimeLeft(endDate)
      : {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          expired: false,
        }
  );

  useEffect(() => {
    if (!endDate) return;

    const timer = setInterval(() => {
      const updated = calculateTimeLeft(endDate);
      setTimeLeft(updated);

      if (updated.expired) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (!products || products.length === 0) return null;

  if (endDate && timeLeft.expired) return null;

  const formattedDate = endDate
    ? new Date(endDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <View className="mb-6">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 mb-3">
        <View className="flex-row items-center gap-2">
          <View className="bg-red-500 rounded-full w-2 h-2" />

          <Text className="text-lg font-bold text-gray-900">
            Flash Sale
          </Text>

          {endDate && !timeLeft.expired && (
            <View className="flex-row items-center ml-1">
              <View className="flex-row items-center gap-1">
                <View className="bg-red-500 px-1.5 py-0.5 rounded-md">
                  <Text className="text-white text-[11px] font-bold">
                    {pad(timeLeft.days)}
                  </Text>
                </View>

                <Text className="text-gray-400 text-[11px]">:</Text>

                <View className="bg-red-500 px-1.5 py-0.5 rounded-md">
                  <Text className="text-white text-[11px] font-bold">
                    {pad(timeLeft.hours)}
                  </Text>
                </View>

                <Text className="text-gray-400 text-[11px]">:</Text>

                <View className="bg-red-500 px-1.5 py-0.5 rounded-md">
                  <Text className="text-white text-[11px] font-bold">
                    {pad(timeLeft.minutes)}
                  </Text>
                </View>

                <Text className="text-gray-400 text-[11px]">:</Text>

                <View className="bg-red-500 px-1.5 py-0.5 rounded-md">
                  <Text className="text-white text-[11px] font-bold">
                    {pad(timeLeft.seconds)}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        <Text className="text-primary text-sm font-medium">
          View All
        </Text>
      </View>

      {/* Products */}
      <FlatList
        data={products}
        keyExtractor={(item) => String(item._id || item.id)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12 }}
        ItemSeparatorComponent={() => <View className="w-2" />}
        renderItem={({ item }) => (
          <View className="w-[160px]">
            <ProductCard product={item} />
          </View>
        )}
      />
    </View>
  );
}