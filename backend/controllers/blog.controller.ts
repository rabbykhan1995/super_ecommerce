import { Request, Response } from "express";
import Blog from "../models/blog.model";
import {
  CreateBlogInput,
  BlogListResponse,
  BlogResponse,
  UpdateBlogInput,
} from "../types/blog.type";
import Helper from "../utils/helper";
import { paginatedAggregate } from "../utils/aggregationQueryBuilder";

export class BlogController {
  constructor() {
    // যদি future এ dependency inject করতে চাও, এখানে রাখা যাবে
  }

  // Create Blog
  static async create(req: Request, res: Response) {
    const payload: CreateBlogInput = req.body;
    let slug: string = Helper.generateSlug(payload.title);
    const exist = await Blog.findOne({ slug });

    if (exist) {
      slug = `${slug}-${Helper.randomSuffix()}`;
    }
    const blog: BlogResponse = await Blog.create({
      ...payload,
      slug,
    });
    res.status(201).json({
      msg: "blog created successfully",
      success: true,
      data: blog,
    });
  }
  // update Blog
  static async update(req: Request, res: Response) {
    const id = req.params.id;
    const payload: UpdateBlogInput = req.body;
    const blog = await Blog.findByIdAndUpdate(id, payload, { new: true });
    res.status(201).json({
      success: true,
      data: blog,
    });
  }
  // List Blogs
static async list(req: Request, res: Response) {
  const result = await paginatedAggregate({
    model: Blog,
    query: req.query,
    searchFields: [{ field: "title" }],
    projection: {
      include: ["title", "slug", "thumbnail", "createdAt", "updatedAt", "shortDescription"],
    },
  });

  return res.status(200).json({ success: true, data: result });
}
  static async blogBySlug(req: Request, res: Response) {
    const slug = String(req.params.slug).trim();

    const blog = (await Blog.findOne({
      slug,
    }).lean()) as BlogResponse;

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.status(200).json({
      success: true,
      data: blog,
    });
  }
}
