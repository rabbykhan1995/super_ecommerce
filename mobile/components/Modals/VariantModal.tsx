/**
 * React Native conversion of the Next.js VariantModal.
 *
 * Assumptions made during the port (adjust if they don't match your setup):
 * 1. Expo project using `expo-router` — `Link`/`router.push` replaces `next/link`.
 *    If you're on plain React Navigation, swap `useRouter()` for
 *    `useNavigation()` and `router.push(...)` for `navigation.navigate(...)`.
 * 2. Icons come from `lucide-react-native` (same API as `lucide-react`).
 * 3. `zustand` store, `Helper.getImage`, `fetchVariantsByProduct`, and the
 *    `EcomVariantDetail` type are reused as-is — zustand and plain fetch
 *    utilities work unchanged in React Native.
 * 4. CSS `:hover` zoom has no RN equivalent (no mouse), so the desktop
 *    hover-zoom branch is dropped. Tapping the main image opens the same
 *    fullscreen zoom overlay that the original used for mobile, with a
 *    drag-to-pan gesture (via PanResponder) standing in for the CSS
 *    `transformOrigin` follow-the-touch effect.
 * 5. `dangerouslySetInnerHTML` isn't available in RN. `shortDescription` is
 *    rendered as plain text with HTML tags stripped. If you need real HTML
 *    rendering (bold, links, etc.), swap `stripHtml(...)` for
 *    `react-native-render-html`.
 * 6. Local `/no-image.png` becomes a bundled asset import — update the path
 *    to wherever that asset lives in your RN project.
 */

import { fetchVariantsByProduct } from "@/lib/productApi";
import { getImageUrl } from "@/lib/utils";
import { useCartStore } from "@/store/cart.store";
import useOpenCloseState from "@/store/openclose.store";
import { useUserStore } from "@/store/user.store";
import type { EcomVariantDetail } from "@/types/product.types";
import { useRouter } from "expo-router";
import { ChevronLeft, ChevronRight, Minus, Plus, ShoppingBag, Star, Trash2, X, ZoomIn } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Modal,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AUTO_SLIDE_INTERVAL = 4000;

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, "").trim();

