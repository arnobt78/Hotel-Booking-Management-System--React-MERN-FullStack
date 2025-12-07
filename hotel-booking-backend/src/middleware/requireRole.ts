import { Request, Response, NextFunction } from "express";

export function requireRole(...allowedRoles: string[]) {
  return (req: any, res: Response, next: NextFunction) => {
    if (!req.userRole) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
}
