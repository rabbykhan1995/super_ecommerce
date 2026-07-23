# Super Ecommerce — React Native Mobile App

> **Stack**: React Native (Expo SDK 52+) · Bun · TypeScript · Expo Router · NativeWind · Zustand  
> **Backend**: Unchanged — same Bun API, same endpoints, same JWT auth  
> **Reference Web Project**: `/ecommerce` (Next.js 14+)

---

## 1. Overview

The mobile app is a **1:1 visual and functional mirror** of the web ecommerce frontend (`/ecommerce`), designed **exclusively for mobile and tablet** (phones + iPads). No desktop layout, no SEO, no server rendering, no SSR/SSG complexity. Pure client-side SPA with native gesture support.

| Concern | Web | Mobile |
|---------|-----|--------|
| Framework | Next.js 14 (App Router) | Expo (Expo Router) |
| Styling | Tailwind CSS v4 | NativeWind v4 |
| State | Zustand | Zustand (same stores) |
| Animations | Framer Motion | React Native Reanimated + Gesture Handler |
| Routing | File-based (`app/`) | File-based (`app/`) via Expo Router |
| Auth Token | Cookie (`document.cookie`) | `expo-secure-store` |
| HTTP | Axios | Axios (same config, same interceptors) |
| Toasts | `react-hot-toast` | `react-native-toast-message` |
| Carousel | Swiper | `react-native-reanimated-carousel` |
| Images | `next/image` | `expo-image` |
| Links | `next/link` | `<Link>` from `expo-router` |

---

## 2. Project Structure

```
mobile/
├── app/                          # Expo Router — file-based routing
│   ├── _layout.tsx               # Root layout (providers, toast, gesture handler)
│   ├── index.tsx                 # Home screen
│   ├── login.tsx
│   ├── registration.tsx
│   ├── forget-password.tsx
│   ├── products/
│   │   ├── index.tsx             # Product listing (with filters)
│   │   └── [id].tsx              # Product detail (dynamic slug/id)
│   ├── cart.tsx
│   ├── checkout.tsx
│   ├── order/
│   │   └── success.tsx
│   ├── track-order.tsx
│   ├── about.tsx
│   ├── contact.tsx
│   ├── faq.tsx
│   ├── training/
│   │   ├── index.tsx             # Training & Programs listing
│   │   └── [slug].tsx
│   ├── shipping-policy.tsx
│   ├── return-refund-policy.tsx
│   └── user/
│       ├── _layout.tsx           # Dashboard layout (auth guard)
│       ├── index.tsx             # User dashboard
│       ├── profile.tsx
│       ├── settings.tsx
│       ├── my-cart.tsx
│       └── my-orders/
│           ├── index.tsx         # Order list
│           └── [orderNo].tsx     # Order detail
│
├── components/
│   ├── ui/                       # Primitives: Button, Input, Card, Badge, Skeleton
│   ├── product/
│   │   ├── ProductCard.tsx       # Ref: /ecommerce/components/Cards/ProductCard.tsx
│   │   └── ProductImageGallery.tsx
│   ├── sliders/
│   │   ├── CartSlider.tsx        # Slide-from-right gesture drawer
│   │   └── MenuSlider.tsx        # Slide-from-left gesture drawer
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx            # Bottom tab bar equivalent
│   │   └── BottomNav.tsx
│   ├── cart/
│   │   └── CartItem.tsx
│   ├── checkout/
│   │   ├── CheckoutForm.tsx
│   │   ├── OrderSummary.tsx
│   │   └── PaymentMethod.tsx
│   ├── filter/
│   │   ├── FilterDrawer.tsx      # Bottom sheet filter
│   │   └── SortSheet.tsx         # Bottom sheet sort
│   └── skeleton/
│       ├── ProductCardSkeleton.tsx
│       ├── BannerSkeleton.tsx
│       └── ...
│
├── lib/
│   ├── api.ts                    # Axios instance (same as /ecommerce/utils/apiconfig.ts)
│   ├── auth.ts                   # Token helpers (SecureStore)
│   └── utils.ts                  # Image helper, formatters (from /ecommerce/helper/helper.ts)
│
├── hooks/                        # Custom hooks (useAuth, useCart, etc.)
│
├── store/                        # Zustand stores (same logic as /ecommerce/zustand/)
│   ├── cart.store.ts
│   ├── user.store.ts
│   ├── openclose.store.ts
│   └── loading.store.ts
│
├── types/                        # Shared TS types (copy from /ecommerce/types/)
│   ├── cart.types.ts
│   ├── product.types.ts
│   ├── order.types.ts
│   └── program.types.ts
│
├── assets/                       # Static assets
│   ├── images/
│   └── fonts/
│
├── app.json                      # Expo config
├── tailwind.config.js            # NativeWind config
├── nativewind-env.d.ts
├── metro.config.js
├── babel.config.js
├── tsconfig.json
├── package.json
└── bun.lock
```

