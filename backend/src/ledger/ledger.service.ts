import { ClientSession, Types } from "mongoose";
import { ApiError } from "../../utils/ApiError";

import LedgerRepository from "./ledger.repository";
import { CreateLedgerInput, LedgerPayload } from "./ledger.type";
import { QueryClient } from "../../drizzle/src";
import Ledger from "./ledger.model";

export default class LedgerService {
  constructor() { }

  static async create(
    payload: LedgerPayload,
    tx?: QueryClient
  ){

    const ledger = await LedgerRepository.create(payload, tx);

    return ledger;
  }
  static async list(query:any){
    return await LedgerRepository.list(query);
  }
  static async findByID(ledgerID:number, tx?:QueryClient){
    return await LedgerRepository.findByID(ledgerID,tx)
  }
}