import { Request, Response } from "express";
import { cloudinary } from "../config/cloudinary.config";
import { ApiError } from "../utils/ApiError";
import Helper from "../utils/helper";

export class ImageController {
  constructor() {}

  // Upload multiple images (with custom ID)
static async uploadImages(req: Request, res: Response) {
  if (!req.files) throw new ApiError(400, "No files uploaded");

  const files = req.files as Express.Multer.File[];

  const uploadPromises = files.map((file) => {
    const uniqueId = Helper.generateRandomID();
    const publicId = `sheshir_image/${uniqueId}`;

    return new Promise<{ url: string; imageId: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { public_id: publicId, overwrite: false },
        (error, result) => {
          if (error) return reject(error);

          resolve({
            url: result!.secure_url,
            imageId: uniqueId,
          });
        }
      );

      stream.end(file.buffer);
    });
  });

  const uploadedImages = await Promise.all(uploadPromises);

  return res.status(201).json({
    msg: "Upload successful",
    success: true,
    data: uploadedImages,
  });
}

  // Delete image by URL
  static async deleteImage(req: Request, res: Response) {
    const { imageUrl } = req.body;
    if (!imageUrl) throw new ApiError(400, "No image URL provided");

    const public_id = Helper.getPublicIdFromUrl(imageUrl);
    const deleted: any = await cloudinary.uploader.destroy(public_id);

    console.log(deleted);

    return res.status(200).json({ success: true, msg: "Delete successful" });
  }
}
