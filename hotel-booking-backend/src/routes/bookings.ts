import express, { Request, Response } from "express";
import Stripe from "stripe";
import Booking from "../models/booking";
import Hotel from "../models/hotel";
import User from "../models/user";
import verifyToken from "../middleware/auth";
import requireAdmin from "../middleware/requireAdmin";
import { body, validationResult } from "express-validator";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_API_KEY as string);

/** True when booking can still be cancelled (upcoming pending/confirmed). */
const isCancellable = (booking: {
  status?: string;
  checkIn: Date;
}): boolean => {
  const status = booking.status || "pending";
  if (status !== "pending" && status !== "confirmed") return false;
  return new Date(booking.checkIn).getTime() > Date.now();
};

/** Guest owns booking, or hotel owner, or admin role. */
const assertCanCancel = async (
  req: Request,
  booking: { userId: string; hotelId: string | { _id?: string } }
): Promise<{ ok: true } | { ok: false; status: number; message: string }> => {
  if (String(booking.userId) === req.userId) {
    return { ok: true };
  }

  const hotelId =
    typeof booking.hotelId === "object" && booking.hotelId !== null
      ? String(booking.hotelId._id || booking.hotelId)
      : String(booking.hotelId);

  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
    return { ok: false, status: 404, message: "Hotel not found" };
  }
  if (hotel.userId === req.userId) {
    return { ok: true };
  }

  const user = await User.findById(req.userId);
  if (user?.role === "admin") {
    return { ok: true };
  }

  return { ok: false, status: 403, message: "Access denied" };
};

/** Owner or admin only (not guest) — for status patch / delete. */
const assertOwnerOrAdmin = async (
  req: Request,
  hotelId: string
): Promise<{ ok: true } | { ok: false; status: number; message: string }> => {
  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
    return { ok: false, status: 404, message: "Hotel not found" };
  }
  if (hotel.userId === req.userId) {
    return { ok: true };
  }
  const user = await User.findById(req.userId);
  if (user?.role === "admin") {
    return { ok: true };
  }
  return { ok: false, status: 403, message: "Access denied" };
};

// Get all bookings (admin only)
router.get("/", verifyToken, requireAdmin, async (_req: Request, res: Response) => {
  try {
    const bookings = await Booking.find()
      .sort({ createdAt: -1 })
      .populate("hotelId", "name city country");

    res.status(200).json(bookings);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Unable to fetch bookings" });
  }
});

// Get bookings by hotel ID (for hotel owners)
router.get(
  "/hotel/:hotelId",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { hotelId } = req.params;

      const hotel = await Hotel.findById(hotelId);
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }

      if (hotel.userId !== req.userId) {
        const user = await User.findById(req.userId);
        if (user?.role !== "admin") {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      const bookings = await Booking.find({ hotelId })
        .sort({ createdAt: -1 })
        .populate("userId", "firstName lastName email");

      res.status(200).json(bookings);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Unable to fetch hotel bookings" });
    }
  }
);

/**
 * Cancel booking (guest / hotel owner / admin).
 * Full Stripe refund when paid + stripePaymentIntentId present.
 * POST /api/bookings/:id/cancel
 */
