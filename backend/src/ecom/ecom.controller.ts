import { Request, Response } from "express";
import { BannerService, FlashSaleService, FeaturedProductService, EcomProductListService, EcomOrderService } from "./ecom.service";
import { EcomProductListQuery } from "./ecom.repository";
import { triggerRevalidation } from "../../utils/revalidate";
import stripe from "../../config/stripe.config";
import Stripe from "stripe";

// ─── Banner Controller ───────────────────────────────────────────────────────

export class BannerController {
    static async create(req: Request, res: Response) {
        const banner = await BannerService.create(req.body);
        res.status(201).json({ success: true, data: banner, msg: "Banner created" });
    }

    static async update(req: Request, res: Response) {
        const { id } = req.params;
        const banner = await BannerService.update(Number(id), req.body);
        res.status(200).json({ success: true, data: banner, msg: "Banner updated" });
    }

    static async delete(req: Request, res: Response) {
        const { id } = req.params;
        await BannerService.delete(Number(id));
        res.status(200).json({ success: true, message: "Banner deleted" });
    }

    static async list(req: Request, res: Response) {
        const { search, page, limit } = req.query;
        const data = await BannerService.list(
            search as string,
            Number(page) || 1,
            Number(limit) || 10
        );
        return res.status(200).json({ success: true, data });
    }

    static async activeBanners(_req: Request, res: Response) {
        const banners = await BannerService.activeBanners();
        return res.status(200).json({ success: true, data: banners });
    }
}

// ─── Flash Sale Controller ───────────────────────────────────────────────────

export class FlashSaleController {
    static async createSale(req: Request, res: Response) {
        const sale = await FlashSaleService.createSale(req.body);
        triggerRevalidation(["home-flash-products"]);
        res.status(201).json({ success: true, data: sale, msg: "Flash sale created" });
    }

    static async updateSale(req: Request, res: Response) {
        const { id } = req.params;
        const sale = await FlashSaleService.updateSale(Number(id), req.body);
        triggerRevalidation(["home-flash-products"]);
        res.status(200).json({ success: true, data: sale, msg: "Flash sale updated" });
    }

    static async deleteSale(req: Request, res: Response) {
        const { id } = req.params;
        await FlashSaleService.deleteSale(Number(id));
        triggerRevalidation(["home-flash-products"]);
        res.status(200).json({ success: true, message: "Flash sale deleted" });
    }

    static async listSales(req: Request, res: Response) {
        const { search, page, limit } = req.query;
        const data = await FlashSaleService.listSales(
            search as string,
            Number(page) || 1,
            Number(limit) || 10
        );
        return res.status(200).json({ success: true, data });
    }

    static async activeSale(_req: Request, res: Response) {
        const sale = await FlashSaleService.activeSaleWithProducts();
        return res.status(200).json({ success: true, data: sale });
    }

    static async addProduct(req: Request, res: Response) {
        const product = await FlashSaleService.addProduct(req.body);
        triggerRevalidation(["home-flash-products"]);
        res.status(201).json({ success: true, data: product, msg: "Product added to flash sale" });
    }

    static async removeProduct(req: Request, res: Response) {
        const { id } = req.params;
        await FlashSaleService.removeProduct(Number(id));
        triggerRevalidation(["home-flash-products"]);
        res.status(200).json({ success: true, message: "Product removed from flash sale" });
    }

    static async productsBySaleID(req: Request, res: Response) {
        const { id } = req.params;
        const products = await FlashSaleService.productsBySaleID(Number(id));
        return res.status(200).json({ success: true, data: products });
    }
}

// ─── Featured Product Controller ─────────────────────────────────────────────

export class FeaturedProductController {
    static async add(req: Request, res: Response) {
        const product = await FeaturedProductService.add(req.body);
        triggerRevalidation(["home-featured-products"]);
        res.status(201).json({ success: true, data: product, msg: "Featured product added" });
    }

    static async remove(req: Request, res: Response) {
        const { id } = req.params;
        await FeaturedProductService.remove(Number(id));
        triggerRevalidation(["home-featured-products"]);
        res.status(200).json({ success: true, message: "Featured product removed" });
    }

    static async toggle(req: Request, res: Response) {
        const productID = Number(req.params.productID);
        const result = await FeaturedProductService.toggle(productID);
        triggerRevalidation(["home-featured-products"]);
        return res.status(200).json({ success: true, data: result });
    }

    static async list(req: Request, res: Response) {
        const { page, limit } = req.query;
        const data = await FeaturedProductService.list(
            Number(page) || 1,
            Number(limit) || 10
        );
        return res.status(200).json({ success: true, data });
    }

