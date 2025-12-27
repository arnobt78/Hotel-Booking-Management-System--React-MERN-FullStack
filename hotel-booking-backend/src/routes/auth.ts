import express, { Request, Response } from "express";
import { check, validationResult } from "express-validator";
import User from "../models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import verifyToken from "../middleware/auth";
import { authLimiter } from "../middleware/rateLimiter";

const router = express.Router();

// Helper function for Access and Refresh Tokens
const createTokens = (userId: string, userRole: string) => {
  const accessToken = jwt.sign(
    { userId, userRole },
    process.env.JWT_SECRET_KEY as string,
    {
      expiresIn: "15m", // Access token has short time of expiration
    }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.REFRESH_SECRET_KEY as string, 
    {
      expiresIn: "7d", // Refresh token has longer time of expiration
    }
  );

  return { accessToken, refreshToken };
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     description: Validates email/password, applies rate limiting, and sets auth_token (access) + refresh_token (refresh) as HttpOnly cookies.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "secret123"
 *     responses:
 *       200:
 *         description: Login successful (cookies set)
 *         headers:
 *           Set-Cookie:
 *             description: HttpOnly cookies for auth_token and refresh_token
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                   example: "64f1c2a9b7d3a2c1f9a1b111"
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "64f1c2a9b7d3a2c1f9a1b111"
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: user@example.com
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     lastName:
 *                       type: string
 *                       example: "Doe"
 *                     role:
 *                       type: string
 *                       example: "user"
 *       400:
 *         description: Validation error or invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   oneOf:
 *                     - type: string
 *                     - type: array
 *       429:
 *         description: Too many attempts (rate limit exceeded)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.post(
  "/login",
  authLimiter, 
  [
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

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      const { accessToken, refreshToken } = createTokens(user.id, user.role);

      res.cookie("auth_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict", 
        maxAge: 15 * 60 * 1000,
      });

      res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, 
      });

      res.status(200).json({
        userId: user._id,
        message: "Login successful",
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Something went wrong on the server" });
    }
  }
);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Refresh access token using refresh token cookie
 *     description: Reads refresh_token from an HttpOnly cookie, validates it, issues a new auth_token (access token), and sets it as an HttpOnly cookie.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Token refreshed successfully (auth_token cookie set)
 *         headers:
 *           Set-Cookie:
 *             description: New auth_token HttpOnly cookie
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Token refreshed successfully"
 *                 userId:
 *                   type: string
 *                   example: "64f1c2a9b7d3a2c1f9a1b111"
 *       401:
 *         description: Missing refresh token, invalid/expired token, or user not found (cookies cleared)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid or expired refresh token. Please login again."
 */
router.post("/refresh-token", async (req: Request, res: Response) => {
  const refreshToken = req.cookies["refresh_token"];

  if (!refreshToken) {
    return res.status(401).json({ message: "Access Denied. No refresh token provided." });
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_SECRET_KEY as string
    ) as { userId: string };

    const user = await User.findById(decoded.userId).select("role");

    if (!user) {
      return res.status(401).json({ message: "Invalid refresh token or user not found." });
    }

    const { accessToken } = createTokens(user.id, user.role);

    res.cookie("auth_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, 
    });

    res.status(200).json({ message: "Token refreshed successfully", userId: user.id });

  } catch (err) {
    // hard logout
    res.clearCookie("auth_token", { path: "/" });
    res.clearCookie("refresh_token", { path: "/" });
    return res.status(401).json({ message: "Invalid or expired refresh token. Please login again." });
  }
});


/**
 * @swagger
 * /api/auth/validate-token:
 *   get:
 *     summary: Validate auth token
 *     description: Protected route. Uses verifyToken middleware that validates the auth_token cookie.
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                   example: "64f1c2a9b7d3a2c1f9a1b111"
 *       401:
 *         description: Token missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get("/validate-token", verifyToken, (req: Request, res: Response) => {
  res.status(200).send({ userId: req.userId });
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Clears both auth_token and refresh_token HttpOnly cookies.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout successful (cookies cleared)
 *         headers:
 *           Set-Cookie:
 *             description: Cookies are cleared/expired
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Logout successful"
 */
router.post("/logout", (req: Request, res: Response) => {
  res.clearCookie("auth_token", {
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
  res.clearCookie("refresh_token", {
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
  res.status(200).send({ message: "Logout successful" });
});

export default router;