import express, { Request, Response } from "express";
import User from "../models/user";
import jwt from "jsonwebtoken";
import { check, validationResult } from "express-validator";
import verifyToken from "../middleware/auth";
import requireAdmin from "../middleware/requireAdmin";
import { authCookieOptions } from "../lib/cookie-options";

const router = express.Router();

router.get("/me", verifyToken, async (req: Request, res: Response) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
});

/**
 * Admin: list users (no passwords).
 * GET /api/users
 */
router.get(
  "/",
  verifyToken,
  requireAdmin,
  async (_req: Request, res: Response) => {
    try {
      const users = await User.find()
        .select(
          "email firstName lastName role isActive totalBookings totalSpent createdAt"
        )
        .sort({ createdAt: -1 })
        .limit(200);
      res.json(users);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Unable to fetch users" });
    }
  }
);

/**
 * Admin: update user role.
 * PATCH /api/users/:id/role
 * Body: { role: "user" | "admin" | "hotel_owner" }
 */
router.patch(
  "/:id/role",
  verifyToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    const allowed = ["user", "admin", "hotel_owner"] as const;
    const role = req.body?.role;
    if (!allowed.includes(role)) {
      return res.status(400).json({
        message: `role must be one of: ${allowed.join(", ")}`,
      });
    }

    try {
      if (req.params.id === req.userId && role !== "admin") {
        return res.status(400).json({
          message: "Cannot demote your own admin role",
        });
      }

      const user = await User.findByIdAndUpdate(
        req.params.id,
        { role, updatedAt: new Date() },
        { new: true }
      ).select("-password");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Unable to update role" });
    }
  }
);

router.post(
  "/register",
  [
    check("firstName", "First Name is required").isString(),
    check("lastName", "Last Name is required").isString(),
    check("email", "Email is required").isEmail(),
    check("password", "Password with 6 or more characters required").isLength({
      min: 6,
    }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array() });
    }

    try {
      let user = await User.findOne({
        email: req.body.email,
      });

      if (user) {
        return res.status(400).json({ message: "User already exists" });
      }

      user = new User(req.body);
      await user.save();

      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET_KEY as string,
        {
          expiresIn: "1d",
        }
      );

      res.cookie("auth_token", token, authCookieOptions());
      return res.status(200).send({ message: "User registered OK" });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Something went wrong" });
    }
  }
);

export default router;
