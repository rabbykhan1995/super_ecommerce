import mongoose, { ClientSession } from "mongoose";
import { ApiError } from "../../utils/ApiError";
import Helper from "../../utils/helper";
import ContactService from "../contact/contact.service";
import ProductService from "../product/product.service";
import { CreateFifoSaleInput, CreateSaleInput, Sale } from "./sale.type";
import SaleCounter from "./saleCounter.model";
import SaleRepository from "./sale.repository";
import { AccountService } from "../account/account.service";
import PayloadBuilder from "../../utils/builder";
import TransactionService from "../transaction/transaction.service";
import LedgerService from "../ledger/ledger.service";
import { RedisReportService } from "../../utils/ReportServiceRedis";
import WarrantyService from "../warranty/warranty.service";
import PurchaseService from "../purchase/purchase.service";



export default class SaleService {
    static async create(payload: CreateSaleInput) {
        let sale = payload.sale;
        const products = payload.products;
        const accounts = payload.accounts;
        const exchangeAccounts = payload.exchangeAccounts;
        let customer;
        let mainProducts: any = [];

        if (sale.contactID) {
            // const contactID = new Types.ObjectId(sale.contactID as string);
            customer = await ContactService.findByID(sale.contactID);
            if (!customer) throw new ApiError(404, "Customer not found");

            sale.balanceBefore = customer.balance ?? 0;
            sale.balanceAfter = sale.paid - (sale.totalAmount - sale.balanceBefore);

        }


        // stock checking before sale
        await Promise.all(
            products.map(async (p) => {
                const [product, batch] = await Promise.all([
                    ProductService.findById(p.productID),
                    p.batchID ? ProductService.findBatchByID(p.batchID) : null,
                ]);

                if (!product) throw new ApiError(404, `Product not found`);
                mainProducts.push(product);

                const soldQty = product.decimal ? Helper.roundQty(p.soldQty) : p.soldQty;

                p.soldQty = soldQty;

                if (!product.manageStock) return;

                if (p.batchID) {
                    if (!batch) throw new ApiError(404, `Batch not found`);
                    if (batch.remainingQty < soldQty) {
                        throw new ApiError(400, `Insufficient stock for ${product.name}. Available: ${batch.remainingQty}`);
                    }
                } else {
                    if (product.stock < soldQty) {
                        throw new ApiError(400, `Insufficient stock for ${product.name}. Available: ${product.stock}`);
                    }
                }
            })
        );

        // transaction শুরু - যেন partial create না হয়
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const counter = await SaleCounter.findOneAndUpdate(
                {},
                { $inc: { counter: 1 } },
                { new: true, upsert: true, session }
            );
            const invoiceNo: string = `INV-${counter!.counter}`;


            const formattedProducts = products.map(p => ({
                ...p,
                productID: p.productID,
                batchID: p.batchID ?? null,
                warranty: p.warranty ? p.warranty : 0

            }));

            // purchase create


            const salePayload = [{ ...sale, invoiceNo, accounts, products: formattedProducts, customerID: sale.contactID as string, exchangeAccounts: exchangeAccounts }];

            const saleCreated = await SaleRepository.create(salePayload, session);

            //  update each batch by reducing thier remaining stock;
            await Promise.all(
                products.map(async (p) => {
                    if (!p.batchID) {
                        const product = await ProductService.findById(p.productID);

                        if (!!product && !product.manageStock) {
                            return;
                        }
                    } else {
                        const batch = await ProductService.findBatchByID(p.batchID!.toString(), session);
                        if (!batch) return;

                        const newQty = batch.remainingQty - p.soldQty;
                        const willBeEmpty = newQty <= 0;

                        await ProductService.updateBatchDynamically(batch._id!.toString(),
                            {
                                inc: { remainingQty: -p.soldQty, soldQty: p.soldQty },
                                ...(willBeEmpty && { set: { isActive: false } }),
                            }, session)

                        if (willBeEmpty) {
                            const nextBatch = await ProductService.findOneBatch({
                                productID: p.productID,
                                isActive: true,
                                remainingQty: { $gt: 0 },
                            }, session)
                                .sort({ PurchaseDate: 1 })
                            if (!!nextBatch) {
                                await ProductService.updateProductFifoBatchAndStock(
                                    p.productID,
                                    { fifoBatchID: nextBatch._id.toString() ?? null },
                                    session
                                );
                            } else {
                                await ProductService.updateProductFifoBatchAndStock(
                                    p.productID,
                                    { fifoBatchID: undefined },
                                    session
                                );
                            }




                        }

                        const mainProduct = mainProducts.find(
                            (prod: any) => prod._id.toString() === p.productID
                        );

                        if (mainProduct?.manageStock) {
                            await ProductService.updateProductFifoBatchAndStock(
                                p.productID,
                                { qty: -p.soldQty },
                                session
                            );
                        }
                        // now warranty will create on this product
                        if (mainProduct?.manageWarranty && !!batch.serial) {
                            const purchase = await PurchaseService.purchaseByID(batch.purchaseID!.toString());

                            await WarrantyService.create({
                                saleID: saleCreated[0]._id.toString(),
                                customerID: customer! ? customer._id : null,
                                supplierID: purchase!.supplierID.toString(),
                                productID: p.productID.toString(),
                                batchID: p.batchID.toString(),
                                serial: batch.serial!.toString(),
                                salePrice: p.salePrice,
                                warranty: Number(p.warranty),
                                saleDate: saleCreated[0].SaleDate,
                                expireDate: Helper.getWarrantyExpireDate(saleCreated[0].SaleDate, p.warranty!),
                            }, session);
                        }
                    }
                })
            );
            //  Accounts
            const isPaymentHappened: boolean = saleCreated[0].paid > 0;
            if (isPaymentHappened) {
                // accounts balance update
                await AccountService.increaseBalance(accounts, session);

                const transactionPayload = PayloadBuilder.transaction(accounts, { type: "sale", typeID: saleCreated[0]._id, typeModel: "Sale", date: sale.saleDate ?? new Date(), status: "completed", accountField: "toAccount" })

                await TransactionService.create(transactionPayload, session);
            }
            const isExchangeHappened: boolean = saleCreated[0].exchangeAmount > 0;
            if (isExchangeHappened) {
                await AccountService.decreaseBalance(exchangeAccounts, session);

                const transactionPayload = PayloadBuilder.transaction(exchangeAccounts, { type: "exchange", typeID: saleCreated[0]._id, typeModel: "Sale", date: sale.saleDate ?? new Date(), status: "completed", accountField: "fromAccount" })

                await TransactionService.create(transactionPayload, session);
            }
            // ledger
            if (customer) {
                const amount = sale.balanceAfter - sale.balanceBefore;
                await ContactService.balanceUpdate(customer._id, amount, session);
                // Ekhane Transaction & Ledger er logic bosbe customer er...
                const payableAmount: number = sale.totalAmount - (sale.balanceBefore || 0)
                const ledgerPayload = PayloadBuilder.ledger({
                    type: "sale",
                    typeID: saleCreated[0]._id,
                    typeModel: "Sale",
                    contactID: customer._id,
                    contactType: "customer",
                    amount: payableAmount,
                    discount: sale.discount,
                    paidAmount: sale.paid,
                    dueAmount: payableAmount - sale.paid,
                    note: sale.note ?? "",
                    date: sale.saleDate,
                    balanceAfter: sale.balanceAfter,
                    balanceBefore: sale.balanceBefore
                })

                await LedgerService.create(ledgerPayload, session);
            }

            await session.commitTransaction();

            await RedisReportService.updateSaleReport({
                amount: sale.totalAmount,
                qty: products.reduce((sum, p) => sum + p.soldQty, 0),
                due: sale.totalAmount - sale.paid,
                paid: sale.paid,
                discount: sale.discount ?? 0,
                date: saleCreated[0].SaleDate
            });
            return saleCreated[0]
        } catch (err) {
            await session.abortTransaction();
            throw err;
        } finally {
            session.endSession();
        }
    }

    static async list(query: any) {
        return await SaleRepository.list(query);
    }

    static async saleInvoiceByID(id: number) {
        const sale: Sale = await SaleRepository.getSaleByID(id);
  
        if (!sale) {
            throw new ApiError(404, "sale not found");
        }

      let accounts;
        let exchangeAccounts;
        if (sale.paid > 0) {
            const transactions = await TransactionService.findBySourceID(sale.id, "sale");
            accounts = transactions.filter(t=>t.type === "credit");

        }

        if(sale.exchangeAmount>0){
            
        }




        return sale
    }

    static async delete(id: string) {
        const sale = await SaleRepository.getSaleByID(id);
        if (!sale) throw new ApiError(404, "Sale not found");

        if (!sale.deletable) {
            throw new ApiError(400, "Sale can not be deleted");
        }
        const session = await mongoose.startSession();
        session.startTransaction();


        try {
            await Promise.all(
                sale.products
                    .filter((p) => p.batchID)
                    .map(async (p) => {
                        const updatedBatch = await ProductService.updateBatchDynamically(
                            p.batchID!.toString(),
                            {
                                inc: {
                                    remainingQty: p.soldQty,
                                    soldQty: -p.soldQty,
                                },

                                set: {
                                    isActive: true,
                                },
                            },
                            session
                        );

                        // fifoBatchID check — এই batch আগের fifo batch হতে পারে
                        const product = await ProductService.findById(p.productID.toString(), session)
                        if (updatedBatch && product) {
                            const currentFifoBatch = await ProductService.findBatchByID(product.fifoBatchID!.toString(), session);
                            // এই batch এর PurchaseDate আগের fifo batch এর চেয়ে পুরনো হলে update করো
                            if (
                                !currentFifoBatch ||
                                updatedBatch.PurchaseDate < currentFifoBatch.PurchaseDate
                            ) {
                                await ProductService.updateProductFifoBatchAndStock(p.productID.toString(), { fifoBatchID: updatedBatch._id.toString() }, session);
                            }
                        }
                    })
            );

            // product stock restore
            await Promise.all(
                sale.products.map((p) =>
                    ProductService.updateProductFifoBatchAndStock(
                        p.productID!.toString(),
                        { qty: p.soldQty },
                        session
                    )
                )
            );

            // account balance reverse

            const isPaymentHappened: boolean = sale.accounts.length > 0
            if (isPaymentHappened) {
                await AccountService.decreaseBalance(
                    sale.accounts.map((a) => ({
                        ...a,
                        accountID: a.accountID!.toString(),
                    })),
                    session
                );

                await TransactionService.deleteTransactions({ typeID: sale._id }, session);
            }
            const isExchangeHappened: boolean = sale.exchangeAmount > 0;
            if (isExchangeHappened) {
                await AccountService.increaseBalance(sale.exchangeAccounts.map(a => ({ ...a, accountID: a.accountID.toString() })), session);
            }

            // customer balance restore
            if (sale.customerID) {
                const rollbackAmount = -(sale.balanceAfter - sale.balanceBefore)
                await ContactService.balanceUpdate(
                    sale.customerID.toString(),
                    rollbackAmount,
                    session
                );
            }

            await WarrantyService.deleteManyBySaleID(sale._id.toString(), session);


            await LedgerService.deleteLedger({ typeID: sale._id }, session);

            await session.commitTransaction();

            await RedisReportService.updateSaleReport({
                amount: -sale.totalAmount,
                qty: -sale.products.reduce((sum, p) => sum + p.soldQty, 0),
                due: -(sale.totalAmount - sale.paid),
                paid: -sale.paid,
                discount: -(sale.discount ?? 0),
                date: sale.SaleDate,
            });


        } catch (err) {
            await session.abortTransaction();
            throw err;
        } finally {
            session.endSession();
        }
    }

    static async getSaleByID(id: string) {
        return await SaleRepository.getSaleByID(id);
    }

    static async findAndUpdateByID(
        id: string,
        update: Record<string, any>,
        session?: ClientSession
    ) {
        return SaleRepository.findAndUpdateByID(
            id,
            update,
            session
        );
    }

    static async fifoSale(payload: CreateFifoSaleInput) {
        // Ekhane ki hobe: Prottek ta product je rack a sajano thakbe, seta ekdom old stock er ta, tahole ei sale ta applicable hobe, tachara eta risky hobe..ba problem hobe...
        let sale = payload.sale;
        const products = payload.products;
        const accounts = payload.accounts;
        const exchangeAccounts = payload.exchangeAccounts;
        let customer;
        let mainProducts: any = [];

        if (sale.contactID) {
            // const contactID = new Types.ObjectId(sale.contactID as string);
            customer = await ContactService.findByID(sale.contactID);
            if (!customer) throw new ApiError(404, "Customer not found");

            sale.balanceBefore = customer.balance ?? 0;
            sale.balanceAfter = sale.paid - (sale.totalAmount - sale.balanceBefore);

        }


        // stock checking before sale
        await Promise.all(
            products.map(async (p) => {
                const product = await ProductService.findById(p.productID);

                if (!product) {
                    throw new ApiError(404, `Product not found`);
                }

                if (product.manageWarranty) {
                    throw new ApiError(401, `Warranty Products are not acceptable`);
                }

                mainProducts.push(product);

                const soldQty = product.decimal
                    ? Helper.roundQty(p.soldQty)
                    : p.soldQty;

                p.soldQty = soldQty;

                // ✅ ONLY validate stock if manageStock is true
                if (product.manageStock) {
                    if (product.stock < soldQty) {
                        throw new ApiError(
                            400,
                            `Insufficient stock for ${product.name}. Available: ${product.stock}`
                        );
                    }
                }

                // ❌ manageStock === false → skip validation (unlimited sale)
            })
        );

        // transaction শুরু - যেন partial create না হয়
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const counter = await SaleCounter.findOneAndUpdate(
                {},
                { $inc: { counter: 1 } },
                { new: true, upsert: true, session }
            );
            const invoiceNo: string = `INV-${counter!.counter}`;


            const formattedProducts = products.map(p => ({
                ...p,
                productID: p.productID,
                batchID: null,
                warranty: 0
            }));

            // purchase create


            const salePayload = [{ ...sale, invoiceNo, accounts, products: formattedProducts, customerID: sale.contactID as string, exchangeAccounts: exchangeAccounts }];

            const saleCreated = await SaleRepository.create(salePayload, session);

            //  update each batch by reducing thier remaining stock on PurchaseDate;
            await Promise.all(
                products.map(async (p) => {

                    const mainProduct = mainProducts.find(
                        (prod: any) => prod._id.toString() === p.productID
                    );

                    if (!mainProduct.manageStock) {
                        return;
                    }

                    const batches = await ProductService.findBatches({
                        productID: p.productID,
                        isActive: true,
                        remainingQty: { $gt: 0 }
                    });

                    if (batches.length === 0) {
                        throw new ApiError(400, "No active batches available at this moment");
                    }

                    const selectedFifoBatch = batches[0];
                    if (selectedFifoBatch.remainingQty < p.soldQty) {
                        throw new ApiError(400, "Sorry you can not sale the access amount of fifo batch");
                    }
                    const newQty = selectedFifoBatch.remainingQty - p.soldQty;
                    const willBeEmpty = newQty <= 0;

                    await ProductService.updateBatchDynamically(selectedFifoBatch._id!.toString(),
                        {
                            inc: { remainingQty: -p.soldQty, soldQty: p.soldQty },
                            ...(willBeEmpty && { set: { isActive: false } }),
                        }, session)

                    if (willBeEmpty) {
                        const nextBatch = await ProductService.findOneBatch({
                            productID: p.productID,
                            isActive: true,
                            remainingQty: { $gt: 0 },
                        }, session)
                            .sort({ PurchaseDate: 1 })
                        if (!!nextBatch) {
                            await ProductService.updateProductFifoBatchAndStock(
                                p.productID,
                                { fifoBatchID: nextBatch._id.toString() ?? null },
                                session
                            );
                        } else {
                            await ProductService.updateProductFifoBatchAndStock(
                                p.productID,
                                { fifoBatchID: undefined },
                                session
                            );
                        }
                    }


                    await ProductService.updateProductFifoBatchAndStock(
                        p.productID,
                        { qty: -p.soldQty },
                        session
                    );



                })
            );
            //  Accounts
            const isPaymentHappened: boolean = saleCreated[0].paid > 0;
            if (isPaymentHappened) {
                // accounts balance update
                await AccountService.increaseBalance(accounts, session);
                const transactionPayload = PayloadBuilder.transaction(accounts, { type: "sale", typeID: saleCreated[0]._id, typeModel: "Sale", date: sale.saleDate ?? new Date(), status: "completed", accountField: "toAccount" })

                await TransactionService.create(transactionPayload, session);
            }
            const isExchangeHappened: boolean = saleCreated[0].exchangeAmount > 0;
            if (isExchangeHappened) {
                await AccountService.decreaseBalance(exchangeAccounts, session);
                const transactionPayload = PayloadBuilder.transaction(exchangeAccounts, { type: "exchange", typeID: saleCreated[0]._id, typeModel: "Sale", date: sale.saleDate ?? new Date(), status: "completed", accountField: "fromAccount" })
                await TransactionService.create(transactionPayload, session);
            }
            // ledger
            if (customer) {
                //ekhane kichu update korte hobe, balance update korar somoy sale.paid dicchi, eta wrong value calculate korche...tai thik value dite hobe and fix korte hobe.   

                const amount = sale.balanceAfter - sale.balanceBefore;
                await ContactService.balanceUpdate(customer._id, amount, session);
                // Ekhane Transaction & Ledger er logic bosbe customer er...
                const payableAmount: number = sale.totalAmount - (sale.balanceBefore || 0)
                const ledgerPayload = PayloadBuilder.ledger({
                    type: "sale",
                    typeID: saleCreated[0]._id,
                    typeModel: "Sale",
                    contactID: customer._id,
                    contactType: "customer",
                    amount: payableAmount,
                    discount: sale.discount,
                    paidAmount: sale.paid,
                    dueAmount: payableAmount - sale.paid,
                    note: sale.note ?? "",
                    date: sale.saleDate,
                    balanceAfter: sale.balanceAfter,
                    balanceBefore: sale.balanceBefore
                })

                await LedgerService.create(ledgerPayload, session);
            }

            await session.commitTransaction();

            await RedisReportService.updateSaleReport({
                amount: sale.totalAmount,
                qty: products.reduce((sum, p) => sum + p.soldQty, 0),
                due: sale.totalAmount - sale.paid,
                paid: sale.paid,
                discount: sale.discount ?? 0,
                date: sale.saleDate
            });
            return saleCreated[0]
        } catch (err) {
            await session.abortTransaction();
            throw err;
        } finally {
            session.endSession();
        }
    }
}