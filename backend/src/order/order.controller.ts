import { Request, Response } from "express";
import { OrderService } from "./order.service";
import stripe from "../../config/stripe.config";
import Stripe from "stripe";

// ─── Order Controller ──────────────────────────────────────────────────────

export class OrderController {
    static async checkout(req: Request, res: Response) {
        const userID = (req as any).user!.id;

        const result = await OrderService.createOrder(userID, req.body);
        res.status(201).json({ success: true, data: result });
    }

    static async myOrders(req: Request, res: Response) {
        const userID = (req as any).user!.id;
        const { page, limit } = req.query;
        const data = await OrderService.getMyOrders(userID, Number(page) || 1, Number(limit) || 10);

        return res.status(200).json({ success: true, data });
    }

        static async allOrders(req: Request, res: Response) {
        const { page, limit, search } = req.query;
        const data = await OrderService.allOrders( Number(page) || 1, Number(limit) || 10, search?.toString());
        return res.status(200).json({ success: true, data });
    }

    static async myOrderDetail(req: Request, res: Response) {
        const userID = (req as any).user!.id;
        const orderNo = req.params.orderNo as string;
        const data = await OrderService.getMyOrderDetail(userID, orderNo);
        return res.status(200).json({ success: true, data });
    }

    static async cancelOrder(req: Request, res: Response) {
        const userID = (req as any).user!.id;
        const orderNo = req.params.orderNo as string;
        const result = await OrderService.cancelOrder(userID, orderNo);
        return res.status(200).json({ success: true, ...result });
    }

    static async orderSuccess(req: Request, res: Response) {
        const userID = (req as any).user!.id;
        const { session_id, orderNo } = req.query;
        const data = await OrderService.confirmOrderSuccess(
            userID,
            session_id as string | undefined,
            orderNo as string | undefined,
        );
        return res.status(200).json({ success: true, data });
    }

    static async publicOrderTracking(req: Request, res: Response) {
        const orderNo = req.params.orderNo as string;
        const data = await OrderService.getPublicOrder(orderNo);
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
        const orderNo = req.params.orderNo as string;
        const { status } = req.body;
        const result = await OrderService.updateOrderStatus(orderNo, status);
        return res.status(200).json({ success: true, ...result });
    }

    static async adminConfirmSale(req: Request, res: Response) {
        const orderNo = req.params.orderNo as string;
        const result = await OrderService.createSaleForCodOrder(orderNo);
        return res.status(200).json({ success: true, ...result });
    }

    static async adminDeleteOrder(req: Request, res: Response) {
        const orderNo = req.params.orderNo as string;
        const result = await OrderService.deleteOrder(orderNo);
        return res.status(200).json({ success: true, ...result });
    }
}
