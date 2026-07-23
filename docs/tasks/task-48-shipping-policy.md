# Task 48 — Shipping Policy Screen

> **Phase**: 12 — Static/Info Pages
> **Say**: "generate task 48" or "generate task 48"

## Objective

Create the shipping policy page.

## File to Create

### `mobile/app/shipping-policy.tsx`

## Implementation

```tsx
import { ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ShippingPolicyScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView className="flex-1 p-6">
        <Text className="text-2xl font-bold text-gray-900 mb-4">Shipping Policy</Text>
        <Text className="text-gray-600 leading-6 mb-4">
          We offer nationwide shipping across Bangladesh. Orders are processed within 1-2 business days.
        </Text>
        <Text className="text-gray-600 leading-6 mb-4">
          Standard delivery takes 3-5 business days. Express delivery is available for select areas.
        </Text>
        <Text className="text-gray-600 leading-6">
          Shipping costs are calculated at checkout based on your location and selected delivery method.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
```

## Verify

Page renders with shipping policy content.
