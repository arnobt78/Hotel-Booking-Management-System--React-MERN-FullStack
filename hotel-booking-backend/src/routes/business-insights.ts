import express, { Request, Response } from "express";
import Hotel from "../models/hotel";
import User from "../models/user";
import Booking from "../models/booking";
import Review from "../models/review";
import verifyToken from "../middleware/auth";

const router = express.Router();

/**
 * @swagger
 * /api/business-insights/dashboard:
 *   get:
 *     summary: Get business insights dashboard data
 *     description: Returns comprehensive business insights data for the dashboard including bookings, revenue, and performance metrics
 *     tags: [Business Insights]
 *     responses:
 *       200:
 *         description: Business insights dashboard data
 */
// Shared dashboard handler - used by both authenticated and public routes
const getDashboardData = async () => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const totalHotels = await Hotel.countDocuments();
  const totalUsers = await User.countDocuments();
  const allBookings = await Booking.find();
  const totalBookings = allBookings.length;

  const recentBookings = allBookings.filter(
    (booking) => new Date(booking.createdAt) >= thirtyDaysAgo
  ).length;

  const totalRevenue = allBookings.reduce(
    (sum: number, booking: any) => sum + (booking.totalCost || 0),
    0
  );

  const recentRevenue = allBookings
    .filter((booking: any) => new Date(booking.createdAt) >= thirtyDaysAgo)
    .reduce((sum: number, booking: any) => sum + (booking.totalCost || 0), 0);

  const currentMonthRevenue = allBookings
    .filter((booking: any) => {
      const bookingDate = new Date(booking.createdAt);
      return bookingDate >= new Date(now.getFullYear(), now.getMonth(), 1);
    })
    .reduce((sum: number, booking: any) => sum + (booking.totalCost || 0), 0);

  const previousMonthRevenue = allBookings
    .filter((booking: any) => {
      const bookingDate = new Date(booking.createdAt);
      return (
        bookingDate >= new Date(now.getFullYear(), now.getMonth() - 1, 1) &&
        bookingDate < new Date(now.getFullYear(), now.getMonth(), 1)
      );
    })
    .reduce((sum: number, booking: any) => sum + (booking.totalCost || 0), 0);

  let revenueGrowth = 0;
  if (previousMonthRevenue > 0) {
    revenueGrowth =
      ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) *
      100;
  } else if (currentMonthRevenue > 0) {
    revenueGrowth = 0;
  }

  const popularDestinations = await Booking.aggregate([
    { $addFields: { hotelIdObjectId: { $toObjectId: "$hotelId" } } },
    { $group: { _id: "$hotelIdObjectId", count: { $sum: 1 }, totalRevenue: { $sum: "$totalCost" } } },
    { $lookup: { from: "hotels", localField: "_id", foreignField: "_id", as: "hotel" } },
    { $unwind: "$hotel" },
    { $group: { _id: "$hotel.city", count: { $sum: "$count" }, totalRevenue: { $sum: "$totalRevenue" }, avgPrice: { $avg: "$hotel.pricePerNight" } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  if (popularDestinations.length === 0) {
    const hotels = await Hotel.find();
    const hotelDestinations = hotels.reduce((acc: any, hotel: any) => {
      if (acc[hotel.city]) {
        acc[hotel.city].count++;
        acc[hotel.city].totalRevenue += hotel.totalRevenue || 0;
      } else {
        acc[hotel.city] = { _id: hotel.city, count: 1, totalRevenue: hotel.totalRevenue || 0, avgPrice: hotel.pricePerNight };
      }
      return acc;
    }, {});
    const fallbackDestinations = Object.values(hotelDestinations)
      .map((dest: any) => ({ _id: dest._id, count: dest.count, totalRevenue: dest.totalRevenue, avgPrice: dest.avgPrice }))
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 5);
    popularDestinations.push(...fallbackDestinations);
  }

  const bookingDates = allBookings.reduce((acc: any, booking: any) => {
    if (booking.createdAt) {
      const dateKey = new Date(booking.createdAt).toISOString().split("T")[0];
      acc[dateKey] = (acc[dateKey] || 0) + 1;
    }
    return acc;
  }, {});

  let dailyBookings = Object.entries(bookingDates)
    .map(([date, count]) => ({ date, bookings: count as number }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  if (dailyBookings.length > 7) dailyBookings = dailyBookings.slice(-7);

  const hotelPerformance = await Booking.aggregate([
    { $group: { _id: "$hotelId", bookingCount: { $sum: 1 }, totalRevenue: { $sum: "$totalCost" } } },
    { $lookup: { from: "hotels", localField: "_id", foreignField: "_id", as: "hotel" } },
    { $unwind: "$hotel" },
    { $project: { _id: "$hotel._id", name: "$hotel.name", city: "$hotel.city", starRating: "$hotel.starRating", pricePerNight: "$hotel.pricePerNight", bookingCount: 1, totalRevenue: 1 } },
    { $sort: { bookingCount: -1 } },
    { $limit: 10 },
  ]);

  if (hotelPerformance.length === 0) {
    const hotels = await Hotel.find();
    const fallbackPerformance = hotels
      .map((hotel: any) => ({
        _id: hotel._id,
        name: hotel.name,
        city: hotel.city,
        starRating: hotel.starRating,
        pricePerNight: hotel.pricePerNight,
        bookingCount: hotel.totalBookings || 0,
        totalRevenue: hotel.totalRevenue || 0,
      }))
      .sort((a: any, b: any) => b.bookingCount - a.bookingCount)
      .slice(0, 10);
    hotelPerformance.push(...fallbackPerformance);
  }

  // Status / payment / refund KPIs for overview + Quality tab
  const cancelledBookings = allBookings.filter(
    (b: any) => b.status === "cancelled"
  ).length;
  const confirmedBookings = allBookings.filter(
    (b: any) => b.status === "confirmed" || b.status === "completed"
  ).length;
  const pendingBookings = allBookings.filter(
    (b: any) => b.status === "pending"
  ).length;
  const refundedBookings = allBookings.filter(
    (b: any) =>
      b.status === "refunded" || b.paymentStatus === "refunded"
  ).length;
  const totalRefundAmount = allBookings.reduce(
    (sum: number, b: any) => sum + (Number(b.refundAmount) || 0),
    0
  );
  const cancellationRate =
    totalBookings > 0
      ? Math.round((cancelledBookings / totalBookings) * 10000) / 100
      : 0;

  const totalReviews = await Review.countDocuments();
  const verifiedReviewCount = await Review.countDocuments({ isVerified: true });
  const ratingAgg = await Review.aggregate([
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$rating" },
        cleanliness: { $avg: "$categories.cleanliness" },
        service: { $avg: "$categories.service" },
        location: { $avg: "$categories.location" },
        value: { $avg: "$categories.value" },
        amenities: { $avg: "$categories.amenities" },
      },
    },
  ]);
  const avgReviewRating =
    ratingAgg.length > 0
      ? Math.round((ratingAgg[0].avgRating || 0) * 100) / 100
      : 0;
  const round2 = (n: number) => Math.round((n || 0) * 100) / 100;
  const reviewCategoryAverages = {
    cleanliness: ratingAgg.length ? round2(ratingAgg[0].cleanliness) : 0,
    service: ratingAgg.length ? round2(ratingAgg[0].service) : 0,
    location: ratingAgg.length ? round2(ratingAgg[0].location) : 0,
    value: ratingAgg.length ? round2(ratingAgg[0].value) : 0,
    amenities: ratingAgg.length ? round2(ratingAgg[0].amenities) : 0,
  };

  // LOS / ADR / party mix from booking stay + guest fields
  const dayMs = 24 * 60 * 60 * 1000;
  let totalNights = 0;
  let totalAdults = 0;
  let totalChildren = 0;
  for (const b of allBookings as any[]) {
    const inMs = new Date(b.checkIn).getTime();
    const outMs = new Date(b.checkOut).getTime();
    const nights =
      Number.isFinite(inMs) && Number.isFinite(outMs) && outMs > inMs
        ? Math.max(1, Math.round((outMs - inMs) / dayMs))
        : 1;
    totalNights += nights;
    totalAdults += Number(b.adultCount) || 0;
    totalChildren += Number(b.childCount) || 0;
  }
  const avgLos =
    totalBookings > 0 ? round2(totalNights / totalBookings) : 0;
  const adr = totalNights > 0 ? round2(totalRevenue / totalNights) : 0;
  const avgPartySize =
    totalBookings > 0
      ? round2((totalAdults + totalChildren) / totalBookings)
      : 0;
  const guestMix = { adults: totalAdults, children: totalChildren };

  const countBy = (field: string) => {
    const map: Record<string, number> = {};
    for (const b of allBookings as any[]) {
      const key = String(b[field] || "unknown");
      map[key] = (map[key] || 0) + 1;
    }
    return Object.entries(map)
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count);
  };
  const bookingStatusBreakdown = countBy("status");
  const paymentStatusBreakdown = countBy("paymentStatus");

  const hotelsByStarAgg = await Hotel.aggregate([
    { $group: { _id: "$starRating", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  const hotelsByStar = hotelsByStarAgg.map((h: any) => ({
    starRating: h._id ?? 0,
    count: h.count,
  }));

  return {
    overview: {
      totalHotels,
      totalUsers,
      totalBookings,
      recentBookings,
      totalRevenue: round2(totalRevenue),
      recentRevenue: round2(recentRevenue),
      revenueGrowth: round2(revenueGrowth),
      cancelledBookings,
      confirmedBookings,
      pendingBookings,
      refundedBookings,
      totalRefundAmount: round2(totalRefundAmount),
      cancellationRate,
      totalReviews,
      avgReviewRating,
      avgLos,
      adr,
      avgPartySize,
      verifiedReviewCount,
    },
    popularDestinations,
    dailyBookings,
    hotelPerformance,
    bookingStatusBreakdown,
    paymentStatusBreakdown,
    guestMix,
    reviewCategoryAverages,
    hotelsByStar,
    lastUpdated: now.toISOString(),
  };
};

router.get("/dashboard/public", async (req: Request, res: Response) => {
  try {
    const businessInsightsData = await getDashboardData();
    res.status(200).json(businessInsightsData);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch business insights data",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.get("/dashboard", verifyToken, async (req: Request, res: Response) => {
  try {
    const businessInsightsData = await getDashboardData();
    res.status(200).json(businessInsightsData);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch business insights data",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Shared forecast handler
const getForecastData = async () => {
  const now = new Date();
  const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const allBookings = await Booking.find();
  const historicalBookings = allBookings.filter(
    (booking: any) => new Date(booking.createdAt) >= twoMonthsAgo
  );

  const weekGroups = historicalBookings.reduce((acc: any, booking: any) => {
    const bookingDate = new Date(booking.createdAt);
    const weekStart = new Date(bookingDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekKey = weekStart.toISOString().split("T")[0];
    if (!acc[weekKey]) acc[weekKey] = { week: weekKey, bookings: 0, revenue: 0 };
    acc[weekKey].bookings++;
    acc[weekKey].revenue += booking.totalCost;
    return acc;
  }, {});

  let weeklyData = Object.values(weekGroups)
    .map((week: any) => ({ week: week.week, bookings: week.bookings, revenue: Math.round(week.revenue * 100) / 100 }))
    .sort((a: any, b: any) => new Date(a.week).getTime() - new Date(b.week).getTime());

  const calculateTrend = (data: number[]) => {
    const n = data.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = data.reduce((sum, val) => sum + val, 0);
    const sumXY = data.reduce((sum, val, index) => sum + val * index, 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    return { slope, intercept };
  };

  const bookingTrends = calculateTrend(weeklyData.map((d) => d.bookings));
  const revenueTrends = calculateTrend(weeklyData.map((d) => d.revenue));

  const forecasts = [];
  for (let i = 1; i <= 4; i++) {
    const weekIndex = weeklyData.length + i - 1;
    let forecastedBookings = 0;
    let forecastedRevenue = 0;
    if (weeklyData.length > 1) {
      forecastedBookings = Math.max(0, Math.round(bookingTrends.slope * weekIndex + bookingTrends.intercept));
      forecastedRevenue = Math.max(0, revenueTrends.slope * weekIndex + revenueTrends.intercept);
    } else if (weeklyData.length === 1) {
      const baseWeek = weeklyData[0];
      forecastedBookings = Math.max(1, Math.round(baseWeek.bookings * (0.9 + i * 0.1)));
      forecastedRevenue = Math.max(100, Math.round(baseWeek.revenue * (0.9 + i * 0.1)));
    }
    const forecastDate = new Date(now.getTime() + i * 7 * 24 * 60 * 60 * 1000);
    forecasts.push({
      week: forecastDate.toISOString().split("T")[0],
      bookings: forecastedBookings,
      revenue: Math.round(forecastedRevenue * 100) / 100,
      confidence: Math.max(0.6, 1 - i * 0.1),
    });
  }

  const currentMonthBookings = allBookings.filter((booking: any) => {
    const bookingDate = new Date(booking.createdAt);
    return bookingDate >= new Date(now.getFullYear(), now.getMonth(), 1);
  }).length;
  const lastMonthBookings = allBookings.filter((booking: any) => {
    const bookingDate = new Date(booking.createdAt);
    return bookingDate >= new Date(now.getFullYear(), now.getMonth() - 1, 1) && bookingDate < new Date(now.getFullYear(), now.getMonth(), 1);
  }).length;
  let seasonalGrowth = 0;
  if (lastMonthBookings > 0) seasonalGrowth = ((currentMonthBookings - lastMonthBookings) / lastMonthBookings) * 100;

  return {
    historical: weeklyData,
    forecasts,
    seasonalGrowth: Math.round(seasonalGrowth * 100) / 100,
    trends: {
      bookingTrend: weeklyData.length > 1 ? (bookingTrends.slope > 0 ? "increasing" : "decreasing") : "stable",
      revenueTrend: weeklyData.length > 1 ? (revenueTrends.slope > 0 ? "increasing" : "decreasing") : "stable",
    },
    lastUpdated: now.toISOString(),
  };
};

router.get("/forecast/public", async (req: Request, res: Response) => {
  try {
    const forecastData = await getForecastData();
    res.status(200).json(forecastData);
  } catch (error) {
    res.status(500).json({
      error: "Failed to generate forecasts",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.get("/forecast", verifyToken, async (req: Request, res: Response) => {
  try {
    const forecastData = await getForecastData();
    res.status(200).json(forecastData);
  } catch (error) {
    res.status(500).json({
      error: "Failed to generate forecasts",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Business aggregates only (safe for public dashboard charts)
const getBusinessStatsData = async () => {
  const allHotels = await Hotel.find();
  const allBookings = await Booking.find();
  const totalBookings = allBookings.length;
  const totalRevenue = allBookings.reduce(
    (sum, booking) => sum + (booking.totalCost || 0),
    0
  );
  const today = new Date();
  const todayBookings = allBookings.filter(
    (booking) =>
      new Date(booking.createdAt).toDateString() === today.toDateString()
  ).length;
  const thisWeekBookings = allBookings.filter((booking) => {
    const bookingDate = new Date(booking.createdAt);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return bookingDate >= weekAgo;
  }).length;
  const avgResponseTime = Math.random() * 100 + 50; // illustrative demo metric

  return {
    database: {
      totalHotels: allHotels.length,
      totalBookings,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
    },
    application: {
      avgResponseTime: Math.round(avgResponseTime),
      requestsPerMinute: Math.round(Math.random() * 50 + 20),
      errorRate: Math.round(Math.random() * 5) / 100,
      uptime: "99.9%",
      todayBookings,
      thisWeekBookings,
    },
    lastUpdated: new Date().toISOString(),
  };
};

// Auth-only: coarse process memory % — never host/pid/raw CPU micros
const getSystemStatsData = async () => {
  const memUsage = process.memoryUsage();
  const used = Math.round(memUsage.heapUsed / 1024 / 1024);
  const total = Math.round(memUsage.heapTotal / 1024 / 1024);
  const business = await getBusinessStatsData();

  return {
    ...business,
    system: {
      memory: {
        used,
        total,
        percentage: total > 0 ? Math.round((used / total) * 100) : 0,
      },
      uptime: Math.round(process.uptime()),
    },
  };
};

// Public: business metrics only (no process telemetry — same CWE class as health leak)
router.get("/system-stats/public", async (_req: Request, res: Response) => {
  try {
    const performanceData = await getBusinessStatsData();
    res.status(200).json(performanceData);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch performance metrics",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.get("/system-stats", verifyToken, async (_req: Request, res: Response) => {
  try {
    const performanceData = await getSystemStatsData();
    res.status(200).json(performanceData);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch performance metrics",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
