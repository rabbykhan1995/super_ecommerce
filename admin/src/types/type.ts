export type Brand = {
  _id: string;
  name: string;
};

export type Unit = {
  id: number;
  name: string;
};

export type ExpenseType = {
  _id: string;
  name: string;
};

export type Category = {
  _id: string;
  name: string;
};

export type SelectOption<T = Record<string, unknown>> = {
  value: string;
  label: string;
} & T;

export type SearchParams = {
  search: string;
  page: number;
  limit: number;
};

export type Product = {
  _id: string;
  name: string;
  barcode?: string;
  stock: number;
  unitName?: string;
  brandName?: string;
  categoryName?: string;
  decimal: boolean;
  manageStock: boolean;
  createdAt: string;
  purchasePrice: number;
  salePrice: number;
  manageWarranty: boolean;
  posEnabled: boolean;
  thumbnail?: string;
};

export type PurchaseProduct = {
  _id: string;
  name: string;
  barcode?: string;
  stock: number;
  unitName?: string;
  brandName?: string;
  categoryName?: string;
  manageStock: boolean;
  createdAt: string;
  purchasePrice: number;
  salePrice: number;
  purchaseQty: number;
  warranty: number;
  manageWarranty: boolean;
  serials?: string[];
  expireDate: Date | null;
};

export type PurchaseReturnProduct = {
  _id: string;
  name: string;
  serial?: string;
  stock: number;
  unitName?: string;
  brandName?: string;
  categoryName?: string;
  manageStock: boolean;
  createdAt: string;
  purchasePrice: number;
  returnedQty: number;
  remainingQty: number;
  qty: number;
  purchasedQty: number;
  warranty: number;
  manageWarranty: boolean;
  serials?: string[];
  selected: boolean;
};

export type SaleReturnProduct = {
  _id: string;
  name: string;
  serial?: string;
  stock: number;
  unitName?: string;
  brandName?: string;
  categoryName?: string;
  manageStock: boolean;
  createdAt: string;
  salePrice: number;
  saleReturnedQty: number;
  remainingQty: number;
  qty: number;
  soldQty: number;
  warranty: number;
  manageWarranty: boolean;
  serials?: string[];
  selected: boolean;
};

export type SaleProduct = {
  _id: string;
  purchaseID?: string;
  name: string;
  barcode?: string;
  stock: number;
  unitName?: string;
  brandName?: string;
  categoryName?: string;
  decimal: boolean;
  manageStock: boolean;
  createdAt: string;
  purchasePrice: number;
  salePrice: number;
  soldQty: number;
  warranty: number;
  manageWarranty: boolean;
  serials: SelectOption<Batch>[];
  selectedSerials: SelectOption<Batch>[];
  batches: SelectOption<Batch>[];
  selectedBatch: SelectOption<Batch> | null;
};

export type PosProduct = {
  _id: string;
  name: string;
  barcode?: string;
  stock: number;
  unitName?: string;
  brandName?: string;
  categoryName?: string;
  decimal: boolean;
  manageStock: boolean;
  createdAt: string;
  salePrice: number;
  soldQty: number;
  manageWarranty: boolean;
  expireDate?: Date;
};

export type DamageProduct = {
  _id: string;
  purchaseID?: string;
  name: string;
  barcode?: string;
  stock: number;
  unitName?: string;
  brandName?: string;
  categoryName?: string;
  decimal: boolean;
  manageStock: boolean;
  createdAt: string;
  purchasePrice: number;
  salePrice: number;
  soldQty: number;
  warranty: number;
  manageWarranty: boolean;
  serials: SelectOption<Batch>[];
  selectedSerials: SelectOption<Batch>[];
  batches: SelectOption<Batch>[];
  selectedBatch: SelectOption<Batch> | null;
  // ✅ NEW FIELD
  reason: "expired" | "manual";
};

export type Contact = {
  id: number;
  name: string;
  mobile: string;
  email?: string;
  address?: string;
  balance: number;
  type: "customer" | "supplier" | "both";
  createdAt: string;
};

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

export type Account = {
  _id: string;
  name: string;
  branch?: string;
  number: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
  default: boolean;
};

export type AccountOption = SelectOption<Account> & {
  amount: number;
  type: string;
};

export type PurchaseListItem = {
  _id: string;
  invoiceNo: string;
  totalAmount: number;
  balanceAfter: number;
  paid: number;
  PurchaseDate: Date;
  createdAt: Date;
  default: boolean;
  supplierName?: string;
  otherCost?: number;
  deletable?: boolean;
  discount: number;
  balanceBefore: number;
};

