import express, { Request, Response } from "express";
import verifyToken from "../middleware/auth";
import Hotel from "../models/hotel";
import Booking from "../models/booking";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: MyBookings
 *   description: View bookings made by the authenticated user
 */

/**
 * @swagger
 * /api/my-bookings:
 *   get:
 *     summary: Get all bookings for the authenticated user
 *     description: >
 *       Returns a list of hotels, each containing the booking(s) the user has made for that hotel.  
 *       This endpoint aggregates booking data with hotel details.
 *
 *     tags: [MyBookings]
 *
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Successfully returned user's bookings grouped by hotel.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Hotel ID
 *                   name:
 *                     type: string
 *                   city:
 *                     type: string
 *                   country:
 *                     type: string
 *                   description:
 *                     type: string
 *                   imageUrls:
 *                     type: array
 *                     items:
 *                       type: string
 *                   bookings:
 *                     type: array
 *                     description: User's bookings for this hotel
 *                     items:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         userId:
 *                           type: string
 *                         hotelId:
 *                           type: string
 *                         startDate:
 *                           type: string
 *                           format: date
 *                         endDate:
 *                           type: string
 *                           format: date
 *                         totalCost:
 *                           type: number
 *                         status:
 *                           type: string
 *
 *       401:
 *         description: Unauthorized – token missing or invalid.
 *
 *       500:
 *         description: Internal server error – unable to fetch bookings.
 */
router.get("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const userBookings = await Booking.find({ userId: req.userId }).sort({
      createdAt: -1,
    });

    const results = await Promise.all(
      userBookings.map(async (booking) => {
        const hotel = await Hotel.findById(booking.hotelId);
        if (!hotel) return null;

        return {
          ...hotel.toObject(),
          bookings: [booking.toObject()],
        };
      })
    );

    const validResults = results.filter((result) => result !== null);
    res.status(200).send(validResults);
  } catch (error) {
    res.status(500).json({ message: "Unable to fetch bookings" });
  }
});

export default router;
