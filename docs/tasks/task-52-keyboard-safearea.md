# Task 52 — Keyboard & SafeArea Handling

> **Phase**: 14 — Polish & Testing
> **Say**: "generate task 52" or "generate task 52"

## Objective

Ensure all screens handle keyboard avoidance, safe areas, and platform-specific behavior correctly.

## Checklist

### Keyboard Avoiding
All form screens must wrap content in `KeyboardAvoidingView`:
```tsx
import { KeyboardAvoidingView, Platform } from "react-native";

<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
  <ScrollView keyboardShouldPersistTaps="handled">
    {/* form content */}
  </ScrollView>
</KeyboardAvoidingView>
```

**Affected screens:**
- `login.tsx`
- `registration.tsx`
- `forget-password.tsx`
- `contact.tsx`
- `track-order.tsx`
- `checkout.tsx`

### Safe Area Usage
- All screens: `SafeAreaView` with `edges={["top"]}` for notch
- Bottom tab navigator: handles bottom inset via `useSafeAreaInsets()`
- Header component: `SafeAreaView` with `edges={["top"]}`

### Platform-Specific
- Android: Set `android:windowSoftInputMode="adjustResize"` in `app.json`
- iOS: `KeyboardAvoidingView` with `behavior="padding"`

## Verify

1. All forms are usable when keyboard is open (fields not hidden)
2. No content behind notch on iPhone
3. No content behind home indicator on iPhone
4. Android keyboard pushes content up properly
