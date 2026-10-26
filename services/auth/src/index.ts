import express from "express"
import dotenv from "dotenv"
import connectDB from "./config/db.js"
import authRoute from "./routes/auth.js"
import cors from "cors"
import mongoose from "mongoose"


dotenv.config()

const app = express()
 
app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
  res.status(200).json({
    service: "Foodly Auth Service",
    status: "healthy",
    database: mongoose.connection.readyState === 1 ? "connected" : "connecting/disconnected",
  });
});

app.use("/api/auth", authRoute)



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Auth service is running on port ${PORT}`);
  connectDB() 
})