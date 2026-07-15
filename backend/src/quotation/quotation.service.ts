import { ApiError } from "../../utils/ApiError";

import ContactService from "../contact/contact.service";

import SaleService from "../sale/sale.service";

import { CreateSaleInput } from "../sale/sale.type";

import QuotationRepository from "./quotation.repository";

import { CreateSaleQuotationInput, QuotationStatus, SaleQuotation, SaleQuotationItemPayload, SaleQuotationPayload } from "./quotation.type";



export default class QuotationService {

    static async createSaleQuotation(payload: CreateSaleQuotationInput) {

        const { products, ...onlyQuote } = payload;



        const quote: SaleQuotation | null = await QuotationRepository.createSaleQuotation(onlyQuote);



        if (!quote) {

            throw new ApiError(401, "Qutoation creation failed");

        }

        

        const items:SaleQuotationItemPayload[] =  products.map(p=>({...p,quotationID:quote.id, warranty: p.warranty ?? undefined, }));



        

        const itemsCreated = await QuotationRepository.createSaleQuotationItems(items);



        return quote;

    }



    static async listOfSaleQuotation(query: any) {

        return await QuotationRepository.listOfSaleQuotation(query);

    }



    static async approveSaleQuotation(quoteID: number, payload: any) {

        const fullQuotation: SaleQuotation | null =

            await QuotationRepository.getSaleQuotationByID(quoteID);



        if (!fullQuotation) {

            throw new ApiError(404, "Sale Quotation not found");

        }



        const fullQuotationObj: any = fullQuotation;





        const products = fullQuotationObj.items.map((p:any) => ({ ...p, productID: p.productID, batchID: p.batchID || null }));

        const accounts = payload.accounts;

        const exchangeAccounts = payload.exchangeAccounts;



        // ✅ proper deep copy

        let sale: any = {...fullQuotationObj};

         

        sale.saleDate = payload.saleDate;

        // remove unwanted fields if needed

        delete sale._id;

        delete sale.createdAt;

        delete sale.updatedAt;

        delete sale.items;



        // override values

        sale.paid = payload.paid;

        sale.exchangedAmount = payload.exchangeAmount;



        if (fullQuotation.customerID) {

            const customer = await ContactService.findByID(

                fullQuotation.customerID

            );

            sale.contactID = fullQuotationObj.customerID??payload.customerID;

            sale.balanceBefore = customer?.balance;

            sale.balanceAfter = sale.paid - (sale.totalAmount - sale.balanceBefore);

        }

        sale.saleDate = payload.saleDate??fullQuotation.saleDate;

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



    static async getFullQuotation(quoteID: number) {

        return await QuotationRepository.getSaleQuotationByID(quoteID);

    }

        static async getQuotationInvoice(quoteID: number) {

          const quote:SaleQuotation = await QuotationRepository.getSaleQuotationByID(quoteID);

          if (!quote) {
            throw new ApiError(404, "Quotation not found");
          }

          const items = await QuotationRepository.getQuotationItemsByID(quoteID);

          return {
            ...quote,
            items,
          };
    }



}