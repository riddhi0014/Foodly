import getBuffer from "../config/dataUri.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import TryCatch from "../middlewares/trycatch.js";
import Restaurant from "../models/Restaurant.js";
import axios from "axios";
import jwt from "jsonwebtoken";

export const addRestaurant=TryCatch(async(req:AuthenticatedRequest,res)=>{

  const user=req.user;  //comes from isAuth middleware

  if(!user)
  {
    return res.status(401).json({message:"Unauthorized"});
  }

  const existingRestaurant=await Restaurant.findOne({
    ownerId: user._id,
  })

  if(existingRestaurant)
  {
    return res.status(400).json({message:"You already have a restaurant"});
  }

  const {name, description,latitude, longitude, formattedAddress,phoneNumber}=req.body;

  if(!name  || !latitude || !longitude )
  {
    return res.status(400).json({message:"All fields are required"});
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

  const restaurant = await Restaurant.create({
    name,
    description,
    phoneNumber,
    image: uploadResult.url,
    ownerId: user._id,
    autoLocation: {
      type: "Point",
      coordinates: [Number(longitude), Number(latitude)],
      formattedAddress,
    },
    isVerified: false,
  });

  return res.status(201).json({
    message: "Restaurant created successfully",
    restaurant,
  });
});


export const fetchMyRestaurant = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Please Login",
      });
    }
    const restaurant = await Restaurant.findOne({ ownerId: req.user._id }); 

    if (!restaurant) {
      return res.status(404).json({
        message: "No Restaurant found",
      });
    }

    if (!req.user.restaurantId) {  //if restaurantId is not present in the user object, we will add it to the token because the user has just created a restaurant and we want to update the token with the new restaurantId. This will be helpful later when we want to check if the user has a restaurant or not. We will check the token for the restaurantId. If it is present, we will allow the user to access the restaurant routes. If it is not present, we will not allow the user to access the restaurant routes.
      const token = jwt.sign(
        {
          user: {                              //new payload.
            ...req.user,
            restaurantId: restaurant._id,
          },
        },
        process.env.JWT_SEC as string,
        {
          expiresIn: "15d",
        }
      );

      return res.json({ restaurant, token });
    }

    res.json({ restaurant });
  }
);

// So whenever a newly created  restaurant is fetched for the first time ever, the already existing token will be updated with the new restaurantId and sent back to the user. This way, the user will have the restaurantId in the token for future requests.

//Otherwise, if we did not add restaurantId to the token payload, then flow:
//JWT-> extract user._id -> find restaurant by ownerId -> if found, return restaurant. If not found, return error.

//This is an extra step and we can avoid it by adding restaurantId to the token payload, and hence directly extract: 
//JWT-> extract user.restaurantId -> find restaurant by _id -> if found, return restaurant. If not found, return error.


export const updateStatusRestaurant = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(403).json({
        message: "Please Login",
      });
    }

    const { status } = req.body;

    if (typeof status !== "boolean") {
      return res.status(400).json({
        message: "Status must be boolean",
      });
    }

    const restaurant = await Restaurant.findOneAndUpdate(
      {
        ownerId: req.user._id,
      },
      { isOpen: status },
      { new: true }
    );

    if (!restaurant) {
      return res.status(404).json({
        message: "Restaurant not found",
      });
    }

    res.json({
      message: "Restaurant status Updated",
      restaurant,
    });
  }
);

export const updateRestaurant = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(403).json({
        message: "Please Login",
      });
    }

    const { name, description } = req.body;

    const restaurant = await Restaurant.findOneAndUpdate(
      { ownerId: req.user._id },
      { name: name, description: description },
      { new: true }
    );

    if (!restaurant) {
      return res.status(404).json({
        message: "Restaurant not found",
      });
    }

    res.json({
      message: "Restaurant Updated",
      restaurant,
    });
  }
);


export const getNearbyRestaurant = TryCatch(async (req, res) => {
  const { latitude, longitude, radius = 5000, search = "" } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({
      message: "Latitude and longitude are required",
    });
  }

  const query: any = {
    isVerified: true,
  };

  if (search && typeof search === "string") {
    query.name = { $regex: search, $options: "i" };
  }

  const restaurants = await Restaurant.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [Number(longitude), Number(latitude)],
        },
        distanceField: "distance",
        maxDistance: Number(radius),
        spherical: true,
        query,
      },
    },
    {
      $sort: {
        isOpen: -1,
        distance: 1,
      },
    },
    {
      $addFields: {
        distanceKm: {
          $round: [{ $divide: ["$distance", 1000] }, 2],
        },
      },
    },
  ]);

  res.json({
    success: true,
    count: restaurants.length,
    restaurants,
  });
});


export const fetchSingleRestaurant = TryCatch(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);
  res.json(restaurant);
});
