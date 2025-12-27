import express, { Request, Response } from "express";
import multer from "multer";
import Hotel from "../models/hotel";
import verifyToken from "../middleware/auth";
import { body } from "express-validator";
import { HotelType } from "../../../shared/types";
import { bucket } from "../firebase";
import { v4 as uuidv4 } from "uuid";
import { requireRole } from "../middleware/requireRole";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

/**
 * @swagger
 * tags:
 *   name: MyHotels
 *   description: CRUD operations for hotels owned by the authenticated user
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Hotel:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         city:
 *           type: string
 *         country:
 *           type: string
 *         description:
 *           type: string
 *         type:
 *           type: array
 *           items:
 *             type: string
 *         pricePerNight:
 *           type: number
 *         facilities:
 *           type: array
 *           items:
 *             type: string
 *         imageUrls:
 *           type: array
 *           items:
 *             type: string
 *         contact:
 *           type: object
 *           properties:
 *             phone:
 *               type: string
 *             email:
 *               type: string
 *             website:
 *               type: string
 *         policies:
 *           type: object
 *           properties:
 *             checkInTime:
 *               type: string
 *             checkOutTime:
 *               type: string
 *             cancellationPolicy:
 *               type: string
 *             petPolicy:
 *               type: string
 *             smokingPolicy:
 *               type: string
 */

// CREATE HOTEL
/**
 * @swagger
 * /api/my-hotels:
 *   post:
 *     summary: Create a new hotel (owned by the authenticated user)
 *     description: Creates a new hotel and uploads up to 6 images to Firebase Storage. Requires authentication (hotel owner / admin).
 *     tags: [MyHotels]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               city:
 *                 type: string
 *               country:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: One or more hotel types.
 *               pricePerNight:
 *                 type: number
 *               facilities:
 *                 type: array
 *                 items:
 *                   type: string
 *               "contact.phone":
 *                 type: string
 *               "contact.email":
 *                 type: string
 *               "contact.website":
 *                 type: string
 *               "policies.checkInTime":
 *                 type: string
 *               "policies.checkOutTime":
 *                 type: string
 *               "policies.cancellationPolicy":
 *                 type: string
 *               "policies.petPolicy":
 *                 type: string
 *               "policies.smokingPolicy":
 *                 type: string
 *               imageFiles:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Up to 6 image files.
 *     responses:
 *       201:
 *         description: Hotel created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Hotel'
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Unauthorized – missing or invalid token.
 *       500:
 *         description: Server error.
 */
router.post(
  "/",
  verifyToken,
  requireRole("hotel_owner"),
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
      const imageFiles = (req as any).files as Express.Multer.File[];
      const newHotel: HotelType = req.body as any;

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
      newHotel.userId = (req as any).userId;

      const hotel = new Hotel(newHotel);
      await hotel.save();

      res.status(201).send(hotel);
    } catch (e) {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
);

// GET ALL HOTELS (owned by current user)
/**
 * @swagger
 * /api/my-hotels:
 *   get:
 *     summary: Get all hotels for the authenticated user
 *     description: Returns all hotels where userId matches the authenticated user.
 *     tags: [MyHotels]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of hotels.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Hotel'
 *       401:
 *         description: Unauthorized – missing or invalid token.
 *       500:
 *         description: Error fetching hotels.
 */
router.get("/", verifyToken, requireRole("hotel_owner"), async (req: Request, res: Response) => {
  try {
    const hotels = await Hotel.find({ userId: (req as any).userId });
    res.json(hotels);
  } catch (error) {
    res.status(500).json({ message: "Error fetching hotels" });
  }
});

// GET ONE HOTEL (owned by current user)
/**
 * @swagger
 * /api/my-hotels/{id}:
 *   get:
 *     summary: Get a single hotel by ID (owned by the authenticated user)
 *     description: Returns a single hotel document if it belongs to the authenticated user.
 *     tags: [MyHotels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Hotel ID.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Hotel data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Hotel'
 *       401:
 *         description: Unauthorized – missing or invalid token.
 *       404:
 *         description: Hotel not found or does not belong to user.
 *       500:
 *         description: Error fetching hotel.
 */
router.get("/:id", verifyToken, requireRole("hotel_owner"), async (req: Request, res: Response) => {
  const id = req.params.id.toString();

  try {
    const hotel = await Hotel.findOne({
      _id: id,
      userId: (req as any).userId,
    });
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }
    res.json(hotel);
  } catch (error) {
    res.status(500).json({ message: "Error fetching hotels" });
  }
});

