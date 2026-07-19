import { createBrowserRouter } from "react-router";
import RootLayout from "../layouts/RootLayout";
import Dashboard from "../pages/Dashboard/Dashboard";
import NewProduct from "../pages/Product/NewProduct";
import ProductList from "../pages/Product/ProductList";
import Brand from "../pages/Product/Brand";
import Unit from "../pages/Product/Unit";
import Category from "../pages/Product/Category";
import EditProduct from "../pages/Product/EditProduct";
import PrivateRoute from "./PrivateRoute";
import Login from "../pages/Auth/Login";
import Registration from "../pages/Auth/Register";
import GoogleCallback from "../pages/Auth/GoogleCallback";
import NewPurchase from "../pages/Purchase/NewPurchase";
import PurchaseList from "../pages/Purchase/PurchaseList";
import EditPurchase from "../pages/Purchase/EditPurchase";
import PurchaseReturn from "../pages/Purchase/PurchaseReturn";
import PurchaseReturnList from "../pages/Purchase/PurchaseReturnList";
import Customer from "../pages/Contact/Customer";
import Supplier from "../pages/Contact/Supplier";
import SupplierLedger from "../pages/Contact/SupplierLedger";
import CustomerLedger from "../pages/Contact/CustomerLedger";
import Account from "../pages/Account/Account";
import PurchaseInvoice from "../pages/Purchase/PurchaseInvoice";
import NewSale from "../pages/Sale/NewSale";
import SaleList from "../pages/Sale/SaleList";
import SaleInvoice from "../pages/Sale/SaleInvoice";
import Transactions from "../pages/Account/Transactions";
import TransactionDetails from "../pages/Transaction/TransactionDetails";
import SaleReturn from "../pages/Sale/SaleReturn";
import SaleReturnList from "../pages/Sale/SaleReturnList";
import CreateDamage from "../pages/Damage/CreateDamage";
import DamageList from "../pages/Damage/DamageList";
import PosProducts from "../pages/Product/PosProducts";
import WarrantyList from "../pages/Warranty/WarrantyList";
import FifoSale from "../pages/Sale/FifoSale";
import ExpenseTypes from "../pages/Expense/ExpenseTypes";
import NewExpense from "../pages/Expense/NewExpense";
import ExpenseList from "../pages/Expense/ExpenseList";
import NewSaleQuotation from "../pages/quotation/NewSaleQuotation";
import SaleQuotationList from "../pages/quotation/SaleQuotationList";
import GenerateBarcode from "../pages/Barcode/GenerateBarcode";
import SaleQuotationInvoice from "../pages/quotation/SaleQuotationInvoice";
import CreateParcel from "../pages/Parcel/CreateParcel";
import ParcelList from "../pages/Parcel/ParcelList";
import EcomProductList from "../pages/Ecommerce/EcomProductList";
import EditEcomProduct from "../pages/Ecommerce/EditEcomProduct";
import Banner from "../pages/Ecommerce/Banner";
import FeatureProduct from "../pages/Ecommerce/FeatureProduct";
import FlashSale from "../pages/Ecommerce/FlashSale";
import FlashProduct from "../pages/Ecommerce/FlashProduct";

