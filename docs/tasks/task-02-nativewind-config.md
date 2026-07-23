# Task 02 — NativeWind & Styling Config

> **Phase**: 1 — Project Setup
> **Say**: "generate task 2" or "generate task 02"

## Objective

Configure NativeWind v4 with Tailwind CSS for React Native styling.

## Files to Create/Edit

### `tailwind.config.js`
```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#F7311E",
        primaryDark: "#df2815",
      },
    },
  },
  plugins: [],
};
```

### `nativewind-env.d.ts`
```ts
/// <reference types="nativewind/types" />
```

### `metro.config.js`
```js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./global.css" });
```

### `global.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .global_button {
    @apply bg-primary px-6 py-3 rounded-lg text-white font-semibold items-center justify-center;
  }
  .global_button_outline {
    @apply border border-primary px-6 py-3 rounded-lg text-primary font-semibold items-center justify-center;
  }
}
```

### Import in root `_layout.tsx`
```ts
import "../global.css";
```

## Key Differences from Web Tailwind

| Web (Tailwind v4) | Mobile (NativeWind v4) |
|---|---|
| `hover:bg-gray-100` | Not supported — use pressable states |
| `lg:grid-cols-3` | Not used — max 2 columns |
| `backdrop-blur-sm` | Use `BlurView` from `expo-blur` |
| `fixed inset-0` | Use `absolute` or `Modal` |
| `overflow-hidden` on body | Use `KeyboardAvoidingView` |

## Color Palette

Reference: `/ecommerce/components/Cards/ProductCard.tsx`
- Primary: `#F7311E`
- Background: `bg-white`, `bg-gray-50`
- Text: `text-gray-900`, `text-gray-500`, `text-gray-400`

## Verify

Run `bun start` — no NativeWind/Tailwind errors.
