import { CreateOrderInput } from "./order.type";
import { ApiError } from "../../utils/ApiError";
import { OrderRepository } from "./order.repository";
import { withTransaction } from "../../utils/withTransaction";
import { QueryClient } from "../../drizzle/src";
import stripe from "../../config/stripe.config";
import Stripe from "stripe";
import SaleRepository from "../sale/sale.repository";
import { variantTable } from "../product/variant.table";
import { productTable } from "../product/product.table";
import { eq, sql } from "drizzle-orm";
import ProductService from "../product/product.service";
import CartService from "../cart/cart.service";

export class OrderService {

    static async createOrder(userID: string, input: CreateOrderInput) {
        return await withTransaction(async (tx: QueryClient) => {
            const cartItems = await CartService.getCart(userID, tx);
            if (!cartItems || cartItems.length === 0) {
                throw new ApiError(400, "Cart is empty");
            }

            let subtotal = 0;
            let totalDiscount = 0;
            const orderItemsData: any[] = [];

            for (const item of cartItems) {
                const variant = await ProductService.findVariantByID(item.variantID, tx);
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

            const order = await OrderRepository.createOrder({
                userID,
                status: "Pending",
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
                await OrderRepository.createOrderItem({
                    orderID: order.id,
                    ...itemData,
                }, tx);
            }

            for (const item of cartItems) {
                await ProductService.decreaseVariantStock(item.variantID, item.quantity, tx);
                await ProductService.decreaseProductStock(item.productID, item.quantity, tx);
                await CartService.removeItem(userID, item.id, tx);
            }

            if (input.paymentMethod === "stripe") {
                const session = await OrderService.createStripeSession(order.id, orderItemsData, totalAmount);
                await OrderRepository.updateOrderByID(order.id, { stripeSessionID: session.id, status: "Confirmed", paymentStatus: "paid" }, tx);
                return { orderId: order.id, stripeSessionUrl: session.url };
            }

            return { orderId: order.id, message: "Order placed successfully" };
        });
    }

    static async createStripeSession(orderId: number, items: any[], totalAmount: number) {
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
            metadata: { orderId: String(orderId) },
        });
        return session;
    }

    static async handleStripeWebhook(event: Stripe.Event) {
        if (event.type === "checkout.session.completed") {
            const session = event.data.object as Stripe.Checkout.Session;
            const stripeSessionID = session.id;
            if (!stripeSessionID) return;

            const order = await OrderRepository.findOrderByStripeSessionID(stripeSessionID);
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
                note: `Ecom order: #${order.id}`,
            });

            await OrderRepository.updateOrderByID(order.id, {
                saleID: sale.id,
                status: "Confirmed",
                paymentStatus: "paid",
                paidAt: new Date(),
                stripePaymentIntent: session.payment_intent as string || null,
            });
        }

        if (event.type === "checkout.session.expired") {
            const session = event.data.object as Stripe.Checkout.Session;
            const stripeSessionID = session.id;
            if (!stripeSessionID) return;

            const order = await OrderRepository.findOrderByStripeSessionID(stripeSessionID);
            if (!order) return;

            await OrderRepository.updateOrderByID(order.id, { status: "Cancelled" });

            for (const item of order.items) {
                const currentVariant = await OrderRepository.findVariantByID(item.variantID);
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

            const order = await OrderRepository.findOrderByStripePaymentIntent(paymentIntent);
            if (!order) return;

            await OrderRepository.updateOrderByID(order.id, { paymentStatus: "refunded" });
        }
    }

    static async confirmOrderSuccess(userID: string, sessionID?: string, orderId?: number) {
        if (sessionID) {
            const session = await stripe.checkout.sessions.retrieve(sessionID);
            const order = await OrderRepository.findOrderByStripeSessionID(sessionID);
            if (!order) throw new ApiError(404, "Order not found");
            if (order.userID !== userID) throw new ApiError(403, "Forbidden");
            return order;
        }

        if (orderId) {
            const order = await OrderRepository.findOrderByID(orderId);
            if (!order) throw new ApiError(404, "Order not found");
            if (order.userID !== userID) throw new ApiError(403, "Forbidden");
            return order;
        }

        throw new ApiError(400, "session_id or orderId is required");
    }

    static async getMyOrders(userID: string, page = 1, limit = 10) {
        return await OrderRepository.listOrdersByUser(userID, page, limit);
    }

    static async allOrders(page = 1, limit = 10) {
        return await OrderRepository.allOrders(page, limit);
    }

    static async getMyOrderDetail(userID: string, orderId: number) {
        const order = await OrderRepository.findOrderByID(orderId);
        if (!order) throw new ApiError(404, "Order not found");
        if (order.userID !== userID) throw new ApiError(403, "Forbidden");
        return order;
    }

    static async cancelOrder(userID: string, orderId: number) {
        const order = await OrderRepository.findOrderByID(orderId);
        if (!order) throw new ApiError(404, "Order not found");
        if (order.userID !== userID) throw new ApiError(403, "Forbidden");
        if (order.status !== "Pending") {
            throw new ApiError(400, "Only pending orders can be cancelled");
        }

        await withTransaction(async (tx: QueryClient) => {
            await OrderRepository.updateOrderByID(order.id, { status: "Cancelled" }, tx);

            for (const item of order.items) {
                const currentVariant = await OrderRepository.findVariantByID(item.variantID, tx);
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

    static async getPublicOrder(orderId: number) {
        const order = await OrderRepository.findOrderByID(orderId);
        if (!order) throw new ApiError(404, "Order not found");

        return {
            id: order.id,
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

    static async updateOrderStatus(orderId: number, status: string) {
        const order = await OrderRepository.findOrderByID(orderId);
        if (!order) throw new ApiError(404, "Order not found");

        await OrderRepository.updateOrderByID(order.id, { status } as any);
        return { message: `Order status updated to ${status}` };
    }

    static async createSaleForCodOrder(orderId: number) {
        const order = await OrderRepository.findOrderByID(orderId);
        if (!order) throw new ApiError(404, "Order not found");
        if (!["Pending", "Confirmed", "Delivered"].includes(order.status)) {
            throw new ApiError(400, "Order must be pending, confirmed or delivered");
        }
        if (order.saleID) {
            throw new ApiError(400, "Sale already exists for this order");
        }

        const sale = await SaleRepository.create({
            totalProductPrice: order.subtotal,
            totalAmount: order.totalAmount,
            paid: order.status === "Delivered" ? order.totalAmount : 0,
            discount: order.discount,
            exchangeAmount: 0,
            otherCost: 0,
            balanceBefore: 0,
            balanceAfter: 0,
            saleDate: new Date(),
            note: `Ecom order (COD): #${order.id}`,
        });

        await OrderRepository.updateOrderByID(order.id, { saleID: sale.id });
        return { message: "Sale created for COD order", saleID: sale.id };
    }
}
