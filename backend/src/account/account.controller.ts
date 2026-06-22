import { Request, Response } from "express";
import { AccountResponse, AllAccountResponse, CreateAccountInput, UpdateAccountInput } from "./account.type";
import { Types } from "mongoose";
import { AccountService } from "./account.service";

export class AccountController {
  static async create(req: Request, res: Response) {
    const account: AccountResponse = await AccountService.create(req.body);

    res.status(201).json({ success: true, data: account, msg: "Account created successfully" });
  }

  static async update(req: Request, res: Response) {

    const account: AccountResponse = await AccountService.update(req.params.id, req.body); // ✅ create না, update

    res.status(200).json({ success: true, data: account, msg: "Account updated successfully" });
  }

  static async list(req: Request, res: Response) {
    const accounts: AllAccountResponse = await AccountService.list();
    res.status(200).json({ success: true, data: accounts });
  }
  static async balanceTransfer(req: Request, res: Response) {

    const result: any = await AccountService.balanceTransfer(req.body);

    return res.status(201).json({ success: true, msg: "Transferred successfully", data: result });
  }
  static async accountDetailsByID(req: Request, res: Response) {
    const account: AccountResponse = await AccountService.accountByID(req.params.id);
    return res.status(200).json({ success: true, data: account });
  }
  //  account delete korar option rakhte hobe..
}