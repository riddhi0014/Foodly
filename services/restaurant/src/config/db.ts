import mongoose, { connect } from "mongoose";

const connectDB = async () => {
  try {
    await connect(process.env.MONGO_URI as string,{dbName:"Foodly"});
    console.log("MongoDB connected");
  } catch (error) {
    console.error(error);
  }
}

export default connectDB;