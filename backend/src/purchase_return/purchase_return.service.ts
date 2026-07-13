import { ApiError } from "../../utils/ApiError";
import PurchaseService from "../purchase/purchase.service";
import {
  CreatePurchaseReturnInput,
  OnlyPurchaseReturnPayload,
  PurchaseReturn,
  PurchaseReturnItem,
  PurchaseReturnItemPayload,
} from "./purchase_return.type";
import ContactService from "../contact/contact.service";
import { Batch, stockFlowPayload } from "../product/product.type";
import ProductService from "../product/product.service";
import PurchaseReturnRepository from "./purchase_return.repository";
import { AccountService } from "../account/account.service";
import TransactionService from "../transaction/transaction.service";
import LedgerService from "../ledger/ledger.service";
import { RedisReportService } from "../../utils/ReportServiceRedis";
import { withTransaction } from "../../utils/withTransaction";
import { LedgerPayload } from "../ledger/ledger.type";
import { TransactionPayload } from "../transaction/transaction.type";

export default class PurchaseReturnService {
  static async create(payload: CreatePurchaseReturnInput) {
    const { purchaseReturn, accounts, exchangeAccounts, products } = payload;
    // batches = [{ batchID, returnQty, reason }]
    // accounts = [{ accountID, amount }]
    const purchase = await PurchaseService.purchaseByID(
      purchaseReturn.purchaseID,
    );

    if (!purchase) throw new ApiError(404, "Purchase not found");
    await withTransaction(async (tx) => {
      // ২. Supplier আনো
      const supplier = await ContactService.findByID(purchase.supplierID);
      if (!supplier) throw new ApiError(404, "Supplier not found");

      // ৩. Batches validate + stock reverse
      let totalReturnAmount = products.reduce(
        (acc, p) => acc + p.returnPrice,
        0,
      );

      const purchaseReturnPayload: OnlyPurchaseReturnPayload = {
        purchaseID: purchase.id,
        supplierID: supplier.id,
        note: purchaseReturn.note,
        paid: purchaseReturn.paid,
        balanceBefore: supplier.balance,
        exchangeAmount: purchaseReturn.exchangeAmount,
        balanceAfter: purchaseReturn.balanceAfter,
        discount: purchaseReturn.discount ?? 0,
        date: purchaseReturn.date,
      };
      const purchaseReturnCreated =
        await PurchaseReturnRepository.purchaseReturnCreate(
          purchaseReturnPayload,
          tx,
        );
      await Promise.all(
        products.map(async (p) => {
          const batch: Batch | null = await ProductService.findBatchByID(
            p.batchID,
            tx,
          );

          if (!batch) throw new ApiError(404, `Batch not found: ${p.batchID}`);
          const allPurchaseFlows =
            await ProductService.findStockFlowDynamically(
              p.batchID,
              "purchaseID",
              purchase.id,
            );

          const previousReturnedFlow = allPurchaseFlows.filter(
            (f) => f.type === "out",
          );
          const alreadyReturned: number = previousReturnedFlow.reduce(
            (acc, f) => f.qty + acc,
            0,
          );

          const maxReturnable = batch.purchasedQty - alreadyReturned;

          if (p.purchaseReturnQty > maxReturnable) {
            throw new ApiError(400, `Max returnable qty is ${maxReturnable}`);
          }

          const stockFlowPayload: stockFlowPayload = {
            batchID: p.batchID,
            productID: p.productID,
            type: "out",
            referenceType: "purchase_return",
            purchaseID: purchase.id,
            purchaseReturnID: purchaseReturnCreated.id,
          };

          const purchaseReturnItemPayload: PurchaseReturnItemPayload = {
            batchID: p.batchID,
            productID: p.productID,
            variantID: p.variantID,
            purchaseReturnID: purchaseReturnCreated.id,
            purchasePrice: batch.cost,
            purchaseReturnedQty: p.purchaseReturnQty,
            reason: p.reason,
          };
          // batch stock decrease + product stock decrease + variantStock decrease + stock flow create + return item create
          await Promise.all([
            ProductService.decreaseBatchStock(p.batchID, totalReturnAmount, tx),
            ProductService.decreaseVariantStock(
              p.variantID,
              totalReturnAmount,
              tx,
            ),
            ProductService.decreaseProductStock(
              p.productID,
              totalReturnAmount,
              tx,
            ),
            ProductService.createStockFlow(stockFlowPayload, tx),
            PurchaseReturnRepository.purchaseReturnItemCreate(
              purchaseReturnItemPayload,
              tx,
            ),
          ]);
        }),
      );

      const isPaymentHappened = purchaseReturn.paid > 0;
      const isExchangeHappened = purchaseReturn.exchangeAmount > 0;
      if (isPaymentHappened) {
        await AccountService.increaseBalance(accounts, tx);

        await Promise.all(
          accounts.map(async (a) => {
            const transactionPayload: TransactionPayload = {
              source: "purchase_return",
              purchaseReturnID: purchaseReturnCreated.id,
              type: "credit",
              date: purchaseReturnCreated.date,
              accountID: a.accountID,
              amount: a.amount,
            };
            await TransactionService.create(transactionPayload, tx);
          }),
        );

        if (isExchangeHappened) {
          await AccountService.decreaseBalance(exchangeAccounts, tx);

          await Promise.all(
            exchangeAccounts.map(async (a) => {
              const transactionPayload: TransactionPayload = {
                source: "purchase_return",
                purchaseReturnID: purchaseReturnCreated.id,
                type: "debit",
                date: purchaseReturnCreated.date,
                accountID: a.accountID,
                amount: a.amount,
              };
              await TransactionService.create(transactionPayload, tx);
            }),
          );
        }
      }
      const amount =
        purchaseReturnCreated.balanceAfter -
        purchaseReturnCreated.balanceBefore;

      ContactService.decreaseBalance(supplier.id, amount, tx);

      const payableAmount: number =
        purchase.totalAmount - (purchase.balanceBefore || 0);

      const ledgerPayload: LedgerPayload = {
        contactID: purchase.supplierID,
        type: "purchase",
        amount: payableAmount,
        balanceAfter: purchase.balanceAfter,
        balanceBefore: purchase.balanceBefore,
        date: purchase.purchaseDate,
        dueAmount: payableAmount - purchase.paid,
        discount: purchase.discount,
        purchaseReturnID: purchaseReturnCreated.id,
        note: purchase.note,
        paidAmount: purchase.paid,
      };

      await LedgerService.create(ledgerPayload, tx);
      // ৮. Report update
      await RedisReportService.updatePurchaseReturnReport({
        amount: totalReturnAmount,
        qty: products.reduce((s: any, b: any) => s + b.purchaseReturnQty, 0),
        paid: purchaseReturn.paid,
        discount: purchaseReturn.discount ?? 0,
        date: purchaseReturnCreated.date,
      });
    });
  }

