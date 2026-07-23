# Task 03 — Project Folder Scaffolding

> **Phase**: 1 — Project Setup
> **Say**: "generate task 3" or "generate task 03"

## Objective

Create the full project directory structure as defined in the architecture.

## Target Structure

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
│   │   └── [id].tsx              # Product detail
│   ├── cart.tsx
│   ├── checkout.tsx
│   ├── order/
│   │   └── success.tsx
│   ├── track-order.tsx
│   ├── about.tsx
│   ├── contact.tsx
│   ├── faq.tsx
│   ├── training/
│   │   ├── index.tsx
│   │   └── [slug].tsx
│   ├── shipping-policy.tsx
│   ├── return-refund-policy.tsx
│   └── user/
│       ├── _layout.tsx           # Dashboard layout (auth guard)
│       ├── index.tsx
│       ├── profile.tsx
│       ├── settings.tsx
│       ├── my-cart.tsx
│       └── my-orders/
│           ├── index.tsx
│           └── [orderNo].tsx
│
├── components/
│   ├── ui/
│   ├── product/
│   ├── sliders/
│   ├── layout/
│   ├── cart/
│   ├── checkout/
│   ├── filter/
│   └── skeleton/
│
├── lib/
├── hooks/
├── store/
├── types/
├── assets/
│   ├── images/
│   └── fonts/
├── app.json
├── tailwind.config.js
├── nativewind-env.d.ts
├── metro.config.js
├── babel.config.js
├── tsconfig.json
├── package.json
└── global.css
```

## Commands

```bash
cd mobile

# Create all directories
mkdir -p app/products app/order app/training app/user/my-orders
mkdir -p components/ui components/product components/sliders components/layout
mkdir -p components/cart components/checkout components/filter components/skeleton
mkdir -p lib hooks store types assets/images assets/fonts
```

## Create Placeholder Files

Create empty placeholder files for all routes and components listed above so the structure is ready for content.

## Verify

Run `find . -type d | sort` — structure should match the target above.
