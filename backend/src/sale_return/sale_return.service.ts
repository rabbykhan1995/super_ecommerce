import { ApiError } from "../../utils/ApiError";
import SaleService from "../sale/sale.service";
import {
  CreateSaleReturnInput,
  OnlySaleReturnPayload,
  SaleReturn,
  SaleReturnItem,
  SaleReturnItemPayload,
} from "./sale_return.type";
import ContactService from "../contact/contact.service";
import { Batch, stockFlowPayload } from "../product/product.type";
import ProductService from "../product/product.service";
import SaleReturnRepository from "./sale_return.repository";
import { AccountService } from "../account/account.service";
import TransactionService from "../transaction/transaction.service";
import LedgerService from "../ledger/ledger.service";
import { RedisReportService } from "../../utils/ReportServiceRedis";
import { withTransaction } from "../../utils/withTransaction";
import { LedgerPayload } from "../ledger/ledger.type";
import { TransactionPayload } from "../transaction/transaction.type";
import SaleRepository from "../sale/sale.repository";

export default class SaleReturnService {
  static async create(payload: CreateSaleReturnInput) {
    const { saleReturn, accounts, exchangeAccounts, products } = payload;

    const sale = await SaleService.getSaleByID(saleReturn.saleID);
    if (!sale) throw new ApiError(404, "Sale not found");

    await withTransaction(async (tx) => {
      let customer = null;
      if (sale.customerID) {
        customer = await ContactService.findByID(sale.customerID);
        if (!customer) throw new ApiError(404, "Customer not found");
      }

      let totalReturnAmount = products.reduce(
        (acc, p) => acc + p.salePrice,
        0,
      );

      const saleReturnPayload: OnlySaleReturnPayload = {
        saleID: sale.id,
        customerID: sale.customerID ?? null,
        note: saleReturn.note,
        paid: saleReturn.paid,
        balanceBefore: customer?.balance ?? 0,
        exchangeAmount: saleReturn.exchangeAmount,
        balanceAfter: saleReturn.balanceAfter,
        discount: saleReturn.discount ?? 0,
        date: saleReturn.date,
      };

      const saleReturnCreated =
        await SaleReturnRepository.saleReturnCreate(saleReturnPayload, tx);

      await Promise.all(
        products.map(async (p) => {
          const batch: Batch | null = await ProductService.findBatchByID(
            p.batchID,
            tx,
          );

          if (!batch)
            throw new ApiError(404, `Batch not found: ${p.batchID}`);

          const allSaleFlows =
            await ProductService.findStockFlowDynamically(
              p.batchID,
              "saleID",
              sale.id,
              tx,
            );

          const soldFlows = allSaleFlows.filter(
            (f) => f.type === "out" && f.referenceType === "sale",
          );
          const alreadySold: number = soldFlows.reduce(
            (acc, f) => f.qty + acc,
            0,
          );

          const returnedFlows = allSaleFlows.filter(
            (f) => f.type === "in" && f.referenceType === "sale_return",
          );
          const alreadyReturned: number = returnedFlows.reduce(
            (acc, f) => f.qty + acc,
            0,
          );

          const maxReturnable = alreadySold - alreadyReturned;

          if (p.saleReturnQty > maxReturnable) {
            throw new ApiError(
              400,
              `Max returnable qty is ${maxReturnable}`,
            );
          }

          const stockFlowPayload: stockFlowPayload = {
            batchID: p.batchID,
            productID: p.productID,
            type: "in",
            referenceType: "sale_return",
            saleID: sale.id,
            saleReturnID: saleReturnCreated.id,
          };

          const saleReturnItemPayload: SaleReturnItemPayload = {
            batchID: p.batchID,
            productID: p.productID,
            variantID: p.variantID,
            saleReturnID: saleReturnCreated.id,
            salePrice: batch.cost,
            saleReturnedQty: p.saleReturnQty,
            reason: p.reason,
          };

          await Promise.all([
            ProductService.increaseBatchStock(p.batchID, p.saleReturnQty, tx),
            ProductService.increaseVariantStock(
              p.variantID,
              p.saleReturnQty,
              tx,
            ),
            ProductService.increaseProductStock(
              p.productID,
              p.saleReturnQty,
              tx,
            ),
            ProductService.createStockFlow(stockFlowPayload, tx),
            SaleReturnRepository.saleReturnItemCreate(
              saleReturnItemPayload,
              tx,
            ),
          ]);
        }),
      );

      const isPaymentHappened = saleReturn.paid > 0;
      const isExchangeHappened = saleReturn.exchangeAmount > 0;

      if (isPaymentHappened) {
        await AccountService.decreaseBalance(accounts, tx);

        await Promise.all(
          accounts.map(async (a) => {
            const transactionPayload: TransactionPayload = {
              source: "sale_return",
              saleReturnID: saleReturnCreated.id,
              type: "debit",
              date: saleReturnCreated.date,
              accountID: a.accountID,
              amount: a.amount,
            };
            await TransactionService.create(transactionPayload, tx);
          }),
        );

        if (isExchangeHappened) {
          await AccountService.increaseBalance(exchangeAccounts, tx);

          await Promise.all(
            exchangeAccounts.map(async (a) => {
              const transactionPayload: TransactionPayload = {
                source: "sale_return",
                saleReturnID: saleReturnCreated.id,
                type: "credit",
                date: saleReturnCreated.date,
                accountID: a.accountID,
                amount: a.amount,
              };
              await TransactionService.create(transactionPayload, tx);
            }),
          );
        }
      }

      if (customer) {
        const amount =
          saleReturnCreated.balanceAfter - saleReturnCreated.balanceBefore;

        await ContactService.decreaseBalance(customer.id, amount, tx);

        const payableAmount: number =
          totalReturnAmount - (saleReturn.paid || 0);

        const ledgerPayload: LedgerPayload = {
          contactID: customer.id,
          type: "sale_return",
          saleReturnID: saleReturnCreated.id,
          amount: totalReturnAmount,
          balanceAfter: saleReturn.balanceAfter,
          balanceBefore: saleReturn.balanceBefore ?? customer.balance ?? 0,
          date: saleReturnCreated.date,
          dueAmount: payableAmount,
          discount: saleReturn.discount ?? 0,
          paidAmount: saleReturn.paid,
          note: saleReturn.note ?? "",
        };

        await LedgerService.create(ledgerPayload, tx);
      }

      // Mark sale as non-deletable
      await SaleRepository.update(
        sale.id,
        { deletable: false },
        tx,
      );

      await RedisReportService.updateSaleReturnReport({
        amount: totalReturnAmount,
        qty: products.reduce((s, b) => s + b.saleReturnQty, 0),
        paid: saleReturn.paid,
        discount: saleReturn.discount ?? 0,
        date: saleReturnCreated.date,
      });
    });
  }

