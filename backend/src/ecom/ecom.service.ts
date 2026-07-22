import {
    CreateBannerInput, UpdateBannerInput,
    CreateFlashSaleInput, UpdateFlashSaleInput, CreateFlashSaleProductInput,
    CreateFeaturedProductInput,
    CreateEcomOrderInput,
} from "./ecom.type";
import { ApiError } from "../../utils/ApiError";
import { BannerRepository, FlashSaleRepository, FeaturedProductRepository, EcomProductListRepository, EcomProductListQuery, EcomOrderRepository } from "./ecom.repository";
import redis from "../../config/redis.config";
import { cartTable } from "../cart/cart.table";
import { withTransaction } from "../../utils/withTransaction";
import { QueryClient } from "../../drizzle/src";
import stripe from "../../config/stripe.config";
import Stripe from "stripe";
import SaleRepository from "../sale/sale.repository";
import { variantTable } from "../product/variant.table";
import { productTable } from "../product/product.table";
import { eq, sql } from "drizzle-orm";

// ─── Banner Service ──────────────────────────────────────────────────────────

const BANNER_CACHE_KEY = "ecom:banners";

export class BannerService {
    static async create(payload: CreateBannerInput) {
        const total = await BannerRepository.count();
        if (total >= 5) throw new ApiError(400, "Maximum 5 banners allowed");
        const banner = await BannerRepository.create(payload);
        if (!banner) throw new ApiError(400, "Banner creation failed");
        await this.invalidateCache();
        return banner;
    }

    static async update(id: number, payload: UpdateBannerInput) {
        const exists = await BannerRepository.findByID(id);
        if (!exists) throw new ApiError(404, "Banner not found");
        const banner = await BannerRepository.update(id, payload);
        if (!banner) throw new ApiError(400, "Banner update failed");
        await this.invalidateCache();
        return banner;
    }

    static async delete(id: number) {
        const exists = await BannerRepository.findByID(id);
        if (!exists) throw new ApiError(404, "Banner not found");
        await BannerRepository.delete(id);
        await this.invalidateCache();
    }

    static async list(search?: string, page?: number, limit?: number) {
        return await BannerRepository.list(search, page, limit);
    }

    static async activeBanners() {
        const cached = await redis.get(BANNER_CACHE_KEY);
        if (cached) return JSON.parse(cached);

        const banners = await BannerRepository.activeBanners();
        await redis.set(BANNER_CACHE_KEY, JSON.stringify(banners), "EX", 300);
        return banners;
    }

    private static async invalidateCache() {
        await redis.del(BANNER_CACHE_KEY);
    }
}

// ─── Flash Sale Service ──────────────────────────────────────────────────────

const FLASH_SALE_CACHE_KEY = "ecom:flash_sale";

export class FlashSaleService {
    static async createSale(payload: CreateFlashSaleInput) {
        const sale = await FlashSaleRepository.createSale(payload);
        if (!sale) throw new ApiError(400, "Flash sale creation failed");
        await this.invalidateCache();
        return sale;
    }

    static async updateSale(id: number, payload: UpdateFlashSaleInput) {
        const exists = await FlashSaleRepository.findSaleByID(id);
        if (!exists) throw new ApiError(404, "Flash sale not found");
        const sale = await FlashSaleRepository.updateSale(id, payload);
        if (!sale) throw new ApiError(400, "Flash sale update failed");
        await this.invalidateCache();
        return sale;
    }

    static async deleteSale(id: number) {
        const exists = await FlashSaleRepository.findSaleByID(id);
        if (!exists) throw new ApiError(404, "Flash sale not found");
        await FlashSaleRepository.deleteSale(id);
        await this.invalidateCache();
    }

    static async listSales(search?: string, page?: number, limit?: number) {
        return await FlashSaleRepository.listSales(search, page, limit);
    }

