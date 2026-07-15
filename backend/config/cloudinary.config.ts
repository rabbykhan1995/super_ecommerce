import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


// Multer memory storage (for express)
const storage = multer.memoryStorage();
const upload = multer({ storage });

export { cloudinary, upload };
