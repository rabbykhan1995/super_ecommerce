import { Request, Response } from "express";
import QuotationService from "./quotation.service";

export default class QuotationController {
    static async createSaleQuotation(req: Request, res: Response) {
        const quotation = await QuotationService.createSaleQuotation(req.body);
        res.status(201).json({ success: true, data: quotation, msg: "Quotation created successfully" });
    }

    static async listOfSaleQuotation(req: Request, res: Response) {
        const list = await QuotationService.listOfSaleQuotation(req.query);
        res.status(200).json({ success: true, data: list });
    }

    static async approveSaleQuotation(req: Request, res: Response) {
        const newSale = await QuotationService.approveSaleQuotation(Number(req.params.id), req.body);
        res.status(200).json({ success: true, data: newSale, msg: "Quotation has been Approved and Invoice has been generated successfully" });
    }

    static async getFullQuotation(req: Request, res: Response) {
        const fullQuotation = await QuotationService.getFullQuotation(Number(req.params.id));
        res.status(200).json({ success: true, data: fullQuotation });
    }

    static async getQuotationInvoice(req: Request, res: Response) {
        const fullQuotation = await QuotationService.getQuotationInvoice(Number(req.params.id));
        res.status(200).json({ success: true, data: fullQuotation });
    }
}