export type PurchaseReturnListItem = {
  _id: string;
  invoiceNo: string;
  totalAmount: number;
  balanceAfter: number;
  paid: number;
  date: Date;
  createdAt: Date;
  default: boolean;
  supplierName?: string;
  otherCost?: number;
  deletable?: boolean;
  discount: number;
  balanceBefore: number;
};



export type SaleListItem = {
  _id: string;
  invoiceNo: string;
  totalAmount: number;
  balanceAfter: number;
  paid: number;
  SaleDate: Date;
  createdAt: Date;
  default: boolean;
  exchangeAmount?: number;
  customerName?: string;
  otherCost?: number;
  deletable?: boolean;
  discount: number;
  balanceBefore: number;
};
export type WarrantyStatus =
  | "sold"
  | "claimed"
  | "sent_to_supplier"
  | "received_from_supplier"
  | "repaired"
  | "replaced" // supplier replaced করেছে
  | "rejected"
  | "returned_to_customer"
  | "refunded";

export type WarrantyListItem = {
  _id: string;
  saleID: string;
  customerID: string | null;
  productID: string;
  batchID: string;
  serial: string | null;
  salePrice: number;
  warranty: number;
  saleDate: Date;
  expireDate: Date;
  status: WarrantyStatus;
  supplierAction: WarrantyStatus;
  claimDate: Date | null;
  supplierID: string | null;
  sentDate: Date | null;
  receivedDate: Date | null;
  replacedSerial: string | null;
  replacedBatchID: string | null;
  refundAmount: number;
  otherCost: number;
  resolvedDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  // populated fields
  customerName: string | null;
  supplierName: string | null;
  productName: string;
};

export type DamageListItem = {
  _id: string;
  invoiceNo: string;
  totalAmount: number;
  balanceAfter: number;
  paid: number;
  SaleDate: Date;
  createdAt: Date;
  default: boolean;
  customerName?: string;
  otherCost?: number;
  deletable?: boolean;
  discount: number;
  balanceBefore: number;
};

export type SaleReturnListItem = {
  _id: string;
  invoiceNo: string;
  totalAmount: number;
  balanceAfter: number;
  paid: number;
  date: Date;
  createdAt: Date;
  default: boolean;
  customerName?: string;
  otherCost?: number;
  deletable?: boolean;
  discount: number;
  balanceBefore: number;
};

export type LedgerListItem = {
  _id: string;
  type: string;
  typeID: string;
  amount: number;
  dueAmount: number;
  paidAmount: number;
  date: Date;
  createdAt: Date;
  discount: number;
  note?: string;
  typeModel: string;
  contact: any;
  balanceBefore: number;
  balanceAfter: number;
};

export const TRANSACTION_TYPES = [
  "sale",
  "purchase",
  "sale_return",
  "purchase_return",
  "transfer",
  "deposit",
  "withdraw",
  "expense",
  "salary",
  "exchange",
] as const;

export const Transaction_TYPE_MODELS = [
  "Sale",
  "Purchase",
  "SaleReturn",
  "PurchaseReturn",
  "Expense",
] as const;
export type TransactionListItem = {
  _id: string;
  type: (typeof TRANSACTION_TYPES)[number];
  amount?: number;
  fromAccount?: string;
  fromAccountName?: string;
  typeID?: string;
  typeModel?: (typeof Transaction_TYPE_MODELS)[number];
  toAccount?: string;
  toAccountName?: string;
  createdAt: Date;
  updatedAt: Date;
  note?: string;
  date?: Date;
  status: "pending" | "completed" | "failed";
};




export type Batch = {
  _id: string;
  purchaseID: string;
  productID: string;
  serial?: string;
  purchasedQty: number;
  remainingQty: number;
  salePrice: number;
  purchasePrice: number;
  PurchaseDate: Date;
  expireDate?: Date;
  isActive: boolean;
  warranty: number;
};

export type ExpenseListItem = {
  _id: string;
  expenseTypeID: string;
  expenseTypeName?: string | null;
  paid: number;
  note?: string | null;
  documentImage?: string | null;
  expenseDate: Date;
  createdAt: string;
};

export type QuotationStatus = "approved" | "pending" | "cancelled";

export type QuotationListItem = {
  _id: string;
  totalAmount: number;
  balanceAfter: number;
  paid: number;
  SaleDate: Date;
  createdAt: Date;
  status: QuotationStatus;
  default: boolean;
  exchangeAmount?: number;
  customerName?: string;
  otherCost?: number;
  deletable?: boolean;
  discount: number;
  balanceBefore: number;
};