# Task 45 — Contact Screen

> **Phase**: 12 — Static/Info Pages
> **Say**: "generate task 45" or "generate task 45"

## Objective

Create the Contact page with contact form.

## Reference

`/ecommerce/app/(with_footer)/contact/page.tsx`

## File to Create

### `mobile/app/contact.tsx`

## Implementation

```tsx
import { useState } from "react";
import { ScrollView, View, Text, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Toast from "react-native-toast-message";
import api from "../lib/api";

export default function ContactScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !email || !message) {
      Toast.show({ type: "error", text1: "Please fill required fields" });
      return;
    }
    setLoading(true);
    try {
      await api.post("/contact", { name, email, subject, message });
      Toast.show({ type: "success", text1: "Message sent!" });
      setName(""); setEmail(""); setSubject(""); setMessage("");
    } catch (err) {
      // Handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView contentContainerClassName="p-6" keyboardShouldPersistTaps="handled">
          <Text className="text-2xl font-bold text-gray-900 mb-1">Contact Us</Text>
          <Text className="text-gray-500 mb-6">We'd love to hear from you</Text>
          <Input label="Name" value={name} onChangeText={setName} placeholder="Your name" />
          <Input label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" />
          <Input label="Subject" value={subject} onChangeText={setSubject} placeholder="Subject" />
          <Input label="Message" value={message} onChangeText={setMessage} placeholder="Your message..." multiline numberOfLines={4} />
          <Button title="Send Message" onPress={handleSubmit} loading={loading} className="mt-2" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
```

## Verify

Form renders, submission works, success toast shown.
