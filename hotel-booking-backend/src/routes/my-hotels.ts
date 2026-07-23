import express, { Request, Response } from "express";
import multer from "multer";
import cloudinary from "cloudinary";
import Hotel from "../models/hotel";
import Booking from "../models/booking";
import Review from "../models/review";
import verifyToken from "../middleware/auth";
import { body } from "express-validator";
import { HotelType } from "../../../shared/types";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

/** Classify bookings into upcoming / completed / cancelled for owner cards */
function classifyBookingCounts(
  bookings: Array<{ status: string; checkIn: Date; checkOut: Date }>
) {
  const now = new Date();
  let upcoming = 0;
  let completed = 0;
  let cancelled = 0;
  for (const b of bookings) {
    if (b.status === "cancelled" || b.status === "refunded") {
      cancelled += 1;
    } else if (
      b.status === "completed" ||
      new Date(b.checkOut).getTime() < now.getTime()
    ) {
      completed += 1;
    } else {
      upcoming += 1;
    }
  }
  return { upcoming, completed, cancelled };
}

router.post(
  "/",
  verifyToken,
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("city").notEmpty().withMessage("City is required"),
    body("country").notEmpty().withMessage("Country is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("type")
      .notEmpty()
      .isArray({ min: 1 })
      .withMessage("Select at least one hotel type"),
    body("pricePerNight")
      .notEmpty()
      .isNumeric()
      .withMessage("Price per night is required and must be a number"),
    body("facilities")
      .notEmpty()
      .isArray()
      .withMessage("Facilities are required"),
  ],
  upload.array("imageFiles", 6),
  async (req: Request, res: Response) => {
    try {
      const imageFiles = (req as any).files as any[];
      const newHotel: HotelType = req.body;

      if (typeof newHotel.type === "string") {
        newHotel.type = [newHotel.type];
      }

      newHotel.contact = {
        phone: req.body["contact.phone"] || "",
        email: req.body["contact.email"] || "",
        website: req.body["contact.website"] || "",
      };

      newHotel.policies = {
        checkInTime: req.body["policies.checkInTime"] || "",
        checkOutTime: req.body["policies.checkOutTime"] || "",
        cancellationPolicy: req.body["policies.cancellationPolicy"] || "",
        petPolicy: req.body["policies.petPolicy"] || "",
        smokingPolicy: req.body["policies.smokingPolicy"] || "",
      };

      const imageUrls = await uploadImages(imageFiles);

      newHotel.imageUrls = imageUrls;
      newHotel.lastUpdated = new Date();
      newHotel.userId = req.userId;

      const hotel = new Hotel(newHotel);
      await hotel.save();

      res.status(201).send(hotel);
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Something went wrong" });
    }
  }
);

// Enriched list: booking status counts + live averageRating from Review collection
router.get("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const hotels = await Hotel.find({ userId: req.userId });
    const hotelIds = hotels.map((h) => h._id.toString());

    if (hotelIds.length === 0) {
      return res.json([]);
    }

    const [allBookings, reviewAggs] = await Promise.all([
      Booking.find({ hotelId: { $in: hotelIds } }).select(
        "hotelId status checkIn checkOut"
      ),
      Review.aggregate([
        { $match: { hotelId: { $in: hotelIds } } },
        {
          $group: {
            _id: "$hotelId",
            averageRating: { $avg: "$rating" },
            reviewCount: { $sum: 1 },
          },
        },
      ]),
    ]);

    const bookingsByHotel = new Map<string, typeof allBookings>();
    for (const b of allBookings) {
      const list = bookingsByHotel.get(b.hotelId) || [];
      list.push(b);
      bookingsByHotel.set(b.hotelId, list);
    }

    const reviewByHotel = new Map(
      reviewAggs.map((r) => [
        r._id as string,
        {
          averageRating: Math.round((r.averageRating as number) * 10) / 10,
          reviewCount: r.reviewCount as number,
        },
      ])
    );

    const enriched = hotels.map((hotel) => {
      const id = hotel._id.toString();
      const counts = classifyBookingCounts(bookingsByHotel.get(id) || []);
      const review = reviewByHotel.get(id);
      const obj = hotel.toObject();
      return {
        ...obj,
        upcomingBookings: counts.upcoming,
        completedBookings: counts.completed,
        cancelledBookings: counts.cancelled,
        averageRating:
          review?.averageRating ?? obj.averageRating ?? obj.starRating ?? 0,
        reviewCount: review?.reviewCount ?? obj.reviewCount ?? 0,
      };
    });

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: "Error fetching hotels" });
  }
});

