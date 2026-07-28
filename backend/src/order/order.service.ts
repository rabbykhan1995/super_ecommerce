import {
    CreateOrderInput,
} from "./order.type";
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

// ─── Order Service ─────────────────────────────────────────────────────────

export class OrderService {

    static async createOrder(userID: string, input: CreateOrderInput) {

        return await withTransaction(async (tx: QueryClient) => {

            const cartItems = await CartService.getCart(userID,tx);

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
            const orderNo = await OrderRepository.generateOrderNo();

            const order = await OrderRepository.createOrder({
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
                await OrderRepository.createOrderItem({
                    orderID: order.id,
                    ...itemData,
                }, tx);
            }

            for (const item of cartItems) {

                await ProductService.decreaseVariantStock(item.variantID, item.quantity, tx)

                await ProductService.decreaseProductStock(item.productID, item.quantity, tx)

                await CartService.removeItem(userID, item.id, tx);
            }
             
            if (input.paymentMethod === "stripe") {
              
                const session = await OrderService.createStripeSession(orderNo, orderItemsData, totalAmount);

                await OrderRepository.updateOrder(orderNo, { stripeSessionID: session.id, status:"confirm" }, tx);

                return { orderNo, stripeSessionUrl: session.url };

            }

            await OrderRepository.updateOrder(orderNo, { status: "confirmed" }, tx);

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

            const order = await OrderRepository.findOrderByOrderNo(orderNo);
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

            await OrderRepository.updateOrder(orderNo, {
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

            const order = await OrderRepository.findOrderByOrderNo(orderNo);
            if (!order) return;

            await OrderRepository.updateOrder(orderNo, { status: "failed" });

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

    static async confirmOrderSuccess(userID: string, sessionID?: string, orderNo?: string) {
        if (sessionID) {
            const session = await stripe.checkout.sessions.retrieve(sessionID);
            const orderNoFromSession = session.metadata?.orderNo;
            if (!orderNoFromSession) throw new ApiError(400, "Invalid session");

            const order = await OrderRepository.findOrderByOrderNo(orderNoFromSession);
            if (!order) throw new ApiError(404, "Order not found");
            if (order.userID !== userID) throw new ApiError(403, "Forbidden");
            return order;
        }

        if (orderNo) {
            const order = await OrderRepository.findOrderByOrderNo(orderNo);
            if (!order) throw new ApiError(404, "Order not found");
            if (order.userID !== userID) throw new ApiError(403, "Forbidden");
            return order;
        }

        throw new ApiError(400, "session_id or orderNo is required");
    }

    static async getMyOrders(userID: string, page = 1, limit = 10) {
        return await OrderRepository.listOrdersByUser(userID, page, limit);
    }

      static async allOrders(page = 1, limit = 10) {
        return await OrderRepository.allOrders( page, limit);
    }

    static async getMyOrderDetail(userID: string, orderNo: string) {
        const order = await OrderRepository.findOrderByOrderNo(orderNo);
        if (!order) throw new ApiError(404, "Order not found");
        if (order.userID !== userID) throw new ApiError(403, "Forbidden");
        return order;
    }

    static async cancelOrder(userID: string, orderNo: string) {
        const order = await OrderRepository.findOrderByOrderNo(orderNo);
        if (!order) throw new ApiError(404, "Order not found");
        if (order.userID !== userID) throw new ApiError(403, "Forbidden");
        if (order.status !== "pending") {
            throw new ApiError(400, "Only pending orders can be cancelled");
        }

        await withTransaction(async (tx: QueryClient) => {
            await OrderRepository.updateOrder(orderNo, { status: "cancelled" }, tx);

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

    static async deleteOrder(orderNo: string) {
        const order = await OrderRepository.findOrderByOrderNo(orderNo);
        if (!order) throw new ApiError(404, "Order not found");

        if (order.saleID) {
            await SaleRepository.delete(order.saleID);
        } else {
            await OrderRepository.deleteOrderItems(order.id);
            await OrderRepository.deleteOrder(orderNo);
        }

        return { message: "Order deleted successfully" };
    }

    static async getPublicOrder(orderNo: string) {
        const order = await OrderRepository.findOrderByOrderNo(orderNo);
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
        const order = await OrderRepository.findOrderByOrderNo(orderNo);
        if (!order) throw new ApiError(404, "Order not found");

        await OrderRepository.updateOrder(orderNo, { status } as any);
        return { message: `Order status updated to ${status}` };
    }

    static async createSaleForCodOrder(orderNo: string) {
        const order = await OrderRepository.findOrderByOrderNo(orderNo);
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

        await OrderRepository.updateOrder(orderNo, { saleID: sale.id });
        return { message: "Sale created for COD order", saleID: sale.id };
    }
}