router.post(
  "/:id/cancel",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const booking = await Booking.findById(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      const authz = await assertCanCancel(req, booking);
      if (authz.ok === false) {
        return res.status(authz.status).json({ message: authz.message });
      }

      if (!isCancellable(booking)) {
        return res.status(400).json({
          message:
            "Booking cannot be cancelled (must be upcoming pending/confirmed)",
        });
      }

      const cancellationReason =
        typeof req.body?.cancellationReason === "string"
          ? req.body.cancellationReason.trim()
          : "";

      let refundAmount = 0;
      let refundSkipped: string | undefined;
      const wasPaid = booking.paymentStatus === "paid";

      if (wasPaid && booking.stripePaymentIntentId) {
        try {
          const refund = await stripe.refunds.create({
            payment_intent: booking.stripePaymentIntentId,
          });
          refundAmount =
            typeof refund.amount === "number"
              ? refund.amount / 100
              : booking.totalCost;
        } catch (stripeErr: unknown) {
          const msg =
            stripeErr instanceof Error
              ? stripeErr.message
              : "Stripe refund failed";
          console.log(stripeErr);
          return res.status(502).json({ message: msg });
        }
      } else if (wasPaid && !booking.stripePaymentIntentId) {
        // Legacy bookings created before PI persistence — cancel without fake refund
        refundSkipped =
          "Cancelled without Stripe refund (no payment intent on file)";
      }

      booking.status = "cancelled";
      if (wasPaid && booking.stripePaymentIntentId && refundAmount > 0) {
        booking.paymentStatus = "refunded";
        booking.refundAmount = refundAmount;
      } else if (wasPaid && !booking.stripePaymentIntentId) {
        // Keep paymentStatus as paid so UI shows cancel without claiming refund
        booking.refundAmount = 0;
      }
      if (cancellationReason) {
        booking.cancellationReason = cancellationReason;
      }
      await booking.save();

      // Mirror create increments only when this booking had been counted as paid revenue
      if (wasPaid) {
        await Hotel.findByIdAndUpdate(booking.hotelId, {
          $inc: {
            totalBookings: -1,
            totalRevenue: -(booking.totalCost || 0),
          },
        });
        await User.findByIdAndUpdate(booking.userId, {
          $inc: {
            totalBookings: -1,
            totalSpent: -(booking.totalCost || 0),
          },
        });
      }

      res.status(200).json({
        booking,
        refundAmount,
        refundSkipped,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Unable to cancel booking" });
    }
  }
);

// Get booking by ID
router.get("/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const booking = await Booking.findById(req.params.id).populate(
      "hotelId",
      "name city country imageUrls"
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const authz = await assertCanCancel(req, booking);
    if (authz.ok === false) {
      return res.status(authz.status).json({ message: authz.message });
    }

    res.status(200).json(booking);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Unable to fetch booking" });
  }
});

// Update booking status (owner / admin only — product cancel uses POST /:id/cancel)
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
      const existing = await Booking.findById(req.params.id);
      if (!existing) {
        return res.status(404).json({ message: "Booking not found" });
      }

      const authz = await assertOwnerOrAdmin(req, existing.hotelId);
      if (authz.ok === false) {
        return res.status(authz.status).json({ message: authz.message });
      }

      const { status, cancellationReason } = req.body;

      // Force Stripe/refund path — do not allow silent cancel via PATCH
      if (status === "cancelled" || status === "refunded") {
        return res.status(400).json({
          message: "Use POST /api/bookings/:id/cancel for cancel/refund",
        });
      }

      const updateData: Record<string, unknown> = { status };
      if (cancellationReason) {
        updateData.cancellationReason = cancellationReason;
      }

      const booking = await Booking.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

      res.status(200).json(booking);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Unable to update booking" });
    }
  }
);

// Update payment status (owner / admin only)
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
      const existing = await Booking.findById(req.params.id);
      if (!existing) {
        return res.status(404).json({ message: "Booking not found" });
      }

      const authz = await assertOwnerOrAdmin(req, existing.hotelId);
      if (authz.ok === false) {
        return res.status(authz.status).json({ message: authz.message });
      }

      const { paymentStatus, paymentMethod } = req.body;

      const updateData: Record<string, unknown> = { paymentStatus };
      if (paymentMethod) {
        updateData.paymentMethod = paymentMethod;
      }

      const booking = await Booking.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

      res.status(200).json(booking);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Unable to update payment status" });
    }
  }
);

// Delete booking (admin only)
router.delete(
  "/:id",
  verifyToken,
  requireAdmin,
  async (req: Request, res: Response) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Skip analytics decrement if cancel already adjusted totals
    const alreadyAdjusted =
      booking.status === "cancelled" ||
      booking.status === "refunded" ||
      booking.paymentStatus === "refunded";

    if (!alreadyAdjusted) {
      await Hotel.findByIdAndUpdate(booking.hotelId, {
        $inc: {
          totalBookings: -1,
          totalRevenue: -(booking.totalCost || 0),
        },
      });

      await User.findByIdAndUpdate(booking.userId, {
        $inc: {
          totalBookings: -1,
          totalSpent: -(booking.totalCost || 0),
        },
      });
    }

    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Unable to delete booking" });
  }
});

export default router;
