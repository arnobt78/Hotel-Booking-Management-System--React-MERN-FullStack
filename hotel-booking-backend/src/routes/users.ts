import express, { Request, Response } from "express";
import User from "../models/user";
import jwt from "jsonwebtoken";
import { check, validationResult } from "express-validator";
import verifyToken from "../middleware/auth";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User account and profile endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - password
 *       properties:
 *         firstName:
 *           type: string
 *           example: "Amina"
 *         lastName:
 *           type: string
 *           example: "Hodžić"
 *         email:
 *           type: string
 *           format: email
 *           example: "amina@example.com"
 *         password:
 *           type: string
 *           example: "Admin123!"
 *
 *     RegisterResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "User registered OK"
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           oneOf:
 *             - type: string
 *             - type: array
 *           example: "User already exists"
 *
 *     UserProfile:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "66f1c4acad533fc6fd2ffcab"
 *         email:
 *           type: string
 *           example: "amina@example.com"
 *         firstName:
 *           type: string
 *           example: "Amina"
 *         lastName:
 *           type: string
 *           example: "Hodžić"
 *         role:
 *           type: string
 *           example: "user"
 */

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current logged-in user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user (without password)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Unauthorized (no/invalid token)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       400:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user account
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       200:
 *         description: User registered successfully (sets auth cookie)
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *             description: HTTP-only auth cookie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterResponse'
 *       400:
 *         description: Validation error (missing/invalid fields)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email already in use"
 *                 field:
 *                   type: string
 *                   example: "email"
 */
router.post(
  "/register",
  [
    check("firstName", "First Name is required").isString().notEmpty(),
    check("lastName", "Last Name is required").isString().notEmpty(),
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
      const existing = await User.findOne({ email: req.body.email });
      if (existing) {
        return res.status(409).json({
          message: "Email already in use",
          field: "email",
        });
      }

      const user = new User(req.body);
      await user.save();

      const token = jwt.sign(
        { userId: user.id, userRole: user.role },
        process.env.JWT_SECRET_KEY as string,
        { expiresIn: "1d" }
      );

      res.cookie("session_id", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 86400000,
        path: "/",
      });

      return res.status(200).send({ message: "User registered OK" });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Something went wrong" });
    }
  }
);

export default router;
