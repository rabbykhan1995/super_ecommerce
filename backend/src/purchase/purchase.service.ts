import { ApiError } from "../../utils/ApiError";
import ContactService from "../contact/contact.service";
import { CreatePurchaseInput, Purchase } from "./purchase.type";
import PurchaseRepository from "./purchase.repository";
import ProductService from "../product/product.service";
import { AccountService } from "../account/account.service";
import TransactionService from "../transaction/transaction.service";
import LedgerService from "../ledger/ledger.service";
import { RedisReportService } from "../../utils/ReportServiceRedis";
import { QueryClient } from "../../drizzle/src";
import { withTransaction } from "../../utils/withTransaction";
import { BatchPayload, stockFlowPayload } from "../product/product.type";
import { TransactionPayload } from "../transaction/transaction.type";
import { LedgerPayload } from "../ledger/ledger.type";
import ProductRepository from "../product/product.repository";

export default class PurchaseService {
  static async create(payload: CreatePurchaseInput) {
    const purchase = payload.purchase;
    const products = payload.products;
    const accounts = payload.accounts;
    const exchangeAccounts = payload.exchangeAccounts;

    const supplier = await ContactService.findByID(purchase.supplierID);

    if (!supplier) throw new ApiError(404, "Supplier not found");

    purchase.balanceBefore = supplier.balance ?? 0;
    purchase.balanceAfter = purchase.totalAmount + purchase.balanceBefore - purchase.paid;

    await withTransaction(async (tx) => {

      const purchaseCreated: Purchase = await PurchaseRepository.purchaseCreate(purchase, tx)

      await Promise.all(products.map(async (p) => {
        const batchPayload: BatchPayload = {
          purchaseDate: purchaseCreated.purchaseDate,
          purchasedQty: p.purchasedQty,
          purchaseID: purchaseCreated.id,
          productID: p.productID,
          variantID: p.variantID,
          cost: p.purchasePrice,
          expireDate: p.expireDate ?? null,
          serial: p.serial ?? null,
          remainingQty: p.purchasedQty
        }

        const batchCreated = await ProductService.createBatch(batchPayload, tx);

        if (!batchCreated) {
          throw new ApiError(400, "Batch creation failed");
        }

        const stockFlowPayload: stockFlowPayload = {
          batchID: batchCreated.id,
          productID: p.productID,
          type: "in",
          beforeQty: 0,
          afterQty: p.purchasedQty,
          purchaseID: purchaseCreated.id,
          referenceType: "purchase"
        }

        await Promise.all([
          ProductService.createStockFlow(stockFlowPayload, tx),
          ProductService.increaseProductStock(p.productID, p.purchasedQty, tx), ProductService.increaseVariantStock(p.variantID, p.purchasedQty, tx)
        ])

      }))
      const isPaymentHappened = purchase.paid > 0;
      const isExchangeHappened = purchase.exchangeAmount > 0;
      if (isPaymentHappened) {

        await AccountService.decreaseBalance(accounts, tx);

        await Promise.all(accounts.map(async (a) => {
          const transactionPayload: TransactionPayload = {
            source: "purchase",
            saleID: purchaseCreated.id,
            type: "debit",
            date: purchaseCreated.purchaseDate,
            accountID: a.accountID,
            amount: a.amount,
          }
          await TransactionService.create(transactionPayload, tx);
        }))

        if (isExchangeHappened) {
          await AccountService.increaseBalance(exchangeAccounts, tx);

          await Promise.all(exchangeAccounts.map(async (a) => {
            const transactionPayload: TransactionPayload = {
              source: "purchase",
              saleID: purchaseCreated.id,
              type: "credit",
              date: purchaseCreated.purchaseDate,
              accountID: a.accountID,
              amount: a.amount,
            }
            await TransactionService.create(transactionPayload, tx);
          }))
        }

      }
      const amount = purchase.balanceAfter - purchase.balanceBefore;

      ContactService.increaseBalance(supplier.id, amount, tx);

      const payableAmount: number = purchase.totalAmount - (purchase.balanceBefore || 0);

      const ledgerPayload:LedgerPayload = {
        contactID:purchase.supplierID,
        type:"purchase",
        amount:payableAmount,
        balanceAfter:purchase.balanceAfter,
        balanceBefore:purchase.balanceBefore,
        date:purchase.purchaseDate,
        dueAmount:payableAmount-purchase.paid,
        discount:purchase.discount,
        purchaseID:purchaseCreated.id,
        note:purchase.note,
        paidAmount:purchase.paid,
      }

      await LedgerService.create(ledgerPayload, tx)

      await RedisReportService.updatePurchaseReport({
        amount: purchase.totalAmount,
        qty: products.reduce((sum, p) => sum + p.purchasedQty, 0),
        due: purchase.totalAmount - purchase.paid,
        paid: purchase.paid - purchase.exchangeAmount,
        discount: purchase.discount ?? 0,
        date: purchase.purchaseDate
      });

      return purchaseCreated;

    })
  }

