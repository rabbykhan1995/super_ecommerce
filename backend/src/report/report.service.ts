import { DashboardSummaryService } from "../dashboard/dashboard.service";

export default class ReportService {

    static async dashboardReport(query: any) {

        const fromDate = new Date(query.fromDate);
        const toDate = new Date(query.toDate);

        const fromDateStr = fromDate.toISOString().slice(0, 10);
        const toDateStr = toDate.toISOString().slice(0, 10);

        const summary = await DashboardSummaryService.getSummary(fromDateStr, toDateStr);
        const dailyData = await DashboardSummaryService.getDailyBreakdown(fromDateStr, toDateStr);

        // Build chart arrays from daily breakdown
        const salesTrend = dailyData.map(row => ({
            date: row.date,
            amount: Number(row.totalSale),
        }));

        const purchaseTrend = dailyData.map(row => ({
            date: row.date,
            amount: Number(row.totalPurchase),
        }));

        const profitTrend = dailyData.map(row => ({
            date: row.date,
            profit: Number(row.profit),
        }));

        const saleVsPurchase = dailyData.map(row => ({
            date: row.date,
            sale: Number(row.totalSale),
            purchase: Number(row.totalPurchase),
        }));

        return {
            cards: {
                totalSale: summary.totalSale,
                totalPurchase: summary.totalPurchase,
                totalSaleReturn: summary.totalSaleReturn,
                totalPurchaseReturn: summary.totalPurchaseReturn,

                totalSalePaid: summary.totalSalePaid,
                totalPurchasePaid: summary.totalPurchasePaid,

                totalSaleDue: summary.totalSaleDue,
                totalPurchaseDue: summary.totalPurchaseDue,

                totalProfit: summary.profit,
            },

            overview: {
                sale: {
                    count: summary.totalSaleCount,
                    total_amount: summary.totalSale,
                    total_qty: summary.totalSaleQty,
                    total_due: summary.totalSaleDue,
                    total_paid: summary.totalSalePaid,
                    total_discount: summary.totalSaleDiscount,
                },
                purchase: {
                    count: summary.totalPurchaseCount,
                    total_amount: summary.totalPurchase,
                    total_qty: summary.totalPurchaseQty,
                    total_due: summary.totalPurchaseDue,
                    total_paid: summary.totalPurchasePaid,
                    total_discount: summary.totalPurchaseDiscount,
                },
                saleReturn: {
                    count: summary.totalSaleReturnCount,
                    total_amount: summary.totalSaleReturn,
                    total_qty: summary.totalSaleReturnQty,
                    total_paid: summary.totalSaleReturnPaid,
                    total_discount: summary.totalSaleReturnDiscount,
                },
                purchaseReturn: {
                    count: summary.totalPurchaseReturnCount,
                    total_amount: summary.totalPurchaseReturn,
                    total_qty: summary.totalPurchaseReturnQty,
                    total_paid: summary.totalPurchaseReturnPaid,
                    total_discount: summary.totalPurchaseReturnDiscount,
                },
            },

            charts: {
                salesTrend,
                purchaseTrend,
                profitTrend,
                saleVsPurchase,

                returnsBreakdown: [
                    {
                        name: "Sale Return",
                        value: summary.totalSaleReturn,
                    },
                    {
                        name: "Purchase Return",
                        value: summary.totalPurchaseReturn,
                    },
                ],
            },
        };
    }
}
