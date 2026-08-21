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
import PaymentDetails from "../pages/PaymentDetails/PaymentDetails";
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
import OrderPack from "../pages/Parcel/OrderPack";
import ParcelList from "../pages/Parcel/ParcelList";
import EcomProductList from "../pages/Ecommerce/EcomProductList";
import EditEcomProduct from "../pages/Ecommerce/EditEcomProduct";
import Banner from "../pages/Ecommerce/Banner";
import FeatureProduct from "../pages/Ecommerce/FeatureProduct";
import FlashSale from "../pages/Ecommerce/FlashSale";
import FlashProduct from "../pages/Ecommerce/FlashProduct";
import OrderListInEcommerce from "../pages/Ecommerce/OrderList";
import OrderListInOrders from "../pages/Orders/OrderList";
import PendingParcels from "../pages/Parcel/PendingParcel";
import CreateOrder from "../pages/Orders/CreateOrder";
import EcomUserList from "../pages/Ecommerce/EcomUserList";
import Stuffs from "../pages/HRM/Stuffs";
import Roles from "../pages/HRM/Roles";
import PermissionRoute from "./PermissionRoute";


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
            element: (
              <PermissionRoute permission="contact:read">
                <Customer />
              </PermissionRoute>
            ),
          },
          {
            path: "supplier",
            element: (
              <PermissionRoute permission="contact:read">
                <Supplier />
              </PermissionRoute>
            ),
          },

          {
            path: "supplier-ledger/:id",
            element: (
              <PermissionRoute permission="ledger:read">
                <SupplierLedger />
              </PermissionRoute>
            ),
          },
          {
            path: "customer-ledger/:id",
            element: (
              <PermissionRoute permission="ledger:read">
                <CustomerLedger />
              </PermissionRoute>
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
            element: (
              <PermissionRoute permission="product:create">
                <NewProduct />
              </PermissionRoute>
            ),
          },
          {
            path: "list",
            element: (
              <PermissionRoute permission="product:read">
                <ProductList />
              </PermissionRoute>
            ),
          },
          {
            path: "edit/:id",
            element: (
              <PermissionRoute permission="product:update">
                <EditProduct />
              </PermissionRoute>
            ),
          },
          {
            path: "brand",
            element: (
              <PermissionRoute permission="brand:read">
                <Brand />
              </PermissionRoute>
            ),
          },
          {
            path: "unit",
            element: (
              <PermissionRoute permission="unit:read">
                <Unit />
              </PermissionRoute>
            ),
          },
          {
            path: "category",
            element: (
              <PermissionRoute permission="category:read">
                <Category />
              </PermissionRoute>
            ),
          },
          {
            path: "featured-products",
            element: (
              <PermissionRoute permission="featured-product:read">
                <FeatureProduct />
              </PermissionRoute>
            ),
          },
          {
            path: "flash-sale",
            element: (
              <PermissionRoute permission="flash-sale:read">
                <FlashSale />
              </PermissionRoute>
            ),
          },
          {
            path: "flash-products",
            element: (
              <PermissionRoute permission="flash-sale:read">
                <FlashProduct />
              </PermissionRoute>
            ),
          },
          {
            path: "pos-products",
            element: (
              <PermissionRoute permission="product:read">
                <PosProducts />
              </PermissionRoute>
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
            element: <PermissionRoute permission="purchase:create">
              <NewPurchase />
            </PermissionRoute>,
          },
          {
            path: "list",
            element: (
              <PermissionRoute permission="purchase:read">
                <PurchaseList />
              </PermissionRoute>
            ),
          },
          {
            path: "edit/:id",
            element: (
              <PermissionRoute permission="purchase:update">
                <EditPurchase />
              </PermissionRoute>
            ),
          },
          {
            path: "return/:id",
            element: (
              <PermissionRoute permission="purchase-return:create">
                <PurchaseReturn />
              </PermissionRoute>
            ),
          },
          {
            path: "return-list",
            element: (
              <PermissionRoute permission="purchase-return:read">
                <PurchaseReturnList />
              </PermissionRoute>
            ),
          },
          {
            path: 'invoice/:id',
            element: (
              <PermissionRoute permission="purchase:read">
                <PurchaseInvoice />
              </PermissionRoute>
            ),
          }

        ],
      },

      // Sale
      {
        path: "sale",
        children: [
          {
            path: "new",
            element: (
              <PermissionRoute permission="sale:create">
                <NewSale />
              </PermissionRoute>
            ),
          },
          {
            path: "list",
            element: (
              <PermissionRoute permission="sale:read">
                <SaleList />
              </PermissionRoute>
            ),
          },
          {
            path: "return/:id",
            element: (
              <PermissionRoute permission="sale-return:create">
                <SaleReturn />
              </PermissionRoute>
            ),
          },
          {
            path: "return-list",
            element: (
              <PermissionRoute permission="sale-return:read">
                <SaleReturnList />
              </PermissionRoute>
            ),
          },
          {
            path: 'invoice/:id',
            element: (
              <PermissionRoute permission="sale:read">
                <SaleInvoice />
              </PermissionRoute>
            ),
          },
          {
            path: 'fifo-sale',
            element: (
              <PermissionRoute permission="sale:create">
                <FifoSale />
              </PermissionRoute>
            ),
          }

        ],
      },
      // Account
      {
        path: "account",
        children: [
          {
            path: "",
            element: (
              <PermissionRoute permission="account:read">
                <Account />
              </PermissionRoute>
            ),
          },
          {
            path: "transaction/:id",
            element: (
              <PermissionRoute permission="transaction:read">
                <Transactions />
              </PermissionRoute>
            ),
          },
          {
            path: "payment-details/:id",
            element: (
              <PermissionRoute permission="payment:read">
                <PaymentDetails />
              </PermissionRoute>
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
            element: (
              <PermissionRoute permission="damage:create">
                <CreateDamage />
              </PermissionRoute>
            ),
          },
          {
            path: "list",
            element: (
              <PermissionRoute permission="damage:read">
                <DamageList />
              </PermissionRoute>
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
            element: (
              <PermissionRoute permission="warranty:read">
                <WarrantyList />
              </PermissionRoute>
            ),
          }

        ],
      },
      // Expense
      {
        path: "expense",
        children: [
          {
            path: "create",
            element: (
              <PermissionRoute permission="expense:create">
                <NewExpense />
              </PermissionRoute>
            ),
          },
          {
            path: "list",
            element: (
              <PermissionRoute permission="expense:read">
                <ExpenseList />
              </PermissionRoute>
            ),
          },
          {
            path: "types",
            element: (
              <PermissionRoute permission="expense:read">
                <ExpenseTypes />
              </PermissionRoute>
            ),
          }
        ],
      },
      // Quotation
      {
        path: "quotation",
        children: [
          {
            path: "create-sale-quotation",
            element: (
              <PermissionRoute permission="quotation:create">
                <NewSaleQuotation />
              </PermissionRoute>
            ),
          },
          {
            path: "list/sale",
            element: (
              <PermissionRoute permission="quotation:read">
                <SaleQuotationList />
              </PermissionRoute>
            ),
          },
          {
            path: "sale-quotation-invoice/:id",
            element: (
              <PermissionRoute permission="quotation:read">
                <SaleQuotationInvoice />
              </PermissionRoute>
            ),
          }
        ],
      },
      // Barcode
      {
        path: "barcode",
        children: [
          {
            path: "barcode",
            element: (
              <PermissionRoute permission="product:read">
                <GenerateBarcode />
              </PermissionRoute>
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
            element: (
              <PermissionRoute permission="order:create">
                <CreateOrder />
              </PermissionRoute>
            ),
          },
          {
            path: "list",
            element: (
              <PermissionRoute permission="order:read">
                <OrderListInOrders />
              </PermissionRoute>
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
            element: (
              <PermissionRoute permission="parcel:create">
                <CreateParcel />
              </PermissionRoute>
            ),
          },
          {
            path: "order-pack/:id",
            element: (
              <PermissionRoute permission="parcel:pack">
                <OrderPack />
              </PermissionRoute>
            ),
          },
          {
            path: "list",
            element: (
              <PermissionRoute permission="parcel:read">
                <ParcelList />
              </PermissionRoute>
            ),
          }, {
            path: "pending",
            element: (
              <PermissionRoute permission="parcel:read">
                <PendingParcels />
              </PermissionRoute>
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
            element: (
              <PermissionRoute permission="product:read">
                <EcomProductList />
              </PermissionRoute>
            ),
          },
          {
            path: "orders",
            element: (
              <PermissionRoute permission="order:read">
                <OrderListInEcommerce />
              </PermissionRoute>
            ),
          },
          {
            path: "edit-product/:id",
            element: (
              <PermissionRoute permission="product:update">
                <EditEcomProduct />
              </PermissionRoute>
            ),
          },
          {
            path: "banners",
            element: (
              <PermissionRoute permission="banner:read">
                <Banner />
              </PermissionRoute>
            ),
          }, {
            path: "featured-products",
            element: (
              <PermissionRoute permission="featured-product:read">
                <FeatureProduct />
              </PermissionRoute>
            ),
          }, {
            path: "flash-sale",
            element: (
              <PermissionRoute permission="flash-sale:read">
                <FlashSale />
              </PermissionRoute>
            ),
          }, {
            path: "flash-products",
            element: (
              <PermissionRoute permission="flash-sale:read">
                <FlashProduct />
              </PermissionRoute>
            ),
          }, {
            path: "all-users-list",
            element: (
              <PermissionRoute permission="user:read">
                <EcomUserList />
              </PermissionRoute>
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
            element: (
              <PermissionRoute permission="user:read">
                <Stuffs />
              </PermissionRoute>
            ),
          },
          {
            path: "roles",
            element: (
              <PermissionRoute permission="role:read">
                <Roles />
              </PermissionRoute>
            ),
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
