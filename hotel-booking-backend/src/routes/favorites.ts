import express from "express";
import verifyToken from "../middleware/auth";
import Favorite from "../models/favorite";

const router = express.Router();

/**
 * @swagger
 * /api/favorites:
 *   get:
 *     summary: Get current user's favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of favorites
 *       401:
 *         description: Unauthorized
 */
router.get("/", verifyToken, async (req, res) => {
  const favorites = await Favorite.find({ userId: req.userId })
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json(favorites);
});

/**
 * @swagger
 * /api/favorites/{hotelId}:
 *   post:
 *     summary: Add hotel to favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: hotelId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Added to favorites
 *       409:
 *         description: Already in favorites
 *       401:
 *         description: Unauthorized
 */
router.post("/:hotelId", verifyToken, async (req, res) => {
  const { hotelId } = req.params;

  try {
    const favorite = await Favorite.create({
      userId: req.userId,
      hotelId,
    });

    return res.status(201).json(favorite);
  } catch (err: any) {
    // unique index error (duplicate favorite)
    if (err?.code === 11000) {
      return res.status(409).json({ message: "Already in favorites" });
    }
    return res.status(500).json({ message: "Failed to add favorite" });
  }
});

/**
 * @swagger
 * /api/favorites/{hotelId}:
 *   delete:
 *     summary: Remove hotel from favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: hotelId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Removed from favorites
 *       404:
 *         description: Favorite not found
 *       401:
 *         description: Unauthorized
 */
router.delete("/:hotelId", verifyToken, async (req, res) => {
  const { hotelId } = req.params;

  const result = await Favorite.findOneAndDelete({
    userId: req.userId,
    hotelId,
  });

  if (!result) {
    return res.status(404).json({ message: "Favorite not found" });
  }

  res.status(200).json({ message: "Removed from favorites" });
});

export default router;
