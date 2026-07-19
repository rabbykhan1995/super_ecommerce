import { Suspense } from "react";
import Hero from "@/components/Sections/Hero";
import FlashSaleProductSlider from "@/components/Sliders/FlashProductuSlider";
import FeaturedProducts from "@/components/Sections/FeaturedProducts";
import OfferProducts from "@/components/Sections/OfferProducts";
import BannerSkeleton from "@/components/Skeletons/BannerSkeleton";
import FlashProductsSkeleton from "@/components/Skeletons/FlashProductsSkeleton";
import FeaturedProductsSkeleton from "@/components/Skeletons/FeaturedProductsSkeleton";
import OfferProductsSkeleton from "@/components/Skeletons/OfferProductsSkeleton";
import { getFlashProducts, getFeaturedProducts, getOfferProducts, getActiveFlashSale } from "@/utils/homeApi";

export const revalidate = 3600;

async function FlashProductsSection() {
  const [items, sale] = await Promise.all([getFlashProducts(), getActiveFlashSale()]);
  return <FlashSaleProductSlider products={items} endDate={sale?.endDate} />;
}

async function FeaturedProductsSection() {
  const items = await getFeaturedProducts();
  return <FeaturedProducts products={items} />;
}

async function OfferProductsSection() {
  const { items } = await getOfferProducts();
  return <OfferProducts products={items} />;
}

export default function Home() {
  return (
    <div className="">
      <div className="relative w-full overflow-hidden mb-10">
        <Suspense fallback={<BannerSkeleton />}>
          <Hero />
        </Suspense>
        <Suspense fallback={<FlashProductsSkeleton />}>
          <FlashProductsSection />
        </Suspense>
      </div>
      <Suspense fallback={<FeaturedProductsSkeleton />}>
        <FeaturedProductsSection />
      </Suspense>
      <Suspense fallback={<OfferProductsSkeleton />}>
        <OfferProductsSection />
      </Suspense>
    </div>
  );
}
