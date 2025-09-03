import mongoose, { Document } from "mongoose";

export interface IAnalytics extends Document {
  _id: string;
  date: Date;
  metrics: {
    totalBookings: number;
    totalRevenue: number;
    totalUsers: number;
    totalHotels: number;
    averageBookingValue: number;
    conversionRate: number;
    cancellationRate: number;
    averageRating: number;
  };
  breakdown: {
    byStatus: {
      pending: number;
      confirmed: number;
      cancelled: number;
      completed: number;
      refunded: number;
    };
    byPaymentStatus: {
      pending: number;
      paid: number;
      failed: number;
      refunded: number;
    };
    byDestination: Array<{
      city: string;
      bookings: number;
      revenue: number;
    }>;
    byHotelType: Array<{
      type: string;
      bookings: number;
      revenue: number;
    }>;
  };
  createdAt: Date;
  updatedAt: Date;
}

const analyticsSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true, index: true },
    metrics: {
      totalBookings: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
      totalUsers: { type: Number, default: 0 },
      totalHotels: { type: Number, default: 0 },
      averageBookingValue: { type: Number, default: 0 },
      conversionRate: { type: Number, default: 0 },
      cancellationRate: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
    },
    breakdown: {
      byStatus: {
        pending: { type: Number, default: 0 },
        confirmed: { type: Number, default: 0 },
        cancelled: { type: Number, default: 0 },
        completed: { type: Number, default: 0 },
        refunded: { type: Number, default: 0 },
      },
      byPaymentStatus: {
        pending: { type: Number, default: 0 },
        paid: { type: Number, default: 0 },
        failed: { type: Number, default: 0 },
        refunded: { type: Number, default: 0 },
      },
      byDestination: [
        {
          city: String,
          bookings: Number,
          revenue: Number,
        },
      ],
      byHotelType: [
        {
          type: String,
          bookings: Number,
          revenue: Number,
        },
      ],
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Add compound indexes for better query performance
analyticsSchema.index({ date: 1 });
analyticsSchema.index({ "metrics.totalRevenue": -1 });

export default mongoose.model<IAnalytics>("Analytics", analyticsSchema);
