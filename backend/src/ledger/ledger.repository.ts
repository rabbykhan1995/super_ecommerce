import { ClientSession, Types } from "mongoose";
import { aggregateOne, paginatedAggregate } from "../../utils/queryBuilder";
import { CreateLedgerInput, Ledger, LedgerPayload, } from "./ledger.type";
import db, { QueryClient } from "../../drizzle/src";
import { ledgerTable } from "./ledger.table";

export default class LedgerRepository {
    constructor() { }

    static async create(
        payload: LedgerPayload,
        client: QueryClient = db
    ): Promise<Ledger> {

        const [ledger] = await client.insert(ledgerTable).values(payload).returning();

        return ledger??null;
    }

    static async paginatedList(
        query: any,
        filter: Record<string, any>
    ) {

        return paginatedAggregate({

            model: Ledger,

            query,

            filter,

            postLookupSearch: true,

            lookups: [
                {
                    from: "accounts",
                    localField: "fromAccount",
                    foreignField: "_id",
                    as: "from",
                    preserveNull: true,
                },

                {
                    from: "accounts",
                    localField: "toAccount",
                    foreignField: "_id",
                    as: "to",
                    preserveNull: true,
                },
            ],

            searchFields: [
                { field: "from.name" },
                { field: "to.name" },
            ],

            projection: {

                include: [
                    "type",
                    "amount",
                    "status",
                    "date",
                    "note",
                    "createdAt",
                ],

                computed: {
                    fromAccountName: "$from.name",
                    toAccountName: "$to.name",
                },
            },

            defaultSort: {
                createdAt: -1,
            },
        });
    }
    static async findById(
        id: string
    ) {

        return Ledger.findById(
            new Types.ObjectId(id)
        );
    }

    static async ledgerDetailsAggregate(
        matchQuery: Record<string, any>,
        ledger: any,
        groupID?: Types.ObjectId
    ) {

        return aggregateOne(

            Ledger,

            matchQuery,

            [
                {
                    from: "contacts",
                    localField: "contactID",
                    foreignField: "_id",
                    as: "contact",
                },
            ],

            undefined,

            [

                {
                    $lookup: {
                        from: "accounts",
                        localField: "toAccount",
                        foreignField: "_id",
                        as: "toAccountDetails",
                    },
                },

                {
                    $lookup: {
                        from: "accounts",
                        localField: "fromAccount",
                        foreignField: "_id",
                        as: "fromAccountDetails",
                    },
                },

                {
                    $unwind: {
                        path: "$toAccountDetails",
                        preserveNullAndEmptyArrays: true,
                    },
                },

                {
                    $unwind: {
                        path: "$fromAccountDetails",
                        preserveNullAndEmptyArrays: true,
                    },
                },

                {
                    $unwind: {
                        path: "$contact",
                        preserveNullAndEmptyArrays: true,
                    },
                },

                {
                    $group: {

                        _id:
                            groupID
                                ? "$groupID"
                                : "$_id",

                        type: {
                            $first: "$type",
                        },

                        totalAmount: {
                            $sum: "$amount",
                        },

                        note: {
                            $first: "$note",
                        },

                        date: {
                            $first: "$date",
                        },

                        status: {
                            $first: "$status",
                        },

                        contact: {
                            $first: "$contact",
                        },

                        accounts: {

                            $push: {

                                transactionID: "$_id",

                                amount: "$amount",

                                toAccount:
                                    "$toAccountDetails",

                                fromAccount:
                                    "$fromAccountDetails",
                            },
                        },
                    },
                },

                {
                    $addFields: {

                        balanceBefore:
                            ledger.balanceBefore,

                        balanceAfter:
                            ledger.balanceAfter,

                        discount:
                            ledger.discount,

                        dueAmount:
                            ledger.dueAmount,
                    },
                },
            ]
        );
    }

    static async findByLedgerOrGroup(
        ledgerID: string,
        groupID?: string
    ) {
        return Ledger.find({
            $or: [
                { _id: new Types.ObjectId(ledgerID) },
                ...(groupID ? [{ groupID: new Types.ObjectId(groupID) }] : []),
            ],
        });
    }

    static async deleteLedger(
        filter: Record<string, any>,
        session?: ClientSession
      ) {
        return Ledger.findOneAndDelete(filter, session ? { session } : undefined);
      }
}