import { ApiError } from "../../utils/ApiError";
import PaymentRepository from "./payment.repository";
import ContactService from "../contact/contact.service";
import { AccountService } from "../account/account.service";
import TransactionService from "../transaction/transaction.service";
import LedgerService from "../ledger/ledger.service";
import { withTransaction } from "../../utils/withTransaction";
import { QueryClient } from "../../drizzle/src";
import {
  CreatePaymentInput,
  PaymentPayload,
} from "./payment.type";
import { PaymentAccountInput } from "./payment.validator";
import { TransactionPayload } from "../transaction/transaction.type";
import { LedgerPayload } from "../ledger/ledger.type";

export default class PaymentService {
  constructor() {}

  static async create(payload: CreatePaymentInput) {
    const { contactID, type, accounts, note, paymentDate } = payload;

    // 1. Fetch contact
    const contact = await ContactService.findByID(contactID);
    if (!contact) {
      throw new ApiError(404, "Contact not found");
    }

    // 2. Calculate balance changes
    const totalAmount = accounts.reduce((sum, a) => sum + a.amount, 0);
    const balanceBefore = contact.balance ?? 0;
    let balanceAfter = balanceBefore;

    // customer_receive: customer টাকা দিচ্ছে → contact balance কমবে (বেশি পাওনাদার হবে)
    // customer_pay: customer কে টাকা দিচ্ছে → contact balance বাড়বে (কম দেনাদার হবে)
    // supplier_pay: supplier কে টাকা দিচ্ছে → contact balance কমবে (কম দেনাদার হবে)
    // supplier_receive: supplier থেকে টাকা পাচ্ছে → contact balance বাড়বে (বেশি পাওনাদার হবে)
    if (type === "customer_receive" || type === "supplier_pay") {
      balanceAfter = balanceBefore - totalAmount;
    } else {
      balanceAfter = balanceBefore + totalAmount;
    }

    // 3. Create payment record
    const paymentCreated = await withTransaction(async (tx: QueryClient) => {
      const paymentPayload: PaymentPayload = {
        contactID,
        type,
        amount: totalAmount,
        balanceBefore,
        balanceAfter,
        note: note ?? null,
        paymentDate,
      };

      const payment = await PaymentRepository.create(paymentPayload, tx);
      if (!payment) {
        throw new ApiError(500, "Payment creation failed");
      }

      // 4. Update account balances
      if (type === "customer_receive" || type === "supplier_receive") {
        // টাকা ঢুকছে account এ
        await AccountService.increaseBalance(
          accounts.map((a) => ({ accountID: a.accountID, amount: a.amount })),
          tx
        );
      } else {
        // টাকা যাচ্ছে account থেকে
        await AccountService.decreaseBalance(
          accounts.map((a) => ({ accountID: a.accountID, amount: a.amount })),
          tx
        );
      }

      // 5. Create transactions for each account
      const txType = type === "customer_receive" || type === "supplier_receive" ? "credit" : "debit";

      await Promise.all(
        accounts.map(async (a) => {
          const transactionPayload: TransactionPayload = {
            accountID: a.accountID,
            amount: a.amount,
            source: "payment",
            type: txType as any,
            date: paymentDate,
            paymentID: payment.id,
          };
          await TransactionService.create(transactionPayload, tx);
        })
      );

      // 6. Update contact balance
      const contactBalanceChange = balanceAfter - balanceBefore;
      await ContactService.updateBalance(contactID, contactBalanceChange, tx);

      // 7. Create ledger entry
      const ledgerPayload: LedgerPayload = {
        type: type === "customer_receive" || type === "supplier_receive" ? "payment_in" : "payment_out",
        contactID,
        amount: totalAmount,
        paidAmount: totalAmount,
        dueAmount: 0,
        balanceBefore,
        balanceAfter,
        note: note ?? "",
        date: paymentDate,
        paymentID: payment.id,
      };

      await LedgerService.create(ledgerPayload, tx);

      return payment;
    });

    return paymentCreated;
  }

  static async list(query: any) {
    return await PaymentRepository.list(query);
  }

  static async findByID(paymentID: number) {
    const payment = await PaymentRepository.findByID(paymentID);
    if (!payment) {
      throw new ApiError(404, "Payment not found");
    }
    return payment;
  }
}
