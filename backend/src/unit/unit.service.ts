import { CreateUnitInput, UpdateUnitInput } from "./unit.type";
import { ApiError } from "../../utils/ApiError";
import UnitRepository from "./unit.repository";
import ProductService from "../product/product.service";


export class UnitService {
    static async create(payload:CreateUnitInput) {
        const { name } = payload;

        const exists = await UnitRepository.findByName(name.trim().toLowerCase());
        if (exists) throw new ApiError(400, "unit already exists");

        const unit = await UnitRepository.create({ name: name.trim().toLowerCase() });
        
        if(!unit){
            throw new ApiError(400, "unit creation failed");
        }

        return unit
    }

    static async update(unitID: any, payload:UpdateUnitInput) {

        const exists = await UnitRepository.findByName(payload.name.trim().toLowerCase());

        if (exists) throw new ApiError(400, "unit already exists");

        const unit = await UnitRepository.update(unitID, { name: payload.name.trim().toLowerCase() })

        if(!unit){
            throw new ApiError(400, "unit creation failed");
        }

        return unit;
    }

    static async delete(unitID: number) {


        const unit = await UnitRepository.findByID(unitID);
        if (!unit) throw new ApiError(404, "unit not found");

        const isUsed = await ProductService.countProduct({ unitID });
        if (isUsed > 0) throw new ApiError(400, "unit is used in products, cannot delete");

        return await UnitRepository.delete(unitID);

    }

    static async list(query: any) {
        // ম্যানুয়ালি সার্চ প্যারামিটার নিন
        const search = query.search as string || "";
        const page = parseInt(query.page as string) || 1;
        const limit = parseInt(query.limit as string) || 10;

        const result = await UnitRepository.list(
            search,
            page,
            limit
        );

        return result;
    }
}