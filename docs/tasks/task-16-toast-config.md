# Task 16 — Toast Configuration

> **Phase**: 4 — UI Primitives
> **Say**: "generate task 16" or "generate task 16"

## Objective

Configure `react-native-toast-message` with the app's color scheme and styles.

## Reference

Replace `react-hot-toast` from web with `react-native-toast-message`.

## Configuration

Add to `mobile/app/_layout.tsx` (already done in Task 09):

```tsx
import Toast from "react-native-toast-message";

// In the layout JSX:
<Toast />
```

## Custom Toast Config (Optional)

Create `mobile/lib/toast-config.ts`:

```ts
import { BaseToast, ErrorToast } from "react-native-toast-message";

export const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: "#22C55E", backgroundColor: "#F0FDF4" }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 14, fontWeight: "600" }}
      text2Style={{ fontSize: 12 }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: "#EF4444", backgroundColor: "#FEF2F2" }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 14, fontWeight: "600" }}
      text2Style={{ fontSize: 12 }}
    />
  ),
};
```

## Usage Pattern (Replace Web's Toast)

```tsx
// Web:
import toast from "react-hot-toast";
toast.success("Item added to cart");
toast.error("Something went wrong");

// Mobile:
import Toast from "react-native-toast-message";
Toast.show({ type: "success", text1: "Item added to cart" });
Toast.show({ type: "error", text1: "Something went wrong" });
```

## Verify

Trigger success and error toasts — should display with correct colors and auto-dismiss.