router.get("/:id", verifyToken, async (req: Request, res: Response) => {
  const id = req.params.id.toString();
  try {
    const hotel = await Hotel.findOne({
      _id: id,
      userId: req.userId,
    });
    res.json(hotel);
  } catch (error) {
    res.status(500).json({ message: "Error fetching hotels" });
  }
});

/**
 * Owner: toggle hotel isActive.
 * PATCH /api/my-hotels/:id/active
 * Body: { isActive: boolean }
 */
router.patch(
  "/:id/active",
  verifyToken,
  async (req: Request, res: Response) => {
    if (typeof req.body?.isActive !== "boolean") {
      return res.status(400).json({ message: "isActive boolean required" });
    }
    try {
      const hotel = await Hotel.findOneAndUpdate(
        { _id: req.params.id, userId: req.userId },
        { isActive: req.body.isActive, lastUpdated: new Date() },
        { new: true }
      );
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }
      res.json(hotel);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Unable to update hotel status" });
    }
  }
);

router.put(
  "/:hotelId",
  verifyToken,
  upload.array("imageFiles"),
  async (req: Request, res: Response) => {
    try {
      // First, find the existing hotel
      const existingHotel = await Hotel.findOne({
        _id: req.params.hotelId,
        userId: req.userId,
      });

      if (!existingHotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }

      // Prepare update data
      const updateData: any = {
        name: req.body.name,
        city: req.body.city,
        country: req.body.country,
        description: req.body.description,
        type: Array.isArray(req.body.type) ? req.body.type : [req.body.type],
        pricePerNight: Number(req.body.pricePerNight),
        starRating: Number(req.body.starRating),
        adultCount: Number(req.body.adultCount),
        childCount: Number(req.body.childCount),
        facilities: Array.isArray(req.body.facilities)
          ? req.body.facilities
          : [req.body.facilities],
        lastUpdated: new Date(),
      };

      // Handle contact information
      updateData.contact = {
        phone: req.body["contact.phone"] || "",
        email: req.body["contact.email"] || "",
        website: req.body["contact.website"] || "",
      };

      // Handle policies
      updateData.policies = {
        checkInTime: req.body["policies.checkInTime"] || "",
        checkOutTime: req.body["policies.checkOutTime"] || "",
        cancellationPolicy: req.body["policies.cancellationPolicy"] || "",
        petPolicy: req.body["policies.petPolicy"] || "",
        smokingPolicy: req.body["policies.smokingPolicy"] || "",
      };

      console.log("Update data:", updateData);

      // Update the hotel
      const updatedHotel = await Hotel.findByIdAndUpdate(
        req.params.hotelId,
        updateData,
        { new: true }
      );

      if (!updatedHotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }

      // Handle image uploads if any
      const files = (req as any).files as any[];
      if (files && files.length > 0) {
        const updatedImageUrls = await uploadImages(files);
        updatedHotel.imageUrls = [
          ...updatedImageUrls,
          ...(req.body.imageUrls
            ? Array.isArray(req.body.imageUrls)
              ? req.body.imageUrls
              : [req.body.imageUrls]
            : []),
        ];
        await updatedHotel.save();
      }

      res.status(200).json(updatedHotel);
    } catch (error) {
      console.error("Error updating hotel:", error);
      console.error("Request body:", req.body);
      console.error("Hotel ID:", req.params.hotelId);
      console.error("User ID:", req.userId);
      res.status(500).json({
        message: "Something went wrong",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

async function uploadImages(imageFiles: any[]) {
  const uploadPromises = imageFiles.map(async (image) => {
    const b64 = Buffer.from(image.buffer as Uint8Array).toString("base64");
    let dataURI = "data:" + image.mimetype + ";base64," + b64;
    const res = await cloudinary.v2.uploader.upload(dataURI, {
      secure: true, // Force HTTPS URLs
      transformation: [
        { width: 800, height: 600, crop: "fill" },
        { quality: "auto" },
      ],
    });
    return res.url;
  });

  const imageUrls = await Promise.all(uploadPromises);
  return imageUrls;
}

export default router;