  static async delete(purchaseID: number) {
    const purchase = await PurchaseRepository.findByID(purchaseID);

    if (!purchase) throw new ApiError(404, "Purchase not found");

    if (!purchase.deletable) {
      throw new ApiError(400, "Purchase Couldn't be deleted due to it is returned or items are sold");
    }

     await withTransaction(async (tx) => {

            const batches = await ProductService.findBatchesByPurchaseID(purchaseID, tx)

            await Promise.all(
                batches
                    .map(async (p) => {
                        await Promise.all(
                            [
                                ProductService.decreaseBatchStock(p.id, p.purchasedQty, tx),
                                ProductService.decreaseProductStock(p.productID, p.purchasedQty, tx),
                                ProductService.decreaseVariantStock(p.variantID, p.purchasedQty, tx)
                            ]
                        );
                    })
            );

            const allTransactions = await TransactionService.findBySourceID(purchase.id, "purchase");
            // account balance reverse
            const isPaymentHappened: boolean = purchase.paid > 0
            if (isPaymentHappened) {

                const accTrans = allTransactions.filter(a => a.type === "debit");

                const accounts = accTrans.map(a => ({ accountID: a.accountID, amount: a.amount as number }));

                await AccountService.increaseBalance(
                    accounts, tx
                );
            }
            const isExchangeHappened: boolean = purchase.exchangeAmount > 0;
            if (isExchangeHappened) {

                const accTrans = allTransactions.filter(a => a.type === "credit");

                const exchangeAccounts = accTrans.map(a => ({ accountID: a.accountID, amount: a.amount as number }));
                await AccountService.decreaseBalance(exchangeAccounts, tx);
            }

            // customer balance restore

                const rollbackAmount = -(purchase.balanceAfter - purchase.balanceBefore);

                await ContactService.decreaseBalance(
                    purchase.supplierID,
                    rollbackAmount,
                    tx
                );


            await PurchaseRepository.deletePurchaseByID(purchaseID, tx);


            await RedisReportService.updateSaleReport({
                amount: -purchase.totalAmount,
                qty: -batches.reduce((sum, p) => sum + p.purchasedQty, 0),
                due: -(purchase.totalAmount - purchase.paid),
                paid: -purchase.paid,
                discount: -(purchase.discount ?? 0),
                date: purchase.purchaseDate,
            });
        })
  }

  static async purchaseInvoiceByID(
    purchaseID: number
  ) {

    const purchase =
      await PurchaseRepository.findByID(
        purchaseID
      );

    if (!purchase) {
      throw new ApiError(
        404,
        "Purchase not found"
      );
    }

    const batches =
      await ProductRepository.findBatchesByPurchaseID(
        purchaseID
      );

    return {
      ...purchase,
      batches,
    };


  }

  static async purchaseByID(id: number, tx?: QueryClient) {
    return await PurchaseRepository.findByID(id, tx);
  }

  static async list(query: any) {
    return await PurchaseRepository.list(query);
  }

  static async purchaseUpdateDynamic(id: number,
    payload: Partial<Purchase>,
    tx?: QueryClient) {
    return await PurchaseRepository.purchaseUpdateDynamic(id,
      payload,
      tx);
  }
}