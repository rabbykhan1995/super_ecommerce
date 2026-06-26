import { ClientSession, Types } from "mongoose";
import Contact from "./contact.model";
import { ContactResponse, CreateContactInput, UpdateContactInput } from "./contact.type";
import { paginatedAggregate } from "../../utils/queryBuilder";
import { AccountResponse } from "../account/account.type";

export default class ContactRepository {
    static async findByID(id: Types.ObjectId): Promise<ContactResponse | null> {
        const contact: ContactResponse | null = await Contact.findById(id);
        return contact;
    }
    static async findByMobile(mobile: string): Promise<ContactResponse | null> {

        const contact: ContactResponse | null = await Contact.findOne({ mobile });

        return contact;
    }

    static async create(payload: CreateContactInput): Promise<ContactResponse | null> {
        const contact: ContactResponse | null = await Contact.create(payload);
        return contact
    }

    static async findByIDAndUpdate(id: Types.ObjectId, payload: UpdateContactInput): Promise<ContactResponse | null> {
        const contact = await Contact.findByIdAndUpdate(
            id,
            payload,
            { new: true }
        );

        return contact;
    }
    static async paginatedList(
        query: any,
        filter: Record<string, any>
    ) {

        return paginatedAggregate({
            model: Contact,
            query,
            filter,

            searchFields: [
                { field: "name" },
                { field: "mobile" },
                { field: "email" },
            ],

            projection: {
                include: [
                    "name",
                    "mobile",
                    "email",
                    "address",
                    "balance",
                    "type",
                    "createdAt",
                ],
            },

            defaultSort: {
                updatedAt: -1,
            },
        });
    }

    static async balanceUpdate(id: Types.ObjectId, amount: number, session?: ClientSession): Promise<AccountResponse | null> {
        const updated: AccountResponse | null = await Contact.findByIdAndUpdate(
            id,
            {
                $inc: {
                    balance: amount,
                },
            },
            {
                new: true,
                ...(session ? { session } : {}),
            }
        );

        return updated;
    }
}