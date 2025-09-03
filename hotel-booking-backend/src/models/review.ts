import mongoose, { Document } from "mongoose";

export interface IReview extends Document {
  _id: string;
  userId: string;
  hotelId: string;
  bookingId: string;
  rating: number;
  comment: string;
  categories: {
    cleanliness: number;
    service: number;
    location: number;
    value: number;
    amenities: number;
  };
  isVerified: boolean;
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    hotelId: { type: String, required: true, index: true },
    bookingId: { type: String, required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5, index: true },
    comment: { type: String, required: true },
    categories: {
      cleanliness: { type: Number, required: true, min: 1, max: 5 },
      service: { type: Number, required: true, min: 1, max: 5 },
      location: { type: Number, required: true, min: 1, max: 5 },
      value: { type: Number, required: true, min: 1, max: 5 },
      amenities: { type: Number, required: true, min: 1, max: 5 },
    },
    isVerified: { type: Boolean, default: false },
    helpfulCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Add compound indexes for better query performance
reviewSchema.index({ hotelId: 1, rating: -1 });
reviewSchema.index({ userId: 1, createdAt: -1 });
reviewSchema.index({ hotelId: 1, createdAt: -1 });

export default mongoose.model<IReview>("Review", reviewSchema);
