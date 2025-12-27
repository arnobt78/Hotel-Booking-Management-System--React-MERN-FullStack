import express, { Request, Response } from "express";
import verifyToken from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";

import User from "../models/user";
import Hotel from "../models/hotel";
import Booking from "../models/booking";
import Favorite from "../models/favorite"; 

const router = express.Router();

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Admin dashboard overview (KPIs + charts)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/dashboard",
  verifyToken,
  requireRole("admin"),
  async (req: Request, res: Response) => {
    try {
      const now = new Date();

      const [totalUsers, totalHotels, totalFavorites] = await Promise.all([
        User.countDocuments({}),
        Hotel.countDocuments({}),
        Favorite.countDocuments({}),
      ]);

      // Aktivne rezervacije 
      const activeBookings = await Booking.countDocuments({
        checkOut: { $gte: now },
        status: { $in: ["pending", "confirmed"] }, 
      });

      // Ukupan prihod 
      const revenueAgg = await Booking.aggregate([
        {
          $match: {
            paymentStatus: { $in: ["paid"] }, 
          },
        },
        { $group: { _id: null, total: { $sum: "$totalCost" } } },
      ]);
      const totalRevenue = revenueAgg[0]?.total ?? 0;

      // Prosječna ocjena svih hotela 
      const avgRatingAgg = await Hotel.aggregate([
        { $match: { averageRating: { $gt: 0 } } },
        { $group: { _id: null, avg: { $avg: "$averageRating" } } },
      ]);
      const avgHotelRating = avgRatingAgg[0]?.avg ?? 0;

      const bookingsByMonth = await Booking.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().setMonth(new Date().getMonth() - 11)),
            },
          },
        },
        {
          $group: {
            _id: {
              y: { $year: "$createdAt" },
              m: { $month: "$createdAt" },
            },
            bookings: { $sum: 1 },
          },
        },
        { $sort: { "_id.y": 1, "_id.m": 1 } },
      ]);

      // Revenue po mjesecima (zadnjih 12)
      const revenueByMonth = await Booking.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().setMonth(new Date().getMonth() - 11)),
            },
            paymentStatus: { $in: ["paid"] }, 
          },
        },
        {
          $group: {
            _id: {
              y: { $year: "$createdAt" },
              m: { $month: "$createdAt" },
            },
            revenue: { $sum: "$totalCost" },
          },
        },
        { $sort: { "_id.y": 1, "_id.m": 1 } },
      ]);

      // Top 5 hotela po prihodima
      const topHotelsByRevenue = await Booking.aggregate([
        {
          $match: {
            paymentStatus: { $in: ["paid"] }, 
          },
        },
        {
          $group: {
            _id: "$hotelId",
            revenue: { $sum: "$totalCost" },
            bookings: { $sum: 1 },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "hotels",
            let: { hid: { $toObjectId: "$_id" } },
            pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$hid"] } } }],
            as: "hotel",
          },
        },
        { $unwind: { path: "$hotel", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            hotelId: "$_id",
            name: "$hotel.name",
            city: "$hotel.city",
            revenue: 1,
            bookings: 1,
          },
        },
      ]);

      // Top 5 hotela po broju booking-a
      const topHotelsByBookings = await Booking.aggregate([
        {
          $group: {
            _id: "$hotelId",
            bookings: { $sum: 1 },
            revenue: { $sum: "$totalCost" },
          },
        },
        { $sort: { bookings: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "hotels",
            let: { hid: { $toObjectId: "$_id" } },
            pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$hid"] } } }],
            as: "hotel",
          },
        },
        { $unwind: { path: "$hotel", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            hotelId: "$_id",
            name: "$hotel.name",
            city: "$hotel.city",
            bookings: 1,
            revenue: 1,
          },
        },
      ]);

      const toLabel = (y: number, m: number) =>
        `${y}-${String(m).padStart(2, "0")}`;

      res.json({
        kpis: {
          totalUsers,
          totalHotels,
          activeBookings,
          totalRevenue,
          avgHotelRating,
          totalFavorites,
        },
        charts: {
          bookingsByMonth: bookingsByMonth.map((x) => ({
            month: toLabel(x._id.y, x._id.m),
            value: x.bookings,
          })),
          revenueByMonth: revenueByMonth.map((x) => ({
            month: toLabel(x._id.y, x._id.m),
            value: x.revenue,
          })),
          topHotelsByRevenue,
          topHotelsByBookings,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      res.status(500).json({ message: "Failed to load admin dashboard" });
    }
  }
);

export default router;
