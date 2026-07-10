import { ClientSession } from "mongoose";
import { ApiError } from "../../utils/ApiError";
import Helper from "../../utils/helper";
import ContactService from "../contact/contact.service";
import ProductService from "../product/product.service";
import { CreateFifoSaleInput, CreateSaleInput, Sale, } from "./sale.type";
import SaleRepository from "./sale.repository";
import { AccountService } from "../account/account.service";
import TransactionService from "../transaction/transaction.service";
import LedgerService from "../ledger/ledger.service";
import { RedisReportService } from "../../utils/ReportServiceRedis";
import WarrantyService from "../warranty/warranty.service";
import PurchaseService from "../purchase/purchase.service";
import { withTransaction } from "../../utils/withTransaction";
import { QueryClient } from "../../drizzle/src";
import { Contact } from "../contact/contact.type";
import { WarrantyPayload } from "../warranty/warranty.type";
import { TransactionPayload } from "../transaction/transaction.type";
import { LedgerPayload } from "../ledger/ledger.type";


export default class SaleService {
    static async create(payload: CreateSaleInput) {
        let sale = payload.sale;
        const products = payload.products;
        const accounts = payload.accounts;
        const exchangeAccounts = payload.exchangeAccounts;
        let customer: Contact | null;

        if (sale.customerID) {

            customer = await ContactService.findByID(sale.customerID);
            if (!customer) throw new ApiError(404, "Customer not found");

            sale.balanceBefore = customer.balance ?? 0;
            sale.balanceAfter = sale.paid - (sale.totalAmount - sale.balanceBefore);

        }

        await withTransaction(async (tx: QueryClient) => {

            const salePayload = sale;

            const saleCreated = await SaleRepository.create(salePayload, tx);

            //  update each batch by reducing thier remaining stock;
            await Promise.all(
                products.map(async (p) => {

                    const [product, batch, variant] = await Promise.all([
                        ProductService.findById(p.productID),
                        ProductService.findBatchByIDForSale(p.batchID as number),
                        ProductService.findVariantByID(p.variantID),
                    ]);

                    if (!product) throw new ApiError(404, `Product not found`);

                    if (!batch) throw new ApiError(404, `Batch not found`);

                    if (!variant) {
                        throw new ApiError(404, `Batch not found`);
                    }

                    // await ProductService.updateBatchDynamically(batch.id,
                    //     {
                    //         inc: { remainingQty: -p.soldQty },
                    //         ...(willBeEmpty && { set: { isActive: false } }),
                    //     }, tx)

                    if (product?.manageStock) {

                        if (batch.remainingQty < p.soldQty) {

                            throw new ApiError(400, `Insufficient stock for ${product.name}. Available: ${batch.remainingQty}`);

                        }

                        Promise.all(
                            [
                                await ProductService.decreaseProductStock(p.productID, p.soldQty, tx),
                                await ProductService.decreaseVariantStock(p.variantID, p.soldQty, tx),
                                await ProductService.decreaseBatchStock(p.batchID as number, p.soldQty)
                            ]
                        )
                    }


                    // now warranty will create on this product
                    if (product?.manageWarranty && !!batch.serial) {

                        const purchase = await PurchaseService.purchaseByID(batch.purchaseID as number, tx);

                        const warrantyPayload: WarrantyPayload = {
                            saleID: saleCreated.id,
                            customerID: customer! ? customer.id : null,
                            supplierID: purchase.supplierID,
                            productID: p.productID,
                            batchID: p.batchID!,
                            serial: batch.serial!,
                            salePrice: p.salePrice,
                            warranty: p.warranty as number,
                            saleDate: saleCreated.saleDate,
                            expireDate: Helper.getWarrantyExpireDate(saleCreated.saleDate, p.warranty!),
                        }
                        await WarrantyService.create(warrantyPayload, tx);
                    }

                    await ProductService.createStockFlow({
                        productID: p.productID,
                        batchID: p.batchID!,
                        variantID: p.variantID,
                        type: "out",
                        referenceType: "sale",
                        saleID: saleCreated.id,
                        qty: p.soldQty,
                        beforeQty: batch.remainingQty,
                        afterQty: batch.remainingQty - p.soldQty,
                    }, tx);

                    await SaleRepository.createSaleItem({
                        saleID: saleCreated.id,
                        batchID: p.batchID!,
                        productID: p.productID,
                        variantID: p.variantID,
                        salePrice: p.salePrice,
                        soldQty: p.soldQty,
                        warranty: p.warranty ?? 0,
                    }, tx)



                })
            );
            //  Accounts
            const isPaymentHappened: boolean = saleCreated.paid > 0;
            if (isPaymentHappened) {
                // accounts balance update
                await AccountService.increaseBalance(accounts, tx);

                await Promise.all(accounts.map(async (a) => {
                    const transactionPayload: TransactionPayload = {
                        source: "sale",
                        saleID: saleCreated.id,
                        type: "credit",
                        date: saleCreated.saleDate,
                        accountID: a.accountID,
                        amount: a.amount,
                    }
                    await TransactionService.create(transactionPayload, tx);
                }))


            }

            const isExchangeHappened: boolean = saleCreated.exchangeAmount > 0;
            if (isExchangeHappened) {
                await AccountService.decreaseBalance(exchangeAccounts, tx);

                await Promise.all(exchangeAccounts.map(async (a) => {
                    const transactionPayload: TransactionPayload = {
                        source: "sale",
                        saleID: saleCreated.id,
                        type: "debit",
                        date: saleCreated.saleDate,
                        accountID: a.accountID,
                        amount: a.amount,
                    }
                    await TransactionService.create(transactionPayload, tx);
                }))
            }
            // ledger
            if (customer) {
                const amount = sale.balanceAfter - sale.balanceBefore;
                await ContactService.increaseBalance(customer.id, amount, tx);
                // Ekhane Transaction & Ledger er logic bosbe customer er...
                const payableAmount: number = sale.totalAmount - (sale.balanceBefore || 0)
                const ledgerPayload: LedgerPayload = {
                    type: "sale",
                    saleID: saleCreated.id,
                    contactID: customer.id,
                    amount: payableAmount,
                    discount: sale.discount,
                    paidAmount: sale.paid,
                    dueAmount: payableAmount - sale.paid,
                    note: sale.note ?? "",
                    date: sale.saleDate,
                    balanceAfter: sale.balanceAfter,
                    balanceBefore: sale.balanceBefore
                };

                await LedgerService.create(ledgerPayload, tx);
            }


            await RedisReportService.updateSaleReport({
                amount: sale.totalAmount,
                qty: products.reduce((sum, p) => sum + p.soldQty, 0),
                due: sale.totalAmount - sale.paid,
                paid: sale.paid,
                discount: sale.discount ?? 0,
                date: saleCreated.saleDate
            });
            return saleCreated
        })

    }

