import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import Review from "../models/review";
import Hotel from "../models/hotel";
import Booking from "../models/booking";
import verifyToken from "../middleware/auth";
import requireAdmin from "../middleware/requireAdmin";

const router = express.Router();

/**
 * Admin: global review list (newest first).
 * GET /api/reviews
 */
router.get(
  "/",
  verifyToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const limit = Math.min(parseInt(String(req.query.limit || "100"), 10), 200);
      const reviews = await Review.find().sort({ createdAt: -1 }).limit(limit);
      res.json(reviews);
    } catch {
      res.status(500).json({ message: "Error fetching reviews" });
    }
  }
);

/**
 * Public: list reviews for a hotel (newest first).
 * GET /api/reviews/hotel/:hotelId
 */
router.get("/hotel/:hotelId", async (req: Request, res: Response) => {
  try {
    const reviews = await Review.find({ hotelId: req.params.hotelId })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(reviews);
  } catch {
    res.status(500).json({ message: "Error fetching reviews" });
  }
});

/**
 * Public: aggregate rating for a hotel.
 * GET /api/reviews/hotel/:hotelId/summary
 */
router.get("/hotel/:hotelId/summary", async (req: Request, res: Response) => {
  try {
    const [agg] = await Review.aggregate([
      { $match: { hotelId: req.params.hotelId } },
      {
        $group: {
          _id: "$hotelId",
          averageRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 },
        },
      },
    ]);
    res.json({
      hotelId: req.params.hotelId,
      averageRating: agg
        ? Math.round((agg.averageRating as number) * 10) / 10
        : 0,
      reviewCount: agg?.reviewCount ?? 0,
    });
  } catch {
    res.status(500).json({ message: "Error fetching review summary" });
  }
});

/**
 * Authenticated: create a review for a completed/confirmed booking at a hotel.
 * POST /api/reviews
 */
router.post(
  "/",
  verifyToken,
  [
    body("hotelId").notEmpty(),
    body("bookingId").notEmpty(),
    body("rating").isInt({ min: 1, max: 5 }),
    body("comment").notEmpty().isLength({ min: 3 }),
    body("categories.cleanliness").isInt({ min: 1, max: 5 }),
    body("categories.service").isInt({ min: 1, max: 5 }),
    body("categories.location").isInt({ min: 1, max: 5 }),
    body("categories.value").isInt({ min: 1, max: 5 }),
    body("categories.amenities").isInt({ min: 1, max: 5 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Invalid review", errors: errors.array() });
    }

    try {
      const { hotelId, bookingId, rating, comment, categories } = req.body;

      const hotel = await Hotel.findById(hotelId);
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }

      const booking = await Booking.findOne({
        _id: bookingId,
        userId: req.userId,
        hotelId,
      });
      if (!booking) {
        return res.status(403).json({ message: "Booking not found for this user/hotel" });
      }

      const existing = await Review.findOne({ bookingId, userId: req.userId });
      if (existing) {
        return res.status(409).json({ message: "Review already exists for this booking" });
      }

      const review = new Review({
        userId: req.userId,
        hotelId,
        bookingId,
        rating,
        comment,
        categories,
        isVerified: booking.paymentStatus === "paid",
      });
      await review.save();

      // Keep hotel document averages in sync for public listings
      const [agg] = await Review.aggregate([
        { $match: { hotelId } },
        {
          $group: {
            _id: "$hotelId",
            averageRating: { $avg: "$rating" },
            reviewCount: { $sum: 1 },
          },
        },
      ]);
      if (agg) {
        hotel.averageRating = Math.round((agg.averageRating as number) * 10) / 10;
        hotel.reviewCount = agg.reviewCount as number;
        await hotel.save();
      }

      res.status(201).json(review);
    } catch (e) {
      res.status(500).json({ message: "Error creating review" });
    }
  }
);

export default router;
