import express from "express";
import connectDB from "./config/db.js";
import dotenv from "dotenv"
import restaurantRoutes from "./routes/restaurant.js";
import ItemRoutes from "./routes/menuitems.js";
import cors from "cors";
import cartRoutes from "./routes/cart.js";
import addressRoutes from "./routes/address.js";
import orderRoutes from "./routes/order.js";
 
dotenv.config()
const app=express();

const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());
app.use('/api/restaurant', restaurantRoutes);
app.use('/api/item', ItemRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/order", orderRoutes);

app.listen(PORT, () => {
  console.log(`Restaurant service is running on port ${PORT}`);
  connectDB()});