    static async list(query: any) {
        return await SaleRepository.list(query);
    }

    static async saleInvoiceByID(saleID: number) {

        const sale: Sale = await SaleRepository.getSaleByID(saleID);

        if (!sale) {

            throw new ApiError(404, "sale not found");

        }

        let transactions;

        let exchangeTransactions;

        if (sale.paid > 0) {
            const allTransactions = await TransactionService.findBySourceID(sale.id, "sale");

            transactions = allTransactions.filter(t => t.type === "credit");

            if (sale.exchangeAmount > 0) {

                exchangeTransactions = allTransactions.filter(t => t.type === "debit");

            }
        }

        const saleProducts = await SaleRepository.getSoldProductsBySaleID(saleID);

        return {

            ...sale,

            ...(sale.exchangeAmount > 0 ? {
                ...exchangeTransactions!.map((t) => ({
                    name: t.account.name,
                    amount: t.amount
                }))
            } : {}),

            ...(sale.paid > 0 ? {
                ...transactions!.map((t) => ({
                    name: t.account.name,
                    amount: t.amount
                }))
            } : {}),

            products: saleProducts,

        }

    }

    static async delete(id: number) {
        
        const sale = await SaleRepository.getSaleByID(id);

        if (!sale) throw new ApiError(404, "Sale not found");

        if (!sale.deletable) {

            throw new ApiError(400, "Sale can not be deleted");
        }

        await withTransaction(async (tx) => {

            const saleItems = await SaleRepository.getSoldProductsBySaleID(id, tx)

            await Promise.all(
                saleItems
                    .map(async (p) => {
                        await Promise.all(
                            [
                                ProductService.increaseBatchStock(p.batchID, p.soldQty, tx),
                                ProductService.increaseProductStock(p.productID, p.soldQty, tx),
                                ProductService.increaseVariantStock(p.variantID, p.soldQty, tx)
                            ]
                        );
                    })
            );

            const allTransactions = await TransactionService.findBySourceID(sale.id, "sale");
            // account balance reverse
            const isPaymentHappened: boolean = sale.paid > 0
            if (isPaymentHappened) {

                const accTrans = allTransactions.filter(a => a.type === "credit");

                const accounts = accTrans.map(a => ({ accountID: a.accountID, amount: a.amount as number }));

                await AccountService.decreaseBalance(
                    accounts, tx
                );
            }
            const isExchangeHappened: boolean = sale.exchangeAmount > 0;
            if (isExchangeHappened) {

                const accTrans = allTransactions.filter(a => a.type === "debit");

                const exchangeAccounts = accTrans.map(a => ({ accountID: a.accountID, amount: a.amount as number }));
                await AccountService.increaseBalance(exchangeAccounts, tx);
            }

            // customer balance restore
            if (sale.customerID) {
                const rollbackAmount = -(sale.balanceAfter - sale.balanceBefore)
                await ContactService.increaseBalance(
                    sale.customerID,
                    rollbackAmount,
                    tx
                );
            }

            await SaleRepository.delete(sale.id, tx);


            await RedisReportService.updateSaleReport({
                amount: -sale.totalAmount,
                qty: -saleItems.reduce((sum, p) => sum + p.soldQty, 0),
                due: -(sale.totalAmount - sale.paid),
                paid: -sale.paid,
                discount: -(sale.discount ?? 0),
                date: sale.saleDate,
            });
        })


    }

