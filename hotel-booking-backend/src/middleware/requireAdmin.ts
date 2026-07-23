import { NextFunction, Request, Response } from "express";
import User from "../models/user";

/**
 * Requires verifyToken first. Loads User.role from DB (JWT has userId only).
 */
const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.userId).select("role");
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Unable to verify admin" });
  }
};

export default requireAdmin;
