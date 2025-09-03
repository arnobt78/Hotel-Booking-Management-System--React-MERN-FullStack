import mongoose from "mongoose";
import { HotelType } from "../../../shared/types";

const hotelSchema = new mongoose.Schema<HotelType>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    city: { type: String, required: true, index: true },
    country: { type: String, required: true, index: true },
    description: { type: String, required: true },
    type: [{ type: String, required: true }],
    adultCount: { type: Number, required: true },
    childCount: { type: Number, required: true },
    facilities: [{ type: String, required: true }],
    pricePerNight: { type: Number, required: true, index: true },
    starRating: { type: Number, required: true, min: 1, max: 5, index: true },
    imageUrls: [{ type: String, required: true }],
    lastUpdated: { type: Date, required: true },
    // Remove embedded bookings - we'll use separate collection
    // bookings: [bookingSchema],

    // New fields for better hotel management and analytics
    location: {
      latitude: Number,
      longitude: Number,
      address: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String,
      },
    },
    contact: {
      phone: String,
      email: String,
      website: String,
    },
    policies: {
      checkInTime: String,
      checkOutTime: String,
      cancellationPolicy: String,
      petPolicy: String,
      smokingPolicy: String,
    },
    amenities: {
      parking: Boolean,
      wifi: Boolean,
      pool: Boolean,
      gym: Boolean,
      spa: Boolean,
      restaurant: Boolean,
      bar: Boolean,
      airportShuttle: Boolean,
      businessCenter: Boolean,
    },
    // Analytics and performance fields
    totalBookings: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    occupancyRate: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    // Audit fields
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Add compound indexes for better query performance
hotelSchema.index({ city: 1, starRating: 1 });
hotelSchema.index({ pricePerNight: 1, starRating: 1 });
hotelSchema.index({ userId: 1, createdAt: -1 });

const Hotel = mongoose.model<HotelType>("Hotel", hotelSchema);
export default Hotel;
