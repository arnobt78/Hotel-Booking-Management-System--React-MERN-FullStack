// src/routes/auth.ts (Ažurirano)

import express, { Request, Response } from "express";
import { check, validationResult } from "express-validator";
import User from "../models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import verifyToken from "../middleware/auth";
import { authLimiter } from "../middleware/rateLimiter"; // Dodano

const router = express.Router();

// Pomoćna funkcija za kreiranje Access i Refresh Tokena
const createTokens = (userId: string, userRole: string) => {
  const accessToken = jwt.sign(
    { userId, userRole },
    process.env.JWT_SECRET_KEY as string,
    {
      expiresIn: "15m", // Kratak vijek trajanja za Access Token (15 minuta)
    }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.REFRESH_SECRET_KEY as string, // Preporučuje se drugi secret key
    {
      expiresIn: "7d", // Duži vijek trajanja za Refresh Token (7 dana)
    }
  );

  return { accessToken, refreshToken };
};

/**
 * RUTA ZA LOGIN
 * Aplikacija Rate Limitinga i postavljanje oba tokena u HttpOnly kolačiće.
 */
router.post(
  "/login",
  authLimiter, // Primjena Rate Limitinga
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
      // Generička greška da se ne otkrije da li je korisnik nepostojeći
      if (!user) {
        return res.status(400).json({ message: "Invalid Credentials" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid Credentials" });
      }

      // KREIRANJE I POSTAVLJANJE TOKENA
      const { accessToken, refreshToken } = createTokens(user.id, user.role);

      // Postavljanje Access Tokena (kratkotrajni)
      res.cookie("auth_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict", // Postavljeno na 'strict' za dodatnu zaštitu
        maxAge: 15 * 60 * 1000, // 15 minuta
      });

      // Postavljanje Refresh Tokena (dugotrajni)
      res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dana
      });

      // Vraćanje osnovnih podataka o korisniku (bez tokena u tijelu)
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
      console.error(error); // Logiranje detalja greške na serveru
      // Vraćanje generičke poruke klijentu
      res.status(500).json({ message: "Something went wrong on the server" });
    }
  }
);

/**
 * RUTA ZA OSVJEŽAVANJE TOKENA (Refresh Token Logic)
 * Koristi refresh_token iz kolačića za izdavanje novog access tokena.
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

    // Izdavanje novog Access Tokena
    const { accessToken } = createTokens(user.id, user.role);

    // Postavljanje novog Access Tokena u kolačić
    res.cookie("auth_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minuta
    });

    res.status(200).json({ message: "Token refreshed successfully", userId: user.id });

  } catch (err) {
    // Ako je refresh token istekao ili nevažeći
    // Preporučuje se brisanje svih tokena nakon ovoga (hard logout)
    res.clearCookie("auth_token", { path: "/" });
    res.clearCookie("refresh_token", { path: "/" });
    return res.status(401).json({ message: "Invalid or expired refresh token. Please login again." });
  }
});
// 

/**
 * RUTA ZA VALIDACIJU TOKENA
 * Koristi middleware verifyToken (koji provjerava auth_token).
 */
router.get("/validate-token", verifyToken, (req: Request, res: Response) => {
  // Ako je middleware verifyToken prošao, token je važeći
  res.status(200).send({ userId: req.userId });
});

/**
 * RUTA ZA LOGOUT
 * Brisanje oba kolačića.
 */
router.post("/logout", (req: Request, res: Response) => {
  // Brišemo Access Token kolačić
  res.clearCookie("auth_token", {
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
  // Brišemo Refresh Token kolačić
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