    static async activeFeatured(_req: Request, res: Response) {
        const products = await FeaturedProductService.activeFeaturedProducts();
        return res.status(200).json({ success: true, data: products });
    }
}

// ─── Ecom Product List Controller ──────────────────────────────────────────

export class EcomProductListController {
    static async featured(_req: Request, res: Response) {
        const products = await EcomProductListService.featuredProducts();
        return res.status(200).json({ success: true, data: products });
    }

    static async flash(_req: Request, res: Response) {
        const products = await EcomProductListService.flashProducts();
        return res.status(200).json({ success: true, data: products });
    }

    static async offers(req: Request, res: Response) {
        const q = req.query;
        const toNum = (v: unknown): number | undefined => {
            if (v == null || v === "") return undefined;
            const n = Number(v);
            return isNaN(n) ? undefined : n;
        };
        const toNumArray = (v: unknown): number[] | undefined => {
            if (v == null || v === "") return undefined;
            const raw = Array.isArray(v) ? v : String(v).split(",");
            const nums = raw.map((item) => Number(String(item).trim())).filter((n) => !isNaN(n));
            return nums.length > 0 ? nums : undefined;
        };
        const toBool = (v: unknown): boolean | undefined => {
            if (v == null || v === "") return undefined;
            return String(v) === "true";
        };

        const result = await EcomProductListService.offerProducts({
            page: toNum(q.page) ?? 1,
            limit: toNum(q.limit) ?? 10,
            search: q.search ? String(q.search) : undefined,
            categoryID: toNumArray(q.categoryID),
            brandID: toNumArray(q.brandID),
            unitID: toNumArray(q.unitID),
            featured: toBool(q.featured),
            published: toBool(q.published),
            inStock: toBool(q.inStock),
            minPrice: toNum(q.minPrice),
            maxPrice: toNum(q.maxPrice),
            minRating: toNum(q.minRating),
            sort: (q.sort ? String(q.sort) : "bestSelling") as EcomProductListQuery["sort"],
        });
        return res.status(200).json({ success: true, data: result });
    }
}

// ─── Ecom Order Controller ──────────────────────────────────────────────────

export class EcomOrderController {
    static async checkout(req: Request, res: Response) {
        const userID = (req as any).user!.id;
        const result = await EcomOrderService.createOrder(userID, req.body);
        res.status(201).json({ success: true, data: result });
    }

    static async myOrders(req: Request, res: Response) {
        const userID = (req as any).user!.id;
        const { page, limit } = req.query;
        const data = await EcomOrderService.getMyOrders(userID, Number(page) || 1, Number(limit) || 10);
        return res.status(200).json({ success: true, data });
    }

    static async myOrderDetail(req: Request, res: Response) {
        const userID = (req as any).user!.id;
        const orderNo = req.params.orderNo as string;
        const data = await EcomOrderService.getMyOrderDetail(userID, orderNo);
        return res.status(200).json({ success: true, data });
    }

    static async cancelOrder(req: Request, res: Response) {
        const userID = (req as any).user!.id;
        const orderNo = req.params.orderNo as string;
        const result = await EcomOrderService.cancelOrder(userID, orderNo);
        return res.status(200).json({ success: true, ...result });
    }

    static async orderSuccess(req: Request, res: Response) {
        const userID = (req as any).user!.id;
        const { session_id, orderNo } = req.query;
        const data = await EcomOrderService.confirmOrderSuccess(
            userID,
            session_id as string | undefined,
            orderNo as string | undefined,
        );
        return res.status(200).json({ success: true, data });
    }

    static async publicOrderTracking(req: Request, res: Response) {
        const orderNo = req.params.orderNo as string;
        const data = await EcomOrderService.getPublicOrder(orderNo);
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

        await EcomOrderService.handleStripeWebhook(event);
        res.status(200).json({ received: true });
    }

    static async adminUpdateOrderStatus(req: Request, res: Response) {
        const orderNo = req.params.orderNo as string;
        const { status } = req.body;
        const result = await EcomOrderService.updateOrderStatus(orderNo, status);
        return res.status(200).json({ success: true, ...result });
    }

    static async adminConfirmSale(req: Request, res: Response) {
        const orderNo = req.params.orderNo as string;
        const result = await EcomOrderService.createSaleForCodOrder(orderNo);
        return res.status(200).json({ success: true, ...result });
    }

    static async adminDeleteOrder(req: Request, res: Response) {
        const orderNo = req.params.orderNo as string;
        const result = await EcomOrderService.deleteOrder(orderNo);
        return res.status(200).json({ success: true, ...result });
    }
}
