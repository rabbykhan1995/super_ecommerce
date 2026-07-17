import { Request, Response } from "express";
import { BannerService } from "./banner.service";

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
