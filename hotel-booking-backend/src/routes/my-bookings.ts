import express, { Request, Response } from "express";
import verifyToken from "../middleware/auth";
import Hotel from "../models/hotel";
import Booking from "../models/booking";

const router = express.Router();

// /api/my-bookings
router.get("/", verifyToken, async (req: Request, res: Response) => {
  try {
    // Get user's bookings from separate collection
    const userBookings = await Booking.find({ userId: req.userId }).sort({
      createdAt: -1,
    });

    // Get hotel details for each booking
    const results = await Promise.all(
      userBookings.map(async (booking) => {
        const hotel = await Hotel.findById(booking.hotelId);
        if (!hotel) {
          return null;
        }

        // Create response object with hotel and booking data
        const hotelWithUserBookings = {
          ...hotel.toObject(),
          bookings: [booking.toObject()],
        };

        return hotelWithUserBookings;
      })
    );

    // Filter out null results and send
    const validResults = results.filter((result) => result !== null);
    res.status(200).send(validResults);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Unable to fetch bookings" });
  }
});

export default router;
