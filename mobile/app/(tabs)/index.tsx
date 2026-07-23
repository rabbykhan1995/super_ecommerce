import { useEffect, useState } from "react";
import { ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/layout/Header";
import Hero from "../../components/sections/Hero";
import FlashProductsSlider from "../../components/sliders/FlashProductsSlider";
import FeaturedProducts from "../../components/sections/FeaturedProducts";
import BannerSkeleton from "../../components/skeleton/BannerSkeleton";
import ProductCardSkeleton from "../../components/skeleton/ProductCardSkeleton";
import api from "../../lib/api";

export default function HomeScreen() {
  const [banners, setBanners] = useState([]);
  const [flashProducts, setFlashProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHomeData = async () => {
    try {
      const [bannerRes, flashRes, featuredRes] = await Promise.all([
        api.get("/home/banners"),
        api.get("/home/flash-products"),
        api.get("/home/featured-products"),
      ]);
      setBanners(bannerRes.data?.data || []);
      setFlashProducts(flashRes.data?.data || []);
      setFeaturedProducts(featuredRes.data?.data || []);
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
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
