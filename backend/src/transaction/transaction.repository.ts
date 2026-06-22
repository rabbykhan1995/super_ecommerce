import { ClientSession, Types } from "mongoose";
import Transaction from "./transaction.model";
import { aggregateOne, paginatedAggregate } from "../../utils/aggregationQueryBuilder";

export default class TransactionRepository {
  constructor() { }

  static async createMany(
    payload: any[],
    session?: ClientSession
  ) {

    return Transaction.insertMany(
      payload,
      {
        session,
        ordered: true,
      }
    );
  }

  static async paginatedList(
    query: any,
    filter: Record<string, any>
  ) {

    return paginatedAggregate({

      model: Transaction,

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

    return Transaction.findById(
      new Types.ObjectId(id)
    );
  }

  static async transactionDetailsAggregate(
    matchQuery: Record<string, any>,
    ledger: any,
    groupID?: Types.ObjectId
  ) {

    return aggregateOne(

      Transaction,

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

  static async deleteTransactions(
    filter: Record<string, any>,
    session?: ClientSession
  ) {
    return Transaction.deleteMany(filter, session ? { session } : undefined);
  }
}