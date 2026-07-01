import mongoose, { ClientSession } from "mongoose";
import { ApiError } from "../../utils/ApiError";
import Helper from "../../utils/helper";
import ContactService from "../contact/contact.service";
import ProductService from "../product/product.service";
import { CreateFifoSaleInput, CreateSaleInput, OnlySalePayload, Sale, SaleItemPayload } from "./sale.type";
import SaleCounter from "./saleCounter.model";
import SaleRepository from "./sale.repository";
import { AccountService } from "../account/account.service";
import PayloadBuilder from "../../utils/builder";
import TransactionService from "../transaction/transaction.service";
import LedgerService from "../ledger/ledger.service";
import { RedisReportService } from "../../utils/ReportServiceRedis";
import WarrantyService from "../warranty/warranty.service";
import PurchaseService from "../purchase/purchase.service";
import { withTransaction } from "../../utils/withTransaction";
import { QueryClient } from "../../drizzle/src";
import { Contact } from "../contact/contact.type";
import { Product } from "../product/product.type";
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
        let mainProducts: Product[] = [];

        if (sale.customerID) {
            // const contactID = new Types.ObjectId(sale.contactID as string);
            customer = await ContactService.findByID(sale.customerID);
            if (!customer) throw new ApiError(404, "Customer not found");

            sale.balanceBefore = customer.balance ?? 0;
            sale.balanceAfter = sale.paid - (sale.totalAmount - sale.balanceBefore);

        }

        await withTransaction(async (tx: QueryClient) => {

            // stock checking before sale
            await Promise.all(
                products.map(async (p) => {
                    const [product, batch, variant] = await Promise.all([
                        ProductService.findById(p.productID),
                        ProductService.findBatchByID(p.batchID as number),
                        ProductService.findVariantByID(p.variantID),
                    ]);

                    if (!product) throw new ApiError(404, `Product not found`);
                    mainProducts.push(product);

                    const soldQty = product.decimal ? Helper.roundQty(p.soldQty) : p.soldQty;

                    p.soldQty = soldQty;

                    if (!product.manageStock) return;

                    if (!batch) throw new ApiError(404, `Batch not found`);

                    if (!variant) {
                        throw new ApiError(404, `Batch not found`);
                    }
                    if (batch.remainingQty < soldQty) {
                        throw new ApiError(400, `Insufficient stock for ${product.name}. Available: ${batch.remainingQty}`);
                    }

                })
            );



            const salePayload = sale;

            const saleCreated = await SaleRepository.create(salePayload, tx);

            //  update each batch by reducing thier remaining stock;
            await Promise.all(
                products.map(async (p) => {

                    const batch = await ProductService.findBatchByIDForSale(p.batchID!, tx);
                    if (!batch) return;

                    const newQty = batch.remainingQty - p.soldQty;
                    const willBeEmpty = newQty <= 0;

                    await ProductService.updateBatchDynamically(batch.id,
                        {
                            inc: { remainingQty: -p.soldQty },
                            ...(willBeEmpty && { set: { isActive: false } }),
                        }, tx)


                    const mainProduct = mainProducts.find(
                        (prod: any) => prod.id === p.productID
                    );

                    if (mainProduct?.manageStock) {
                        await ProductService.decreaseProductStock(
                            p.productID,
                            p.soldQty,
                            tx
                        );
                    }


                    // now warranty will create on this product
                    if (mainProduct?.manageWarranty && !!batch.serial) {
                        const purchase = await PurchaseService.purchaseByID(batch.purchaseID as number, tx);
                        const warrantyPayload: WarrantyPayload = {
                            saleID: saleCreated.id,
                            customerID: customer! ? customer.id : null,
                            supplierID: purchase!.supplierID,
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

                    await ProductService.decreaseVariantStock(p.variantID, p.soldQty, tx);

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

    static async findAndUpdateByID(
        id: string,
        update: Record<string, any>,
        session?: ClientSession
    ) {
        return SaleRepository.findAndUpdateByID(
            id,
            update,
            session
        );
    }

    static async fifoSale(payload: CreateFifoSaleInput) {
        // Ekhane ki hobe: Prottek ta product je rack a sajano thakbe, seta ekdom old stock er ta, tahole ei sale ta applicable hobe, tachara eta risky hobe..ba problem hobe...
        let sale = payload.sale;
        const products = payload.products;
        const accounts = payload.accounts;
        const exchangeAccounts = payload.exchangeAccounts;
        let customer;
        let mainProducts: any = [];

        if (sale.customerID) {
            // const contactID = new Types.ObjectId(sale.contactID as string);
            customer = await ContactService.findByID(sale.customerID);
            if (!customer) throw new ApiError(404, "Customer not found");

            sale.balanceBefore = customer.balance ?? 0;
            sale.balanceAfter = sale.paid - (sale.totalAmount - sale.balanceBefore);

        }


        // stock checking before sale
        await Promise.all(
            products.map(async (p) => {
                const product = await ProductService.findById(p.productID);

                if (!product) {
                    throw new ApiError(404, `Product not found`);
                }

                if (product.manageWarranty) {
                    throw new ApiError(401, `Warranty Products are not acceptable`);
                }

                mainProducts.push(product);

                const soldQty = product.decimal
                    ? Helper.roundQty(p.soldQty)
                    : p.soldQty;

                p.soldQty = soldQty;

                // ✅ ONLY validate stock if manageStock is true
                if (product.manageStock) {
                    if (product.stock < soldQty) {
                        throw new ApiError(
                            400,
                            `Insufficient stock for ${product.name}. Available: ${product.stock}`
                        );
                    }
                }

                // ❌ manageStock === false → skip validation (unlimited sale)
            })
        );

        await withTransaction(async (tx) => {
            const formattedProducts = products.map(p => ({
                ...p,
                productID: p.productID,
                batchID: null,
                warranty: 0
            }));

            // purchase create




            const saleCreated = await SaleRepository.create(sale, tx);

            //  update each batch by reducing thier remaining stock on PurchaseDate;
            await Promise.all(
                products.map(async (p) => {

                    const mainProduct = mainProducts.find(
                        (prod: any) => prod._id.toString() === p.productID
                    );

                    if (!mainProduct.manageStock) {
                        return;
                    }

                    const batches = await ProductService.findBatchesByVariantID(p.variantID);



                    if (batches.length === 0) {
                        throw new ApiError(400, "No active batches available at this moment");
                    }

                    const selectedFifoBatch = batches[0];
                    if (selectedFifoBatch.remainingQty < p.soldQty) {
                        throw new ApiError(400, "Sorry you can not sale the access amount of fifo batch");
                    }
                    const newQty = selectedFifoBatch.remainingQty - p.soldQty;
                    const willBeEmpty = newQty <= 0;

                    await ProductService.updateBatchDynamically(selectedFifoBatch.id,
                        {
                            inc: { remainingQty: -p.soldQty, soldQty: p.soldQty },
                            ...(willBeEmpty && { set: { isActive: false } }),
                        }, session)


                    await ProductService.updateProductFifoBatchAndStock(
                        p.productID,
                        { qty: -p.soldQty },
                        session
                    );



                })
            );
            //  Accounts
            const isPaymentHappened: boolean = saleCreated[0].paid > 0;
            if (isPaymentHappened) {
                // accounts balance update
                await AccountService.increaseBalance(accounts, session);
                const transactionPayload = PayloadBuilder.transaction(accounts, { type: "sale", typeID: saleCreated[0]._id, typeModel: "Sale", date: sale.saleDate ?? new Date(), status: "completed", accountField: "toAccount" })

                await TransactionService.create(transactionPayload, session);
            }
            const isExchangeHappened: boolean = saleCreated[0].exchangeAmount > 0;
            if (isExchangeHappened) {
                await AccountService.decreaseBalance(exchangeAccounts, session);
                const transactionPayload = PayloadBuilder.transaction(exchangeAccounts, { type: "exchange", typeID: saleCreated[0]._id, typeModel: "Sale", date: sale.saleDate ?? new Date(), status: "completed", accountField: "fromAccount" })
                await TransactionService.create(transactionPayload, session);
            }
            // ledger
            if (customer) {
                //ekhane kichu update korte hobe, balance update korar somoy sale.paid dicchi, eta wrong value calculate korche...tai thik value dite hobe and fix korte hobe.   

                const amount = sale.balanceAfter - sale.balanceBefore;
                await ContactService.balanceUpdate(customer._id, amount, session);
                // Ekhane Transaction & Ledger er logic bosbe customer er...
                const payableAmount: number = sale.totalAmount - (sale.balanceBefore || 0)
                const ledgerPayload = PayloadBuilder.ledger({
                    type: "sale",
                    typeID: saleCreated[0]._id,
                    typeModel: "Sale",
                    contactID: customer._id,
                    contactType: "customer",
                    amount: payableAmount,
                    discount: sale.discount,
                    paidAmount: sale.paid,
                    dueAmount: payableAmount - sale.paid,
                    note: sale.note ?? "",
                    date: sale.saleDate,
                    balanceAfter: sale.balanceAfter,
                    balanceBefore: sale.balanceBefore
                })

                await LedgerService.create(ledgerPayload, session);
            }

            await session.commitTransaction();

            await RedisReportService.updateSaleReport({
                amount: sale.totalAmount,
                qty: products.reduce((sum, p) => sum + p.soldQty, 0),
                due: sale.totalAmount - sale.paid,
                paid: sale.paid,
                discount: sale.discount ?? 0,
                date: sale.saleDate
            });
            return saleCreated[0]
        })

    }
}