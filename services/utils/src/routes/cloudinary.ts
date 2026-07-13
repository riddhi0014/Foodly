import express from "express";
import cloudinary from "cloudinary";

const router = express.Router();

router.post("/upload", async (req, res) => {
  try {
    const { buffer } = req.body;
    const cloud = await cloudinary.v2.uploader.upload(buffer);

    res.json({
      url: cloud.secure_url,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
});

export default router;


// the route expects the frontend to send a Base64-encoded image (buffer in the request body). For larger files, many production systems use multipart/form-data with middleware like multer because it's more memory-efficient. This implementation is perfectly fine for moderate-sized images, but it's a design choice worth keeping in mind as your application scales.
