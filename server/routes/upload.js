import express from 'express';
import cloudinaryService from "cloudinary";
import multer from "multer";
import multerCloudinaryStorage from "multer-storage-cloudinary";

const { v2: cloudinary } = cloudinaryService;
const { CloudinaryStorage } = multerCloudinaryStorage;


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    allowedFormats: ['jpg', 'png']
  }
});

const parser = multer({ storage: storage });
import { isAuthenticated } from '../middleware/auth';
import {handleUpload} from "../controller/upload";

const router = express.Router();


router.post('/', isAuthenticated(), parser.single('media'), handleUpload, function (error, req, res, next) {
  return res.status(400).json({ errors: {media: error.message} });
},);

export default router;