    static async activeSaleWithProducts() {
        const cached = await redis.get(FLASH_SALE_CACHE_KEY);
        if (cached) return JSON.parse(cached);

        const sale = await FlashSaleRepository.activeSaleWithProducts();
        if (sale) {
            await redis.set(FLASH_SALE_CACHE_KEY, JSON.stringify(sale), "EX", 120);
        }
        return sale;
    }

    static async addProduct(payload: CreateFlashSaleProductInput) {
        const exists = await FlashSaleRepository.findSaleByID(payload.flashSaleID);
        if (!exists) throw new ApiError(404, "Flash sale not found");
        const product = await FlashSaleRepository.addProduct(payload);
        if (!product) throw new ApiError(400, "Failed to add product to flash sale");
        await this.invalidateCache();
        return product;
    }

    static async removeProduct(id: number) {
        const exists = await FlashSaleRepository.findProductByID(id);
        if (!exists) throw new ApiError(404, "Flash sale product not found");
        await FlashSaleRepository.removeProduct(id);
        await this.invalidateCache();
    }

    static async productsBySaleID(flashSaleID: number) {
        return await FlashSaleRepository.productsBySaleID(flashSaleID);
    }

    private static async invalidateCache() {
        await redis.del(FLASH_SALE_CACHE_KEY);
    }
}

// ─── Featured Product Service ────────────────────────────────────────────────

const FEATURED_CACHE_KEY = "ecom:featured_products";

export class FeaturedProductService {
    static async add(payload: CreateFeaturedProductInput) {
        const existing = await FeaturedProductRepository.findByProductID(payload.productID);
        if (existing) throw new ApiError(400, "Product is already featured");
        const product = await FeaturedProductRepository.add(payload);
        if (!product) throw new ApiError(400, "Failed to add featured product");
        await this.invalidateCache();
        return product;
    }

    static async remove(id: number) {
        const exists = await FeaturedProductRepository.findByID(id);
        if (!exists) throw new ApiError(404, "Featured product not found");
        await FeaturedProductRepository.remove(id);
        await this.invalidateCache();
    }

    static async list(page?: number, limit?: number) {
        return await FeaturedProductRepository.list(page, limit);
    }

    static async toggle(productID: number) {
        const existing = await FeaturedProductRepository.findByProductID(productID);
        if (existing) {
            await FeaturedProductRepository.remove(existing.id);
            await this.invalidateCache();
            return { featured: false };
        }
        await FeaturedProductRepository.add({ productID, sortOrder: 0 });
        await this.invalidateCache();
        return { featured: true };
    }

    static async activeFeaturedProducts() {
        const cached = await redis.get(FEATURED_CACHE_KEY);
        if (cached) return JSON.parse(cached);

        const products = await FeaturedProductRepository.activeFeaturedProducts();
        await redis.set(FEATURED_CACHE_KEY, JSON.stringify(products), "EX", 300);
        return products;
    }

    private static async invalidateCache() {
        await redis.del(FEATURED_CACHE_KEY);
    }
}

// ─── Ecom Product List Service ─────────────────────────────────────────────

export class EcomProductListService {
    static async featuredProducts() {
        return await FeaturedProductRepository.activeFeaturedProducts();
    }

    static async flashProducts() {
        const sale = await FlashSaleRepository.activeSaleWithProducts();
        if (!sale) return [];

        return sale.products.map((fp) => ({
            id: fp.product.id,
            name: fp.product.name,
            slug: fp.product.slug,
            thumbnail: fp.product.thumbnail,
            salePrice: fp.product.salePrice,
            stock: fp.product.stock,
            totalSold: fp.product.totalSold,
            averageRating: fp.product.averageRating,
            totalReviews: fp.product.totalReviews,
            video: fp.product.video,
            shortDescription: fp.product.shortDescription,
            discountPrice: fp.discountPrice,
        }));
    }

    static async offerProducts(query: EcomProductListQuery) {
        return await EcomProductListRepository.list({
            ...query,
            published: true,
        });
    }
}

