import { CreateCategoryInput, UpdateCategoryInput } from "./category.type";
import { ApiError } from "../../utils/ApiError";
import CategoryRepository from "./category.repository";
import ProductService from "../product/product.service";

export class CategoryService {
    static async create(payload:CreateCategoryInput) {
        const { name } = payload;

        const exists = await CategoryRepository.findByName(name.trim().toLowerCase());
        if (exists) throw new ApiError(400, "category already exists");

        const category = await CategoryRepository.create({ name: name.trim().toLowerCase() });
        
        if(!category){
            throw new ApiError(400, "category creation failed");
        }

        return category
    }

    static async update(categoryID: any, payload:UpdateCategoryInput) {

        const exists = await CategoryRepository.findByName(payload.name.trim().toLowerCase());

        if (exists) throw new ApiError(400, "category already exists");

        const category = await CategoryRepository.update(categoryID, { name: payload.name.trim().toLowerCase() })

        if(!category){
            throw new ApiError(400, "category creation failed");
        }

        return category;
    }

    static async delete(categoryID: number) {


        const category = await CategoryRepository.findByID(categoryID);
        if (!category) throw new ApiError(404, "category not found");

        const isUsed = await ProductService.countProduct({ categoryID });
        if (isUsed > 0) throw new ApiError(400, "category is used in products, cannot delete");

        return await CategoryRepository.delete(categoryID);

    }

    static async list(query: any) {
        // ম্যানুয়ালি সার্চ প্যারামিটার নিন
        const search = query.search as string || "";
        const page = parseInt(query.page as string) || 1;
        const limit = parseInt(query.limit as string) || 10;

        const result = await CategoryRepository.list(
            search,
            page,
            limit
        );

        return result;
    }
}