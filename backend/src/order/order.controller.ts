import { Request, Response } from "express";
import { OrderService } from "./order.service";
import { OrderStatus } from "./order.type";
import stripe from "../../config/stripe.config";
import Stripe from "stripe";

export class OrderController {
    static async checkout(req: Request, res: Response) {

        const userID = (req as any).user!.id;

        const result = await OrderService.checkoutOrder(userID, req.body);
        res.status(201).json({ success: true, data: result });
    }

    static async checkoutMobile(req: Request, res: Response) {
        const userID = req.user!.id; // apnar auth middleware onujayi adjust korুন

        const result = await OrderService.checkoutOrderMobile(userID, req.body);
        res.status(200).json({ success: true, data: result });
    }

    static async createOrder(req: Request, res: Response) {
        const result = await OrderService.createOrder(req.body);

        res.status(201).json({ success: true, data: result });
    }

    static async myOrders(req: Request, res: Response) {

        const userID = (req as any).user!.id;
        console.log("user id : ", userID)
        const { page, limit } = req.query;

        console.log("page and limit :", page, limit)
        const data = await OrderService.getMyOrders(userID, Number(page) || 1, Number(limit) || 10);

        return res.status(200).json({ success: true, data });
    }

    static async allOrders(req: Request, res: Response) {
        const { page, limit, status } = req.query;
        const data = await OrderService.allOrders(Number(page) || 1, Number(limit) || 10, status as OrderStatus | undefined);
        return res.status(200).json({ success: true, data });
    }

    static async myOrderDetail(req: Request, res: Response) {
        const userID = (req as any).user!.id;
        const orderId = Number(req.params.id);
        const data = await OrderService.getMyOrderDetail(userID, orderId);
        return res.status(200).json({ success: true, data });
    }

     static async trackOrder(req: Request, res: Response) {
        const orderId = Number(req.params.id);
        const data = await OrderService.trackOrder(orderId);
        return res.status(200).json({ success: true, data });
    }

    static async adminOrderDetail(req: Request, res: Response) {
        const orderId = Number(req.params.id);
        const data = await OrderService.getAdminOrderDetail(orderId);
        return res.status(200).json({ success: true, data });
    }

    static async cancelOrder(req: Request, res: Response) {
        const userID = (req as any).user!.id;
        const orderId = Number(req.params.id);
        const result = await OrderService.cancelOrder(userID, orderId);
        return res.status(200).json({ success: true, ...result });
    }

    static async orderSuccess(req: Request, res: Response) {
        const userID = (req as any).user!.id;
        const { session_id, orderId } = req.query;
        const data = await OrderService.confirmOrderSuccess(
            userID,
            session_id as string | undefined,
            orderId ? Number(orderId) : undefined,
        );
        return res.status(200).json({ success: true, data });
    }

    static async publicOrderTracking(req: Request, res: Response) {
        const orderId = Number(req.params.id);
        const data = await OrderService.getPublicOrder(orderId);
        return res.status(200).json({ success: true, data });
    }

    static async stripeWebhook(req: Request, res: Response) {
        const sig = req.headers["stripe-signature"] as string;
        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET!,
            );
        } catch (err: any) {
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        await OrderService.handleStripeWebhook(event);
        res.status(200).json({ received: true });
    }

    static async adminUpdateOrderStatus(req: Request, res: Response) {
        const orderId = Number(req.params.id);
        const { status } = req.body;
        const result = await OrderService.updateOrderStatus(orderId, status);
        return res.status(200).json({ success: true, ...result });
    }

}