// ─── Ecom Order Service ─────────────────────────────────────────────────────

export class EcomOrderService {

    static async createOrder(userID: string, input: CreateEcomOrderInput) {
        return await withTransaction(async (tx: QueryClient) => {
            const cartItems = await tx.query.cartTable.findMany({
                where: (cart: any, { eq }: any) => eq(cart.userID, userID),
            });

            if (!cartItems || cartItems.length === 0) {
                throw new ApiError(400, "Cart is empty");
            }

            let subtotal = 0;
            let totalDiscount = 0;
            const orderItemsData: any[] = [];

            for (const item of cartItems) {
                const variant = await EcomOrderRepository.findVariantByID(item.variantID, tx);
                if (!variant) throw new ApiError(400, `Variant not found for item: ${item.name}`);
                if (variant.stock! < item.quantity) {
                    throw new ApiError(400, `Insufficient stock for ${item.name}`);
                }

                const salePrice = variant.salePrice as number;
                let effectivePrice = salePrice;

                if (
                    variant.discountPrice != null &&
                    (variant.discountPrice as number) > 0 &&
                    (variant.discountPrice as number) < salePrice
                ) {
                    effectivePrice = variant.discountPrice as number;
                }

                const lineTotal = effectivePrice * item.quantity;
                const lineDiscount = (salePrice - effectivePrice) * item.quantity;

                subtotal += lineTotal;
                totalDiscount += lineDiscount;

                orderItemsData.push({
                    productID: item.productID,
                    variantID: item.variantID,
                    productName: item.name,
                    variantAttrs: item.attributes,
                    thumbnail: item.thumbnail,
                    salePrice,
                    discountPrice: effectivePrice !== salePrice ? effectivePrice : null,
                    quantity: item.quantity,
                    lineTotal,
                });
            }

            const totalAmount = subtotal;
            const orderNo = await EcomOrderRepository.generateOrderNo();

            const order = await EcomOrderRepository.createOrder({
                userID,
                orderNo,
                status: "pending",
                subtotal,
                shippingCost: 0,
                discount: totalDiscount,
                totalAmount,
                paymentMethod: input.paymentMethod,
                paymentStatus: "unpaid",
                shippingName: input.shipping.name,
                shippingPhone: input.shipping.phone,
                shippingAddress: input.shipping.address,
                shippingCity: input.shipping.city || null,
                shippingArea: input.shipping.area || null,
                note: input.note || null,
            }, tx);

            for (const itemData of orderItemsData) {
                await EcomOrderRepository.createOrderItem({
                    orderID: order.id,
                    ...itemData,
                }, tx);
            }

            for (const item of cartItems) {
                const currentVariant = await EcomOrderRepository.findVariantByID(item.variantID, tx);
                await tx
                    .update(variantTable)
                    .set({ stock: currentVariant!.stock! - item.quantity } as any)
                    .where(eq(variantTable.id, item.variantID));

                await tx
                    .update(productTable)
                    .set({
                        stock: sql`stock - ${item.quantity}`,
                        totalSold: sql`total_sold + ${item.quantity}`,
                    } as any)
                    .where(eq(productTable.id, item.productID));
            }

            await tx.delete(cartTable).where(eq(cartTable.userID, userID));

            if (input.paymentMethod === "stripe") {
                const session = await EcomOrderService.createStripeSession(orderNo, orderItemsData, totalAmount);
                await EcomOrderRepository.updateOrder(orderNo, { stripeSessionID: session.id }, tx);
                return { orderNo, stripeSessionUrl: session.url };
            }

            await EcomOrderRepository.updateOrder(orderNo, { status: "confirmed" }, tx);
            return { orderNo, message: "Order placed successfully" };
        });
    }

