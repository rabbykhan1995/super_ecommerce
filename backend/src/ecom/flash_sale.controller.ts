import { Request, Response } from "express";
import { FlashSaleService } from "./flash_sale.service";

export class FlashSaleController {
    static async createSale(req: Request, res: Response) {
        const sale = await FlashSaleService.createSale(req.body);
        res.status(201).json({ success: true, data: sale, msg: "Flash sale created" });
    }

    static async updateSale(req: Request, res: Response) {
        const { id } = req.params;
        const sale = await FlashSaleService.updateSale(Number(id), req.body);
        res.status(200).json({ success: true, data: sale, msg: "Flash sale updated" });
    }

    static async deleteSale(req: Request, res: Response) {
        const { id } = req.params;
        await FlashSaleService.deleteSale(Number(id));
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
        res.status(201).json({ success: true, data: product, msg: "Product added to flash sale" });
    }

    static async removeProduct(req: Request, res: Response) {
        const { id } = req.params;
        await FlashSaleService.removeProduct(Number(id));
        res.status(200).json({ success: true, message: "Product removed from flash sale" });
    }

    static async productsBySaleID(req: Request, res: Response) {
        const { id } = req.params;
        const products = await FlashSaleService.productsBySaleID(Number(id));
        return res.status(200).json({ success: true, data: products });
    }
}
