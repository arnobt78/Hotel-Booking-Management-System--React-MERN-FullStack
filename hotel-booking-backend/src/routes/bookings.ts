import express, { Request, Response } from "express";
import Booking from "../models/booking";
import Hotel from "../models/hotel";
import User from "../models/user";
import verifyToken from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";
import { body, param, validationResult } from "express-validator";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Booking management and administration
 */

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Get all bookings (admin only)
 *     description: Returns all bookings in the system. Admin role is required.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookings returned successfully.
 *       401:
 *         description: Unauthorized – missing or invalid token.
 *       403:
 *         description: Forbidden – user is not an admin.
 *       500:
 *         description: Unable to fetch bookings.
 */
// Get all bookings (admin only)
router.get(
  "/",
  verifyToken,
  requireRole("admin"),
  async (req: any, res: Response) => {
    try {

      const bookings = await Booking.find()
        .sort({ createdAt: -1 })
        .populate("hotelId", "name city country");

      res.status(200).json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Unable to fetch bookings" });
    }
  }
);


/**
 * @swagger
 * /api/bookings/hotel/{hotelId}:
 *   get:
 *     summary: Get bookings for a specific hotel (hotel owner only)
 *     description: Returns all bookings for a given hotel. Only the owner of the hotel (or admin, ako dodaš) može pristupiti.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: hotelId
 *         required: true
 *         description: ID of the hotel.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of bookings for the hotel.
 *       401:
 *         description: Unauthorized – missing or invalid token.
 *       403:
 *         description: Forbidden – user is not the owner of this hotel.
 *       404:
 *         description: Hotel not found.
 *       500:
 *         description: Unable to fetch hotel bookings.
 */
// Get bookings by hotel ID (for hotel owners)
router.get(
  "/hotel/:hotelId",
  verifyToken,
  requireRole("hotel_owner"),
  async (req: Request, res: Response) => {
    try {
      const { hotelId } = req.params;

      // Verify the hotel belongs to the authenticated user
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }

      // preporuka: hotel.userId.toString() === req.userId
      if (hotel.userId !== req.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const bookings = await Booking.find({ hotelId })
        .sort({ createdAt: -1 })
        .populate("userId", "firstName lastName email");

      res.status(200).json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Unable to fetch hotel bookings" });
    }
  }
);

/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     summary: Get booking by ID
 *     description: Returns booking details by its ID. RBAC logika treba da odluči ko smije vidjeti (user, hotel_owner, admin).
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Booking ID.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking details.
 *       401:
 *         description: Unauthorized – missing or invalid token.
 *       403:
 *         description: Forbidden – user has no access to this booking.
 *       404:
 *         description: Booking not found.
 *       500:
 *         description: Unable to fetch booking.
 */
// Get booking by ID
router.get(
  "/:id",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const booking = await Booking.findById(req.params.id).populate(
        "hotelId",
        "name city country imageUrls"
      );

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      res.status(200).json(booking);
    } catch (error) {
      res.status(500).json({ message: "Unable to fetch booking" });
    }
  }
);

/**
 * @swagger
 * /api/bookings/{id}/status:
 *   patch:
 *     summary: Update booking status
 *     description: Updates the status of a booking (pending, confirmed, cancelled, completed, refunded). Dozvole zavise od uloge (user/owner/admin).
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Booking ID.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, cancelled, completed, refunded]
 *               cancellationReason:
 *                 type: string
 *               refundAmount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Booking status updated.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Unauthorized – missing or invalid token.
 *       403:
 *         description: Forbidden – user has no access to update this booking.
 *       404:
 *         description: Booking not found.
 *       500:
 *         description: Unable to update booking status.
 */
// Update booking status
router.patch(
  "/:id/status",
  verifyToken,
  [
    body("status")
      .isIn(["pending", "confirmed", "cancelled", "completed", "refunded"])
      .withMessage("Invalid status"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { status, cancellationReason } = req.body;

      const updateData: any = { status };
      if (status === "cancelled" && cancellationReason) {
        updateData.cancellationReason = cancellationReason;
      }
      if (status === "refunded") {
        updateData.refundAmount = req.body.refundAmount || 0;
      }

      const booking = await Booking.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      res.status(200).json(booking);
    } catch (error) {
      res.status(500).json({ message: "Unable to update booking" });
    }
  }
);

/**
 * @swagger
 * /api/bookings/{id}/payment:
 *   patch:
 *     summary: Update booking payment status
 *     description: Updates the payment status for a booking (pending, paid, failed, refunded).
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Booking ID.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentStatus:
 *                 type: string
 *                 enum: [pending, paid, failed, refunded]
 *               paymentMethod:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment status updated.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Unauthorized – missing or invalid token.
 *       403:
 *         description: Forbidden – user has no access to update this payment.
 *       404:
 *         description: Booking not found.
 *       500:
 *         description: Unable to update payment status.
 */
// Update payment status
router.patch(
  "/:id/payment",
  verifyToken,
  [
    body("paymentStatus")
      .isIn(["pending", "paid", "failed", "refunded"])
      .withMessage("Invalid payment status"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { paymentStatus, paymentMethod } = req.body;

      const updateData: any = { paymentStatus };
      if (paymentMethod) {
        updateData.paymentMethod = paymentMethod;
      }

      const booking = await Booking.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      res.status(200).json(booking);
    } catch (error) {
      res.status(500).json({ message: "Unable to update payment status" });
    }
  }
);

/**
 * @swagger
 * /api/bookings/{id}:
 *   delete:
 *     summary: Delete booking (admin only)
 *     description: Deletes a booking and updates related analytics. Only admin can delete bookings.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Booking ID.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking deleted successfully.
 *       401:
 *         description: Unauthorized – missing or invalid token.
 *       403:
 *         description: Forbidden – user is not an admin.
 *       404:
 *         description: Booking not found.
 *       500:
 *         description: Unable to delete booking.
 */
// Delete booking (admin only)
router.delete(
  "/:id",
  verifyToken,
  requireRole("admin"),
  async (req: Request, res: Response) => {
    try {
      const booking = await Booking.findByIdAndDelete(req.params.id);

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Update hotel analytics
      await Hotel.findByIdAndUpdate(booking.hotelId, {
        $inc: {
          totalBookings: -1,
          totalRevenue: -(booking.totalCost || 0),
        },
      });

      // Update user analytics
      await User.findByIdAndUpdate(booking.userId, {
        $inc: {
          totalBookings: -1,
          totalSpent: -(booking.totalCost || 0),
        },
      });

      res.status(200).json({ message: "Booking deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Unable to delete booking" });
    }
  }
);

export default router;
