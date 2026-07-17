import { Request, Response } from "express";
import { imagekit } from "../../config/imagekit.config";
import { ApiError } from "../../utils/ApiError";
import Helper from "../../utils/helper";

export class ImageController {
  constructor() {}

  static async uploadImages(req: Request, res: Response) {
    if (!req.files) throw new ApiError(400, "No files uploaded");

    const files = req.files as Express.Multer.File[];

    const uploadPromises = files.map((file) => {
      const uniqueId = Helper.generateRandomID();
      const fileName = `${uniqueId}`;

      return imagekit.upload({
        file: file.buffer,
        fileName,
        folder: "/my-ecom",
      });
    });

    const uploadedImages = await Promise.all(uploadPromises);

    const data = uploadedImages.map((img) => ({
      url: img.url,
      imageId: img.fileId,
    }));

    return res.status(201).json({
      msg: "Upload successful",
      success: true,
      data,
    });
  }

  static async deleteImage(req: Request, res: Response) {
    const { fileId } = req.body;
    if (!fileId) throw new ApiError(400, "No fileId provided");

    try {
      await imagekit.deleteFile(fileId);
    } catch (error: any) {
      console.error("ImageKit delete error:", error);
      throw new ApiError(500, `Image delete failed: ${error.message}`);
    }

    return res.status(200).json({ success: true, msg: "Delete successful" });
  }
}
