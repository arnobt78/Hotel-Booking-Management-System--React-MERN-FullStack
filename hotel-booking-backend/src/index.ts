import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import userRoutes from "./routes/users";
import authRoutes from "./routes/auth";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";
import myHotelRoutes from "./routes/my-hotels";
import hotelRoutes from "./routes/hotels";
import bookingRoutes from "./routes/my-bookings";
import bookingsManagementRoutes from "./routes/bookings";
import reviewRoutes from "./routes/reviews";
import favoriteRoutes from "./routes/favorites";
import healthRoutes from "./routes/health";
import adminRoutes from "./routes/admin";
import businessInsightsRoutes from "./routes/business-insights";
import swaggerUi from "swagger-ui-express";
import { specs } from "./swagger";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import type { ErrorRequestHandler, RequestHandler } from "express";

const requiredEnvVars = [
  "MONGODB_CONNECTION_STRING",
  "JWT_SECRET_KEY",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "STRIPE_SECRET_KEY",
];

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error("Missing required environment variables:");
  missingEnvVars.forEach((envVar) => console.error(`   - ${envVar}`));
  process.exit(1);
}

console.log("All required environment variables are present");
console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
console.log(`Frontend URL: ${process.env.FRONTEND_URL || "Not set"}`);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// MongoDB Connection with Error Handling
const connectDB = async () => {
  try {
    console.log("Attempting to connect to MongoDB...");
    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string);
    console.log("MongoDB connected successfully");
    console.log(`Database: ${mongoose.connection.db.databaseName}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    console.error("Please check your MONGODB_CONNECTION_STRING");
    process.exit(1);
  }
};

// Handle MongoDB connection events
mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected. Attempting to reconnect...");
});

mongoose.connection.on("error", (error) => {
  console.error("MongoDB connection error:", error);
});

mongoose.connection.on("reconnected", () => {
  console.log("MongoDB reconnected successfully");
});

connectDB();

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://98.86.196.119.nip.io",
  "http://localhost:5174"
].filter((origin): origin is string => Boolean(origin));

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) return callback(null, true);

    if (process.env.NODE_ENV === "development") {
      console.log("CORS blocked origin:", origin);
    }

    return callback(null, false);
  },
  credentials: true,
  optionsSuccessStatus: 204,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie", "X-Requested-With"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

const corsBlocker: RequestHandler = (req, res, next) => {
  const origin = req.headers.origin;

  if (!origin) return next();

  if (allowedOrigins.includes(origin)) return next();

  return res.status(403).json({ message: "CORS: origin not allowed" });
};

app.use(corsBlocker);


app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security middleware
app.use(helmet());

app.set("trust proxy", 1);

// Rate limiting 
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 200, // Increased limit for general requests
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Special limiter for payment endpoints
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 50, 
  message: "Too many payment requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", generalLimiter);
app.use("/api/hotels/*/bookings/payment-intent", paymentLimiter);
app.use("/api/reviews", reviewRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/admin", adminRoutes);

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan("combined"));

app.use((req, res, next) => {
  res.header("Vary", "Origin");
  next();
});

app.get("/", (req: Request, res: Response) => {
  res.send("<h1>Hotel Booking Backend API is running 🚀</h1>");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/my-hotels", myHotelRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/my-bookings", bookingRoutes);
app.use("/api/bookings", bookingsManagementRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/business-insights", businessInsightsRoutes);

// Swagger API Documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Hotel Booking API Documentation",
  })
);

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  
  const status = typeof err?.status === "number" ? err.status : 500;
  const message = err?.message || "Internal server error";

  res.status(status).json({
    message,
    ...(process.env.NODE_ENV === "development" ? { stack: err?.stack } : {}),
  });
};

app.use(errorHandler);

const PORT = process.env.PORT || 7002;

const server = app.listen(PORT, () => {
  console.log("🚀 ============================================");
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Local: http://localhost:${PORT}`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
  console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
  console.log("🚀 ============================================");
});

const gracefulShutdown = (signal: string) => {
  console.log(`\n⚠️  ${signal} received. Starting graceful shutdown...`);

  server.close(async () => {
    console.log("🔒 HTTP server closed");

    try {
      await mongoose.connection.close();
      console.log("🔒 MongoDB connection closed");
      console.log("✅ Graceful shutdown completed");
      process.exit(0);
    } catch (error) {
      console.error("❌ Error during shutdown:", error);
      process.exit(1);
    }
  });

  setTimeout(() => {
    console.error("⚠️  Forced shutdown after timeout");
    process.exit(1);
  }, 30000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  gracefulShutdown("UNCAUGHT_EXCEPTION");
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  gracefulShutdown("UNHANDLED_REJECTION");
});