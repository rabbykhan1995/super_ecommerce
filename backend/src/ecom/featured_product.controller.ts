import { Request, Response } from "express";
import { FeaturedProductService } from "./featured_product.service";

export class FeaturedProductController {
    static async add(req: Request, res: Response) {
        const product = await FeaturedProductService.add(req.body);
        res.status(201).json({ success: true, data: product, msg: "Featured product added" });
    }

    static async remove(req: Request, res: Response) {
        const { id } = req.params;
        await FeaturedProductService.remove(Number(id));
        res.status(200).json({ success: true, message: "Featured product removed" });
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
