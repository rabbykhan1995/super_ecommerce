import mongoose, { Types } from "mongoose";
import { ApiError } from "../../utils/ApiError";
import PurchaseService from "../purchase/purchase.service";
import { CreatePurchaseReturnInput, PurchaseReturnResponse } from "./purchase_return.type";
import ContactService from "../contact/contact.service";
import { BatchResponse } from "../product/product.type";
import ProductService from "../product/product.service";
import PurchaseReturnRepository from "./purchase_return.repository";
import { AccountService } from "../account/account.service";
import TransactionService from "../transaction/transaction.service";
import PayloadBuilder from "../../utils/builder";
import LedgerService from "../ledger/ledger.service";
import { RedisReportService } from "../../utils/ReportServiceRedis";

export default class PurchaseReturnService {
    static async create(payload: CreatePurchaseReturnInput) {
        const { purchaseID, batches, accounts, note, paid, discount, date } = payload;
        // batches = [{ batchID, returnQty, reason }]
        // accounts = [{ accountID, amount }]
        const purchase = await PurchaseService.purchaseByID(purchaseID);

        if (!purchase) throw new ApiError(404, "Purchase not found");
        const session = await mongoose.startSession();
        session.startTransaction();


        try {
            // ২. Supplier আনো
            const supplier = await ContactService.findByID(purchase.supplierID.toString());
            if (!supplier) throw new ApiError(404, "Supplier not found");

            // ৩. Batches validate + stock reverse
            let totalReturnAmount = 0;

            const batchDetails = await Promise.all(
                batches.map(async (item: any) => {
                    const batch: BatchResponse | null = await ProductService.findBatchByID(item._id, session);

                    if (!batch) throw new ApiError(404, `Batch not found: ${item.batchID}`);

                    const alreadyReturned = batch.purchaseReturnedQty ?? 0;
                    const maxReturnable = batch.purchasedQty - alreadyReturned;

                    if (item.purchaseReturnQty > maxReturnable) {
                        throw new ApiError(400, `Max returnable qty is ${maxReturnable}`);
                    }

                    totalReturnAmount += item.purchaseReturnQty * batch.purchasePrice;

                    // Batch returnedQty বাড়াও
                    await ProductService.updateBatchDynamically(item.batchID, { inc: { purchaseReturnedQty: item.purchaseReturnQty, remainingQty: -item.purchaseReturnQty } }, session)

                    // Product stock কমাও
                    await ProductService.updateProductFifoBatchAndStock(batch.productID.toString(), { qty: -item.purchaseReturnQty }, session)

                    return {
                        batchID: batch._id,
                        productID: batch.productID,
                        purchaseReturnedQty: item.purchaseReturnQty,
                        purchasePrice: batch.purchasePrice,
                        reason: item.reason,
                    };
                })
            );

            const totalPaid = accounts.reduce((s: number, a: any) => s + a.amount, 0);
            const purchaseReturnPayload = {
                purchaseID: purchase._id,
                supplierID: supplier._id,
                note,
                totalAmount: totalReturnAmount,
                paid: totalPaid,
                balanceBefore: supplier.balance,
                balanceAfter: supplier.balance,
                discount: discount ?? 0,
                accounts,
                batches: batchDetails,
                date: date,

            }
            const purchaseReturn = await PurchaseReturnRepository.createPurchaseReturn(purchaseReturnPayload, session);

            // ৪. Account balance বাড়াও (টাকা ফেরত দিচ্ছো)

            if (totalPaid > 0 && accounts.length > 0) {
                await AccountService.increaseBalance(accounts, session);

                // Transaction create
                const groupID = new Types.ObjectId();

                const transactionPayloads = PayloadBuilder.transaction(accounts, {
                    groupID,
                    type: "purchase_return",
                    typeID: purchaseReturn._id,
                    typeModel: "PurchaseReturn",
                    contactID: supplier._id,
                    note,
                    accountField: "toAccount",
                    status: "completed",
                    date: purchaseReturn.date,
                })

                await TransactionService.create(transactionPayloads, session)

                // ৫. Supplier balance update
                const balanceBefore = supplier.balance ?? 0;
                const balanceAfter = balanceBefore - totalReturnAmount + (totalReturnAmount - totalPaid);

                await ContactService.balanceUpdate(supplier._id.toString(), -paid, session);


                // ৬. Ledger create

                const ledgerPayload = PayloadBuilder.ledger({
                    typeID: purchaseReturn._id,
                    type: "purchase_return",
                    contactID: supplier._id,
                    contactType: "supplier",
                    amount: totalReturnAmount,
                    paidAmount: totalPaid,
                    dueAmount: totalReturnAmount - totalPaid,
                    discount: discount ?? 0,
                    note: note ?? "",
                    date: purchaseReturn.date,
                    balanceBefore,
                    balanceAfter,
                })
                await LedgerService.create(ledgerPayload, session);
            }

            purchase.deletable = false;
            await purchase.save({ session });

            await PurchaseService.purchaseUpdateDynamic(purchaseID, { deletable: false }, session);
            await session.commitTransaction();

            // ৮. Report update
            await RedisReportService.updatePurchaseReturnReport({
                amount: totalReturnAmount,
                qty: batches.reduce((s: any, b: any) => s + b.purchaseReturnQty, 0),
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

    static async list(query: any) {
        return await PurchaseReturnRepository.list(query);
    }

    static async purchaseReturnInvoiceByID(id: string) {
        const result = await PurchaseReturnRepository.purchaseReturnInvoiceByID(id);

        if (!result) {
            throw new ApiError(404, "Purchase Invoice generation failed");
        }

        return result;
    }

    static async getPurchaseReturnBatches(purchaseID: string) {
        // এই purchaseID দিয়ে batch আছে কিনা
        return await PurchaseReturnRepository.getPurchaseReturnBatches(purchaseID)


    }

    static async delete(id: string) {
        const purchaseReturn: PurchaseReturnResponse | null = await PurchaseReturnRepository.purchaseReturnByID(id)
        if (!purchaseReturn) throw new ApiError(404, "Purchase return not found");

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // ১. Supplier আনো
            const supplier = await ContactService.findByID(purchaseReturn.supplierID.toString());

            if (!supplier) throw new ApiError(404, "Supplier not found");

            // ২. Batch reverse — returnedQty কমাও, remainingQty বাড়াও, stock বাড়াও
            await Promise.all(
                purchaseReturn.batches.map(async (item: any) => {
                    await ProductService.updateBatchDynamically(item.batchID, {
                        inc: {
                            purchaseReturnedQty: -item.purchaseReturnedQty,
                            remainingQty: item.purchaseReturnedQty,
                        }
                    })


                    await ProductService.updateProductFifoBatchAndStock(item.productID, { qty: item.purchaseReturnedQty }, session)
                })
            );

            // ৩. Account balance reverse
            if (purchaseReturn.paid > 0 && purchaseReturn.accounts.length > 0) {
                await AccountService.increaseBalance(purchaseReturn.accounts.map(a => ({ ...a, accountID: a.accountID.toString() })), session)

                // ৪. Transaction delete
                if (purchaseReturn.paid > 0) {
                    await TransactionService.deleteTransactions({ typeID: purchaseReturn._id }, session);
                }
                // ৬. Supplier balance reverse
                await ContactService.balanceUpdate(supplier._id, purchaseReturn.paid, session);
            }
            // ৫. Ledger delete
            await LedgerService.deleteLedger({ typeID: purchaseReturn._id }, session);
            // ৭. Purchase deletable check — আর কোনো return নেই?
            const otherReturns = await PurchaseReturnRepository.countOtherPurchaseReturns(
                purchaseReturn.purchaseID.toString(),
                purchaseReturn.purchaseID.toString(),
                session
            )

            if (otherReturns === 0) {
                await PurchaseService.purchaseUpdateDynamic(purchaseReturn.purchaseID.toString(), { deletable: true }, session)
            }

            // ৮. PurchaseReturn delete
            await PurchaseReturnRepository.deletePurchaseReturn(id, session);
            await session.commitTransaction();

            await RedisReportService.updatePurchaseReturnReport({
                amount: -purchaseReturn.batches.reduce((acc, b) => acc + b.purchasePrice, 0),
                qty: -purchaseReturn.batches.reduce((acc, b) => acc + b.purchaseReturnedQty, 0),
                paid: -purchaseReturn.paid,
                discount: -purchaseReturn.discount,
                date: new Date()
            });

        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
}