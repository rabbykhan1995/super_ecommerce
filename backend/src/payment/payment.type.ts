import z from "zod";
import { createPaymentSchema } from "./payment.validator";
import { paymentTable, paymentTypeEnum } from "./payment.table";

export type Payment = typeof paymentTable.$inferSelect;
export type PaymentType = (typeof paymentTypeEnum.enumValues)[number];
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type PaymentPayload = typeof paymentTable.$inferInsert;
