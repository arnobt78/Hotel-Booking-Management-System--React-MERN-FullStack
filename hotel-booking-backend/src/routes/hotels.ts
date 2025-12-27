import express, { Request, Response } from "express";
import Hotel from "../models/hotel";
import Booking from "../models/booking";
import User from "../models/user";
import { BookingType, HotelSearchResponse } from "../../../shared/types";
import { body, param, validationResult } from "express-validator";
import Stripe from "stripe";
import verifyToken from "../middleware/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const router = express.Router();

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const toMidnightUTC = (d: Date) =>
  new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

const diffNights = (start: Date, end: Date) => {
  const s = toMidnightUTC(start);
  const e = toMidnightUTC(end);
  return (e.getTime() - s.getTime()) / MS_PER_DAY;
};

/**
 * @swagger
 * tags:
 *   - name: Hotels
 *     description: Public hotel search & details
 *   - name: HotelBookings
 *     description: Payment and booking operations for a selected hotel
 */

/**
 * @swagger
 * /api/hotels/search:
 *   get:
 *     summary: Search hotels using various filters
 *     tags: [Hotels]
 *     parameters:
 *       - name: destination
 *         in: query
 *         schema:
 *           type: string
 *         description: City or country
 *       - name: facilities
 *         in: query
 *         schema:
 *           type: array
 *           items: { type: string }
 *         description: Facility filter (array or single)
 *       - name: types
 *         in: query
 *         schema:
 *           type: array
 *           items: { type: string }
 *         description: Hotel types
 *       - name: stars
 *         in: query
 *         schema:
 *           type: array
 *           items: { type: number }
 *       - name: maxPrice
 *         in: query
 *         schema:
 *           type: number
 *       - name: sortOption
 *         in: query
 *         schema:
 *           type: string
 *           enum: [starRating, pricePerNightAsc, pricePerNightDesc]
 *       - name: page
 *         in: query
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: List of filtered hotels with pagination metadata
 *       500:
 *         description: Something went wrong
 */
router.get("/search", async (req: Request, res: Response) => {
  try {
    const query = constructSearchQuery(req.query);

    let sortOptions = {};
    switch (req.query.sortOption) {
      case "starRating":
        sortOptions = { starRating: -1 };
        break;
      case "pricePerNightAsc":
        sortOptions = { pricePerNight: 1 };
        break;
      case "pricePerNightDesc":
        sortOptions = { pricePerNight: -1 };
        break;
    }

    const pageSize = 5;
    const pageNumber = parseInt(req.query.page ? req.query.page.toString() : "1");
    const skip = (pageNumber - 1) * pageSize;

    const hotels = await Hotel.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize);

    const total = await Hotel.countDocuments(query);

    const response: HotelSearchResponse = {
      data: hotels,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
      },
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

/**
 * @swagger
 * /api/hotels:
 *   get:
 *     summary: Get all hotels (public)
 *     tags: [Hotels]
 *     responses:
 *       200:
 *         description: Successfully retrieved hotel list
 *       500:
 *         description: Error fetching hotels
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const hotels = await Hotel.find().sort("-lastUpdated");
    res.json(hotels);
  } catch (error) {
    res.status(500).json({ message: "Error fetching hotels" });
  }
});

/**
 * @swagger
 * /api/hotels/{id}:
 *   get:
 *     summary: Get hotel details by ID
 *     tags: [Hotels]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Hotel ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Hotel details returned
 *       400:
 *         description: Validation error
 *       500:
 *         description: Something went wrong
 */
router.get(
  "/:id",
  [param("id").notEmpty().withMessage("Hotel ID is required")],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const id = req.params.id.toString();

    try {
      const hotel = await Hotel.findById(id);
      res.json(hotel);
    } catch (error) {
      res.status(500).json({ message: "Error fetching hotel" });
    }
  }
);

/**
 * @swagger
 * /api/hotels/{hotelId}/bookings/payment-intent:
 *   post:
 *     summary: Create a Stripe payment intent for a hotel booking
 *     tags: [HotelBookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: hotelId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               numberOfNights:
 *                 type: number
 *                 example: 3
 *     responses:
 *       200:
 *         description: Payment intent created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 paymentIntentId: { type: string }
 *                 clientSecret: { type: string }
 *                 totalCost: { type: number }
 *       400:
 *         description: Hotel not found
 *       500:
 *         description: Stripe error or server failure
 */
router.post(
  "/:hotelId/bookings/payment-intent",
  verifyToken,
  [
    body("numberOfNights")
      .isInt({ min: 1 })
      .withMessage("numberOfNights must be an integer >= 1"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { numberOfNights } = req.body;
      const hotelId = req.params.hotelId;

      const hotel = await Hotel.findById(hotelId);
      if (!hotel) {
        return res.status(400).json({ message: "Hotel not found" });
      }

      const totalCost = hotel.pricePerNight * Number(numberOfNights);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalCost * 100),
        currency: "gbp",
        metadata: {
          hotelId,
          userId: req.userId,
        },
      });

      if (!paymentIntent.client_secret) {
        return res.status(500).json({ message: "Error creating payment intent" });
      }

      res.send({
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret.toString(),
        totalCost,
      });
    } catch (error) {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
);