---

## 3. Routing Map

Every web route maps to an Expo Router file. Expo Router uses **file-based routing** identical in concept to Next.js App Router.

| Web Route (`/ecommerce/app/`) | Mobile Route (`mobile/app/`) | Notes |
|-------------------------------|------------------------------|-------|
| `(with_footer)/page.tsx` | `index.tsx` | Homepage |
| `(with_footer)/products/page.tsx` | `products/index.tsx` | Product listing with filters |
| `(with_footer)/products/layout.tsx` | Handled by `_layout.tsx` | |
| `(with_footer)/product/[slug]/page.tsx` | `products/[id].tsx` | Product detail (use product ID or slug) |
| `(with_footer)/cart/page.tsx` | `cart.tsx` | Cart page |
| `(with_footer)/checkout/page.tsx` | `checkout.tsx` | Checkout flow |
| `(with_footer)/checkout/CheckoutForm.tsx` | `components/checkout/CheckoutForm.tsx` | Component, not route |
| `(with_footer)/checkout/PaymentMethod.tsx` | `components/checkout/PaymentMethod.tsx` | Component |
| `(with_footer)/checkout/OrderSummary.tsx` | `components/checkout/OrderSummary.tsx` | Component |
| `(with_footer)/order/success/page.tsx` | `order/success.tsx` | Order success screen |
| `(with_footer)/login/page.tsx` | `login.tsx` | Login screen |
| `(with_footer)/registration/page.tsx` | `registration.tsx` | Registration screen |
| `(with_footer)/forget-password/page.tsx` | `forget-password.tsx` | Forgot password |
| `(with_footer)/about/page.tsx` | `about.tsx` | |
| `(with_footer)/contact/page.tsx` | `contact.tsx` | |
| `(with_footer)/faq/page.tsx` | `faq.tsx` | |
| `(with_footer)/track-order/page.tsx` | `track-order.tsx` | Order tracking |
| `(with_footer)/shipping-policy/page.tsx` | `shipping-policy.tsx` | |
| `(with_footer)/return-refund-policy/page.tsx` | `return-refund-policy.tsx` | |
| `(with_footer)/training&programs/page.tsx` | `training/index.tsx` | Training listing |
| `(with_footer)/training/[slug]/page.tsx` | `training/[slug].tsx` | Training detail |
| `(dashboard)/layout.tsx` | `user/_layout.tsx` | Auth guard layout |
| `(dashboard)/user/page.tsx` | `user/index.tsx` | User dashboard |
| `(dashboard)/user/profile/page.tsx` | `user/profile.tsx` | |
| `(dashboard)/user/settings/page.tsx` | `user/settings.tsx` | |
| `(dashboard)/user/my-cart/page.tsx` | `user/my-cart.tsx` | |
| `(dashboard)/user/my-orders/page.tsx` | `user/my-orders/index.tsx` | |
| `(dashboard)/user/my-orders/[orderNo]/page.tsx` | `user/my-orders/[orderNo].tsx` | |

### Auth-Protected Routes

Apply an auth guard in `user/_layout.tsx`:

```
Protected (redirect to login if no token):
  /user/**
  /cart
  /checkout
```

Reference: `/ecommerce/middleware.ts` — same logic, implemented as a layout component in RN.

---

## 4. Styling — NativeWind

NativeWind is Tailwind CSS for React Native. The web project uses **Tailwind CSS v4**. NativeWind v4 supports the same utility classes.

### Key Differences from Web Tailwind

| Web (Tailwind v4) | Mobile (NativeWind v4) |
|---|---|
| `className="flex"` | `className="flex"` (same) |
| `hover:bg-gray-100` | Not supported — use `pressable` states via state |
| `lg:grid-cols-3` (desktop) | **Not used** — mobile+tablet only, max 2 columns |
| `backdrop-blur-sm` | Limited support — use `BlurView` from `expo-blur` |
| `fixed inset-0` | Use `absolute` with full dimensions or `Modal` |
| `overflow-hidden` on body | Not applicable — use `KeyboardAvoidingView` |
| `text-gray-900` | Same |
| `px-4 py-2` | Same |
| `rounded-xl` | Same |
| Custom classes (`global_button`) | Define in `global.css` via NativeWind |

