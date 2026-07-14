import express from "express";
import dotenv from "dotenv";
import cloudinary from "cloudinary";
import cors from "cors";
import uploadRoutes from "./routes/cloudinary.js"
// import paymentRoutes from "./routes/payment.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";
import paymentRoutes from "./routes/payment.js";

dotenv.config();

connectRabbitMQ();

const app = express();

app.use(cors());

app.use(express.json({ limit: "50mb" })); //usage- 


app.use(express.urlencoded({ limit: "50mb", extended: true }));  //what is form data? It is a way to send data in key-value pairs, often used in HTML forms. The 'extended: true' option allows for rich objects and arrays to be encoded into the URL-encoded format, allowing for a JSON-like experience with URL-encoded.

const { CLOUD_NAME, CLOUD_API_KEY, CLOUD_SECRET_KEY } = process.env;

if (!CLOUD_NAME || !CLOUD_API_KEY || !CLOUD_SECRET_KEY) {
  throw new Error("Missing Cloudinary environment variables");
}

cloudinary.v2.config({
  cloud_name: CLOUD_NAME,
  api_key: CLOUD_API_KEY,
  api_secret: CLOUD_SECRET_KEY,
});

app.use("/api", uploadRoutes);
// app.use("/api/payment", paymentRoutes);
app.use("/api/payment", paymentRoutes);

const PORT = process.env.PORT || 5003;

app.listen(PORT, () => {
  console.log(`Utils service is running on port ${PORT}`);
});
