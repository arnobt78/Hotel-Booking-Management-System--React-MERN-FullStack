import express, { Request, Response } from "express";
import Analytics from "../models/analytics";
import Booking from "../models/booking";
import Hotel from "../models/hotel";
import User from "../models/user";
import Review from "../models/review";
import verifyToken from "../middleware/auth";
import requireAdmin from "../middleware/requireAdmin";

const router = express.Router();

/** Build a snapshot payload from live DB aggregates */
const buildLiveSnapshot = async () => {
  const [totalHotels, totalUsers, allBookings, reviewAgg] = await Promise.all([
    Hotel.countDocuments(),
    User.countDocuments(),
    Booking.find().select("status paymentStatus totalCost hotelId"),
    Review.aggregate([
      { $group: { _id: null, averageRating: { $avg: "$rating" } } },
    ]),
  ]);

  const totalBookings = allBookings.length;
  const totalRevenue = allBookings.reduce(
    (sum, b) => sum + (b.totalCost || 0),
    0
  );

  const byStatus = {
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    completed: 0,
    refunded: 0,
  };
  const byPaymentStatus = {
    pending: 0,
    paid: 0,
    failed: 0,
    refunded: 0,
  };

  for (const b of allBookings) {
    const s = (b.status || "pending") as keyof typeof byStatus;
    if (s in byStatus) byStatus[s] += 1;
    const p = (b.paymentStatus || "pending") as keyof typeof byPaymentStatus;
    if (p in byPaymentStatus) byPaymentStatus[p] += 1;
  }

  const cancelledCount = byStatus.cancelled + byStatus.refunded;
  const cancellationRate =
    totalBookings > 0 ? (cancelledCount / totalBookings) * 100 : 0;
  const averageBookingValue =
    totalBookings > 0 ? totalRevenue / totalBookings : 0;
  const averageRating = reviewAgg[0]?.averageRating
    ? Math.round((reviewAgg[0].averageRating as number) * 10) / 10
    : 0;

  // Destination breakdown (top cities via hotel lookup)
  const destAgg = await Booking.aggregate([
    { $addFields: { hotelIdObjectId: { $toObjectId: "$hotelId" } } },
    {
      $group: {
        _id: "$hotelIdObjectId",
        bookings: { $sum: 1 },
        revenue: { $sum: "$totalCost" },
      },
    },
    {
      $lookup: {
        from: "hotels",
        localField: "_id",
        foreignField: "_id",
        as: "hotel",
      },
    },
    { $unwind: "$hotel" },
    {
      $group: {
        _id: "$hotel.city",
        bookings: { $sum: "$bookings" },
        revenue: { $sum: "$revenue" },
      },
    },
    { $sort: { bookings: -1 } },
    { $limit: 10 },
  ]);

  const typeAgg = await Hotel.aggregate([
    { $unwind: { path: "$type", preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: { $ifNull: ["$type", "Unknown"] },
        bookings: { $sum: { $ifNull: ["$totalBookings", 0] } },
        revenue: { $sum: { $ifNull: ["$totalRevenue", 0] } },
      },
    },
    { $sort: { bookings: -1 } },
    { $limit: 10 },
  ]);

  return {
    date: new Date(),
    metrics: {
      totalBookings,
      totalRevenue,
      totalUsers,
      totalHotels,
      averageBookingValue: Math.round(averageBookingValue * 100) / 100,
      conversionRate: 0,
      cancellationRate: Math.round(cancellationRate * 10) / 10,
      averageRating,
    },
    breakdown: {
      byStatus,
      byPaymentStatus,
      byDestination: destAgg.map((d) => ({
        city: d._id as string,
        bookings: d.bookings as number,
        revenue: d.revenue as number,
      })),
      byHotelType: typeAgg.map((t) => ({
        type: t._id as string,
        bookings: t.bookings as number,
        revenue: t.revenue as number,
      })),
    },
  };
};

/**
 * List recent business-insights rollups (admin).
 * Mounted under /api/business-insights — avoids /analytics path (ad-blockers).
 * GET /api/business-insights/rollups
 */
router.get(
  "/rollups",
  verifyToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const limit = Math.min(parseInt(String(req.query.limit || "20"), 10), 50);
      const snapshots = await Analytics.find()
        .sort({ date: -1 })
        .limit(limit);
      res.json(snapshots);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Unable to fetch business insights rollups" });
    }
  }
);

/**
 * Capture a live rollup into Analytics model (admin).
 * POST /api/business-insights/rollups
 */
router.post(
  "/rollups",
  verifyToken,
  requireAdmin,
  async (_req: Request, res: Response) => {
    try {
      const payload = await buildLiveSnapshot();
      const snapshot = await Analytics.create(payload);
      res.status(201).json(snapshot);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Unable to create business insights rollup" });
    }
  }
);

export default router;
