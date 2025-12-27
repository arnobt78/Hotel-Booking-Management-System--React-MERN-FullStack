import express, { Request, Response } from "express";
import User from "../models/user";
import jwt from "jsonwebtoken";
import { check, validationResult } from "express-validator";
import verifyToken from "../middleware/auth";
import { authLimiter } from "../middleware/rateLimiter";

const router = express.Router();

const createTokens = (userId: string, userRole: string) => {
    if (!process.env.JWT_SECRET_KEY || !process.env.REFRESH_SECRET_KEY) {
        throw new Error("Server configuration error: Token keys missing.");
    }
    
    const accessToken = jwt.sign(
        { userId, userRole },
        process.env.JWT_SECRET_KEY as string,
        {
            expiresIn: "15m",
        }
    );

    const refreshToken = jwt.sign(
        { userId },
        process.env.REFRESH_SECRET_KEY as string,
        {
            expiresIn: "7d",
        }
    );

    return { accessToken, refreshToken };
};


router.post(
    "/register",
    authLimiter, 
    [
        check("firstName", "First Name is required").isString(),
        check("lastName", "Last Name is required").isString(),
        check("email", "Email is required").isEmail(),
        check("password", "Password with 8 or more characters required").isLength({
            min: 8,
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

            const { accessToken, refreshToken } = createTokens(user.id, user.role);

            res.cookie("auth_token", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 15 * 60 * 1000, // 15 minuta
                path: "/",
            });

            res.cookie("refresh_token", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dana
                path: "/",
            });

            return res.status(200).send({ message: "User registered OK", userId: user.id });
        } catch (error) {
            res.status(500).send({ message: "Something went wrong on the server" });
        }
    }
);


router.get("/me", verifyToken, async (req: Request, res: Response) => {
    const userId = req.userId;

    try {
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Something went wrong on the server" });
    }
});

export default router;