import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      userId: string;
      userRole: "user" | "admin" | "hotel_owner";
    }
  }
}

interface JwtPayload {
  userId: string;
  userRole: "user" | "admin" | "hotel_owner";
}
const verifyToken = (req: any, res: Response, next: NextFunction) => {
  console.log("=== verifyToken called ===");
  console.log("Request:", req.method, req.originalUrl);
  console.log("Headers.authorization:", req.headers.authorization);
  console.log("Cookies:", req.cookies);

  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
    console.log("Token extracted from Authorization header:", token);
  } else if (req.cookies && req.cookies["session_id"]) {
    token = req.cookies["session_id"];
    console.log("Token extracted from cookie session_id:", token);
  } else {
    console.log("❌ No token found (ne u headeru, ne u cookie)");
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY as string
    ) as JwtPayload;

    console.log("✅ JWT decoded:", decoded);

    req.userId = decoded.userId;
    req.userRole = decoded.userRole;

    next();
  } catch (error) {
    console.error("❌ JWT verify error:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export default verifyToken;

/*import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

//prebaciti u poseban fajl 
declare global {
  namespace Express {
    interface Request {
      userId: string;
      userRole: "user" | "admin" | "hotel_owner";
    }
  }
}

interface JwtPayload {
  userId: string;
  userRole: "user" | "admin" | "hotel_owner";
}

const verifyToken = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  } else {
    token = req.cookies["session_id"]; 
  }

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY as string
    ) as JwtPayload;

    req.userId = decoded.userId;
    req.userRole = decoded.userRole;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export default verifyToken;
*/