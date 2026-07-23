# Task 53 — Full App Verification

> **Phase**: 14 — Polish & Testing
> **Say**: "generate task 53" or "generate task 53"

## Objective

Final verification pass — ensure all features work end-to-end.

## Verification Checklist

### Auth Flow
- [ ] Register → Login → See dashboard
- [ ] Logout → Redirect to login
- [ ] Protected routes redirect when not logged in
- [ ] Token persists across app restarts

### Navigation
- [ ] Bottom tabs switch correctly
- [ ] Back navigation works everywhere
- [ ] Deep linking works (product detail, order detail)
- [ ] Menu slider opens/closes with gesture
- [ ] Cart slider opens/closes with gesture

### Products
- [ ] Product listing loads with data
- [ ] Filter by category works
- [ ] Sort options work
- [ ] Product detail shows all info
- [ ] Variant selection modal works
- [ ] Add to cart from product detail works

### Cart & Checkout
- [ ] Cart slider shows items
- [ ] Quantity +/- works
- [ ] Remove item works
- [ ] Clear cart works
- [ ] Checkout form validation works
- [ ] Payment method selection works
- [ ] Order placement succeeds
- [ ] Stripe redirect opens browser
- [ ] COD order succeeds

### Home
- [ ] Banners carousel auto-plays
- [ ] Flash products load
- [ ] Featured products load
- [ ] Offer products load
- [ ] Pull-to-refresh works

### User Dashboard
- [ ] Dashboard shows user info
- [ ] Profile shows correct data
- [ ] My orders list loads
- [ ] Order detail shows correct info
- [ ] Settings menu works
- [ ] Track order navigation works

### Static Pages
- [ ] About page renders
- [ ] Contact form works
- [ ] FAQ expand/collapse works
- [ ] Shipping policy renders
- [ ] Return/refund policy renders

### Training
- [ ] Training listing loads
- [ ] Training detail shows content

### UI Quality
- [ ] All colors match web (#F7311E primary)
- [ ] Fonts are readable
- [ ] Images load with placeholders
- [ ] Skeletons show during loading
- [ ] Toast notifications work
- [ ] No console errors

## Commands to Run

```bash
cd mobile
bun start          # Start Expo dev server
bun run lint       # Run linting
npx tsc --noEmit   # TypeScript check
```

## Final Output

A fully functional React Native mobile app that mirrors the web ecommerce frontend.
