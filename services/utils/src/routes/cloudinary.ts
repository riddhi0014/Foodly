import express from "express";
import cloudinary from "cloudinary";

const router = express.Router();

router.post("/upload", async (req, res) => {
  try {
    const { buffer } = req.body;

    if (!buffer) {
      return res.status(400).json({ message: "No buffer provided" });
    }

    try {
      const cloud = await cloudinary.v2.uploader.upload(buffer);
      return res.json({
        url: cloud.secure_url,
      });
    } catch (cloudinaryError: any) {
      console.error("Cloudinary Upload Error:", cloudinaryError.message || cloudinaryError);
      // Fallback: If Cloudinary fails (e.g. 403 Forbidden or expired account), fallback to Data URI string
      if (typeof buffer === "string" && buffer.startsWith("data:")) {
        console.log("Fallback: using base64 Data URI for uploaded image");
        return res.json({
          url: buffer,
        });
      }
      throw cloudinaryError;
    }
  } catch (error: any) {
    res.status(500).json({
      message: error.message || "Upload failed",
    });
  }
});

export default router;


// the route expects the frontend to send a Base64-encoded image (buffer in the request body). For larger files, many production systems use multipart/form-data with middleware like multer because it's more memory-efficient. This implementation is perfectly fine for moderate-sized images, but it's a design choice worth keeping in mind as your application scales.
