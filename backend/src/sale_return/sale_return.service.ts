import mongoose from "mongoose";
import { ApiError } from "../../utils/ApiError";
import SaleService from "../sale/sale.service";
import { CreateSaleReturnInput } from "./sale_return.type";
import { ContactResponse } from "../contact/contact.type";
import ContactService from "../contact/contact.service";
import ProductService from "../product/product.service";
import { BatchResponse } from "../product/product.type";
import SaleReturnRepository from "./sale_return.repository";
import { AccountService } from "../account/account.service";
import PayloadBuilder from "../../utils/builder";
import TransactionService from "../transaction/transaction.service";
import LedgerService from "../ledger/ledger.service";
import { RedisReportService } from "../../utils/ReportServiceRedis";

export default class SaleReturnService {
    static async create(payload: CreateSaleReturnInput) {
        const { saleID, batches, accounts, note, paid, discount, date } = payload;

        const sale = await SaleService.getSaleByID(saleID);
        if (!sale) throw new ApiError(404, "Sale not found");

        const session = await mongoose.startSession();
        session.startTransaction();


        try {
            let customer: ContactResponse | null = null;
            if (sale.customerID) {
                customer = await ContactService.findByID(sale.customerID.toString())
                if (!customer) { throw new ApiError(404, "Customer not found"); }
            }

            let totalReturnAmount = 0;

            const batchDetails = await Promise.all(
                batches.map(async (item: any) => {
                    const batch: BatchResponse | null = await ProductService.findBatchByID(item.batchID.toString());
                    if (!batch) throw new ApiError(404, `Batch not found: ${item.batchID}`);

                    const alreadyReturned = batch.saleReturnedQty ?? 0;
                    const maxReturnable = batch.soldQty - alreadyReturned;

                    if (item.saleReturnQty > maxReturnable) {
                        throw new ApiError(400, `Max returnable qty is ${maxReturnable}`);
                    }

                    totalReturnAmount += item.saleReturnQty * batch.salePrice;

                    // Batch remainingQty বাড়াও, returnedQty বাড়াও
                    await ProductService.updateBatchDynamically(
                        item.batchID,
                        {
                            inc: {
                                remainingQty: item.saleReturnQty,
                                saleReturnedQty: item.saleReturnQty,
                            },

                            set: {
                                isActive: true,
                            },
                        },
                        session // ফেরত এলে আবার active
                    );

                    // Product stock বাড়াও
                    await ProductService.updateProductFifoBatchAndStock(batch.productID.toString(), {
                        qty: item.saleReturnQty // ✅
                    }, session);

                    // fifo batch update — যদি কোনো active batch না থাকে
                    const product = await ProductService.findById(batch.productID.toString(), session);
                    if (!product?.fifoBatchID) {
                        await ProductService.updateProductFifoBatchAndStock(batch.productID.toString(), {
                            fifoBatchID: batch._id.toString()
                        }, session);
                    }

                    return {
                        batchID: batch._id,
                        productID: batch.productID,
                        saleReturnedQty: item.saleReturnQty,
                        salePrice: batch.salePrice,
                        reason: item.reason,
                    };
                })
            );

            const totalPaid = accounts.reduce((s: number, a: any) => s + a.amount, 0);
            const balanceBefore = customer?.balance ?? 0;
            const balanceAfter = balanceBefore - totalReturnAmount + (totalReturnAmount - totalPaid);

            const saleReturnPayload = {
                saleID: sale._id,
                customerID: sale.customerID,
                note,
                totalAmount: totalReturnAmount,
                paid: totalPaid,
                balanceBefore,
                balanceAfter,
                discount: discount ?? 0,
                accounts,
                batches: batchDetails,
                date,
            }

            const saleReturn = await SaleReturnRepository.create(saleReturnPayload, session);

            if (totalPaid > 0 && accounts.length > 0) {

                await AccountService.decreaseBalance(accounts, session);

                const transactionPayload = PayloadBuilder.transaction(accounts, {
                    type: "sale_return",
                    typeModel: "SaleReturn",
                    typeID: saleReturn._id,
                    contactID: sale.customerID,
                    note,
                    status: "completed",
                    date: saleReturn.date,
                })

                await TransactionService.create(transactionPayload, session);


            }

            // ৫. Customer balance update + Ledger
            if (customer) {
                await ContactService.balanceUpdate(customer._id, saleReturn.paid, session)

                const ledgerPayload = PayloadBuilder.ledger({
                    typeID: saleReturn._id,
                    type: "sale_return",
                    contactID: customer._id,
                    contactType: "customer",
                    amount: totalReturnAmount,
                    paidAmount: totalPaid,
                    dueAmount: totalReturnAmount - totalPaid,
                    discount: discount ?? 0,
                    note: note ?? "",
                    date: saleReturn.date,
                    balanceBefore,
                    balanceAfter,
                })
                await LedgerService.create(ledgerPayload, session);
            }

            await SaleService.findAndUpdateByID(
                saleID,
                {
                    deletable: false,
                },
                session
            );

            await session.commitTransaction();

            await RedisReportService.updateSaleReturnReport({
                amount: totalReturnAmount,
                qty: batches.reduce((s: any, b: any) => s + b.saleReturnQty, 0),
                paid: totalPaid,
                discount: discount ?? 0,
                date: new Date(),
            });



        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    static async list(payload: any) {
        return await SaleReturnRepository.list(payload);
    }

    static async getSaleReturnBatches(id: string) {
        const sale = await SaleService.getSaleByID(id);

        if (!sale) throw new ApiError(404, "Sale not found");

        // sale এর products থেকে batchID গুলো নাও
        const batchIDs = sale.products
            .filter((p: any) => p.batchID);


        const batches = await ProductService.findSaleReturnBatches(batchIDs, sale);

        return batches;
    }

    static async delete(id: string) {
        const saleReturn = await SaleReturnRepository.findById(id);
        if (!saleReturn) throw new ApiError(404, "Sale return not found");

        const session = await mongoose.startSession();
        session.startTransaction();

        let customer = null;
        try {
            if (saleReturn.customerID) {
                customer = await ContactService.findByID(saleReturn.customerID.toString());

                if (!customer) {
                    throw new ApiError(404, "customer not found in sale return");
                }
            }
            await Promise.all(
                saleReturn.batches.map(async (item: any) => {
                    saleReturn.batches.map(async (item: any) => {
                        const updatedBatch: BatchResponse | null = await ProductService.updateBatchDynamically(item.batchID, {
                            inc: {
                                saleReturnedQty: -item.saleReturnedQty,
                                remainingQty: -item.saleReturnedQty,
                            }
                        }, session)

                        // stock ফেরত এলে active করো
                        if (updatedBatch && updatedBatch.remainingQty > 0 && !updatedBatch.isActive) {
                            await ProductService.updateBatchDynamically(item.batchID, {
                                set: {
                                    isActive: true
                                }
                            }, session)
                        }
                    });

                    await ProductService.updateProductFifoBatchAndStock(item.productID, { qty: item.saleReturnedQty }, session);

                })
            );

            // ৩. Account balance reverse
            if (saleReturn.paid > 0 && saleReturn.accounts.length > 0) {
                // decrease account balance
                await AccountService.decreaseBalance(saleReturn.accounts.map(a => ({ ...a, accountID: a.accountID.toString() })), session)

                // ৪. Transaction delete
                await TransactionService.deleteTransactions({ typeID: saleReturn._id }, session)

                // ৫. Ledger delete
                await LedgerService.deleteLedger({
                    typeID: saleReturn._id
                }, session)
                // ৬. Customer balance reverse
                if (!!customer) {
                    await ContactService.balanceUpdate(customer._id.toString(), saleReturn.paid, session);
                }

            }

            const otherReturns = await SaleReturnRepository.countOtherSaleReturns(
                saleReturn.saleID.toString(), saleReturn.saleID.toString(), session
            )

            if (otherReturns === 0) {
                await SaleService.findAndUpdateByID(
                    saleReturn.saleID.toString(),
                    { deletable: true },
                    session
                );
            }

            await SaleReturnRepository.delete(saleReturn._id.toString(), session);

            await session.commitTransaction();

               await RedisReportService.updateSaleReturnReport({
                amount:-saleReturn.batches.reduce((acc,b)=>acc+b.salePrice,0),
                qty: -saleReturn.batches.reduce((acc,b)=>acc+b.saleReturnedQty,0),
                paid: -saleReturn.paid,
                discount: -(saleReturn.discount ?? 0),
                date: new Date(),
            });
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    static async saleReturnInvoiceByID(id: string) {
        const saleReturn = await SaleReturnRepository.saleReturnInvoiceByID(id);
        if (!saleReturn) throw new ApiError(404, "Sale return not found");

    }
}