  static async list(query: any) {
    return await PurchaseReturnRepository.list(query);
  }

  static async delete(purchaseReturnID: number) {
    const purchaseReturn: PurchaseReturn | null =
      await PurchaseReturnRepository.findByID(purchaseReturnID);
    if (!purchaseReturn) throw new ApiError(404, "Purchase return not found");

    await withTransaction(async (tx) => {
      // ১. Supplier আনো
      const supplier = await ContactService.findByID(purchaseReturn.supplierID);

      if (!supplier) throw new ApiError(404, "Supplier not found");

      const returnedItems: PurchaseReturnItem[] =
        await PurchaseReturnRepository.itemsByPurchaseReturnID(
          purchaseReturnID,
          tx,
        );
      // ২. Batch reverse — returnedQty কমাও, remainingQty বাড়াও, stock বাড়াও
      await Promise.all(
        returnedItems.map(async (p: PurchaseReturnItem) => {
          await Promise.all([
            ProductService.increaseVariantStock(
              p.productID,
              p.purchaseReturnedQty,
              tx,
            ),
            ProductService.increaseProductStock(
              p.productID,
              p.purchaseReturnedQty,
              tx,
            ),
            ProductService.increaseBatchStock(
              p.batchID,
              p.purchaseReturnedQty,
              tx,
            ),
          ]);
        }),
      );
      const allTransactions = await TransactionService.findBySourceID(
        purchaseReturnID,
        "purchase_return",
      );
      // account balance reverse
      const isPaymentHappened: boolean = purchaseReturn.paid > 0;
      if (isPaymentHappened) {
        const accTrans = allTransactions.filter((a) => a.type === "credit");

        const accounts = accTrans.map((a) => ({
          accountID: a.accountID,
          amount: a.amount as number,
        }));

        await AccountService.decreaseBalance(accounts, tx);
      }
      const isExchangeHappened: boolean = purchaseReturn.exchangeAmount > 0;
      if (isExchangeHappened) {
        const accTrans = allTransactions.filter((a) => a.type === "debit");

        const exchangeAccounts = accTrans.map((a) => ({
          accountID: a.accountID,
          amount: a.amount as number,
        }));
        await AccountService.increaseBalance(exchangeAccounts, tx);
      }

      // customer balance restore

      const rollbackAmount = -(
        purchaseReturn.balanceAfter - purchaseReturn.balanceBefore
      );

      await ContactService.decreaseBalance(
        purchaseReturn.supplierID,
        rollbackAmount,
        tx,
      );

      await PurchaseReturnRepository.deletePurchaseReturnByID(
        purchaseReturnID,
        tx,
      );

      await RedisReportService.updatePurchaseReturnReport({
        amount: -returnedItems.reduce((acc, b) => acc + b.purchasePrice, 0),
        qty: -returnedItems.reduce((acc, b) => acc + b.purchaseReturnedQty, 0),
        paid: -purchaseReturn.paid,
        discount: -purchaseReturn.discount,
        date: new Date(),
      });
    });
  }

  static async purchaseReturnInvoiceByID(purchaseReturnID: number) {

    return await PurchaseReturnRepository.getPurchaseReturnInvoice(purchaseReturnID);


  }

  static async purchaseForReturnByID(purchaseID: number) {
    const purchase = await PurchaseService.purchaseForReturnByID(purchaseID);

    if (!purchase) return null;

    const batchesWithReturnableQty = (purchase.batches || []).map((batch: any) => {
      const alreadyReturned = (batch.stockFlows || [])
        .filter((f: any) => f.type === "out")
        .reduce((acc: number, f: any) => acc + Number(f.qty), 0);

      const { stockFlows, ...batchWithoutStockFlows } = batch;

      return {
        ...batchWithoutStockFlows,
        returnableQty: Number(batch.purchasedQty) - alreadyReturned,
      };
    });

    return { ...purchase, batches: batchesWithReturnableQty };
  }
}