### Responsive Design

This app targets **mobile and tablet only** (no desktop). In RN:
- Use `useWindowDimensions()` for screen size checks (phone < 768px, tablet >= 768px)
- Use `Platform.OS` for platform-specific code
- Use `SafeAreaView` instead of assuming viewport

### Color Palette

Reference: `/ecommerce/components/Cards/ProductCard.tsx`
- Primary accent: `#F7311E` (red/orange)
- Background: `bg-white`, `bg-gray-50`
- Text: `text-gray-900`, `text-gray-500`, `text-gray-400`

---

## 5. Gesture-Based Sliders

### Cart Slider (Slide from Right)

**Reference**: `/ecommerce/components/Sliders/CartSlider.tsx`

- Web: `framer-motion` with `AnimatePresence`, `motion.div` translateX
- Mobile: `react-native-reanimated` + `react-native-gesture-handler`
  - Use `Gesture.Pan()` for swipe-to-close
  - Use `Animated.View` with `useAnimatedStyle` for slide animation
  - Spring animation: `withSpring(0, { damping: 25, stiffness: 300 })` — matches web config
  - Backdrop: semi-transparent `Pressable` overlay, `onPress` closes
  - Width: full screen on mobile (web was `sm:w-[420px]`)

### Menu Slider (Slide from Left)

**Reference**: `/ecommerce/components/Sliders/MenuSliders.tsx`

