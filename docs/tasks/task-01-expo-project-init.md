# Task 01 — Expo Project Init & Dependencies

> **Phase**: 1 — Project Setup
> **Say**: "generate task 1" or "generate task 01"

## Objective

Initialize the Expo project and install all required dependencies.

## Commands

```bash
# 1. Create Expo project with Bun
bunx create-expo-app@latest mobile --template tabs
cd mobile

# 2. Core dependencies
bun add expo-router expo-secure-store expo-image expo-status-bar
bun add react-native-reanimated react-native-gesture-handler
bun add react-native-safe-area-context react-native-screens
bun add expo-font

# 3. Styling
bun add nativewind tailwindcss react-native-css-interop

# 4. State & Data
bun add zustand axios

# 5. UI & Animations
bun add react-native-reanimated-carousel @gorhom/bottom-sheet
bun add react-native-toast-message lucide-react-native

# 6. Dev
bun add -d typescript @babel/core
```

## Expected Versions

| Package | Version |
|---------|---------|
| expo | ~52.0.0 |
| react | 18.3.1 |
| react-native | 0.76.0 |
| nativewind | ^4.0.0 |
| zustand | ^5.0.0 |
| axios | ^1.7.0 |
| react-native-reanimated | ~3.16.0 |
| react-native-gesture-handler | ~2.20.0 |
| @gorhom/bottom-sheet | ^5.0.0 |

## Environment File

Create `mobile/.env`:
```env
EXPO_PUBLIC_API_URL=https://your-api-domain.com/api
```

## Verify

Run `bun start` — app should boot without errors.

## Output

A working Expo project at `mobile/` with all dependencies installed.
