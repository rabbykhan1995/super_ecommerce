import DashboardRepository from "./dashboard.repository";

export class DashboardSummaryService {

  private static async getOrCreate(date: string) {
    const existing = await DashboardRepository.findByDate(date);
    if (existing) return existing;

    const newRow = {
      date,
      totalSale: "0",
      totalSalePaid: "0",
      totalSaleDue: "0",
      totalSaleCount: 0,
      totalSaleQty: 0,
      totalSaleDiscount: "0",
      totalPurchase: "0",
      totalPurchasePaid: "0",
      totalPurchaseDue: "0",
      totalPurchaseCount: 0,
      totalPurchaseQty: 0,
      totalPurchaseDiscount: "0",
      totalSaleReturn: "0",
      totalSaleReturnPaid: "0",
      totalSaleReturnCount: 0,
      totalSaleReturnQty: 0,
      totalSaleReturnDiscount: "0",
      totalPurchaseReturn: "0",
      totalPurchaseReturnPaid: "0",
      totalPurchaseReturnCount: 0,
      totalPurchaseReturnQty: 0,
      totalPurchaseReturnDiscount: "0",
      totalExpense: "0",
      totalExpenseCount: 0,
      totalDamage: "0",
      totalDamageCount: 0,
      totalDamageQty: 0,
      profit: "0",
    };

    return await DashboardRepository.create(newRow);
  }

  private static formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private static async recalculateProfit(date: string) {
    const row = await this.getOrCreate(date);
    const profit =
      Number(row.totalSalePaid) -
      Number(row.totalPurchasePaid) -
      Number(row.totalSaleReturnPaid) +
      Number(row.totalPurchaseReturnPaid) -
      Number(row.totalExpense) -
      Number(row.totalDamage);

    await DashboardRepository.updateByDate(date, { profit: String(profit), updatedAt: new Date() });
  }

  // ========== SALE ==========
  static async updateSale(data: {
    amount: number;
    paid: number;
    due: number;
    qty: number;
    discount: number;
    date: Date;
  }) {
    const date = this.formatDate(data.date);
    await this.getOrCreate(date);

    await DashboardRepository.incrementByDate(date, {
      totalSale: data.amount,
      totalSalePaid: data.paid,
      totalSaleDue: data.due,
      totalSaleCount: 1,
      totalSaleQty: data.qty,
      totalSaleDiscount: data.discount,
    });

    await this.recalculateProfit(date);
  }

  // ========== PURCHASE ==========
  static async updatePurchase(data: {
    amount: number;
    paid: number;
    due: number;
    qty: number;
    discount: number;
    date: Date;
  }) {
    const date = this.formatDate(data.date);
    await this.getOrCreate(date);

    await DashboardRepository.incrementByDate(date, {
      totalPurchase: data.amount,
      totalPurchasePaid: data.paid,
      totalPurchaseDue: data.due,
      totalPurchaseCount: 1,
      totalPurchaseQty: data.qty,
      totalPurchaseDiscount: data.discount,
    });

    await this.recalculateProfit(date);
  }

  // ========== SALE RETURN ==========
  static async updateSaleReturn(data: {
    amount: number;
    paid: number;
    qty: number;
    discount: number;
    date: Date;
  }) {
    const date = this.formatDate(data.date);
    await this.getOrCreate(date);

    await DashboardRepository.incrementByDate(date, {
      totalSaleReturn: data.amount,
      totalSaleReturnPaid: data.paid,
      totalSaleReturnCount: 1,
      totalSaleReturnQty: data.qty,
      totalSaleReturnDiscount: data.discount,
    });

    await this.recalculateProfit(date);
  }

  // ========== PURCHASE RETURN ==========
  static async updatePurchaseReturn(data: {
    amount: number;
    paid: number;
    qty: number;
    discount: number;
    date: Date;
  }) {
    const date = this.formatDate(data.date);
    await this.getOrCreate(date);

    await DashboardRepository.incrementByDate(date, {
      totalPurchaseReturn: data.amount,
      totalPurchaseReturnPaid: data.paid,
      totalPurchaseReturnCount: 1,
      totalPurchaseReturnQty: data.qty,
      totalPurchaseReturnDiscount: data.discount,
    });

    await this.recalculateProfit(date);
  }

  // ========== EXPENSE ==========
  static async updateExpense(data: {
    amount: number;
    date: Date;
  }) {
    const date = this.formatDate(data.date);
    await this.getOrCreate(date);

    await DashboardRepository.incrementByDate(date, {
      totalExpense: data.amount,
      totalExpenseCount: 1,
    });

    await this.recalculateProfit(date);
  }

