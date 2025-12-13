import express from "express";
import Review from "../models/review";
import Hotel from "../models/hotel";
import Booking from "../models/booking";
import verifyToken from "../middleware/auth";

const router = express.Router();

/**
 * @swagger
 * /api/reviews/{hotelId}:
 *   post:
 *     summary: Create a review for a hotel
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: hotelId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rating, comment, categories]
 *             properties:
 *               rating:
 *                 type: number
 *                 example: 5
 *               comment:
 *                 type: string
 *               categories:
 *                 type: object
 *                 properties:
 *                   cleanliness: { type: number, example: 5 }
 *                   service: { type: number, example: 5 }
 *                   location: { type: number, example: 4 }
 *                   value: { type: number, example: 5 }
 *                   amenities: { type: number, example: 4 }
 *     responses:
 *       201:
 *         description: Review created
 *       401:
 *         description: Unauthorized
 */
router.post("/:hotelId", verifyToken, async (req, res) => {
  const { rating, comment, categories } = req.body;
  const userId = req.userId;
  const hotelId = req.params.hotelId;

  const booking = await Booking.findOne({
    userId,
    hotelId,
    status: "paid", 
  });

  if (!booking) {
    return res.status(403).json({
      message: "You can only review hotels you have stayed in",
    });
  }

  const existingReview = await Review.findOne({
    userId,
    hotelId,
  });

  if (existingReview) {
    return res.status(400).json({
      message: "You already reviewed this hotel",
    });
  }

  const review = await Review.create({
    userId,
    hotelId,
    bookingId: booking._id,
    rating,
    comment,
    categories,
    isVerified: true,
  });

  const stats = await Review.aggregate([
    { $match: { hotelId } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  await Hotel.findByIdAndUpdate(hotelId, {
    averageRating: stats[0]?.avgRating || 0,
    reviewCount: stats[0]?.count || 0,
  });

  res.status(201).json(review);
});

/**
 * @swagger
 * /api/reviews/{hotelId}:
 *   get:
 *     summary: Get all reviews for a hotel
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: hotelId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   userId:
 *                     type: string
 *                   rating:
 *                     type: number
 *                   comment:
 *                     type: string
 *                   categories:
 *                     type: object
 *                     properties:
 *                       cleanliness: { type: number }
 *                       service: { type: number }
 *                       location: { type: number }
 *                       value: { type: number }
 *                       amenities: { type: number }
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       404:
 *         description: No reviews found
 */
router.get("/:hotelId", async (req, res) => {
  const { hotelId } = req.params;

  const reviews = await Review.find({ hotelId })
    .sort({ createdAt: -1 })
    .lean();

  if (!reviews || reviews.length === 0) {
    return res.status(404).json({ message: "No reviews found for this hotel" });
  }

  res.status(200).json(reviews);
});

export default router;
