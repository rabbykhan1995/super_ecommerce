import { Request, Response } from "express";
import TransactionService from "./transaction.service";


export class TransactionController {

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
    //  account delete korar option rakhte hobe..
}