  static async list(query: any) {
    return await SaleReturnRepository.list(query);
  }

  static async delete(saleReturnID: number) {
    const saleReturn: SaleReturn | null =
      await SaleReturnRepository.findByID(saleReturnID);
    if (!saleReturn) throw new ApiError(404, "Sale return not found");

    await withTransaction(async (tx) => {
      let customer = null;
      if (saleReturn.customerID) {
        customer = await ContactService.findByID(saleReturn.customerID);
        if (!customer)
          throw new ApiError(404, "Customer not found");
      }

      const returnedItems: SaleReturnItem[] =
        await SaleReturnRepository.itemsBySaleReturnID(
          saleReturnID,
          tx,
        );

      // Restore stock
      await Promise.all(
        returnedItems.map(async (p: SaleReturnItem) => {
          await Promise.all([
            ProductService.increaseVariantStock(
              p.productID,
              p.saleReturnedQty,
              tx,
            ),
            ProductService.increaseProductStock(
              p.productID,
              p.saleReturnedQty,
              tx,
            ),
            ProductService.increaseBatchStock(
              p.batchID,
              p.saleReturnedQty,
              tx,
            ),
          ]);
        }),
      );

      const allTransactions = await TransactionService.findBySourceID(
        saleReturnID,
        "sale_return",
      );

      const isPaymentHappened: boolean = saleReturn.paid > 0;
      if (isPaymentHappened) {
        const accTrans = allTransactions.filter((a) => a.type === "debit");

        const accounts = accTrans.map((a) => ({
          accountID: a.accountID,
          amount: a.amount as number,
        }));

        await AccountService.increaseBalance(accounts, tx);
      }

      const isExchangeHappened: boolean = saleReturn.exchangeAmount > 0;
      if (isExchangeHappened) {
        const accTrans = allTransactions.filter((a) => a.type === "credit");

        const exchangeAccounts = accTrans.map((a) => ({
          accountID: a.accountID,
          amount: a.amount as number,
        }));

        await AccountService.decreaseBalance(exchangeAccounts, tx);
      }

      if (customer) {
        const rollbackAmount = -(
          saleReturn.balanceAfter - saleReturn.balanceBefore
        );

        await ContactService.decreaseBalance(
          saleReturn.customerID!,
          rollbackAmount,
          tx,
        );
      }

      // Check if other returns exist for this sale
      const otherReturns =
        await SaleReturnRepository.countOtherSaleReturns(
          saleReturn.saleID,
          saleReturnID,
          tx,
        );

      if (otherReturns === 0) {
        await SaleRepository.update(
          saleReturn.saleID,
          { deletable: true },
          tx,
        );
      }

      await SaleReturnRepository.deleteSaleReturnByID(
        saleReturnID,
        tx,
      );

      await RedisReportService.updateSaleReturnReport({
        amount: -returnedItems.reduce(
          (acc, b) => acc + b.salePrice,
          0,
        ),
        qty: -returnedItems.reduce(
          (acc, b) => acc + b.saleReturnedQty,
          0,
        ),
        paid: -saleReturn.paid,
        discount: -(saleReturn.discount ?? 0),
        date: new Date(),
      });
    });
  }

  static async saleReturnInvoiceByID(saleReturnID: number) {
    return await SaleReturnRepository.getSaleReturnInvoice(
      saleReturnID,
    );
  }
}
