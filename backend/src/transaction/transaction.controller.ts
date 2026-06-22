import { Request, Response } from "express";
import TransactionService from "./transaction.service";


export class TransactionController {

    static async createTransaction(req: Request, res: Response) {
            
            const newTransactions = await TransactionService.createTransactionWithLedger(req.body);

            return res.status(201).json({ msg: "Transaction successful", data: newTransactions });

      
    }

    static async accountTransactionList(
        req: Request,
        res: Response
    ) {

        const result =
            await TransactionService.accountTransactionList(
                req.query
            );

        return res.status(200).json({
            success: true,
            data: result,
        });
    }

    static async transactionDetails(
        req: Request,
        res: Response
    ) {

        const result =
            await TransactionService.transactionDetails(
                req.params.id.toString()
            );

        return res.status(200).json({
            success: true,
            data: result,
        });
    }

    //  account delete korar option rakhte hobe..
}