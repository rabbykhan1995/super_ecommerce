import { CreateBrandInput, UpdateBrandInput } from "./brand.type";
import { ApiError } from "../../utils/ApiError";
import BrandRepository from "./brand.repository";
import ProductService from "../product/product.service";

export class BrandService {
    static async create(payload:CreateBrandInput) {
        const { name } = payload;

        const exists = await BrandRepository.findByName(name.trim().toLowerCase());
        if (exists) throw new ApiError(400, "Brand already exists");

        const brand = await BrandRepository.create({ name: name.trim().toLowerCase() });
        
        if(!brand){
            throw new ApiError(400, "brand creation failed");
        }

        return brand
    }

    static async update(brandID: any, payload:UpdateBrandInput) {

        const exists = await BrandRepository.findByName(payload.name.trim().toLowerCase());

        if (exists) throw new ApiError(400, "Brand already exists");

        const brand = await BrandRepository.update(brandID, { name: payload.name.trim().toLowerCase() })

        if(!brand){
            throw new ApiError(400, "Brand creation failed");
        }

        return brand;
    }

    static async delete(brandID: number) {


        const brand = await BrandRepository.findByID(brandID);
        if (!brand) throw new ApiError(404, "Brand not found");

        const isUsed = await ProductService.countProduct({ brandID });
        if (isUsed > 0) throw new ApiError(400, "Brand is used in products, cannot delete");

        return await BrandRepository.delete(brandID);

    }

    static async list(query: any) {
        // ম্যানুয়ালি সার্চ প্যারামিটার নিন
        const search = query.search as string || "";
        const page = parseInt(query.page as string) || 1;
        const limit = parseInt(query.limit as string) || 10;

        const result = await BrandRepository.list(
            search,
            page,
            limit
        );

        return result;
    }
}