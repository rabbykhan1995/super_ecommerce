import { Types } from "mongoose";
import ContactRepository from "./contact.repository";
import { ContactResponse, CreateContactInput, UpdateContactInput } from "./contact.type";
import { ApiError } from "../../utils/ApiError";
import { ClientSession } from "mongoose";
import { AccountResponse } from "../account/account.type";

export default class ContactService {
    // NOTE:this will not be return any error res from here findByID
    static async findByID(id: string): Promise<ContactResponse | null> {

        const contactID = new Types.ObjectId(id);

        const contact: ContactResponse | null = await ContactRepository.findByID(contactID);

        return contact;
    }

    static async findByMobile(mobile: string): Promise<ContactResponse> {

        const contact: ContactResponse | null = await ContactRepository.findByMobile(mobile);

        if (!contact) {
            throw new ApiError(404, "Contact not found");
        }
        return contact;
    }

    static async create(payload: CreateContactInput): Promise<ContactResponse> {
        const exists = await ContactRepository.findByMobile(payload.mobile);

        if (exists) {
            throw new ApiError(401, "Contact already exist with this number");
        }

        const contact = await ContactRepository.create(payload);

        if (!contact) {
            throw new ApiError(401, "Contact Creation failed");
        }

        return contact;

    }

    static async update(contactID: string, payload: UpdateContactInput): Promise<ContactResponse> {
        const id = new Types.ObjectId(contactID);

        const contact: ContactResponse | null = await ContactRepository.findByID(id);

        if (!contact) {
            throw new ApiError(404, "Contact not found");
        }

        const updated: ContactResponse | null = await ContactRepository.findByIDAndUpdate(id, payload);



        if (!updated) {
            throw new ApiError(401, "Contact Update failed");
        }

        return updated;

    }

    static async list(query: any) {

        const { type } = query;

        let filter: Record<string, any> = {};

        if (type === "customer") {

            filter = {
                type: { $in: ["customer", "both"] }
            };

        } else if (type === "supplier") {

            filter = {
                type: { $in: ["supplier", "both"] }
            };

        } else if (type === "both") {

            filter = {
                type: "both"
            };
        }

        return ContactRepository.paginatedList(
            query,
            filter
        );
    }

     static async balanceUpdate(id: string | any, amount: number, session?: ClientSession): Promise<AccountResponse> {
            const updated: AccountResponse | null = await ContactRepository.balanceUpdate(id, amount , session);
            if(!updated){
                throw new ApiError(403, "Contact Balance updated failed");
            }
            return updated;
        }

}