# Task 27 — Home Screen

> **Phase**: 8 — Home Screen
> **Say**: "generate task 27" or "generate task 27"

## Objective

Create the home screen that displays hero banner, flash products, featured products, and offer products.

## Reference

`/ecommerce/app/(with_footer)/page.tsx`

## File to Create

### `mobile/app/(tabs)/index.tsx` (or `mobile/app/index.tsx`)

## Implementation

```tsx
import { useEffect, useState } from "react";
import { ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/layout/Header";
import Hero from "../../components/sections/Hero";
import FlashProductsSlider from "../../components/sliders/FlashProductsSlider";
import FeaturedProducts from "../../components/sections/FeaturedProducts";
import OfferProducts from "../../components/sections/OfferProducts";
import BannerSkeleton from "../../components/skeleton/BannerSkeleton";
import ProductCardSkeleton from "../../components/skeleton/ProductCardSkeleton";
import api from "../../lib/api";

export default function HomeScreen() {
  const [banners, setBanners] = useState([]);
  const [flashProducts, setFlashProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [offerProducts, setOfferProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHomeData = async () => {
    try {
      const [bannerRes, flashRes, featuredRes, offerRes] = await Promise.all([
        api.get("/home/banners"),
        api.get("/home/flash-products"),
        api.get("/home/featured-products"),
        api.get("/home/offer-products"),
      ]);
      setBanners(bannerRes.data?.data || []);
      setFlashProducts(flashRes.data?.data || []);
      setFeaturedProducts(featuredRes.data?.data || []);
      setOfferProducts(offerRes.data?.data || []);
    } catch (err) {
      // Error handled by interceptor
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchHomeData(); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHomeData();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <>
            <BannerSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
          </>
        ) : (
          <>
            <Hero banners={banners} />
            <FlashProductsSlider products={flashProducts} />
            <FeaturedProducts products={featuredProducts} />
            <OfferProducts products={offerProducts} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
```

## Key Points

- Header with menu and cart icons
- Pull-to-refresh support
- Loading skeletons while data fetches
- All sections rendered in ScrollView
- API calls in parallel via `Promise.all`

## Verify

Home screen loads, banners display, product sections populate, pull-to-refresh works.
