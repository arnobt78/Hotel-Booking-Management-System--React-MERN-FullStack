import express, { Request, Response } from "express";
import mongoose from "mongoose";
import verifyToken from "../middleware/auth";

const router = express.Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Liveness / readiness probe (public)
 *     description: >
 *       Minimal payload for load balancers and Docker healthchecks.
 *       Does not expose hostnames, PIDs, memory heaps, or database names (CWE-200).
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy
 *       503:
 *         description: API is unhealthy
 */
// Public probe — Coolify/Docker must remain able to hit this without auth
router.get("/", async (_req: Request, res: Response) => {
  try {
    const dbStatus =
      mongoose.connection.readyState === 1 ? "connected" : "disconnected";

    const healthData = {
      status: dbStatus === "connected" ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
      },
    };

    const statusCode = dbStatus === "connected" ? 200 : 503;
    res.status(statusCode).json(healthData);
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: "Health check failed",
    });
  }
});

/**
 * @swagger
 * /api/health/detailed:
 *   get:
 *     summary: Sanitized health metrics for authenticated users
 *     description: >
 *       Requires JWT. Returns coarse uptime/memory only — never host, port, PID,
 *       Node version, platform, or raw CPU micros (VulDB / CWE-200).
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sanitized detailed health
 *       401:
 *         description: Unauthorized
 */
router.get("/detailed", verifyToken, async (_req: Request, res: Response) => {
  try {
    const memUsage = process.memoryUsage();
    const heapUsedMb = Math.round(memUsage.heapUsed / 1024 / 1024);
    const heapTotalMb = Math.round(memUsage.heapTotal / 1024 / 1024);
    const percentage =
      heapTotalMb > 0 ? Math.round((heapUsedMb / heapTotalMb) * 100) : 0;

    const detailedHealth = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      performance: {
        // Rounded MB only — no RSS/external/raw byte dumps for recon
        memory: {
          usedMb: heapUsedMb,
          totalMb: heapTotalMb,
          percentage,
        },
        uptime: Math.round(process.uptime()),
      },
      database: {
        status:
          mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      },
    };

    res.status(200).json(detailedHealth);
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      error: "Detailed health check failed",
    });
  }
});

export default router;
