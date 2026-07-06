import * as productSchema from "../src/product/product.table";
import * as variantSchema from "../src/product/variant.table";
import * as batchSchema from "../src/product/batch.table";
import * as stockFlowSchema from "../src/product/stock_flow.table";
import * as brandSchema from "../src/brand/brand.table";
import * as categorySchema from "../src/category/category.table";
import * as unitSchema from "../src/unit/unit.table";
import * as transactionSchema from "../src/transaction/transaction.table";
import * as accountSchema from "../src/account/account.table";
import * as balanceTransferSchema from "../src/account/balance_transfer.table"
import * as saleSchema from "../src/sale/sale.table"
import * as saleReturnSchema from "../src/sale_return/sale_return.table"
import * as saleItemsSchema from "../src/sale/sale_items.table"
import * as contactSchema from "../src/contact/contact.table"
import * as purchaseSchema from "../src/purchase/purchase.table"
import * as purchaseReturnSchema from "../src/purchase_return/purchase_return.table"
import * as authSchema from "../src/auth/auth.table"
import * as ledgerSchema from "../src/ledger/ledger.table"
import * as expenseSchema from "../src/expense/expense.table"
import * as damageSchema from "../src/damage/damage.table"
// সব টেবিল এবং তাদের রিলেশন একসাথে কম্বাইন করা হলো
export const dbSchema = {
  ...productSchema,
  ...variantSchema,
  ...batchSchema,
  ...stockFlowSchema,
  ...brandSchema,
  ...categorySchema,
  ...unitSchema,
  ...transactionSchema,
  ...ledgerSchema,
  ...accountSchema,
  ...contactSchema,
  ...balanceTransferSchema,
  ...saleSchema,
  ...saleItemsSchema,
  ...purchaseSchema,
  ...purchaseReturnSchema,
  ...saleReturnSchema,
  ...authSchema,
  ...expenseSchema,
  ...damageSchema,
};