// UPDATE HOTEL (owned by current user)
/**
 * @swagger
 * /api/my-hotels/{hotelId}:
 *   put:
 *     summary: Update an existing hotel (owned by the authenticated user)
 *     description: Updates hotel details and optionally uploads new images. Existing images can be preserved by sending their URLs in imageUrls field.
 *     tags: [MyHotels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: hotelId
 *         required: true
 *         description: Hotel ID.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               city:
 *                 type: string
 *               country:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: array
 *                 items:
 *                   type: string
 *               pricePerNight:
 *                 type: number
 *               starRating:
 *                 type: number
 *               adultCount:
 *                 type: number
 *               childCount:
 *                 type: number
 *               facilities:
 *                 type: array
 *                 items:
 *                   type: string
 *               "contact.phone":
 *                 type: string
 *               "contact.email":
 *                 type: string
 *               "contact.website":
 *                 type: string
 *               "policies.checkInTime":
 *                 type: string
 *               "policies.checkOutTime":
 *                 type: string
 *               "policies.cancellationPolicy":
 *                 type: string
 *               "policies.petPolicy":
 *                 type: string
 *               "policies.smokingPolicy":
 *                 type: string
 *               imageUrls:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Existing image URLs to keep.
 *               imageFiles:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: New image files to upload.
 *     responses:
 *       200:
 *         description: Hotel updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Hotel'
 *       401:
 *         description: Unauthorized – missing or invalid token.
 *       404:
 *         description: Hotel not found or not owned by user.
 *       500:
 *         description: Error updating hotel.
 */
router.put(
  "/:hotelId",
  verifyToken,
  requireRole("hotel_owner"),
  upload.array("imageFiles", 6),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const hotelId = req.params.hotelId;

      const existingHotel = await Hotel.findOne({ _id: hotelId, userId });
      if (!existingHotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }

      const keptImageUrls = parseImageUrls(req.body.imageUrls);

      const files = (req as any).files as Express.Multer.File[];
      const newImageUrls =
        files && files.length > 0 ? await uploadImages(files) : [];

      const finalImageUrls = [...keptImageUrls, ...newImageUrls];

      const removedImageUrls = (existingHotel.imageUrls || []).filter(
        (url: string) => !keptImageUrls.includes(url)
      );

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
        imageUrls: finalImageUrls,
        contact: {
          phone: req.body["contact.phone"] || "",
          email: req.body["contact.email"] || "",
          website: req.body["contact.website"] || "",
        },
        policies: {
          checkInTime: req.body["policies.checkInTime"] || "",
          checkOutTime: req.body["policies.checkOutTime"] || "",
          cancellationPolicy: req.body["policies.cancellationPolicy"] || "",
          petPolicy: req.body["policies.petPolicy"] || "",
          smokingPolicy: req.body["policies.smokingPolicy"] || "",
        },
      };

      const updatedHotel = await Hotel.findByIdAndUpdate(hotelId, updateData, {
        new: true,
      });

      if (!updatedHotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }

      await Promise.all(
        removedImageUrls.map(async (url: string) => {
          const path = getFirebasePathFromDownloadUrl(url);
          if (!path) return;
          try {
            await bucket.file(path).delete({ ignoreNotFound: true });
          } catch (e) {
            console.warn("Failed to delete file from Firebase:", path, e);
          }
        })
      );

      return res.status(200).json(updatedHotel);
    } catch (error: any) {
      res.status(500).json({
        message: "Something went wrong",
        error: error.message || "Unknown error",
      });
    }
  }
);


function parseImageUrls(value: any): string[] {
  if (!value) return [];

  if (Array.isArray(value)) return value.filter(Boolean);

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
      } catch {
        return [];
      }
    }
    return [value];
  }

  return [];
}

function getFirebasePathFromDownloadUrl(url: string): string | null {
  const marker = "/o/";
  const idx = url.indexOf(marker);
  if (idx === -1) return null;

  const after = url.substring(idx + marker.length);
  const pathEncoded = after.split("?")[0];
  if (!pathEncoded) return null;

  return decodeURIComponent(pathEncoded); 
}


// FIREBASE UPLOAD FUNCTION
async function uploadImages(imageFiles: Express.Multer.File[]) {
  const uploadPromises = imageFiles.map(async (file) => {
    const filename = `hotels/${uuidv4()}-${file.originalname}`;
    const fileUpload = bucket.file(filename);

    await fileUpload.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
        metadata: {
          firebaseStorageDownloadTokens: uuidv4(),
        },
      },
    });

    return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(
      filename
    )}?alt=media`;
  });

  return Promise.all(uploadPromises);
}

export default router;
