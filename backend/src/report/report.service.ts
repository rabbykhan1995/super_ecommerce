import redis from "../../config/redis.config";

export default class ReportService {

    static async dashboardReport(query: any) {

        const fromDate = new Date(query.fromDate);
        const toDate = new Date(query.toDate);

        const purchase = {
            count: 0,
            total_amount: 0,
            total_qty: 0,
            total_due: 0,
            total_paid: 0,
            total_discount: 0,
        };

        const sale = {
            count: 0,
            total_amount: 0,
            total_qty: 0,
            total_due: 0,
            total_paid: 0,
            total_discount: 0,
        };

        const purchaseReturn = {
            count: 0,
            total_amount: 0,
            total_qty: 0,
            total_paid: 0,
            total_discount: 0,
        };

        const saleReturn = {
            count: 0,
            total_amount: 0,
            total_qty: 0,
            total_paid: 0,
            total_discount: 0,
        };

        const pipeline = redis.pipeline();

        const dates: string[] = [];
        const current = new Date(fromDate);

        while (current <= toDate) {
            dates.push(current.toISOString().slice(0, 10));
            current.setDate(current.getDate() + 1);
        }

        // charts arrays
        const salesTrend: any[] = [];
        const purchaseTrend: any[] = [];
        const profitTrend: any[] = [];
        const saleVsPurchase: any[] = [];

        for (const date of dates) {

            pipeline.hgetall(`report:purchase:daily:${date}`);
            pipeline.hgetall(`report:sale:daily:${date}`);
            pipeline.hgetall(`report:purchase_return:daily:${date}`);
            pipeline.hgetall(`report:sale_return:daily:${date}`);
        }

        const results = await pipeline.exec();

        let index = 0;

        for (const date of dates) {

            const purchaseData = results?.[index++]?.[1] as any || {};
            const saleData = results?.[index++]?.[1] as any || {};
            const purchaseReturnData = results?.[index++]?.[1] as any || {};
            const saleReturnData = results?.[index++]?.[1] as any || {};

            // -------------------------
            // SUMMARY CALCULATION
            // -------------------------

            if (Object.keys(purchaseData).length) {
                purchase.count += Number(purchaseData.count || 0);
                purchase.total_amount += Number(purchaseData.total_amount || 0);
                purchase.total_qty += Number(purchaseData.total_qty || 0);
                purchase.total_due += Number(purchaseData.total_due || 0);
                purchase.total_paid += Number(purchaseData.total_paid || 0);
                purchase.total_discount += Number(purchaseData.total_discount || 0);
            }

            if (Object.keys(saleData).length) {
                sale.count += Number(saleData.count || 0);
                sale.total_amount += Number(saleData.total_amount || 0);
                sale.total_qty += Number(saleData.total_qty || 0);
                sale.total_due += Number(saleData.total_due || 0);
                sale.total_paid += Number(saleData.total_paid || 0);
                sale.total_discount += Number(saleData.total_discount || 0);
            }

            if (Object.keys(purchaseReturnData).length) {
                purchaseReturn.count += Number(purchaseReturnData.count || 0);
                purchaseReturn.total_amount += Number(purchaseReturnData.total_amount || 0);
                purchaseReturn.total_qty += Number(purchaseReturnData.total_qty || 0);
                purchaseReturn.total_paid += Number(purchaseReturnData.total_paid || 0);
                purchaseReturn.total_discount += Number(purchaseReturnData.total_discount || 0);
            }

            if (Object.keys(saleReturnData).length) {
                saleReturn.count += Number(saleReturnData.count || 0);
                saleReturn.total_amount += Number(saleReturnData.total_amount || 0);
                saleReturn.total_qty += Number(saleReturnData.total_qty || 0);
                saleReturn.total_paid += Number(saleReturnData.total_paid || 0);
                saleReturn.total_discount += Number(saleReturnData.total_discount || 0);
            }

            // -------------------------
            // CHART DATA (IMPORTANT)
            // -------------------------

            const dailySale = Number(saleData.total_amount || 0);
            const dailyPurchase = Number(purchaseData.total_amount || 0);

            const dailyProfit =
                Number(saleData.total_paid || 0) -
                Number(purchaseData.total_paid || 0) -
                Number(saleReturnData.total_paid || 0) +
                Number(purchaseReturnData.total_paid || 0);

            salesTrend.push({
                date,
                amount: dailySale,
            });

            purchaseTrend.push({
                date,
                amount: dailyPurchase,
            });

            profitTrend.push({
                date,
                profit: dailyProfit,
            });

            saleVsPurchase.push({
                date,
                sale: dailySale,
                purchase: dailyPurchase,
            });
        }

        return {
            cards: {
                totalSale: sale.total_amount,
                totalPurchase: purchase.total_amount,
                totalSaleReturn: saleReturn.total_amount,
                totalPurchaseReturn: purchaseReturn.total_amount,

                totalSalePaid: sale.total_paid,
                totalPurchasePaid: purchase.total_paid,

                totalSaleDue: sale.total_due,
                totalPurchaseDue: purchase.total_due,

                totalProfit:
                    sale.total_paid -
                    purchase.total_paid -
                    saleReturn.total_paid +
                    purchaseReturn.total_paid,
            },

            overview: {
                sale,
                purchase,
                saleReturn,
                purchaseReturn,
            },

            charts: {
                salesTrend,
                purchaseTrend,
                profitTrend,
                saleVsPurchase,

                returnsBreakdown: [
                    {
                        name: "Sale Return",
                        value: saleReturn.total_amount,
                    },
                    {
                        name: "Purchase Return",
                        value: purchaseReturn.total_amount,
                    },
                ],
            },
        };
    }
}