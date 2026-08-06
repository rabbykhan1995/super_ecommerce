import { Request, Response } from "express";
import { ApiError } from "../../utils/ApiError";
import ReportService from "./report.service";

export class ReportController {

static async dashboardReport(req: Request, res: Response) {
  const { fromDate, toDate } = req.query;

  if (!fromDate || !toDate) {
    throw new ApiError(400, "fromDate and toDate query parameters are required");
  }

  const dashboardReport = await ReportService.dashboardReport(req.query);
  res.status(200).json({ success: true, data: dashboardReport });
}

}