/**
 * @swagger
 * /api/hotels/{hotelId}/bookings:
 *   post:
 *     summary: Confirm a booking after successful Stripe payment
 *     tags: [HotelBookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: hotelId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentIntentId:
 *                 type: string
 *               totalCost:
 *                 type: number
 *               startDate:
 *                 type: string
 *               endDate:
 *                 type: string
 *     responses:
 *       200:
 *         description: Booking confirmed
 *       400:
 *         description: Payment intent mismatch or unpaid
 *       500:
 *         description: Server error while saving booking
 */
router.post(
  "/:hotelId/bookings",
  verifyToken,
  [
    body("paymentIntentId")
      .notEmpty()
      .withMessage("paymentIntentId is required"),

    body("totalCost")
      .isNumeric()
      .withMessage("totalCost must be a number"),

    body("checkIn")
      .notEmpty().withMessage("checkIn is required")
      .isISO8601().withMessage("checkIn must be a valid ISO date"),

    body("checkOut")
      .notEmpty().withMessage("checkOut is required")
      .isISO8601().withMessage("checkOut must be a valid ISO date"),

    body().custom((_, { req }) => {
      const start = new Date(req.body.checkIn);
      const end = new Date(req.body.checkOut);

      const nights = diffNights(start, end);
      if (nights < 1) {
        throw new Error("Booking must be at least 1 night (checkOut must be after checkIn)");
      }

      if (req.body.numberOfNights && Number(req.body.numberOfNights) !== nights) {
        throw new Error("numberOfNights mismatch");
      }

      return true;
    }),

  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const paymentIntentId = req.body.paymentIntentId;

      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId as string
      );

      if (!paymentIntent) {
        return res.status(400).json({ message: "payment intent not found" });
      }

      if (
        paymentIntent.metadata.hotelId !== req.params.hotelId ||
        paymentIntent.metadata.userId !== req.userId
      ) {
        return res.status(400).json({ message: "payment intent mismatch" });
      }

      if (paymentIntent.status !== "succeeded") {
        return res.status(400).json({
          message: `payment intent not succeeded. Status: ${paymentIntent.status}`,
        });
      }

      const newBooking: BookingType = {
        ...req.body,
        userId: req.userId,
        hotelId: req.params.hotelId,
        createdAt: new Date(),
        status: "confirmed",
        paymentStatus: "paid",
      };

      const booking = new Booking(newBooking);
      await booking.save();

      await Hotel.findByIdAndUpdate(req.params.hotelId, {
        $inc: {
          totalBookings: 1,
          totalRevenue: newBooking.totalCost,
        },
      });

      await User.findByIdAndUpdate(req.userId, {
        $inc: {
          totalBookings: 1,
          totalSpent: newBooking.totalCost,
        },
      });

      res.status(200).send();
    } catch (error) {
      res.status(500).json({ message: "something went wrong" });
    }
  }
);

const constructSearchQuery = (queryParams: any) => {
  let constructedQuery: any = {};

  if (queryParams.destination?.trim()) {
    const destination = queryParams.destination.trim();

    constructedQuery.$or = [
      { city: { $regex: destination, $options: "i" } },
      { country: { $regex: destination, $options: "i" } },
    ];
  }

  if (queryParams.facilities) {
    constructedQuery.facilities = {
      $all: Array.isArray(queryParams.facilities)
        ? queryParams.facilities
        : [queryParams.facilities],
    };
  }

  if (queryParams.types) {
    constructedQuery.type = {
      $in: Array.isArray(queryParams.types)
        ? queryParams.types
        : [queryParams.types],
    };
  }

  if (queryParams.stars) {
    const starRatings = Array.isArray(queryParams.stars)
      ? queryParams.stars.map((star: string) => parseInt(star))
      : [parseInt(queryParams.stars)];
    constructedQuery.starRating = { $in: starRatings };
  }

  if (queryParams.maxPrice) {
    constructedQuery.pricePerNight = {
      $lte: parseInt(queryParams.maxPrice),
    };
  }

  // Guests capacity filtering
  if (queryParams.adultCount) {
    const adults = parseInt(queryParams.adultCount);
    if (!isNaN(adults)) {
      constructedQuery.adultCount = { $gte: adults };
    }
  }

  if (queryParams.childCount) {
    const children = parseInt(queryParams.childCount);
    if (!isNaN(children)) {
      constructedQuery.childCount = { $gte: children };
    }
  }

  return constructedQuery;
};

export default router;
