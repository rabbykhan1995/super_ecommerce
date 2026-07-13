export type Brand = {
  id: number;
  name: string;
};

export type Unit = {
  id: number;
  name: string;
};

export type ExpenseType = {
  id: number;
  name: string;
};

export type Category = {
  id: number;
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
  id: number;
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
  id: number;
  productID: number,
  variantID: number;
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
  id: number;
  productID: number;
  variantID: number;
  name: string;
  serial?: string;
  cost: number;
  purchasedQty: number;
  remainingQty: number;
  qty: number;
  warranty: number;
  product?: { name: string };
  selected: boolean;
};

export type SaleReturnProduct = {
  id: number;
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
  id: number;
  purchaseID?: number;
  productID: number;
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
  id: number;
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

export type PosSaleProduct = {
  id: number;
  productID: number;
  variantID: number;
  name: string;
  barcode?: string;
  stock: number;
  unitName?: string;
  brandName?: string;
  categoryName?: string;
  decimal: boolean;
  manageStock: boolean;
  salePrice: number;
  soldQty: number;
  expireDate?: Date;
};

export type DamageProduct = {
  id: number;
  purchaseID?: number;
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
  id: number;
  name: string;
  branch?: string;
  number: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
  isDefault: boolean;
};

export type AccountOption = SelectOption<Account> & {
  amount: number;
  type: string;
};

export type PurchaseListItem = {
  id: number;
  invoiceNo: string;
  totalAmount: number;
  balanceAfter: number;
  paid: number;
  purchaseDate: Date;
  createdAt: Date;
  default: boolean;
  supplierName?: string;
  otherCost?: number;
  deletable?: boolean;
  discount: number;
  balanceBefore: number;
  supplier: {
    name: string;
  }
};

export type PurchaseReturnListItem = {
  id: number;
  purchaseID: number;
  supplierID: number;
  totalAmount: number;
  balanceAfter: number;
  paid: number;
  date: Date;
  createdAt: Date;
  discount: number;
  balanceBefore: number;
  supplier?: { name: string };
};



export type SaleListItem = {
  id: number;
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
  id: number;
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
  id: number;
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
  id: number;
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
  id: number;
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
  id: number;
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
  id: number;
  purchaseID: number;
  productID: number;
  variantID: number;
  serial?: string;
  purchasedQty: number;
  remainingQty: number;
  cost: number;
  purchasePrice: number;
  PurchaseDate: Date;
  expireDate?: Date;
  isActive: boolean;
  warranty: number;
};

export type ExpenseListItem = {
  id: number;
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
  id: number;
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

export type Variant = {
  id: number;
  stock: number | null;
  salePrice: number | null;
  createdAt?: Date;
  updatedAt?: Date;
  productID: number;
  barcode: string;
  weight: number | null;
  attributes: {
    name: string;
    value: string;
  }[];
}

export type VariantPayload = {
  salePrice: number | null;
  productID?: number;
  barcode?: string;
  weight: number;
  attributes: {
    name: string;
    value: string;
  }[];
}


export interface VariantListItem {
  id: number;
  productID: number;
  salePrice: number;
  stock: number;
  barcode: string;
  createdAt: string;
  weight: number;
  attributes: {
    name: string;
    value: string;
  }[];
  updatedAt: string;
  product: {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    shortDescription: string | null;
    metaTitle: string | null;
    metaDescription: string | null;
    keywords: string[];
    brandID: number;
    unitID: number;
    categoryID: number;
    manageStock: boolean;
    manageWarranty: boolean;
    thumbnail: string | null;
    video: string | null;
    stock: number;
    totalSold: string;
    alertQty: number;
    decimal: boolean;
    purchasePrice: number;
    salePrice: number;
    isPublished: boolean;
    inPosList: boolean;
    createdAt: string;
    updatedAt: string;
    sku: string | null;
    status: string;
    featured: boolean;
    showStock: boolean;
    sortOrder: number;
    averageRating: string;
    totalReviews: number;
    brand: {
      id: number;
      name: string;
      createdAt: string;
      updatedAt: string;
    };
    unit: {
      id: number;
      name: string;
      createdAt: string;
      updatedAt: string;
    };
    category: {
      id: number;
      name: string;
      createdAt: string;
      updatedAt: string;
    };
  };
}