- Web: `framer-motion` slide from left (`x: "-100%"` → `x: 0`)
- Mobile: Same reanimated approach, reversed direction
- Width: `80vw` (matches web's `w-[80vw]`)
- Contains: user info, page links, categories, login/logout actions
- Categories fetched on open via API — same pattern

### Implementation Notes

- Both sliders should use `react-native-reanimated` `useSharedValue` + `useAnimatedStyle`
- Enable gesture-driven animation (not just programmatic)
- `react-native-gesture-handler` `GestureDetector` wraps the drawer
- Status bar overlay: use `Modal` from React Native or absolute positioned overlay

---

## 6. State Management — Zustand

Same Zustand stores from the web project, ported with minimal changes.

### Store Files

| Store | File Reference | Changes Needed |
|-------|---------------|----------------|
| `cartStore` | `/ecommerce/zustand/cart.store.ts` | Replace `document.cookie` token → `SecureStore` |
| `userStore` | `/ecommerce/zustand/user.store.ts` | Same — token via helper |
| `useOpenCloseState` | `/ecommerce/zustand/openclose.store.ts` | No changes |
| `loadingStore` | `/ecommerce/zustand/loading.store.ts` | No changes |

### Key Store Behaviors (Same as Web)

**Cart Store**:
- `fetchCart()` → GET `/cart/list`
- `addItem(payload)` → POST `/cart/add`
- `updateItem(id, payload)` → PUT `/cart/update/:id`
- `removeItem(id)` → DELETE `/cart/remove/:id`
- `clearCart()` → DELETE `/cart/clear`
- Derived: `totalCartItems`, `cartTotal` (same calculation)
- Slider state: `openCartSlider`, `setOpenCartSlider`

**User Store**:
- `fetchUser()` → GET `/auth/get-profile`
- `logout()` → GET `/auth/logout` + clear token
- Token stored in `expo-secure-store` instead of cookies

---

## 7. Authentication & Token Management

### Web Approach (Reference)
- Token stored in `document.cookie` via `/ecommerce/helper/helper.ts`
- Axios interceptor attaches `config.headers.token = Helper.getToken()`
- 401 response → clear token, redirect to `/login`

### Mobile Approach

**Storage**: `expo-secure-store` (encrypted, like iOS Keychain / Android Keystore)

```
Token operations:
  getToken()  → SecureStore.getItemAsync("token")
  setToken(t) → SecureStore.setItemAsync("token", t)
  clearToken()→ SecureStore.deleteItemAsync("token")
```

**Axios Interceptor** (same structure as `/ecommerce/utils/apiconfig.ts`):
- Request interceptor: attach token from SecureStore to `config.headers.token`
- Response interceptor: on 401 → clear token, clear user store, navigate to `/login`
- Toast replacement: `react-native-toast-message` instead of `react-hot-toast`

### Auth Flow

1. Login → POST `/auth/login` → receive JWT → store in SecureStore
2. App startup → read token → fetch profile (`/auth/get-profile`)
3. If profile succeeds → set user in store → navigate to home
4. If token missing/invalid → show login screen
5. Protected screens (`/user/*`, `/cart`, `/checkout`) → check token in layout, redirect if missing

---

## 8. API Layer

**Reference**: `/ecommerce/utils/apiconfig.ts`

Same axios instance, same base URL, same endpoints. Only token source changes.

### API Endpoints Used

| Module | Method | Endpoint | Ref |
|--------|--------|----------|-----|
| Auth | POST | `/auth/login` | `userApi.ts` |
| Auth | POST | `/auth/register` | `userApi.ts` |
| Auth | GET | `/auth/get-profile` | `userApi.ts` |
| Auth | GET | `/auth/logout` | `userApi.ts` |
| Products | GET | `/product/ecom-product-list` | `productApi.ts` |
| Products | GET | `/product/productBySlug/:slug` | `productApi.ts` |
| Products | GET | `/product/ecom-variants/:id` | `productApi.ts` |
| Categories | GET | `/category/list` | `productApi.ts` |
| Brands | GET | `/brand/list` | `productApi.ts` |
| Cart | GET | `/cart/list` | `cart.store.ts` |
| Cart | POST | `/cart/add` | `cart.store.ts` |
| Cart | PUT | `/cart/update/:id` | `cart.store.ts` |
| Cart | DELETE | `/cart/remove/:id` | `cart.store.ts` |
| Cart | DELETE | `/cart/clear` | `cart.store.ts` |
| Checkout | POST | `/checkout/create-order` | `checkoutApi.ts` |
| Home | GET | Various | `homeApi.ts` |

### Axios Config Changes

```typescript
// lib/api.ts — same as /ecommerce/utils/apiconfig.ts but with SecureStore
import * as SecureStore from "expo-secure-store";
import axios from "axios";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("token");
  if (token) config.headers.token = token;
  return config;
});

// Response interceptor — same 401 handling, toast via react-native-toast-message
```

---

## 9. Component Mapping — Web to Mobile

| Web Component | File Reference | Mobile Equivalent | Notes |
|---|---|---|---|
| `ProductCard` | `Cards/ProductCard.tsx` | `components/product/ProductCard.tsx` | Replace video hover with `onPress` → navigate to detail. Keep badges, price, rating layout. |
| `CartSlider` | `Sliders/CartSlider.tsx` | `components/sliders/CartSlider.tsx` | Gesture-driven drawer. Use `react-native-reanimated` for spring animation. |
| `MenuSlider` | `Sliders/MenuSliders.tsx` | `components/sliders/MenuSlider.tsx` | Gesture-driven drawer from left. Same content: links, categories, user info. |
| `Hero` | `Sections/Hero.tsx` | `components/sections/Hero.tsx` | Banner image carousel. Use `react-native-reanimated-carousel`. |
| `FlashProductsSlider` | `Sliders/FlashProductuSlider.tsx` | `components/sliders/FlashProductsSlider.tsx` | Horizontal scroll carousel. |
| `FeaturedProducts` | `Sections/FeaturedProducts.tsx` | `components/sections/FeaturedProducts.tsx` | FlatList with `numColumns={2}` (phone + tablet, no 3-col desktop grid). |
| `OfferProducts` | `Sections/OfferProducts.tsx` | `components/sections/OfferProducts.tsx` | Same as featured. |
| `MobileBottomNav` | `Head&Foot/MobileBottomNav.tsx` | `components/layout/BottomNav.tsx` | Use `@react-navigation/bottom-tabs` or Expo Router tabs. |
| `MobileTopBar` | `Head&Foot/MobileTopBar.tsx` | `components/layout/Header.tsx` | SafeAreaView header with cart icon, menu icon. |
| `ProductFilter` | `Filter/ProductFilter.tsx` | `components/filter/FilterDrawer.tsx` | Use `@gorhom/bottom-sheet` or similar for bottom sheet filter. |
| `MobileFilterDrawer` | `Filter/MobileFilterDrawer.tsx` | `components/filter/FilterDrawer.tsx` | Already designed for mobile — port directly. |
| `VariantModal` | `Modals/VariantModal.tsx` | `components/ui/VariantModal.tsx` | Use React Native `Modal` or bottom sheet. |
| `Footer` | `Head&Foot/Footer.tsx` | Not needed — replaced by BottomNav | Mobile has bottom tab navigation. |
| `AddToCartButton` | `Buttons/AddToCartButton.tsx` | `components/cart/AddToCartButton.tsx` | Same logic: variant selection → add to cart. |
| `ProductImageGallery` | `Product/ProductImageGallery.tsx` | `components/product/ProductImageGallery.tsx` | Horizontal scroll image list with zoom. Use `react-native-image-zooming`. |
| `CheckoutForm` | `checkout/CheckoutForm.tsx` | `components/checkout/CheckoutForm.tsx` | TextInput fields. Same fields: name, phone, address, city, area. |
| `OrderSummary` | `checkout/OrderSummary.tsx` | `components/checkout/OrderSummary.tsx` | Same layout: item list, subtotal, discount, total. |
| `PaymentMethod` | `checkout/PaymentMethod.tsx` | `components/checkout/PaymentMethod.tsx` | Stripe / COD radio selection. |

### Key UI Patterns to Preserve

**ProductCard** (from `/ecommerce/components/Cards/ProductCard.tsx`):
- Discount badge: top-left, red bg (`#F7311E`), white text
- Sold count badge: top-right, green bg
- Out of stock: full-width gray banner
- Image: `aspect-square`, `object-contain`
- Price: green text with strikethrough for discount
- Cart button: red (`#F7311E`), opens variant modal
- Rating: 5-star row with count

**CartSlider** (from `/ecommerce/components/Sliders/CartSlider.tsx`):
- Slide from right, full width
- Header: "Cart (count)" with close and "Clear All"
- Items: image + name + attributes + price + quantity controls + remove
- Footer: total + "View Cart" + "Checkout" buttons
- Backdrop: `bg-black/40`

**MenuSlider** (from `/ecommerce/components/Sliders/MenuSliders.tsx`):
- Slide from left, `80vw` width
- Header: "Menu" + close
- User section (if logged in): name + email
- Pages: Home, About, Products, Contact, Track Order, FAQ
- Categories: fetched on open, list with icons
- Bottom: Login or Dashboard + Logout

---

## 10. Navigation Structure

### Tab Navigator (Bottom Tabs)

```
Home (index)       — 🏠 icon
Products           — 📦 icon
Cart               — 🛒 icon (with badge: totalCartItems)
Track Order        — 📋 icon
Profile            — 👤 icon (or Login if unauthenticated)
```

### Stack Navigator (per tab)

**Home Stack**: Home → Product Detail → Training Detail  
**Products Stack**: Product List → Product Detail  
**Cart Stack**: Cart → Checkout → Order Success  
**Profile Stack**: Profile → Settings / My Orders / My Cart / Login

### Drawer/Overlay (not tab)

- Menu Slider: triggered from header hamburger icon (left swipe or tap)
- Cart Slider: triggered from header cart icon (right side)

---

## 11. Dependencies

### Core

```json
{
  "expo": "~52.0.0",
  "expo-router": "~4.0.0",
  "expo-secure-store": "~14.0.0",
  "expo-image": "~2.0.0",
  "expo-status-bar": "~2.0.0",
  "expo-font": "~13.0.0",
  "react": "18.3.1",
  "react-native": "0.76.0",
  "react-native-reanimated": "~3.16.0",
  "react-native-gesture-handler": "~2.20.0",
  "react-native-safe-area-context": "~4.12.0",
  "react-native-screens": "~4.1.0"
}
```

### Styling

```json
{
  "nativewind": "^4.0.0",
  "tailwindcss": "^3.4.0",
  "react-native-css-interop": "^0.1.0"
}
```

### State & Data

```json
{
  "zustand": "^5.0.0",
  "axios": "^1.7.0"
}
```

### UI & Animations

```json
{
  "react-native-reanimated-carousel": "^4.0.0",
  "@gorhom/bottom-sheet": "^5.0.0",
  "react-native-toast-message": "^2.2.0",
  "lucide-react-native": "^0.400.0"
}
```

### Dev

```json
{
  "typescript": "^5.5.0",
  "@babel/core": "^7.25.0",
  "metro-react-native-babel-preset": "^0.77.0"
}
```

---

## 12. Setup Instructions

```bash
# 1. Create Expo project with Bun
bunx create-expo-app@latest mobile --template tabs
cd mobile

# 2. Install core dependencies
bun add expo-router expo-secure-store expo-image expo-status-bar
bun add react-native-reanimated react-native-gesture-handler
bun add react-native-safe-area-context react-native-screens

# 3. Install styling
bun add nativewind tailwindcss react-native-css-interop

# 4. Install state & data
bun add zustand axios

# 5. Install UI
bun add react-native-reanimated-carousel @gorhom/bottom-sheet
bun add react-native-toast-message lucide-react-native

# 6. Install dev
bun add -d typescript @babel/core

# 7. Start dev
bun start
```

---

## 13. Environment Variables

```env
# mobile/.env
EXPO_PUBLIC_API_URL=https://your-api-domain.com/api
```

Same API URL as the web project's `NEXT_PUBLIC_API_URL`. No backend changes needed.

---

## 14. Development Workflow

### Shared Code

These files can be **copied directly** from `/ecommerce` with minimal changes:

| File | Source | Changes |
|------|--------|---------|
| Types | `types/*.types.ts` | Copy as-is |
| API Utils | `utils/productApi.ts`, `utils/homeApi.ts`, `utils/checkoutApi.ts` | Remove `NEXT_PUBLIC_API_URL` → use `process.env.EXPO_PUBLIC_API_URL` |
| Helper | `helper/helper.ts` | Remove `document.cookie` → use SecureStore |
| Zustand Stores | `zustand/*.store.ts` | Remove `window` references, use SecureStore for token |

### Files That Need Full Rewrite

| File | Reason |
|------|--------|
| All components | React Native primitives (`View`, `Text`, `ScrollView`) instead of HTML (`div`, `span`) |
| All page files | Expo Router screen format |
| Navigation | New tab/stack navigator setup |
| Sliders | Reanimated gesture-based implementation |

---

## 15. Key Implementation Notes

1. **No HTML elements**: All `div` → `View`, `span`/`p`/`h1` → `Text`, `button` → `Pressable`/`TouchableOpacity`, `input` → `TextInput`, `img` → `<Image>` or `<ExpoImage>`

2. **Scrolling**: Use `ScrollView` or `FlatList` (for lists). `FlatList` for product grids with `numColumns={2}` (both phone and tablet — no 3-column desktop layout).

3. **No hover states**: Mobile has no hover. ProductCard video-on-hover → use `onPress` to navigate or show video fullscreen.

4. **No `fixed` positioning**: Use `position: 'absolute'` within a parent or `Modal` for overlays.

5. **Keyboard handling**: Wrap forms in `KeyboardAvoidingView` (iOS) / `android:windowSoftInputMode="adjustResize"`.

6. **Safe areas**: Use `SafeAreaView` from `react-native-safe-area-context` for notches and home indicators.

7. **Images**: All images must have explicit dimensions. Use `expo-image` for caching and placeholders.

8. **Navigation params**: Product detail uses `[id]` or `[slug]` — pass via `router.push({ pathname: '/products/[id]', params: { id: product.id } })`.

9. **Toast notifications**: Replace `toast.success()` / `toast.error()` with `Toast.show()` from `react-native-toast-message`.

10. **Stripe checkout**: Same flow — API returns `sessionUrl`, open via `Linking.openURL(sessionUrl)` in RN (opens in browser).

---

## 16. Visual Reference Guide

For component styling, positioning, colors, and layout — always refer back to the web project:

| What to Reference | Web File |
|---|---|
| Product card layout & badges | `/ecommerce/components/Cards/ProductCard.tsx` |
| Cart slider design | `/ecommerce/components/Sliders/CartSlider.tsx` |
| Menu slider design | `/ecommerce/components/Sliders/MenuSliders.tsx` |
| Filter UI | `/ecommerce/components/Filter/ProductFilter.tsx` |
| Mobile filter drawer | `/ecommerce/components/Filter/MobileFilterDrawer.tsx` |
| Checkout form | `/ecommerce/app/(with_footer)/checkout/CheckoutForm.tsx` |
| Order summary | `/ecommerce/app/(with_footer)/checkout/OrderSummary.tsx` |
| Hero section | `/ecommerce/components/Sections/Hero.tsx` |
| Bottom navigation | `/ecommerce/components/Head&Foot/MobileBottomNav.tsx` |
| Top bar | `/ecommerce/components/Head&Foot/MobileTopBar.tsx` |
| Dashboard layout | `/ecommerce/app/(dashboard)/layout.tsx` |
| Side panel | `/ecommerce/components/Dashboard/SidePanel.tsx` |
| Color constants | `/ecommerce/components/Cards/ProductCard.tsx` (`#F7311E`, `#df2815`) |
| Global button style | `/ecommerce/app/globals.css` (`global_button` class) |

---

*Document Version: 1.0*  
*Last Updated: 2026-07-23*  
*Project: Super_Ecommerce — React Native Mobile App*
