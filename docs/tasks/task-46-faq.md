# Task 46 — FAQ Screen

> **Phase**: 12 — Static/Info Pages
> **Say**: "generate task 46" or "generate task 46"

## Objective

Create the FAQ page with collapsible questions.

## Reference

`/ecommerce/app/(with_footer)/faq/page.tsx`

## File to Create

### `mobile/app/faq.tsx`

## Implementation

```tsx
import { useState } from "react";
import { ScrollView, View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import api from "../lib/api";

export default function FAQScreen() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useState(() => {
    api.get("/faq/list").then((res) => setFaqs(res.data?.data || [])).catch(() => {});
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView className="flex-1 p-6">
        <Text className="text-2xl font-bold text-gray-900 mb-6">FAQ</Text>
        {faqs.map((faq, index) => (
          <View key={index} className="border-b border-gray-100 py-4">
            <Pressable onPress={() => setExpandedIndex(expandedIndex === index ? null : index)} className="flex-row items-center justify-between">
              <Text className="flex-1 font-medium text-gray-900 pr-4">{faq.question}</Text>
              {expandedIndex === index ? <ChevronUp size={18} color="#6B7280" /> : <ChevronDown size={18} color="#6B7280" />}
            </Pressable>
            {expandedIndex === index && (
              <Text className="text-gray-600 mt-3 leading-6">{faq.answer}</Text>
            )}
          </View>
        ))}
        {faqs.length === 0 && (
          <Text className="text-gray-500 text-center py-10">No FAQs available</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
```

## Verify

FAQs load, expand/collapse works, content displays.
