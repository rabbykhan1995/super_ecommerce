import { CreateCategoryInput, UpdateCategoryInput } from "./category.type";
import { ApiError } from "../../utils/ApiError";
import CategoryRepository from "./category.repository";
import ProductService from "../product/product.service";
import db from "../../drizzle/src";
import { categoryTable } from "./category.table";
import { desc } from "drizzle-orm";

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

        const isUsed = await ProductService.countProduct("categoryID " ,categoryID );
        if (isUsed > 0) throw new ApiError(400, "category is used in products, cannot delete");

        return await CategoryRepository.delete(categoryID);

    }

static async list() {
  return await db
    .select()
    .from(categoryTable)
    .orderBy(desc(categoryTable.createdAt));
}
}