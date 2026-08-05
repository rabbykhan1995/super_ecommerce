import { CheckoutOrderInput, CreateOrderInput, OrderStatus } from "./order.type";
import { ApiError } from "../../utils/ApiError";
import { OrderRepository } from "./order.repository";
import { withTransaction } from "../../utils/withTransaction";
import { QueryClient } from "../../drizzle/src";
import stripe from "../../config/stripe.config";
import Stripe from "stripe";
import ProductService from "../product/product.service";
import CartService from "../cart/cart.service";
import { Contact } from "../contact/contact.type";
import ContactService from "../contact/contact.service";

export class OrderService {
    static async checkoutOrder(userID: string, input: CheckoutOrderInput) {
        return await withTransaction(async (tx: QueryClient) => {

            const contact: Contact = await ContactService.findOne({ userID: userID }, tx);

            if (!contact) {
                throw new ApiError(400, "Contact Required");
            }

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

                if ((variant.stock!- (variant.reservedStock??0)) < item.quantity) {
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
                    salePrice,
                    quantity: item.quantity,
                    lineTotal,
                });
            }

            const totalAmount = subtotal;

            const order = await OrderRepository.createOrder({
                contactID: contact.id,
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
                await CartService.removeItem(userID, item.id, tx);
                await ProductService.increaseVariantReservedStock(item.variantID, item.quantity, tx);
                await ProductService.increaseProductReservedStock(item.productID, item.quantity, tx);
            }

            if (input.paymentMethod === "stripe") {
                const session = await OrderService.createStripeSession(order.id, orderItemsData, totalAmount);
                await OrderRepository.updateOrderByID(order.id, { stripeSessionID: session.id, status: "Confirmed", paymentStatus: "paid" }, tx);
                return { orderId: order.id, stripeSessionUrl: session.url };
            }

            return { orderId: order.id, message: "Order placed successfully" };
        });
    }

    static async createOrder(input: CreateOrderInput) {
        return await withTransaction(async (tx: QueryClient) => {
            const items = input.items;

            let subtotal = 0;
            const orderItemsData: any[] = [];

            for (const item of items) {

                const variant = await ProductService.findVariantByID(item.variantID, tx);

                if (!variant) {
                    throw new ApiError(400, `variant not found`);
                }

                if (variant.stock! - (variant.reservedStock??0) < item.quantity) {
                    throw new ApiError(400, `Insufficient stock`);
                }

                const salePrice = item.salePrice;
                const lineTotal = item.lineTotal ?? salePrice * item.quantity;

                subtotal += lineTotal;

                orderItemsData.push({
                    productID: item.productID,
                    variantID: item.variantID,
                    salePrice,
                    quantity: item.quantity,
                    lineTotal,
                    serial: item.serial || null,
                });
            }

            const totalAmount = subtotal;

            const order = await OrderRepository.createOrder({
                contactID: input.contactID,
                status: "Pending",
                subtotal,
                shippingCost: 0,
                discount: 0,
                totalAmount,
                paymentMethod: input.paymentMethod || null,
                paymentStatus: "unpaid",
                shippingName: input.shippingName,
                shippingPhone: input.shippingPhone,
                shippingAddress: input.shippingAddress,
                shippingCity: input.shippingCity || null,
                shippingArea: input.shippingArea || null,
                note: input.note || null,
                orderFrom: input.orderFrom || "Manual",
                orderedBy: input.orderedBy || null,
            }, tx);

            for (const itemData of orderItemsData) {
                await OrderRepository.createOrderItem({
                    orderID: order.id,
                    ...itemData,
                }, tx);

                await ProductService.increaseVariantReservedStock(itemData.variantID, itemData.quantity, tx);
                await ProductService.increaseProductReservedStock(itemData.productID, itemData.quantity, tx);
            }

            return { orderId: order.id, message: "Order created successfully" };
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
        // ar jodi completed hoi payment
        if (event.type === "checkout.session.completed") {
            const session = event.data.object as Stripe.Checkout.Session;
            const stripeSessionID = session.id;
            if (!stripeSessionID) return;

            const order = await OrderRepository.findOrderByStripeSessionID(stripeSessionID);
            if (!order || order.saleID) return;

            await OrderRepository.updateOrderByID(order.id, {
                status: "Confirmed",
                paymentStatus: "paid",
                paidAt: new Date(),
                stripePaymentIntent: session.payment_intent as string || null,
            });
        }
        //    jodi stripe er session expired hoi
        if (event.type === "checkout.session.expired") {
            const session = event.data.object as Stripe.Checkout.Session;
            const stripeSessionID = session.id;
            if (!stripeSessionID) return;

            const order = await OrderRepository.findOrderByStripeSessionID(stripeSessionID);
            if (!order) return;

            await withTransaction(async (tx: QueryClient) => {
                for (const item of order.items) {
                    await ProductService.decreaseVariantReservedStock(item.variantID, item.quantity, tx);
                    await ProductService.decreaseProductReservedStock(item.productID, item.quantity, tx);
                }
                await OrderRepository.deleteOrderByID(order.id, tx);
            });
        }
        // jodi refuned hoi
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
        const contact = await ContactService.findOne({ userID });
        if (!contact) throw new ApiError(404, "Contact not found");

        if (sessionID) {
            const order = await OrderRepository.findOrderByStripeSessionID(sessionID);
            if (!order) throw new ApiError(404, "Order not found");
            if (order.contactID !== contact.id) throw new ApiError(403, "Forbidden");
            return order;
        }

        if (orderId) {
            const order = await OrderRepository.findOrderByID(orderId);
            if (!order) throw new ApiError(404, "Order not found");
            if (order.contactID !== contact.id) throw new ApiError(403, "Forbidden");
            return order;
        }

        throw new ApiError(400, "session_id or orderId is required");
    }

    static async getMyOrders(userID: string, page = 1, limit = 10) {

        const contact = await ContactService.findOne({ userID });

        return await OrderRepository.listOrdersByUser(contact.id, page, limit);
    }

    static async allOrders(page = 1, limit = 10, status?: OrderStatus) {
        return await OrderRepository.allOrders(page, limit, status);
    }

    static async getMyOrderDetail(userID: string, orderId: number) {
        const contact = await ContactService.findOne({ userID });
        if (!contact) throw new ApiError(404, "Contact not found");

        const order = await OrderRepository.findOrderByID(orderId);
        if (!order) throw new ApiError(404, "Order not found");
        if (order.contactID !== contact.id) throw new ApiError(403, "Forbidden");
        return order;
    }

    static async getAdminOrderDetail(orderId: number) {
        const order = await OrderRepository.findOrderByID(orderId);
        if (!order) throw new ApiError(404, "Order not found");
        return order;
    }

    static async cancelOrder(userID: string, orderId: number) {
        const order = await OrderRepository.findOrderByID(orderId);
        if (!order) throw new ApiError(404, "Order not found");

        const contact = await ContactService.findOne({ userID });

        if (!contact) {
            throw new ApiError(403, "Forbidden");
        }

        if (order.contactID !== contact.id) throw new ApiError(403, "Forbidden");
        if (order.status !== "Pending") {
            throw new ApiError(400, "Only pending orders can be cancelled");
        }

        await withTransaction(async (tx: QueryClient) => {
            await OrderRepository.updateOrderByID(order.id, { status: "Cancelled" }, tx);

            for (const item of order.items) {
                await ProductService.decreaseVariantReservedStock(item.variantID, item.quantity, tx);
                await ProductService.decreaseProductReservedStock(item.productID, item.quantity, tx);
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

}
