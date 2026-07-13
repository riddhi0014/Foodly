import mongoose, { Schema, Document } from 'mongoose';

export interface IRestaurant extends Document {          //interfaces are only for Typescript.
  name: string;
  description?: string;
  image: string;
  ownerId: string;
  phoneNumber: string;
  isVerified: boolean;
  autoLocation:{               //This is GeoJSON format.
    type: "Point";
    coordinates: [number, number]; //Longitude, Latitude
    formattedAddress: string;
  }
  isOpen: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IRestaurant>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    image: {
      type: String,
      required: true,
    },
    ownerId: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      required: true,
    },

    autoLocation: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
      formattedAddress: {
        type: String,
      },
    },

    isOpen: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

schema.index({ autoLocation: "2dsphere" });

const Restaurant= mongoose.model<IRestaurant>("Restaurant", schema);
export default Restaurant;