export const router = createBrowserRouter([

  {
    path: "/",
    element: (
      <PrivateRoute>
        <RootLayout></RootLayout>
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        Component: Dashboard,
      },
      // Contact
      {
        path: "contact",
        children: [
          {
            path: "customer",
            Component: Customer,
          },
          {
            path: "supplier",
            Component: Supplier,
          },

          {
            path: "supplier-ledger/:id",
            Component: SupplierLedger,
          },
          {
            path: "customer-ledger/:id",
            Component: CustomerLedger,
          },
          {
            path: "supplier-ledger/:id",
            Component: SupplierLedger,
          },

        ],
      },
      // product
      {
        path: "product",
        children: [
          {
            path: "new",
            Component: NewProduct,
          },
          {
            path: "list",
            Component: ProductList,
          },
          {
            path: "edit/:id",
            Component: EditProduct,
          },
          {
            path: "brand",
            Component: Brand,
          },
          {
            path: "unit",
            Component: Unit,
          },
          {
            path: "category",
            Component: Category,
          },
           {
            path: "featured-products",
            Component: FeatureProduct,
          },
           {
            path: "flash-sale",
            Component: FlashSale,
          },
          {
            path: "flash-products",
            Component: FlashProduct,
          },
          {
            path: "pos-products",
            Component: PosProducts,
          },
        ],
      },
      // purchase
      {
        path: "purchase",
        children: [
          {
            path: "new",
            Component: NewPurchase,
          },
          {
            path: "list",
            Component: PurchaseList,
          },
          {
            path: "edit/:id",
            Component: EditPurchase,
          },
          {
            path: "return/:id",
            Component: PurchaseReturn,
          },
          {
            path: "return-list",
            Component: PurchaseReturnList,
          },
          { path: 'invoice/:id', Component: PurchaseInvoice }

        ],
      },

      // Sale
      {
        path: "sale",
        children: [
          {
            path: "new",
            Component: NewSale,
          },
          {
            path: "list",
            Component: SaleList,
          },
          {
            path: "return/:id",
            Component: SaleReturn,
          },
          {
            path: "return-list",
            Component: SaleReturnList,
          },
          { path: 'invoice/:id', Component: SaleInvoice },
          { path: 'fifo-sale', Component: FifoSale }

        ],
      },
      // Account
      {
        path: "account",
        children: [
          {
            path: "",
            Component: Account,
          },
          {
            path: "transaction/:id",
            Component: Transactions,
          },
          {
            path: "transaction-details/:id",
            Component: TransactionDetails,
          },

        ],
      },
      // Damage
      {
        path: "damage",
        children: [
          {
            path: "create",
            Component: CreateDamage,
          },
          {
            path: "list",
            Component: DamageList,
          },

        ],
      },

      // Warranty
      {
        path: "warranty",
        children: [
          {
            path: "list",
            Component: WarrantyList,
          }

        ],
      },
      // Expense
      {
        path: "expense",
        children: [
          {
            path: "create",
            Component: NewExpense,
          },
          {
            path: "list",
            Component: ExpenseList,
          },
          {
            path: "types",
            Component: ExpenseTypes,
          }
        ],
      },
      // Quotation
      {
        path: "quotation",
        children: [
          {
            path: "create-sale-quotation",
            Component: NewSaleQuotation,
          },
          {
            path: "list/sale",
            Component: SaleQuotationList,
          },
          {
            path: "types",
            Component: ExpenseTypes,
          },
          {
            path: "sale-quotation-invoice/:id",
            Component: SaleQuotationInvoice,
          }
        ],
      },
      // Barcode
      {
        path: "barcode",
        children: [
          {
            path: "barcode",
            Component: GenerateBarcode,
          },
        ],
      },
      // Parcel
      {
        path: "parcel",
        children: [
          {
            path: "create",
            Component: CreateParcel,
          },
          {
            path: "list",
            Component: ParcelList,
          },
        ],
      },
           // Ecommerce
      {
        path: "ecom",
        children: [
          {
            path: "product-list",
            Component: EcomProductList,
          },
          {
            path: "orders",
            Component: ParcelList,
          },
              {
            path: "edit-product/:id",
            Component: EditEcomProduct,
          },
           {
            path: "banners",
            Component: Banner,
          },{
            path: "featured-products",
            Component: FeatureProduct,
          },{
            path: "flash-sale",
            Component: FlashSale,
          },{
            path: "flash-products",
            Component: FlashProduct,
          },

        ],
      },

    ],
  },

  {
    path: "/registration",
    Component: Registration,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/auth/callback",
    Component: GoogleCallback,
  },
]);