  // ========== DAMAGE ==========
  static async updateDamage(data: {
    amount: number;
    qty: number;
    date: Date;
  }) {
    const date = this.formatDate(data.date);
    await this.getOrCreate(date);

    await DashboardRepository.incrementByDate(date, {
      totalDamage: data.amount,
      totalDamageCount: 1,
      totalDamageQty: data.qty,
    });

    await this.recalculateProfit(date);
  }

  // ========== READ METHODS ==========

  static async getSummary(fromDate: string, toDate: string) {
    const rows = await DashboardRepository.findRange(fromDate, toDate);

    const summary = rows.reduce(
      (acc, row) => ({
        totalSale: acc.totalSale + Number(row.totalSale),
        totalSalePaid: acc.totalSalePaid + Number(row.totalSalePaid),
        totalSaleDue: acc.totalSaleDue + Number(row.totalSaleDue),
        totalSaleCount: acc.totalSaleCount + (row.totalSaleCount || 0),
        totalSaleQty: acc.totalSaleQty + (row.totalSaleQty || 0),
        totalSaleDiscount: acc.totalSaleDiscount + Number(row.totalSaleDiscount),
        totalPurchase: acc.totalPurchase + Number(row.totalPurchase),
        totalPurchasePaid: acc.totalPurchasePaid + Number(row.totalPurchasePaid),
        totalPurchaseDue: acc.totalPurchaseDue + Number(row.totalPurchaseDue),
        totalPurchaseCount: acc.totalPurchaseCount + (row.totalPurchaseCount || 0),
        totalPurchaseQty: acc.totalPurchaseQty + (row.totalPurchaseQty || 0),
        totalPurchaseDiscount: acc.totalPurchaseDiscount + Number(row.totalPurchaseDiscount),
        totalSaleReturn: acc.totalSaleReturn + Number(row.totalSaleReturn),
        totalSaleReturnPaid: acc.totalSaleReturnPaid + Number(row.totalSaleReturnPaid),
        totalSaleReturnCount: acc.totalSaleReturnCount + (row.totalSaleReturnCount || 0),
        totalSaleReturnQty: acc.totalSaleReturnQty + (row.totalSaleReturnQty || 0),
        totalSaleReturnDiscount: acc.totalSaleReturnDiscount + Number(row.totalSaleReturnDiscount),
        totalPurchaseReturn: acc.totalPurchaseReturn + Number(row.totalPurchaseReturn),
        totalPurchaseReturnPaid: acc.totalPurchaseReturnPaid + Number(row.totalPurchaseReturnPaid),
        totalPurchaseReturnCount: acc.totalPurchaseReturnCount + (row.totalPurchaseReturnCount || 0),
        totalPurchaseReturnQty: acc.totalPurchaseReturnQty + (row.totalPurchaseReturnQty || 0),
        totalPurchaseReturnDiscount: acc.totalPurchaseReturnDiscount + Number(row.totalPurchaseReturnDiscount),
        totalExpense: acc.totalExpense + Number(row.totalExpense),
        totalExpenseCount: acc.totalExpenseCount + (row.totalExpenseCount || 0),
        totalDamage: acc.totalDamage + Number(row.totalDamage),
        totalDamageCount: acc.totalDamageCount + (row.totalDamageCount || 0),
        totalDamageQty: acc.totalDamageQty + (row.totalDamageQty || 0),
      }),
      {
        totalSale: 0,
        totalSalePaid: 0,
        totalSaleDue: 0,
        totalSaleCount: 0,
        totalSaleQty: 0,
        totalSaleDiscount: 0,
        totalPurchase: 0,
        totalPurchasePaid: 0,
        totalPurchaseDue: 0,
        totalPurchaseCount: 0,
        totalPurchaseQty: 0,
        totalPurchaseDiscount: 0,
        totalSaleReturn: 0,
        totalSaleReturnPaid: 0,
        totalSaleReturnCount: 0,
        totalSaleReturnQty: 0,
        totalSaleReturnDiscount: 0,
        totalPurchaseReturn: 0,
        totalPurchaseReturnPaid: 0,
        totalPurchaseReturnCount: 0,
        totalPurchaseReturnQty: 0,
        totalPurchaseReturnDiscount: 0,
        totalExpense: 0,
        totalExpenseCount: 0,
        totalDamage: 0,
        totalDamageCount: 0,
        totalDamageQty: 0,
      }
    );

    const profit =
      summary.totalSalePaid -
      summary.totalPurchasePaid -
      summary.totalSaleReturnPaid +
      summary.totalPurchaseReturnPaid -
      summary.totalExpense -
      summary.totalDamage;

    return { ...summary, profit };
  }

  static async getDailyBreakdown(fromDate: string, toDate: string) {
    return await DashboardRepository.findRange(fromDate, toDate);
  }
}