    static async getSaleByID(saleID: number) {
        return await SaleRepository.getSaleByID(saleID);
    }



    static async fifoSale(payload: CreateFifoSaleInput) {
        // Ekhane ki hobe: Prottek ta product je rack a sajano thakbe, seta ekdom old stock er ta, tahole ei sale ta applicable hobe, tachara eta risky hobe..ba problem hobe...
        let sale = payload.sale;
        const products = payload.products;
        const accounts = payload.accounts;
        const exchangeAccounts = payload.exchangeAccounts;
        let customer: Contact | null;

        if (sale.customerID) {
            // const contactID = new Types.ObjectId(sale.contactID as string);
            customer = await ContactService.findByID(sale.customerID);
            if (!customer) throw new ApiError(404, "Customer not found");

            sale.balanceBefore = customer.balance ?? 0;
            sale.balanceAfter = sale.paid - (sale.totalAmount - sale.balanceBefore);

        }

        await withTransaction(async (tx) => {

            await Promise.all(products.map(async (p) => {

                const [product, variant] = await Promise.all([
                    ProductService.findById(p.productID),
                    ProductService.findVariantByID(p.variantID),
                ]);

                if (!product) throw new ApiError(404, `Product not found`);

                if (!variant) {
                    throw new ApiError(404, `Batch not found`);
                }

                if (!product.manageStock) {
                    const [batch] = await ProductService.findBatchesByVariantID(p.variantID);


                    // ekhane baki jinish hobe, jemon sale_items+stockFlow hobe.
                    await ProductService.createStockFlow({
                        productID: p.productID,
                        batchID: batch.id,
                        variantID: batch.variantID,
                        type: "out",
                        referenceType: "sale",
                        saleID: saleCreated.id,
                        qty: p.soldQty,
                        beforeQty: batch.remainingQty,
                        afterQty: batch.remainingQty - p.soldQty,
                    }, tx);

                    await SaleRepository.createSaleItem({
                        saleID: saleCreated.id,
                        batchID: batch.id,
                        productID: batch.productID,
                        variantID: batch.variantID,
                        salePrice: p.salePrice,
                        soldQty: p.soldQty,
                        warranty: 0,
                    }, tx)

                }

                if (product.manageWarranty) {
                    throw new ApiError(400, `${product.name} ${variant.attributes[0].name} - ${variant.attributes[0].value} is a warranty product, please choose another sale method`);
                }

                const fifoBatches = await ProductService.getFifoBatchesByVariantID(variant.id);

                if (fifoBatches.length === 0) {
                    throw new ApiError(400, `${product.name} ${variant.attributes[0].name} - ${variant.attributes[0].value} has no stock`);
                }


                // ekhan theke for (const item of allocations) { ei porjonto fifo logic
                // __________________
                // Fifo Start
                // __________________
                let remainingSoldQty = p.soldQty;

                const allocations: {
                    batchID: number;
                    qty: number;
                    costPrice: number;
                    beforeQty: number;
                    afterQty: number;
                }[] = [];

                for (const batch of fifoBatches) {
                    if (remainingSoldQty <= 0) break;

                    const available = batch.remainingQty;

                    if (available <= 0) continue;

                    const qty = Math.min(available, remainingSoldQty);

                    allocations.push({
                        batchID: batch.id,
                        qty,
                        costPrice: batch.cost,
                        beforeQty: batch.remainingQty,
                        afterQty: batch.remainingQty - qty,
                    });

                    remainingSoldQty -= qty;
                }

                if (remainingSoldQty > 0) {
                    throw new ApiError(
                        400,
                        `${product.name} ${variant.attributes[0].name} - ${variant.attributes[0].value} has not enough stock`
                    );
                }

                for (const item of allocations) {

                    await Promise.all([
                        await ProductService.createStockFlow({
                        productID: p.productID,
                        batchID: item.batchID,
                        variantID: p.variantID,
                        type: "out",
                        referenceType: "sale",
                        saleID: saleCreated.id,
                        qty: item.qty,
                        beforeQty: item.beforeQty,
                        afterQty: item.afterQty,
                    }, tx),

                    await SaleRepository.createSaleItem({
                        saleID: saleCreated.id,
                        batchID: item.batchID,
                        productID: p.productID,
                        variantID: p.variantID,
                        salePrice: p.salePrice,
                        soldQty: item.qty,
                        warranty: 0,
                    }, tx),

                    await ProductService.decreaseBatchStock(
                        item.batchID,
                        item.qty,
                        tx
                    ),

                    await ProductService.decreaseProductStock(p.productID, item.qty, tx),

                    await ProductService.decreaseVariantStock(p.variantID, item.qty, tx)
                ])

                }
                // __________________
                // Fifo End
                // __________________
            }))
            // purchase create
            const saleCreated = await SaleRepository.create(sale, tx);

            //  Accounts
            const isPaymentHappened: boolean = saleCreated.paid > 0;
            if (isPaymentHappened) {
                // accounts balance update
                await AccountService.increaseBalance(accounts, tx);

                await Promise.all(accounts.map(async (a) => {
                    const transactionPayload: TransactionPayload = {
                        source: "sale",
                        saleID: saleCreated.id,
                        type: "credit",
                        date: saleCreated.saleDate,
                        accountID: a.accountID,
                        amount: a.amount,
                    }
                    await TransactionService.create(transactionPayload, tx);
                }))


            }
            const isExchangeHappened: boolean = saleCreated.exchangeAmount > 0;
            if (isExchangeHappened) {
                await AccountService.decreaseBalance(exchangeAccounts, tx);

                await Promise.all(exchangeAccounts.map(async (a) => {
                    const transactionPayload: TransactionPayload = {
                        source: "sale",
                        saleID: saleCreated.id,
                        type: "debit",
                        date: saleCreated.saleDate,
                        accountID: a.accountID,
                        amount: a.amount,
                    }
                    await TransactionService.create(transactionPayload, tx);
                }))
            }

            if (customer) {
                const amount = sale.balanceAfter - sale.balanceBefore;

                await ContactService.increaseBalance(customer.id, amount, tx);

                // Ekhane Transaction & Ledger er logic bosbe customer er...
                const payableAmount: number = sale.totalAmount - (sale.balanceBefore || 0)

                const ledgerPayload: LedgerPayload = {
                    type: "sale",
                    saleID: saleCreated.id,
                    contactID: customer.id,
                    amount: payableAmount,
                    discount: sale.discount,
                    paidAmount: sale.paid,
                    dueAmount: payableAmount - sale.paid,
                    note: sale.note ?? "",
                    date: sale.saleDate,
                    balanceAfter: sale.balanceAfter,
                    balanceBefore: sale.balanceBefore
                };

                await LedgerService.create(ledgerPayload, tx);
            }


            await RedisReportService.updateSaleReport({
                amount: sale.totalAmount,
                qty: products.reduce((sum, p) => sum + p.soldQty, 0),
                due: sale.totalAmount - sale.paid,
                paid: sale.paid,
                discount: sale.discount ?? 0,
                date: sale.saleDate
            });
            return saleCreated
        })

    }
}