    static async createStripeSession(orderNo: string, items: any[], totalAmount: number) {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: items.map((item: any) => ({
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: item.productName,
                        images: item.thumbnail ? [item.thumbnail] : [],
                    },
                    unit_amount: Math.round((item.discountPrice ?? item.salePrice) * 100),
                },
                quantity: item.quantity,
            })),
            success_url: `${process.env.ECOM_CLIENT_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.ECOM_CLIENT_URL}/cart`,
            metadata: { orderNo },
        });
        return session;
    }

    static async handleStripeWebhook(event: Stripe.Event) {
        if (event.type === "checkout.session.completed") {
            const session = event.data.object as Stripe.Checkout.Session;
            const orderNo = session.metadata?.orderNo;
            if (!orderNo) return;

            const order = await EcomOrderRepository.findOrderByOrderNo(orderNo);
            if (!order || order.saleID) return;

            const sale = await SaleRepository.create({
                totalProductPrice: order.subtotal,
                totalAmount: order.totalAmount,
                paid: order.totalAmount,
                discount: order.discount,
                exchangeAmount: 0,
                otherCost: 0,
                balanceBefore: 0,
                balanceAfter: 0,
                saleDate: new Date(),
                note: `Ecom order: ${orderNo}`,
            });

            await EcomOrderRepository.updateOrder(orderNo, {
                saleID: sale.id,
                status: "confirmed",
                paymentStatus: "paid",
                paidAt: new Date(),
                stripePaymentIntent: session.payment_intent as string || null,
            });
        }

        if (event.type === "checkout.session.expired") {
            const session = event.data.object as Stripe.Checkout.Session;
            const orderNo = session.metadata?.orderNo;
            if (!orderNo) return;

            const order = await EcomOrderRepository.findOrderByOrderNo(orderNo);
            if (!order) return;

            await EcomOrderRepository.updateOrder(orderNo, { status: "failed" });

            for (const item of order.items) {
                const currentVariant = await EcomOrderRepository.findVariantByID(item.variantID);
                if (currentVariant) {
                    await withTransaction(async (tx: QueryClient) => {
                        await tx.update(variantTable).set({
                            stock: currentVariant.stock! + item.quantity,
                        } as any).where(eq(variantTable.id, item.variantID));
                        await tx.update(productTable).set({
                            stock: sql`stock + ${item.quantity}`,
                            totalSold: sql`total_sold - ${item.quantity}`,
                        } as any).where(eq(productTable.id, item.productID));
                    });
                }
            }
        }

        if (event.type === "charge.refunded") {
            const charge = event.data.object as Stripe.Charge;
            const paymentIntent = charge.payment_intent as string;
            if (!paymentIntent) return;

            const order = await EcomOrderRepository.findOrderByStripePaymentIntent(paymentIntent);
            if (!order) return;

            await EcomOrderRepository.updateOrderByID(order.id, { paymentStatus: "refunded" });
        }
    }

    static async confirmOrderSuccess(userID: string, sessionID?: string, orderNo?: string) {
        if (sessionID) {
            const session = await stripe.checkout.sessions.retrieve(sessionID);
            const orderNoFromSession = session.metadata?.orderNo;
            if (!orderNoFromSession) throw new ApiError(400, "Invalid session");

            const order = await EcomOrderRepository.findOrderByOrderNo(orderNoFromSession);
            if (!order) throw new ApiError(404, "Order not found");
            if (order.userID !== userID) throw new ApiError(403, "Forbidden");
            return order;
        }

        if (orderNo) {
            const order = await EcomOrderRepository.findOrderByOrderNo(orderNo);
            if (!order) throw new ApiError(404, "Order not found");
            if (order.userID !== userID) throw new ApiError(403, "Forbidden");
            return order;
        }

        throw new ApiError(400, "session_id or orderNo is required");
    }

    static async getMyOrders(userID: string, page = 1, limit = 10) {
        return await EcomOrderRepository.listOrdersByUser(userID, page, limit);
    }

    static async getMyOrderDetail(userID: string, orderNo: string) {
        const order = await EcomOrderRepository.findOrderByOrderNo(orderNo);
        if (!order) throw new ApiError(404, "Order not found");
        if (order.userID !== userID) throw new ApiError(403, "Forbidden");
        return order;
    }

    static async cancelOrder(userID: string, orderNo: string) {
        const order = await EcomOrderRepository.findOrderByOrderNo(orderNo);
        if (!order) throw new ApiError(404, "Order not found");
        if (order.userID !== userID) throw new ApiError(403, "Forbidden");
        if (order.status !== "pending") {
            throw new ApiError(400, "Only pending orders can be cancelled");
        }

        await withTransaction(async (tx: QueryClient) => {
            await EcomOrderRepository.updateOrder(orderNo, { status: "cancelled" }, tx);

            for (const item of order.items) {
                const currentVariant = await EcomOrderRepository.findVariantByID(item.variantID, tx);
                if (currentVariant) {
                    await tx.update(variantTable).set({
                        stock: currentVariant.stock! + item.quantity,
                    } as any).where(eq(variantTable.id, item.variantID));
                    await tx.update(productTable).set({
                        stock: sql`stock + ${item.quantity}`,
                        totalSold: sql`total_sold - ${item.quantity}`,
                    } as any).where(eq(productTable.id, item.productID));
                }
            }
        });

        return { message: "Order cancelled successfully" };
    }

    static async deleteOrder(orderNo: string) {
        const order = await EcomOrderRepository.findOrderByOrderNo(orderNo);
        if (!order) throw new ApiError(404, "Order not found");

        if (order.saleID) {
            await SaleRepository.delete(order.saleID);
        } else {
            await EcomOrderRepository.deleteOrderItems(order.id);
            await EcomOrderRepository.deleteOrder(orderNo);
        }

        return { message: "Order deleted successfully" };
    }

    static async getPublicOrder(orderNo: string) {
        const order = await EcomOrderRepository.findOrderByOrderNo(orderNo);
        if (!order) throw new ApiError(404, "Order not found");

        return {
            orderNo: order.orderNo,
            status: order.status,
            subtotal: order.subtotal,
            shippingCost: order.shippingCost,
            discount: order.discount,
            totalAmount: order.totalAmount,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,
            shippingName: order.shippingName,
            shippingPhone: order.shippingPhone,
            shippingAddress: order.shippingAddress,
            shippingCity: order.shippingCity,
            shippingArea: order.shippingArea,
            note: order.note,
            paidAt: order.paidAt,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            items: order.items,
        };
    }

    static async updateOrderStatus(orderNo: string, status: string) {
        const order = await EcomOrderRepository.findOrderByOrderNo(orderNo);
        if (!order) throw new ApiError(404, "Order not found");

        await EcomOrderRepository.updateOrder(orderNo, { status } as any);
        return { message: `Order status updated to ${status}` };
    }

    static async createSaleForCodOrder(orderNo: string) {
        const order = await EcomOrderRepository.findOrderByOrderNo(orderNo);
        if (!order) throw new ApiError(404, "Order not found");
        if (!["confirmed", "delivered"].includes(order.status)) {
            throw new ApiError(400, "Order must be confirmed or delivered");
        }
        if (order.saleID) {
            throw new ApiError(400, "Sale already exists for this order");
        }

        const sale = await SaleRepository.create({
            totalProductPrice: order.subtotal,
            totalAmount: order.totalAmount,
            paid: order.status === "delivered" ? order.totalAmount : 0,
            discount: order.discount,
            exchangeAmount: 0,
            otherCost: 0,
            balanceBefore: 0,
            balanceAfter: 0,
            saleDate: new Date(),
            note: `Ecom order (COD): ${orderNo}`,
        });

        await EcomOrderRepository.updateOrder(orderNo, { saleID: sale.id });
        return { message: "Sale created for COD order", saleID: sale.id };
    }
}
