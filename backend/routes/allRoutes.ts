import { Router } from "express";
import productRoute from "../src/product/product.route";
import userRoute from "../src/auth/auth.route";
import categoryRoute from "../src/category/category.route"
import imageRoute from "./image.route";
import contactRoute from "../src/contact/contact.route";
import brandRoute from "../src/brand/brand.route";
import unitRoute from "../src/unit/unit.route";
import purchaseRoute from "../src/purchase/purchase.route"
import accountRoute from "../src/account/account.route"
import saleRoute from "../src/sale/sale.route"
import ledgerRoute from "../src/ledger/ledger.route"
import transactionRoute from "../src/transaction/transaction.route"
import purchaseReturnRoute from "../src/purchase_return/purchase_return.route"
import saleReturnRoute from "../src/sale_return/sale_return.route"
import damageRoute from "../src/damage/damage.route"
import warrantyRoute from "../src/warranty/warranty.route"
import reportRoute from "../src/report/report.route"
import expenseRoute from "../src/expense/expense.route"
import quotationRoute from "../src/quotation/quotation.route"
import cartRoute from "../src/cart/cart.route"
import adminRoute from "../src/admin/role.route"

const router = Router();
router.use("/product", productRoute);
router.use("/brand", brandRoute);
router.use("/unit", unitRoute);
router.use("/auth", userRoute);
router.use("/category", categoryRoute)
router.use("/contact", contactRoute)
router.use("/purchase", purchaseRoute)
router.use("/purchase-return", purchaseReturnRoute)
router.use("/sale", saleRoute)
router.use("/sale-return", saleReturnRoute)
router.use("/account", accountRoute)
router.use("/ledger", ledgerRoute)
router.use("/transaction", transactionRoute)
router.use("/damage", damageRoute)
router.use("/warranty", warrantyRoute)
router.use("/report", reportRoute)
router.use("/expense", expenseRoute)
router.use("/cart", cartRoute)
router.use("/admin/role", adminRoute)
// router.use("/quotation", quotationRoute)

export default router;
