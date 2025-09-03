import express, { Request, Response } from "express";
import mongoose from "mongoose";

const router = express.Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Get API health status
 *     description: Returns the current health status of the API including database connection, memory usage, and uptime
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   description: Server uptime in seconds
 *                 database:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "connected"
 *                     collections:
 *                       type: number
 *                       description: Number of collections in database
 *                 memory:
 *                   type: object
 *                   properties:
 *                     used:
 *                       type: number
 *                       description: Memory usage in MB
 *                     total:
 *                       type: number
 *                       description: Total memory in MB
 *                     percentage:
 *                       type: number
 *                       description: Memory usage percentage
 *       503:
 *         description: API is unhealthy
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    // Check database connection
    const dbStatus =
      mongoose.connection.readyState === 1 ? "connected" : "disconnected";
    const collections =
      (await mongoose.connection.db?.listCollections().toArray()) || [];

    // Get memory usage
    const memUsage = process.memoryUsage();
    const usedMemoryMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const totalMemoryMB = Math.round(memUsage.heapTotal / 1024 / 1024);
    const memoryPercentage = Math.round((usedMemoryMB / totalMemoryMB) * 100);

    // Get uptime
    const uptime = process.uptime();

    const healthData = {
      status: dbStatus === "connected" ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      uptime: Math.round(uptime),
      database: {
        status: dbStatus,
        collections: collections.length,
        name: mongoose.connection.name || "hotel-booking",
      },
      memory: {
        used: usedMemoryMB,
        total: totalMemoryMB,
        percentage: memoryPercentage,
      },
      environment: process.env.NODE_ENV || "development",
      version: "1.0.0",
    };

    const statusCode = dbStatus === "connected" ? 200 : 503;
    res.status(statusCode).json(healthData);
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: "Health check failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * @swagger
 * /api/health/detailed:
 *   get:
 *     summary: Get detailed API health status
 *     description: Returns detailed health information including system metrics and performance data
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Detailed health information
 */
router.get("/detailed", async (req: Request, res: Response) => {
  try {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    const detailedHealth = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      system: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        pid: process.pid,
      },
      performance: {
        memory: {
          heapUsed: memUsage.heapUsed,
          heapTotal: memUsage.heapTotal,
          external: memUsage.external,
          rss: memUsage.rss,
        },
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system,
        },
        uptime: Math.round(process.uptime()),
      },
      database: {
        status:
          mongoose.connection.readyState === 1 ? "connected" : "disconnected",
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        name: mongoose.connection.name,
      },
    };

    res.status(200).json(detailedHealth);
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      error: "Detailed health check failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
