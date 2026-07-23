# Task 49 — Return/Refund Policy Screen

> **Phase**: 12 — Static/Info Pages
> **Say**: "generate task 49" or "generate task 49"

## Objective

Create the return/refund policy page.

## File to Create

### `mobile/app/return-refund-policy.tsx`

## Implementation

```tsx
import { ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ReturnRefundPolicyScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView className="flex-1 p-6">
        <Text className="text-2xl font-bold text-gray-900 mb-4">Return & Refund Policy</Text>
        <Text className="text-gray-600 leading-6 mb-4">
          We accept returns within 7 days of delivery for most items. Products must be in original condition with tags attached.
        </Text>
        <Text className="text-gray-600 leading-6 mb-4">
          To initiate a return, please contact our support team with your order number and reason for return.
        </Text>
        <Text className="text-gray-600 leading-6">
          Refunds are processed within 5-7 business days after we receive and inspect the returned item.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
```

## Verify

Page renders with return/refund policy content.
