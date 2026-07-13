import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import TryCatch from "../middlewares/trycatch.js";
import Restaurant from "../models/Restaurant.js";
import getBuffer from "../config/dataUri.js";
import axios from "axios";
import MenuItems from "../models/MenuItems.js";
 

 export const addMenuItem=TryCatch(async(req:AuthenticatedRequest, res)=>{
  if(!req.user){
    return res.status(401).json({message:"Unauthorized request.Please login"})
  }

  const restaurant = await Restaurant.findOne({ ownerId: req.user._id });

  if(!restaurant){
    return res.status(404).json({message:"Restaurant not found"})
  }

  const { name, description, price, image } = req.body;

  if(!name && !price){
    return res.status(400).json({message:"Name and price are required"})  
  }

  const file=req.file;  //comes from multer middleware

  if(!file)
  {
    return res.status(400).json({message:"Image is required"});
  }

  const fileBuffer=getBuffer(file); // form data after conversion using dataUri

if(!fileBuffer?.content)
  {
    return res.status(500).json({message:"Error processing image"}); 
  }

  const { data: uploadResult } = await axios.post(
    `${process.env.UTILS_SERVICE}/api/upload`,
    {
      buffer: fileBuffer.content,
    }
  );


  const item = await MenuItems.create({
    restaurantId: restaurant._id,
    name,
    description,
    price,
    image: uploadResult.url,
  });

  return  res.status(201).json({message:"Menu item added successfully", item});

 })


 export const getAllItems=TryCatch(async(req:AuthenticatedRequest, res)=>{
  
    if(!req.user){
      return res.status(401).json({message:"Unauthorized request.Please login"})
    }
  
    const {restaurantId}=req.params;

    if(!restaurantId){
      return res.status(400).json({message:"Restaurant id is required"})
    }

    const restaurant = await Restaurant.findOne({ ownerId: req.user._id });
  
    if(!restaurant){
      return res.status(404).json({message:"Restaurant not found"})
    }
  
    const items = await MenuItems.find({ restaurantId: restaurant._id });
  
    return res.status(200).json({items});
  }
);


export const deleteMenuItem = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Please login",
      });
    }

    const { itemId } = req.params;
    if (!itemId) {
      return res.status(400).json({
        message: "Id is required",
      });
    }

    const item = await MenuItems.findById(itemId);

    if (!item) {
      return res.status(404).json({
        message: "No item found",
      });
    }

    const restaraunt = await Restaurant.findOne({
      _id: item.restaurantId,
      ownerId: req.user._id,
    });

    if (!restaraunt) {
      return res.status(404).json({
        message: "NO Restaurant found",
      });
    }

    await item.deleteOne();

    res.json({
      message: "Menu item deleted successfully",
    });
  }
);

export const toggleMenuItemAvailability = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Please login",
      });
    }

    const { itemId } = req.params;
    if (!itemId) {
      return res.status(400).json({
        message: "Id is required",
      });
    }

    const item = await MenuItems.findById(itemId);

    if (!item) {
      return res.status(404).json({
        message: "No item found",
      });
    }

    const restaraunt = await Restaurant.findOne({
      _id: item.restaurantId,
      ownerId: req.user._id,
    });

    if (!restaraunt) {
      return res.status(404).json({
        message: "NO Restaurant found",
      });
    }

    item.isAvailable = !item.isAvailable;
    await item.save();

    res.json({
      message: `Item Marked as ${
        item.isAvailable ? "available" : "unavailable"
      }`,
      item,
    });
  }
);
