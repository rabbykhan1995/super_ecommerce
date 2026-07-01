import mongoose, { ClientSession } from "mongoose";
import { ApiError } from "../../utils/ApiError";
import ContactService from "../contact/contact.service";
import { CreatePurchaseInput, IPurchase } from "./purchase.type";
import PurchaseRepository from "./purchase.repository";
import PayloadBuilder from "../../utils/builder";
import ProductService from "../product/product.service";
import { AccountService } from "../account/account.service";
import TransactionService from "../transaction/transaction.service";
import LedgerService from "../ledger/ledger.service";
import { RedisReportService } from "../../utils/ReportServiceRedis";
import { QueryClient } from "../../drizzle/src";

export default class PurchaseService {
  static async create(payload: CreatePurchaseInput) {
    const purchase = payload.purchase;
    const products = payload.products;
    const accounts = payload.accounts;
    const exchangeAccounts = payload.exchangeAccounts;

    const supplier = await ContactService.findByID(purchase.supplierID);

    if (!supplier) throw new ApiError(404, "Supplier not found");

    const balanceBefore = supplier.balance ?? 0;
    const balanceAfter = purchase.totalAmount + balanceBefore - purchase.paid;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const invoiceNo = await PurchaseRepository.getPurchaseInvoiceNo(session);

      const purchaseCreated = await PurchaseRepository.purchaseCreate({ ...purchase, PurchaseDate: purchase.purchaseDate, invoiceNo, balanceBefore, balanceAfter, accounts }, session)

      const batches =
        PayloadBuilder.batch(
          products,
          {
            purchaseID: purchaseCreated[0]._id,
            purchaseDate: purchase.purchaseDate,
          }
        );

      const batchesCreated = await ProductService.createBatches(batches, session);

      // product stock and fifo batch update
      await Promise.all(
        batchesCreated.map(async (b) => {
          const product = await ProductService.findById(b.productID.toString());

          if (!product?.fifoBatchID) {
            await ProductService.updateProductFifoBatchAndStock(b.productID.toString(), {
              fifoBatchID: b._id.toString(),
              qty: b.purchasedQty,
              salePrice: b.salePrice,
              purchasePrice: b.purchasePrice,
            }, session);

          } else {
            // fifoBatchID আছে, শুধু stock update
            await ProductService.updateProductFifoBatchAndStock(b.productID.toString(), {
              qty: b.purchasedQty,
              salePrice: b.salePrice,
              purchasePrice: b.purchasePrice,
            }, session);
          }
        })
      );

      if (purchase.paid > 0 && accounts && accounts.length > 0) {

        await AccountService.decreaseBalance(accounts, session)

        const transactionPayload =
          PayloadBuilder.transaction(accounts, {
            type: "purchase",

            typeID: purchaseCreated[0]._id,

            typeModel: "Purchase",

            accountField: "fromAccount",

            date: purchase.purchaseDate,
            contactID: purchase.supplierID ?? undefined,
          });

        // transaction create
        await TransactionService.create(transactionPayload, session);

        const isExchangeHappened:boolean = purchase.exchangeAmount>0;

        if (isExchangeHappened) {
          await AccountService.increaseBalance(exchangeAccounts, session);
          const payload = PayloadBuilder.transaction(exchangeAccounts, {
            type: "exchange",
            typeID: purchaseCreated[0]._id,
            typeModel: "Purchase",
            accountField: "toAccount",
            date: purchase.purchaseDate,
            contactID: purchase.supplierID ?? undefined,
          });
          await TransactionService.create(payload, session);
        }

      }
      const amount = purchase.balanceAfter - purchase.balanceBefore;
      ContactService.balanceUpdate(supplier._id, amount, session);
      const payableAmount: number = purchase.totalAmount - (purchase.balanceBefore || 0);

      const ledgerPayload = PayloadBuilder.ledger({
        type: "purchase",

        typeID: purchaseCreated[0]._id,

        typeModel: "Purchase",

        contactID: supplier._id,

        contactType: "supplier",

        amount: payableAmount,

        discount: purchase.discount,

        paidAmount: purchase.paid,

        dueAmount: payableAmount - purchase.paid,

        note: purchase.note ?? undefined,

        date: purchase.purchaseDate,

        balanceAfter: purchase.balanceAfter,

        balanceBefore: purchase.balanceBefore,
      })

      await LedgerService.create(ledgerPayload, session)
      await session.commitTransaction();

      await RedisReportService.updatePurchaseReport({
        amount: purchase.totalAmount,
        qty: products.reduce((sum, p) => sum + p.purchasedQty, 0),
        due: purchase.totalAmount - purchase.paid,
        paid: purchase.paid - purchase.exchangeAmount,
        discount: purchase.discount ?? 0,
        date: purchase.purchaseDate
      });

      return purchaseCreated[0];

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async delete(purchaseID: string) {
    const purchase = await PurchaseRepository.findById(purchaseID);

    if (!purchase) throw new ApiError(404, "Purchase not found");

    if (!purchase.deletable) {
      throw new ApiError(400, "Purchase Couldn't be deleted due to it is returned or items are sold");
    }

    const session = await mongoose.startSession();
    session.startTransaction();


    try {
      const amount = purchase.balanceAfter - purchase.balanceBefore;
      await ContactService.balanceUpdate(purchase.supplierID.toString(), -amount, session);

      await AccountService.increaseBalance(purchase.accounts.map(a => ({ accountID: a.accountID.toString(), amount: a.amount })), session);

      const batches = await ProductService.findBatches({
        purchaseID: purchase._id.toString(),
        isActive: true,
        remainingQty: { $gt: 0 },
      });

      await Promise.all(
        batches.map((b) =>
          ProductService.updateProductFifoBatchAndStock(
            b.productID.toString(),
            {
              fifoBatchID: b._id.toString(),
              qty: -b.purchasedQty,
            },
            session
          )
        )
      );

      await ProductService.deleteBatches({ purchaseID: purchase._id }, session)

      await PurchaseRepository.deletePurchaseByID(purchase._id.toString(), session);



      if (purchase.accounts.length > 0) {
        // Alada kore amk exchange delete kora lagbe na, 1 ta diye purchase er 2  tai delete hoye jabe...
        await TransactionService.deleteTransactions({ typeID: purchase._id, typeModel: "Purchase" }, session);
      }


      await LedgerService.deleteLedger({ typeID: purchase._id, typeModel: "Purchase" }, session)



      await session.commitTransaction();

      await RedisReportService.updatePurchaseReport({
        amount: -purchase.totalAmount,
        qty: -batches.reduce((sum, b) => sum + b.purchasedQty, 0),
        due: -(purchase.totalAmount - purchase.paid),
        paid: -purchase.paid,
        discount: -(purchase.discount ?? 0),
        date: purchase.PurchaseDate
      });


    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async purchaseInvoiceByID(
    purchaseID: string
  ) {

    const purchase =
      await PurchaseRepository.purchaseInvoiceByID(
        purchaseID
      );

    if (!purchase) {
      throw new ApiError(
        404,
        "Purchase not found"
      );
    }

    // const batches =
    //   await PurchaseRepository.purchaseBatches(
    //     purchaseID
    //   );

    // return {
    //   ...purchase,
    //   batches,
    // };

    return purchase
  }

  static async purchaseByID(id: number, tx?:QueryClient) {
    return await PurchaseRepository.findByID(id, tx);
  }

  static async list(query: any) {
    return await PurchaseRepository.list(query);
  }

  static async purchaseUpdateDynamic(id: string,
    payload: Partial<IPurchase>,
    session?: ClientSession) {
    return await PurchaseRepository.purchaseUpdateDynamic(id,
      payload,
      session);
  }
}