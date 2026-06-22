import { Request, Response } from "express";
import { AccountResponse, AllAccountResponse, CreateAccountInput, UpdateAccountInput } from "./report.type";
import { ApiError } from "../../utils/ApiError";
import mongoose, { Types } from "mongoose";
import ReportService from "./report.service";



export class ReportController {

static async dashboardReport(req: Request, res: Response) {
  const dashboardReport = await ReportService.dashboardReport(req.query);
  res.status(201).json({ success: true, data: dashboardReport, msg: "Account created successfully" });
}


//  account delete korar option rakhte hobe..
}