const VariantModal = () => {
  const router = useRouter();
  const { variantModalOpen, variantModalProduct, setVariantModalOpen } =
    useOpenCloseState();

  const { cart, addItem, updateItem, removeItem, isAdding, isUpdating, isRemoving, fetchCart } = useCartStore();
  const user = useUserStore((s) => s.user);

  const [variants, setVariants] = useState<EcomVariantDetail[]>([]);
  const [selectedVariant, setSelectedVariant] =
    useState<EcomVariantDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Find if the selected variant is already in the cart
  const cartItem = useMemo(() => {
    if (!selectedVariant) return null;
    return cart.find((item) => item.variantID === selectedVariant.id) ?? null;
  }, [cart, selectedVariant]);

  // Slider state
  const [activeSlide, setActiveSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fullscreen zoom state
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(0);
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  // Fetch variants when modal opens
  useEffect(() => {
    if (!variantModalOpen || !variantModalProduct?.id) return;

    fetchCart();

    const loadVariants = async () => {
      setLoading(true);
      try {
        const data = await fetchVariantsByProduct(variantModalProduct.id);
        const sorted = [...data].sort(
          (a, b) => (a.salePrice ?? 0) - (b.salePrice ?? 0)
        );
        setVariants(sorted);
        setSelectedVariant(sorted[0] ?? null);
        setActiveSlide(0);
      } catch (err) {
        console.error("Failed to fetch variants:", err);
        setVariants([]);
        setSelectedVariant(null);
      } finally {
        setLoading(false);
      }
    };

    loadVariants();
  }, [variantModalOpen, variantModalProduct?.id, fetchCart]);

  // Reset state when modal closes
  useEffect(() => {
    if (!variantModalOpen) {
      setVariants([]);
      setSelectedVariant(null);
      setActiveSlide(0);
      setIsAutoPlaying(true);
      setZoomOpen(false);
      setQuantity(1);
    }
  }, [variantModalOpen]);

  // Reset quantity when variant changes
  useEffect(() => {
    setQuantity(1);
  }, [selectedVariant?.id]);

  const handleIncrement = useCallback(() => {
    if (!selectedVariant) return;
    const maxStock = selectedVariant.stock ?? 0;
    if (cartItem) {
      if (cartItem.quantity + 1 > maxStock) return;
      updateItem(cartItem.id, { quantity: cartItem.quantity + 1 });
    } else {
      if (quantity >= maxStock) return;
      setQuantity((prev) => prev + 1);
    }
  }, [selectedVariant, cartItem, quantity, updateItem]);

  const handleDecrement = useCallback(() => {
    if (!selectedVariant) return;
    if (cartItem) {
      if (cartItem.quantity - 1 < 1) return;
      updateItem(cartItem.id, { quantity: cartItem.quantity - 1 });
    } else {
      if (quantity <= 1) return;
      setQuantity((prev) => prev - 1);
    }
  }, [selectedVariant, cartItem, quantity, updateItem]);

  const handleClose = useCallback(() => setVariantModalOpen(false), [setVariantModalOpen]);

  const handleAddToCart = useCallback(async () => {
    if (!selectedVariant || !variantModalProduct) return;
    if (!user) {
      handleClose();
      router.push("/login");
      return;
    }
    const success = await addItem({
      productID: variantModalProduct.id,
      variantID: selectedVariant.id,
      quantity,
    });
    if (success) {
      setQuantity(1);
    }
  }, [selectedVariant, variantModalProduct, quantity, addItem, user, router, handleClose]);

  const currentImages: string[] = selectedVariant?.images?.length
    ? selectedVariant.images
    : variantModalProduct?.thumbnail
      ? [variantModalProduct.thumbnail]
      : [];

  // Auto-slide logic
  const stopAutoPlay = useCallback(() => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
  }, []);

  useEffect(() => {
    stopAutoPlay();
    if (isAutoPlaying && currentImages.length > 1 && !zoomOpen) {
      autoPlayRef.current = setInterval(() => {
        setActiveSlide((prev) => (prev + 1) % currentImages.length);
      }, AUTO_SLIDE_INTERVAL);
    }
    return stopAutoPlay;
  }, [isAutoPlaying, currentImages.length, zoomOpen, stopAutoPlay]);

  // Reset slide when variant changes
  useEffect(() => {
    setActiveSlide(0);
  }, [selectedVariant?.id]);

  const goToSlide = (index: number) => {
    setActiveSlide(index);
    setIsAutoPlaying(true);
  };

  const goPrev = () =>
    setActiveSlide(
      (prev) => (prev - 1 + currentImages.length) % currentImages.length
    );

  const goNext = () =>
    setActiveSlide((prev) => (prev + 1) % currentImages.length);

  // Drag-to-pan while zoomed, snaps back on release (RN has no CSS
  // transform-origin follow-the-cursor, so this is the closest analog).
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: () => {
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  if (!variantModalOpen || !variantModalProduct) return null;

  const product = variantModalProduct;
  const isOutOfStock = selectedVariant ? selectedVariant.stock === 0 : true;

  const hasRealAttributes =
    !!selectedVariant?.attributes &&
    selectedVariant.attributes.length > 0 &&
    !(
      selectedVariant.attributes.length === 1 &&
      selectedVariant.attributes[0].name === "base" &&
      selectedVariant.attributes[0].value === "none"
    );

  return (

     <SafeAreaView style={styles.safeArea}>
      <Modal
        visible={variantModalOpen}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
  

        <View style={styles.overlay}>
          <View style={styles.card}>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <X color="#ef4444" size={20} />
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* ===== Image Slider ===== */}
              <View style={styles.sliderSection}>
                <View style={styles.mainImageWrap}>
                  {loading ? (
                    <View style={styles.centerFill}>
                      <ActivityIndicator size="large" color="#F7311E" />
                    </View>
                  ) : currentImages.length > 0 ? (
                    <TouchableOpacity
                      activeOpacity={0.95}
                      style={StyleSheet.absoluteFill}
                      onPress={() => {
                        setZoomIndex(activeSlide);
                        setZoomOpen(true);
                      }}
                    >
                      <Image
                        source={getImageUrl(currentImages[activeSlide])}
                        style={styles.mainImage}
                        resizeMode="contain"
                      />
                      <View style={styles.zoomIconBtn}>
                        <ZoomIn color="#fff" size={18} />
                      </View>
                    </TouchableOpacity>
                  ) : (
                    // Update this to wherever your bundled placeholder lives
                    <Image
                      source={require("@/assets/images/no-image.png")}
                      style={styles.mainImage}
                      resizeMode="contain"
                    />
                  )}

                  {currentImages.length > 1 && (
                    <>
                      <TouchableOpacity
                        onPress={goPrev}
                        style={[styles.navArrow, styles.navArrowLeft]}
                      >
                        <ChevronLeft size={20} color="#374151" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={goNext}
                        style={[styles.navArrow, styles.navArrowRight]}
                      >
                        <ChevronRight size={20} color="#374151" />
                      </TouchableOpacity>
                      <View style={styles.slideCounter}>
                        <Text style={styles.slideCounterText}>
                          {activeSlide + 1} / {currentImages.length}
                        </Text>
                      </View>
                    </>
                  )}
                </View>

                {/* Thumbnail strip */}
                {currentImages.length > 1 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.thumbStrip}
                    contentContainerStyle={{ gap: 8 }}
                  >
                    {currentImages.map((img, idx) => (
                      <TouchableOpacity
                        key={idx}
                        onPress={() => goToSlide(idx)}
                        style={[
                          styles.thumb,
                          activeSlide === idx
                            ? styles.thumbActive
                            : styles.thumbInactive,
                        ]}
                      >
                        <Image
                          source={getImageUrl(img)}
                          style={styles.thumbImage}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}

                {/* Auto-play toggle */}
                {currentImages.length > 1 && (
                  <TouchableOpacity
                    onPress={() => setIsAutoPlaying((p) => !p)}
                    style={styles.autoplayToggle}
                  >
                    <View
                      style={[
                        styles.autoplayDot,
                        { backgroundColor: isAutoPlaying ? "#4ade80" : "#d1d5db" },
                      ]}
                    />
                    <Text style={styles.autoplayText}>
                      {isAutoPlaying ? "Auto-sliding" : "Paused"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* ===== Variant Details ===== */}
              <View style={styles.detailsSection}>
                <Text style={styles.productName}>{product.name}</Text>

                {/* Rating */}
                <View style={styles.ratingRow}>
                  <View style={{ flexDirection: "row" }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        color={
                          i < Math.round(product.averageRating)
                            ? "#facc15"
                            : "#d1d5db"
                        }
                        fill={
                          i < Math.round(product.averageRating)
                            ? "#facc15"
                            : "none"
                        }
                      />
                    ))}
                  </View>
                  <Text style={styles.ratingText}>
                    {product.averageRating?.toFixed(1)} (
                    {product.totalReviews ?? 0} reviews)
                  </Text>
                </View>

                {/* Price */}
                <View style={styles.priceRow}>
                  <Text style={styles.price}>
                    ৳{" "}
                    {selectedVariant?.discountPrice &&
                    selectedVariant.discountPrice < selectedVariant.salePrice
                      ? selectedVariant.discountPrice
                      : selectedVariant?.salePrice ?? 0}
                  </Text>
                  {selectedVariant?.discountPrice &&
                  selectedVariant.salePrice &&
                  selectedVariant.discountPrice < selectedVariant.salePrice ? (
                    <Text style={styles.strikePrice}>
                      ৳ {selectedVariant.salePrice}
                    </Text>
                  ) : null}
                </View>

                {/* Stock */}
                <View style={styles.stockRow}>
                  <Text style={styles.stockLabel}>Stock:</Text>
                  {isOutOfStock ? (
                    <Text style={styles.outOfStock}>Out of Stock</Text>
                  ) : (
                    <Text style={styles.inStock}>
                      {selectedVariant?.stock ?? "N/A"} available
                    </Text>
                  )}
                </View>

                {/* Variant Selector */}
                {loading ? (
                  <Text style={styles.loadingText}>Loading variants...</Text>
                ) : variants.length > 0 ? (
                  <View style={{ gap: 8 }}>
                    <Text style={styles.sectionLabel}>Variants:</Text>
                    <View style={styles.variantWrap}>
                      {variants.map((v) => {
                        const label = v.attributes.map((a) => a.value).join(" / ");
                        const active = selectedVariant?.id === v.id;
                        return (
                          <TouchableOpacity
                            key={v.id}
                            onPress={() => setSelectedVariant(v)}
                            style={[
                              styles.variantChip,
                              active
                                ? styles.variantChipActive
                                : styles.variantChipInactive,
                            ]}
                          >
                            <Text
                              style={
                                active
                                  ? styles.variantChipTextActive
                                  : styles.variantChipText
                              }
                            >
                              {label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                ) : null}

                {/* Attributes */}
                {hasRealAttributes && (
                  <View style={styles.attributesBox}>
                    <Text style={styles.sectionLabel}>Attributes:</Text>
                    <View style={styles.attributesRow}>
                      {selectedVariant!.attributes.map((attr, idx) => (
                        <Text key={idx} style={styles.attributeItem}>
                          <Text style={styles.attributeName}>{attr.name}: </Text>
                          <Text style={styles.attributeValue}>{attr.value}</Text>
                        </Text>
                      ))}
                    </View>
                  </View>
                )}

                {/* Short Description */}
                {product.shortDescription && (
                  <Text style={styles.description}>
                    {stripHtml(product.shortDescription)}
                  </Text>
                )}

                {/* Actions */}
                <View style={styles.actionsRow}>
                  {isOutOfStock ? (
                    <Text style={styles.outOfStockAction}>Out of Stock</Text>
                  ) : cartItem ? (
                    <View style={styles.cartControls}>
                      <Text style={styles.inCartLabel}>In Cart:</Text>
                      <View style={styles.quantityControls}>
                        <TouchableOpacity
                          onPress={handleDecrement}
                          disabled={isUpdating}
                          style={styles.quantityBtn}
                        >
                          <Minus size={16} color="#374151" />
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>
                          {isUpdating ? "..." : cartItem.quantity}
                        </Text>
                        <TouchableOpacity
                          onPress={handleIncrement}
                          disabled={isUpdating}
                          style={styles.quantityBtn}
                        >
                          <Plus size={16} color="#374151" />
                        </TouchableOpacity>
                      </View>
                      <TouchableOpacity
                        onPress={() => removeItem(cartItem.id)}
                        disabled={isRemoving}
                        style={styles.removeBtn}
                      >
                        {isRemoving ? (
                          <ActivityIndicator size="small" color="#ef4444" />
                        ) : (
                          <Trash2 size={16} color="#ef4444" />
                        )}
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.addToCartRow}>
                      <View style={styles.quantityControls}>
                        <TouchableOpacity
                          onPress={handleDecrement}
                          style={styles.quantityBtn}
                        >
                          <Minus size={16} color="#374151" />
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{quantity}</Text>
                        <TouchableOpacity
                          onPress={handleIncrement}
                          style={styles.quantityBtn}
                        >
                          <Plus size={16} color="#374151" />
                        </TouchableOpacity>
                      </View>
                      <TouchableOpacity
                        onPress={handleAddToCart}
                        disabled={isAdding || isOutOfStock}
                        style={[styles.addToCartBtn, (isAdding || isOutOfStock) && styles.addToCartBtnDisabled]}
                      >
                        {isAdding ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <>
                            <ShoppingBag size={16} color="#fff" />
                            <Text style={styles.addToCartText}>Add To Cart</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.moreInfoBtn}
                    onPress={() => {
                      handleClose();
                      router.push({
                        pathname: "/product/[slug]",
                        params: { slug: product.slug },
                      });
                    }}
                  >
                    <Text style={styles.moreInfoText}>More Info</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>

      </Modal>

      {/* ===== FULLSCREEN ZOOM OVERLAY ===== */}

      <Modal
        visible={zoomOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setZoomOpen(false)}
      >
        <View style={styles.zoomOverlay}>
          <TouchableOpacity
            style={styles.zoomCloseBtn}
            onPress={() => setZoomOpen(false)}
          >
            <X color="#fff" size={24} />
          </TouchableOpacity>

          <View style={styles.zoomImageWrap} {...panResponder.panHandlers}>
            <Animated.Image
              source={getImageUrl(currentImages[zoomIndex] || currentImages[0])}
              style={[
                styles.zoomImage,
                {
                  transform: [
                    { translateX: pan.x },
                    { translateY: pan.y },
                    { scale: 2 },
                  ],
                },
              ]}
              resizeMode="contain"
            />
          </View>

          {currentImages.length > 1 && (
            <View style={styles.zoomNavRow}>
              <TouchableOpacity
                onPress={() =>
                  setZoomIndex(
                    (prev) => (prev - 1 + currentImages.length) % currentImages.length
                  )
                }
                style={styles.zoomNavBtn}
              >
                <ChevronLeft color="#fff" size={24} />
              </TouchableOpacity>
              <Text style={styles.zoomCounter}>
                {zoomIndex + 1} / {currentImages.length}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  setZoomIndex((prev) => (prev + 1) % currentImages.length)
                }
                style={styles.zoomNavBtn}
              >
                <ChevronRight color="#fff" size={24} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
</SafeAreaView>
 
  );
};

const styles = StyleSheet.create({
    safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.42)",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
  card: {
    width: "100%",
    maxHeight: "88%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 100,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  sliderSection: { gap: 8 },
  mainImageWrap: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  centerFill: { ...StyleSheet.absoluteFillObject, justifyContent: "center", alignItems: "center" },
  mainImage: { width: "100%", height: "100%" },
  zoomIconBtn: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderRadius: 999,
  },
  navArrow: {
    position: "absolute",
    top: "50%",
    marginTop: -18,
    backgroundColor: "rgba(255,255,255,0.85)",
    padding: 8,
    borderRadius: 999,
  },
  navArrowLeft: { left: 8 },
  navArrowRight: { right: 8 },
  slideCounter: {
    position: "absolute",
    bottom: 12,
    left: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  slideCounterText: { color: "#fff", fontSize: 12 },
  thumbStrip: { flexDirection: "row" },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 2,
  },
  thumbActive: { borderColor: "#F7311E" },
  thumbInactive: { borderColor: "#e5e7eb" },
  thumbImage: { width: "100%", height: "100%" },
  autoplayToggle: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start" },
  autoplayDot: { width: 8, height: 8, borderRadius: 999 },
  autoplayText: { fontSize: 12, color: "#9ca3af" },
  detailsSection: { gap: 10, marginTop: 14 },
  productName: { fontSize: 20, fontWeight: "700", color: "#1f2937" },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  ratingText: { fontSize: 12, color: "#6b7280" },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 10 },
  price: { fontSize: 24, fontWeight: "700", color: "#16a34a" },
  strikePrice: { fontSize: 13, color: "#9ca3af", textDecorationLine: "line-through" },
  stockRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  stockLabel: { fontSize: 13, fontWeight: "600", color: "#4b5563" },
  outOfStock: { fontSize: 13, fontWeight: "700", color: "#ef4444" },
  inStock: { fontSize: 13, fontWeight: "700", color: "#16a34a" },
  loadingText: { fontSize: 13, color: "#9ca3af", paddingVertical: 6 },
  sectionLabel: { fontSize: 13, fontWeight: "600", color: "#4b5563" },
  variantWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  variantChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, borderWidth: 1 },
  variantChipActive: { backgroundColor: "#F7311E", borderColor: "#F7311E" },
  variantChipInactive: { backgroundColor: "#fff", borderColor: "#d1d5db" },
  variantChipText: { fontSize: 13, fontWeight: "600", color: "#374151" },
  variantChipTextActive: { fontSize: 13, fontWeight: "600", color: "#fff" },
  attributesBox: { backgroundColor: "#f9fafb", borderRadius: 10, padding: 12, gap: 6 },
  attributesRow: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  attributeItem: { fontSize: 13 },
  attributeName: { color: "#6b7280" },
  attributeValue: { fontWeight: "600", color: "#1f2937" },
  description: { fontSize: 13, color: "#4b5563", lineHeight: 19 },
  actionsRow: { flexDirection: "row", alignItems: "center", marginTop: 6, paddingTop: 4 },
  outOfStockAction: { color: "#ef4444", fontWeight: "700", fontSize: 13 },
  moreInfoBtn: {
    marginLeft: "auto",
    borderWidth: 1,
    borderColor: "#16a34a",
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 10,
  },
  moreInfoText: { color: "#16a34a", fontWeight: "600", fontSize: 13 },
  cartControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  inCartLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4b5563",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    overflow: "hidden",
  },
  quantityBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: "600",
    minWidth: 40,
    textAlign: "center",
  },
  removeBtn: {
    padding: 8,
    borderRadius: 8,
  },
  addToCartRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  addToCartBtn: {
    flex: 1,
    backgroundColor: "#F7311E",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  addToCartBtnDisabled: {
    opacity: 0.5,
  },
  addToCartText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  zoomOverlay: { flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center" },
  zoomCloseBtn: {
    position: "absolute",
    top: 40,
    right: 16,
    zIndex: 70,
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 8,
    borderRadius: 999,
  },
  zoomImageWrap: { width: "100%", height: "100%", justifyContent: "center", alignItems: "center", overflow: "hidden" },
  zoomImage: { width: "100%", height: "100%" },
  zoomNavRow: {
    position: "absolute",
    bottom: 32,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    zIndex: 70,
  },
  zoomNavBtn: { backgroundColor: "rgba(255,255,255,0.2)", padding: 12, borderRadius: 999 },
  zoomCounter: { color: "#fff", fontSize: 13, fontWeight: "600" },
});

export default VariantModal;