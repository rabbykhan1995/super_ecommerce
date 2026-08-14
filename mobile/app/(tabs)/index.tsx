import { useEffect, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FeaturedProducts from "../../components/sections/FeaturedProducts";
import Hero from "../../components/sections/Hero";
import BannerSkeleton from "../../components/skeleton/BannerSkeleton";
import ProductCardSkeleton from "../../components/skeleton/ProductCardSkeleton";
import FlashProductsSlider from "../../components/sliders/FlashProductsSlider";
import api from "../../lib/api";

export default function HomeScreen() {
  const [banners, setBanners] = useState<any[]>([]);
  const [acitveFlashSale, setActiveFlashSale] = useState<any[]>([]);
  const [flashProducts, setFlashProducts] = useState<any[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHomeData = async () => {
    try {

      const [activeFlashSale,bannerRes, flashRes, featuredRes] = await Promise.all([
                api.get("/ecom/flash-sale/active"),
        api.get("/ecom/banner/active"),
        api.get("/ecom/flash-products"),
        api.get("/ecom/featured-product/active"),
      ]);

      setActiveFlashSale(activeFlashSale?.data?.data);
      // Null check + Safe Array Assignment
      setBanners(Array.isArray(bannerRes?.data?.data) ? bannerRes.data.data : []);
      setFlashProducts(Array.isArray(flashRes?.data?.data) ? flashRes.data.data : []);
      setFeaturedProducts(Array.isArray(featuredRes?.data?.data) ? featuredRes.data.data : []);
    } catch (err: any) {
      console.error("Home Data Fetch Error:", err?.response?.data || err.message || err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHomeData();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View className="p-4 gap-y-4">
            <BannerSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
          </View>
        ) : (
          <>
            {/* Banner Section */}
            {banners.length > 0 && <Hero banners={banners} />}

            {/* Flash Products Section (Jodi data null ba khali thake tahole render hobe na) */}
            {flashProducts.length > 0 && (
              <FlashProductsSlider products={flashProducts}   endDate={acitveFlashSale?.endDate} />
            )}

            {/* Featured Products Section */}
            {featuredProducts.length > 0 && (
              <FeaturedProducts products={featuredProducts} />
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}