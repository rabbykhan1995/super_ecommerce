import { ApiError } from "../../utils/ApiError";
import ContactService from "../contact/contact.service";
import SaleService from "../sale/sale.service";
import { CreateSaleInput } from "../sale/sale.type";
import QuotationRepository from "./quotation.repository";
import { CreateSaleQuotationInput, QuotationStatus, SaleQuotationResponse } from "./quotation.type";

export default class QuotationService {
    static async createSaleQuotation(payload: CreateSaleQuotationInput) {
        const quote: SaleQuotationResponse | null = await QuotationRepository.createSaleQuotation({ ...payload, ...(payload.contactID ? { customerID: payload.contactID } : {}) });

        if (!quote) {
            throw new ApiError(401, "Qutoation creation failed");
        }

        return quote;
    }

    static async listOfSaleQuotation(query: any) {
        return await QuotationRepository.listOfSaleQuotation(query);
    }

    static async approveSaleQuotation(quoteID: string, payload: any) {
        const fullQuotation: SaleQuotationResponse | null =
            await QuotationRepository.getSaleQuotationByID(quoteID);

        if (!fullQuotation) {
            throw new ApiError(404, "Sale Quotation not found");
        }

        const fullQuotationObj: any = fullQuotation.toObject();


        const products = fullQuotationObj.products.map((p:any) => ({ ...p, productID: p.productID.toString(), batchID: p.batchID?.toString() || null }));
        const accounts = payload.accounts;
        const exchangeAccounts = payload.exchangeAccounts;

        // ✅ proper deep copy
        let sale: any = {...fullQuotationObj};
         
        sale.saleDate = payload.saleDate;
        // remove unwanted fields if needed
        delete sale._id;
        delete sale.createdAt;
        delete sale.updatedAt;

        // override values
        sale.paid = payload.paid;
        sale.exchangedAmount = payload.exchangeAmount;

        if (fullQuotation.customerID) {
            const customer = await ContactService.findByID(
                fullQuotation.customerID.toString()
            );
            sale.contactID = fullQuotationObj.customerID??payload.customerID;
            sale.balanceBefore = customer?.balance;
            sale.balanceAfter = sale.paid - (sale.totalAmount - sale.balanceBefore);
        }
        sale.saleDate = payload.saleDate??fullQuotation.SaleDate;
        const createSalePayload: CreateSaleInput = {
            sale,
            accounts,
            products,
            exchangeAccounts,
        };
     
        const saleCreated = await SaleService.create(createSalePayload);

        if (!saleCreated) {
            throw new ApiError(400, "Sale not created");
        }

        await QuotationRepository.updateStatusOfSaleQuotation(
            quoteID,
            "approved"
        );

        return saleCreated;
    }

    static async getFullQuotation(quoteID: string) {
        return await QuotationRepository.getSaleQuotationByID(quoteID);
    }
        static async getQuotationInvoice(quoteID: string) {
        return await QuotationRepository.getQuotationInvoice(quoteID);
    }

}