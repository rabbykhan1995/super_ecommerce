import ImageKit from "imagekit";
import multer from "multer";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

export { imagekit, upload };
