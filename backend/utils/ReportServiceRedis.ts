import redis from "../config/redis.config";
import Helper from "./helper";

export class RedisReportService {

static async updatePurchaseReport(data: {
    amount: number;
    qty: number;
    due: number;
    paid: number;
    discount: number;
    date: Date;
  }) {

    const d = new Date(data.date);

    const day = d.toISOString().slice(0, 10);
    const month = day.slice(0, 7);
    const year = day.slice(0, 4);

    const week = Helper.getWeekNumber(d);

    const dailyKey = `report:purchase:daily:${day}`;
    const weeklyKey = `report:purchase:weekly:${year}-W${week}`;
    const monthlyKey = `report:purchase:monthly:${month}`;
    const yearlyKey = `report:purchase:yearly:${year}`;
    const totalKey = `stats:purchase:total`;

    const pipeline = redis.pipeline();

    const keys = [dailyKey, weeklyKey, monthlyKey, yearlyKey, totalKey];

    for (const key of keys) {

      pipeline.hincrby(key, "count", 1);
      pipeline.hincrbyfloat(key, "total_amount", data.amount);
      pipeline.hincrby(key, "total_qty", data.qty);
      pipeline.hincrbyfloat(key, "total_due", data.due);
      pipeline.hincrbyfloat(key, "total_paid", data.paid);
      pipeline.hincrbyfloat(key, "total_discount", data.discount);

    }

    await pipeline.exec();
}
static async updatePurchaseReturnReport(data: {
    amount: number;
    qty: number;
    paid: number;
    discount: number;
    date: Date;
}) {
    const d = new Date(data.date);

    const day = d.toISOString().slice(0, 10);
    const month = day.slice(0, 7);
    const year = day.slice(0, 4);
    const week = Helper.getWeekNumber(d);

    const dailyKey   = `report:purchase_return:daily:${day}`;
    const weeklyKey  = `report:purchase_return:weekly:${year}-W${week}`;
    const monthlyKey = `report:purchase_return:monthly:${month}`;
    const yearlyKey  = `report:purchase_return:yearly:${year}`;
    const totalKey   = `stats:purchase_return:total`;

    const pipeline = redis.pipeline();

    const keys = [dailyKey, weeklyKey, monthlyKey, yearlyKey, totalKey];

    for (const key of keys) {
        pipeline.hincrby(key, "count", 1);
        pipeline.hincrbyfloat(key, "total_amount", data.amount);
        pipeline.hincrby(key, "total_qty", data.qty);
        pipeline.hincrbyfloat(key, "total_paid", data.paid);
        pipeline.hincrbyfloat(key, "total_discount", data.discount);
    }

    await pipeline.exec();
}
static async updateSaleReport(data: {
    amount: number;
    qty: number;
    due: number;
    paid: number;
    discount: number;
    date: Date;
  }) {

    const d = new Date(data.date);

    const day = d.toISOString().slice(0, 10);
    const month = day.slice(0, 7);
    const year = day.slice(0, 4);

    const week = Helper.getWeekNumber(d);

    const dailyKey = `report:sale:daily:${day}`;
    const weeklyKey = `report:sale:weekly:${year}-W${week}`;
    const monthlyKey = `report:sale:monthly:${month}`;
    const yearlyKey = `report:sale:yearly:${year}`;
    const totalKey = `stats:sale:total`;

    const pipeline = redis.pipeline();

    const keys = [dailyKey, weeklyKey, monthlyKey, yearlyKey, totalKey];

    for (const key of keys) {

      pipeline.hincrby(key, "count", 1);
      pipeline.hincrbyfloat(key, "total_amount", data.amount);
      pipeline.hincrby(key, "total_qty", data.qty);
      pipeline.hincrbyfloat(key, "total_due", data.due);
      pipeline.hincrbyfloat(key, "total_paid", data.paid);
      pipeline.hincrbyfloat(key, "total_discount", data.discount);

    }

    await pipeline.exec();
}
static async updateSaleReturnReport(data: {
    amount: number;
    qty: number;
    paid: number;
    discount: number;
    date: Date;
}) {
    const d = new Date(data.date);

    const day = d.toISOString().slice(0, 10);
    const month = day.slice(0, 7);
    const year = day.slice(0, 4);
    const week = Helper.getWeekNumber(d);

    const dailyKey   = `report:sale_return:daily:${day}`;
    const weeklyKey  = `report:sale_return:weekly:${year}-W${week}`;
    const monthlyKey = `report:sale_return:monthly:${month}`;
    const yearlyKey  = `report:sale_return:yearly:${year}`;
    const totalKey   = `stats:sale_return:total`;

    const pipeline = redis.pipeline();

    const keys = [dailyKey, weeklyKey, monthlyKey, yearlyKey, totalKey];

    for (const key of keys) {
        pipeline.hincrby(key, "count", 1);
        pipeline.hincrbyfloat(key, "total_amount", data.amount);
        pipeline.hincrby(key, "total_qty", data.qty);
        pipeline.hincrbyfloat(key, "total_paid", data.paid);
        pipeline.hincrbyfloat(key, "total_discount", data.discount);
    }

    await pipeline.exec();
}
static async updateExpenseReport(data: {
    paid: number;
    date: Date;
  }) {

    const d = new Date(data.date);

    const day = d.toISOString().slice(0, 10);
    const month = day.slice(0, 7);
    const year = day.slice(0, 4);

    const week = Helper.getWeekNumber(d);

    const dailyKey = `report:sale:daily:${day}`;
    const weeklyKey = `report:sale:weekly:${year}-W${week}`;
    const monthlyKey = `report:sale:monthly:${month}`;
    const yearlyKey = `report:sale:yearly:${year}`;
    const totalKey = `stats:sale:total`;

    const pipeline = redis.pipeline();

    const keys = [dailyKey, weeklyKey, monthlyKey, yearlyKey, totalKey];

    for (const key of keys) {

      pipeline.hincrby(key, "count", 1);
      pipeline.hincrbyfloat(key, "total_paid", data.paid);
    }

    await pipeline.exec();
}
}