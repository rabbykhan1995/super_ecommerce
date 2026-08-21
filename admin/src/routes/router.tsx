import { createBrowserRouter } from "react-router";
import type { ComponentType } from "react";
import PrivateRoute from "./PrivateRoute";
import PermissionRoute from "./PermissionRoute";

type PageLoader = () => Promise<{ default: ComponentType }>;

const lazyPage =
  (load: PageLoader) =>
  async () => {
    const { default: Component } = await load();
    return { Component };
  };

const lazyProtectedPage =
  (permission: string, load: PageLoader) =>
  async () => {
    const { default: Page } = await load();
    return {
      Component: () => (
        <PermissionRoute permission={permission}>
          <Page />
        </PermissionRoute>
      ),
    };
  };

const lazyRootLayout = async () => {
  const { default: RootLayout } = await import("../layouts/RootLayout");
  return {
    HydrateFallback: () => (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-900">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600" />
      </div>
    ),
    Component: () => (
      <PrivateRoute>
        <RootLayout />
      </PrivateRoute>
    ),
  };
};

export const router = createBrowserRouter([
  {
    path: "/",
    lazy: lazyRootLayout,
    children: [
      {
        index: true,
        lazy: lazyPage(() => import("../pages/Dashboard/Dashboard")),
      },
      // Contact
      {
        path: "contact",
        children: [
          {
            path: "customer",
            lazy: lazyProtectedPage(
              "contact:read",
              () => import("../pages/Contact/Customer")
            ),
          },
          {
            path: "supplier",
            lazy: lazyProtectedPage(
              "contact:read",
              () => import("../pages/Contact/Supplier")
            ),
          },

          {
            path: "supplier-ledger/:id",
            lazy: lazyProtectedPage(
              "ledger:read",
              () => import("../pages/Contact/SupplierLedger")
            ),
          },
          {
            path: "customer-ledger/:id",
            lazy: lazyProtectedPage(
              "ledger:read",
              () => import("../pages/Contact/CustomerLedger")
            ),
          },
        ],
      },
      // product
      {
        path: "product",
        children: [
          {
            path: "new",
            lazy: lazyProtectedPage(
              "product:create",
              () => import("../pages/Product/NewProduct")
            ),
          },
          {
            path: "list",
            lazy: lazyProtectedPage(
              "product:read",
              () => import("../pages/Product/ProductList")
            ),
          },
          {
            path: "edit/:id",
            lazy: lazyProtectedPage(
              "product:update",
              () => import("../pages/Product/EditProduct")
            ),
          },
          {
            path: "brand",
            lazy: lazyProtectedPage(
              "brand:read",
              () => import("../pages/Product/Brand")
            ),
          },
          {
            path: "unit",
            lazy: lazyProtectedPage(
              "unit:read",
              () => import("../pages/Product/Unit")
            ),
          },
          {
            path: "category",
            lazy: lazyProtectedPage(
              "category:read",
              () => import("../pages/Product/Category")
            ),
          },
          {
            path: "featured-products",
            lazy: lazyProtectedPage(
              "featured-product:read",
              () => import("../pages/Ecommerce/FeatureProduct")
            ),
          },
          {
            path: "flash-sale",
            lazy: lazyProtectedPage(
              "flash-sale:read",
              () => import("../pages/Ecommerce/FlashSale")
            ),
          },
          {
            path: "flash-products",
            lazy: lazyProtectedPage(
              "flash-sale:read",
              () => import("../pages/Ecommerce/FlashProduct")
            ),
          },
          {
            path: "pos-products",
            lazy: lazyProtectedPage(
              "product:read",
              () => import("../pages/Product/PosProducts")
            ),
          },
        ],
      },
      // purchase
      {
        path: "purchase",
        children: [
          {
            path: "new",
            lazy: lazyProtectedPage(
              "purchase:create",
              () => import("../pages/Purchase/NewPurchase")
            ),
          },
          {
            path: "list",
            lazy: lazyProtectedPage(
              "purchase:read",
              () => import("../pages/Purchase/PurchaseList")
            ),
          },
          {
            path: "edit/:id",
            lazy: lazyProtectedPage(
              "purchase:update",
              () => import("../pages/Purchase/EditPurchase")
            ),
          },
          {
            path: "return/:id",
            lazy: lazyProtectedPage(
              "purchase-return:create",
              () => import("../pages/Purchase/PurchaseReturn")
            ),
          },
          {
            path: "return-list",
            lazy: lazyProtectedPage(
              "purchase-return:read",
              () => import("../pages/Purchase/PurchaseReturnList")
            ),
          },
          {
            path: "invoice/:id",
            lazy: lazyProtectedPage(
              "purchase:read",
              () => import("../pages/Purchase/PurchaseInvoice")
            ),
          },
        ],
      },

      // Sale
      {
        path: "sale",
        children: [
          {
            path: "new",
            lazy: lazyProtectedPage(
              "sale:create",
              () => import("../pages/Sale/NewSale")
            ),
          },
          {
            path: "list",
            lazy: lazyProtectedPage(
              "sale:read",
              () => import("../pages/Sale/SaleList")
            ),
          },
          {
            path: "return/:id",
            lazy: lazyProtectedPage(
              "sale-return:create",
              () => import("../pages/Sale/SaleReturn")
            ),
          },
          {
            path: "return-list",
            lazy: lazyProtectedPage(
              "sale-return:read",
              () => import("../pages/Sale/SaleReturnList")
            ),
          },
          {
            path: "invoice/:id",
            lazy: lazyProtectedPage(
              "sale:read",
              () => import("../pages/Sale/SaleInvoice")
            ),
          },
          {
            path: "fifo-sale",
            lazy: lazyProtectedPage(
              "sale:create",
              () => import("../pages/Sale/FifoSale")
            ),
          },
        ],
      },
      // Account
      {
        path: "account",
        children: [
          {
            path: "",
            lazy: lazyProtectedPage(
              "account:read",
              () => import("../pages/Account/Account")
            ),
          },
          {
            path: "transaction/:id",
            lazy: lazyProtectedPage(
              "transaction:read",
              () => import("../pages/Account/Transactions")
            ),
          },
          {
            path: "payment-details/:id",
            lazy: lazyProtectedPage(
              "payment:read",
              () => import("../pages/PaymentDetails/PaymentDetails")
            ),
          },
        ],
      },
      // Damage
      {
        path: "damage",
        children: [
          {
            path: "create",
            lazy: lazyProtectedPage(
              "damage:create",
              () => import("../pages/Damage/CreateDamage")
            ),
          },
          {
            path: "list",
            lazy: lazyProtectedPage(
              "damage:read",
              () => import("../pages/Damage/DamageList")
            ),
          },
        ],
      },

      // Warranty
      {
        path: "warranty",
        children: [
          {
            path: "list",
            lazy: lazyProtectedPage(
              "warranty:read",
              () => import("../pages/Warranty/WarrantyList")
            ),
          },
        ],
      },
      // Expense
      {
        path: "expense",
        children: [
          {
            path: "create",
            lazy: lazyProtectedPage(
              "expense:create",
              () => import("../pages/Expense/NewExpense")
            ),
          },
          {
            path: "list",
            lazy: lazyProtectedPage(
              "expense:read",
              () => import("../pages/Expense/ExpenseList")
            ),
          },
          {
            path: "types",
            lazy: lazyProtectedPage(
              "expense:read",
              () => import("../pages/Expense/ExpenseTypes")
            ),
          },
        ],
      },
      // Quotation
      {
        path: "quotation",
        children: [
          {
            path: "create-sale-quotation",
            lazy: lazyProtectedPage(
              "quotation:create",
              () => import("../pages/quotation/NewSaleQuotation")
            ),
          },
          {
            path: "list/sale",
            lazy: lazyProtectedPage(
              "quotation:read",
              () => import("../pages/quotation/SaleQuotationList")
            ),
          },
          {
            path: "sale-quotation-invoice/:id",
            lazy: lazyProtectedPage(
              "quotation:read",
              () => import("../pages/quotation/SaleQuotationInvoice")
            ),
          },
        ],
      },
      // Barcode
      {
        path: "barcode",
        children: [
          {
            path: "barcode",
            lazy: lazyProtectedPage(
              "product:read",
              () => import("../pages/Barcode/GenerateBarcode")
            ),
          },
        ],
      },
      // Order
      {
        path: "order",
        children: [
          {
            path: "create",
            lazy: lazyProtectedPage(
              "order:create",
              () => import("../pages/Orders/CreateOrder")
            ),
          },
          {
            path: "list",
            lazy: lazyProtectedPage(
              "order:read",
              () => import("../pages/Orders/OrderList")
            ),
          },
        ],
      },
      // Parcel
      {
        path: "parcel",
        children: [
          {
            path: "create",
            lazy: lazyProtectedPage(
              "parcel:create",
              () => import("../pages/Parcel/CreateParcel")
            ),
          },
          {
            path: "order-pack/:id",
            lazy: lazyProtectedPage(
              "parcel:pack",
              () => import("../pages/Parcel/OrderPack")
            ),
          },
          {
            path: "list",
            lazy: lazyProtectedPage(
              "parcel:read",
              () => import("../pages/Parcel/ParcelList")
            ),
          },
          {
            path: "pending",
            lazy: lazyProtectedPage(
              "parcel:read",
              () => import("../pages/Parcel/PendingParcel")
            ),
          },
        ],
      },
      // Ecommerce
      {
        path: "ecom",
        children: [
          {
            path: "product-list",
            lazy: lazyProtectedPage(
              "product:read",
              () => import("../pages/Ecommerce/EcomProductList")
            ),
          },
          {
            path: "orders",
            lazy: lazyProtectedPage(
              "order:read",
              () => import("../pages/Ecommerce/OrderList")
            ),
          },
          {
            path: "edit-product/:id",
            lazy: lazyProtectedPage(
              "product:update",
              () => import("../pages/Ecommerce/EditEcomProduct")
            ),
          },
          {
            path: "banners",
            lazy: lazyProtectedPage(
              "banner:read",
              () => import("../pages/Ecommerce/Banner")
            ),
          },
          {
            path: "featured-products",
            lazy: lazyProtectedPage(
              "featured-product:read",
              () => import("../pages/Ecommerce/FeatureProduct")
            ),
          },
          {
            path: "flash-sale",
            lazy: lazyProtectedPage(
              "flash-sale:read",
              () => import("../pages/Ecommerce/FlashSale")
            ),
          },
          {
            path: "flash-products",
            lazy: lazyProtectedPage(
              "flash-sale:read",
              () => import("../pages/Ecommerce/FlashProduct")
            ),
          },
          {
            path: "all-users-list",
            lazy: lazyProtectedPage(
              "user:read",
              () => import("../pages/Ecommerce/EcomUserList")
            ),
          },
        ],
      },

      // HRM
      {
        path: "hrm",
        children: [
          {
            path: "stuffs",
            lazy: lazyProtectedPage(
              "user:read",
              () => import("../pages/HRM/Stuffs")
            ),
          },
          {
            path: "roles",
            lazy: lazyProtectedPage(
              "role:read",
              () => import("../pages/HRM/Roles")
            ),
          },
        ],
      },
    ],
  },

  {
    path: "/registration",
    lazy: lazyPage(() => import("../pages/Auth/Register")),
  },
  {
    path: "/login",
    lazy: lazyPage(() => import("../pages/Auth/Login")),
  },
  {
    path: "/auth/callback",
    lazy: lazyPage(() => import("../pages/Auth/GoogleCallback")),
  },
]);
