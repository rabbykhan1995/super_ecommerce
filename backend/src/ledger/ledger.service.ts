import { ClientSession, Types } from "mongoose";
import { ApiError } from "../../utils/ApiError";

import LedgerRepository from "./ledger.repository";
import { CreateLedgerInput, LedgerResponse } from "./ledger.type";

export default class LedgerService {
  constructor() { }

  static async create(
    payload: CreateLedgerInput,
    session?: ClientSession
  ): Promise<LedgerResponse[]> {

    const ledger = await LedgerRepository.create([payload], session);

    if (!ledger || ledger.length === 0) {
      throw new ApiError(500, "Ledger creation failed");
    }

    return ledger;
  }
  static async accountLedgerList(
    query: any
  ) {

    const {
      accountID,
      type
    } = query;

    let filter: Record<string, any> = {};

    // account filter
    if (accountID) {

      filter.$or = [
        {
          fromAccount:
            new Types.ObjectId(
              accountID as string
            ),
        },
        {
          toAccount:
            new Types.ObjectId(
              accountID as string
            ),
        },
      ];
    }

    // type filter
    if (type) {
      filter.type = type;
    }

    return LedgerRepository.paginatedList(
      query,
      filter
    );
  }
  static async ledgerByID(
    ledgerID: string,
    groupID?: string,
  ) {

    // 1. fetch ledger(s)
    const ledger = await LedgerRepository.findByLedgerOrGroup(
      ledgerID,
      groupID
    );

    if (!ledger || ledger.length === 0) {
      throw new ApiError(404, "Ledger not found");
    }

    return ledger;
  }

  static async deleteLedger(
          filter: Record<string, any>,
          session?: ClientSession
      ) {
          return LedgerRepository.deleteLedger(filter, session);
      }
}