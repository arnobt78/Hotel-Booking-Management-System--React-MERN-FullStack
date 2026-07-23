/**
 * Wipe + seed MongoDB demo data (Mongoose — not Prisma).
 *
 * Usage: npm run seed
 * Requires MONGODB_CONNECTION_STRING in .env
 *
 * Destroys: User, Hotel, Booking, Review, Analytics collections.
 * Creates test@user.com / 12345678 as admin (for /admin + manual testing).
 * Populates every documented schema field for realistic demos.
 */
import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/user";
import Hotel from "../models/hotel";
import Booking from "../models/booking";
import Review from "../models/review";
import Analytics from "../models/analytics";

const IMG = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
];

const daysFromNow = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};

const daysAgo = (n: number) => daysFromNow(-n);

async function seed() {
  const uri = process.env.MONGODB_CONNECTION_STRING;
  if (!uri) {
    console.error("Missing MONGODB_CONNECTION_STRING");
    process.exit(1);
  }

  const wantsTls =
    uri.includes("mongodb+srv://") ||
    /[?&]tls=true/i.test(uri) ||
    /[?&]ssl=true/i.test(uri);

  await mongoose.connect(uri, {
    ...(wantsTls
      ? { tls: true, tlsAllowInvalidCertificates: false }
      : {}),
  });
  console.log("Connected. Wiping demo collections…");

  await Promise.all([
    Review.deleteMany({}),
    Booking.deleteMany({}),
    Hotel.deleteMany({}),
    Analytics.deleteMany({}),
    User.deleteMany({}),
  ]);

  console.log("Seeding users (all schema fields)…");
  const admin = await new User({
    email: "test@user.com",
    password: "12345678",
    firstName: "Test",
    lastName: "Admin",
    image: "https://i.pravatar.cc/150?u=admin",
    role: "admin",
    phone: "+44 20 7946 0001",
    address: {
      street: "10 Downing Street",
      city: "London",
      state: "England",
      country: "United Kingdom",
      zipCode: "SW1A 2AA",
    },
    preferences: {
      preferredDestinations: ["London", "Edinburgh", "Bath"],
      preferredHotelTypes: ["Boutique", "Luxury"],
      budgetRange: { min: 100, max: 400 },
    },
    totalBookings: 0,
    totalSpent: 0,
    lastLogin: daysAgo(0),
    emailVerified: true,
    isActive: true,
  }).save();

  const owner = await new User({
    email: "owner@hotel.com",
    password: "12345678",
    firstName: "Hotel",
    lastName: "Owner",
    image: "https://i.pravatar.cc/150?u=owner",
    role: "hotel_owner",
    phone: "+44 131 000 0002",
    address: {
      street: "42 Castle Wynd",
      city: "Edinburgh",
      state: "Scotland",
      country: "United Kingdom",
      zipCode: "EH1 2NG",
    },
    preferences: {
      preferredDestinations: ["Edinburgh", "Glasgow"],
      preferredHotelTypes: ["Boutique", "Family"],
      budgetRange: { min: 80, max: 250 },
    },
    totalBookings: 0,
    totalSpent: 0,
    lastLogin: daysAgo(1),
    emailVerified: true,
    isActive: true,
  }).save();

  const guest = await new User({
    email: "guest@user.com",
    password: "12345678",
    firstName: "Guest",
    lastName: "Traveler",
    image: "https://i.pravatar.cc/150?u=guest",
    role: "user",
    phone: "+44 7700 900123",
    address: {
      street: "88 Quayside",
      city: "Liverpool",
      state: "England",
      country: "United Kingdom",
      zipCode: "L3 4AN",
    },
    preferences: {
      preferredDestinations: ["London", "Liverpool", "Manchester"],
      preferredHotelTypes: ["Budget", "Apartment"],
      budgetRange: { min: 60, max: 200 },
    },
    totalBookings: 0,
    totalSpent: 0,
    lastLogin: daysAgo(2),
    emailVerified: true,
    isActive: true,
  }).save();

  console.log("Seeding hotels (all schema fields)…");
  const hotelA = await new Hotel({
    userId: owner.id,
    name: "Thames View Boutique",
    city: "London",
    country: "United Kingdom",
    description:
      "A refined riverside boutique hotel with contemporary rooms and easy access to central London.",
    type: ["Boutique", "Luxury"],
    adultCount: 2,
    childCount: 1,
    facilities: ["Free WiFi", "Parking", "Spa", "Restaurant"],
    pricePerNight: 180,
    starRating: 5,
    imageUrls: [IMG[0], IMG[1]],
    lastUpdated: new Date(),
    location: {
      latitude: 51.5074,
      longitude: -0.1278,
      address: {
        street: "1 Embankment Place",
        city: "London",
        state: "England",
        country: "United Kingdom",
        zipCode: "WC2N 6NN",
      },
    },
    contact: {
      phone: "+44 20 0000 0001",
      email: "stay@thamesview.example",
      website: "https://thamesview.example",
    },
    policies: {
      checkInTime: "15:00",
      checkOutTime: "11:00",
      cancellationPolicy: "Free cancel 48h before check-in",
      petPolicy: "Pets welcome on request (£25/night)",
      smokingPolicy: "Non-smoking property",
    },
    amenities: {
      parking: true,
      wifi: true,
      pool: false,
      gym: true,
      spa: true,
      restaurant: true,
      bar: true,
      airportShuttle: false,
      businessCenter: true,
    },
    totalBookings: 0,
    totalRevenue: 0,
    averageRating: 0,
    reviewCount: 0,
    occupancyRate: 72,
    isActive: true,
    isFeatured: true,
  }).save();

  const hotelB = await new Hotel({
    userId: admin.id,
    name: "Edinburgh Castle Inn",
    city: "Edinburgh",
    country: "United Kingdom",
    description:
      "Historic comfort near the Royal Mile — ideal for leisure and short business trips.",
    type: ["Budget", "Family"],
    adultCount: 4,
    childCount: 2,
    facilities: ["Free WiFi", "Family Rooms", "Non-Smoking Rooms"],
    pricePerNight: 95,
    starRating: 3,
    imageUrls: [IMG[2], IMG[0]],
    lastUpdated: new Date(),
    location: {
      latitude: 55.9533,
      longitude: -3.1883,
      address: {
        street: "15 Castlehill",
        city: "Edinburgh",
        state: "Scotland",
        country: "United Kingdom",
        zipCode: "EH1 2NG",
      },
    },
    contact: {
      phone: "+44 131 000 0003",
      email: "hello@castleinn.example",
      website: "https://castleinn.example",
    },
    policies: {
      checkInTime: "14:00",
      checkOutTime: "10:00",
      cancellationPolicy: "Free cancel 24h before check-in",
      petPolicy: "No pets",
      smokingPolicy: "Smoking area outdoors only",
    },
    amenities: {
      parking: false,
      wifi: true,
      pool: false,
      gym: false,
      spa: false,
      restaurant: true,
      bar: false,
      airportShuttle: true,
      businessCenter: false,
    },
    totalBookings: 0,
    totalRevenue: 0,
    averageRating: 0,
    reviewCount: 0,
    occupancyRate: 65,
    isActive: true,
    isFeatured: false,
  }).save();

  const hotelC = await new Hotel({
    userId: owner.id,
    name: "Quiet Quayside Suites",
    city: "Liverpool",
    country: "United Kingdom",
    description: "Spacious suites on the waterfront with kitchenettes.",
    type: ["Apartment"],
    adultCount: 3,
    childCount: 2,
    facilities: ["Free WiFi", "Parking", "Airport Shuttle", "Kitchenette"],
    pricePerNight: 120,
    starRating: 4,
    imageUrls: [IMG[1], IMG[2]],
    lastUpdated: new Date(),
    location: {
      latitude: 53.4084,
      longitude: -2.9916,
      address: {
        street: "20 Princes Dock",
        city: "Liverpool",
        state: "England",
        country: "United Kingdom",
        zipCode: "L3 1DL",
      },
    },
    contact: {
      phone: "+44 151 000 0004",
      email: "stay@quayside.example",
      website: "https://quayside.example",
    },
    policies: {
      checkInTime: "16:00",
      checkOutTime: "11:00",
      cancellationPolicy: "Non-refundable within 7 days",
      petPolicy: "Small pets allowed",
      smokingPolicy: "Strictly non-smoking",
    },
    amenities: {
      parking: true,
      wifi: true,
      pool: false,
      gym: false,
      spa: false,
      restaurant: false,
      bar: false,
      airportShuttle: true,
      businessCenter: false,
    },
    totalBookings: 0,
    totalRevenue: 0,
    averageRating: 0,
    reviewCount: 0,
    occupancyRate: 40,
    isActive: false,
    isFeatured: false,
  }).save();

  console.log("Seeding bookings (status × paymentStatus matrix + all fields)…");
  const bookingSpecs: Array<{
    hotelId: string;
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    adultCount: number;
    childCount: number;
    status: "pending" | "confirmed" | "cancelled" | "completed" | "refunded";
    paymentStatus: "pending" | "paid" | "failed" | "refunded";
    paymentMethod?: string;
    specialRequests?: string;
    checkIn: Date;
    checkOut: Date;
    createdAt: Date;
    totalCost: number;
    stripePaymentIntentId?: string;
    cancellationReason?: string;
    refundAmount?: number;
  }> = [
    {
      hotelId: hotelA.id,
      userId: guest.id,
      firstName: "Guest",
      lastName: "Traveler",
      email: "guest@user.com",
      phone: "+44 7700 900123",
      adultCount: 2,
      childCount: 1,
      status: "confirmed",
      paymentStatus: "paid",
      paymentMethod: "card",
      specialRequests: "High floor with river view if available",
      checkIn: daysFromNow(14),
      checkOut: daysFromNow(17),
      createdAt: daysAgo(2),
      totalCost: 540,
      stripePaymentIntentId: "pi_seed_upcoming_paid",
    },
    {
      hotelId: hotelA.id,
      userId: guest.id,
      firstName: "Guest",
      lastName: "Traveler",
      email: "guest@user.com",
      phone: "+44 7700 900123",
      adultCount: 2,
      childCount: 0,
      status: "pending",
      paymentStatus: "pending",
      paymentMethod: "card",
      specialRequests: "Late check-in after 21:00",
      checkIn: daysFromNow(30),
      checkOut: daysFromNow(32),
      createdAt: daysAgo(1),
      totalCost: 360,
    },
    {
      hotelId: hotelB.id,
      userId: guest.id,
      firstName: "Guest",
      lastName: "Traveler",
      email: "guest@user.com",
      phone: "+44 7700 900123",
      adultCount: 2,
      childCount: 0,
      status: "cancelled",
      paymentStatus: "refunded",
      paymentMethod: "card",
      specialRequests: "",
      checkIn: daysFromNow(10),
      checkOut: daysFromNow(12),
      createdAt: daysAgo(5),
      totalCost: 190,
      stripePaymentIntentId: "pi_seed_cancelled_refunded",
      cancellationReason: "Change of plans",
      refundAmount: 190,
    },
    {
      hotelId: hotelB.id,
      userId: guest.id,
      firstName: "Guest",
      lastName: "Traveler",
      email: "guest@user.com",
      phone: "+44 7700 900123",
      adultCount: 3,
      childCount: 1,
      status: "cancelled",
      paymentStatus: "paid",
      paymentMethod: "card",
      specialRequests: "Cot for toddler",
      checkIn: daysFromNow(20),
      checkOut: daysFromNow(22),
      createdAt: daysAgo(8),
      totalCost: 190,
      cancellationReason: "Legacy cancel without PI",
    },
    {
      hotelId: hotelA.id,
      userId: guest.id,
      firstName: "Guest",
      lastName: "Traveler",
      email: "guest@user.com",
      phone: "+44 7700 900123",
      adultCount: 2,
      childCount: 0,
      status: "completed",
      paymentStatus: "paid",
      paymentMethod: "card",
      specialRequests: "Quiet room away from lift",
      checkIn: daysAgo(20),
      checkOut: daysAgo(17),
      createdAt: daysAgo(40),
      totalCost: 540,
      stripePaymentIntentId: "pi_seed_completed_paid",
    },
    {
      hotelId: hotelB.id,
      userId: admin.id,
      firstName: "Test",
      lastName: "Admin",
      email: "test@user.com",
      phone: "+44 20 7946 0001",
      adultCount: 1,
      childCount: 0,
      status: "completed",
      paymentStatus: "paid",
      paymentMethod: "card",
      specialRequests: "Early check-in if possible",
      checkIn: daysAgo(10),
      checkOut: daysAgo(8),
      createdAt: daysAgo(25),
      totalCost: 190,
      stripePaymentIntentId: "pi_seed_admin_completed",
    },
    {
      hotelId: hotelA.id,
      userId: guest.id,
      firstName: "Guest",
      lastName: "Traveler",
      email: "guest@user.com",
      phone: "+44 7700 900123",
      adultCount: 2,
      childCount: 0,
      status: "refunded",
      paymentStatus: "refunded",
      paymentMethod: "card",
      specialRequests: "",
      checkIn: daysAgo(5),
      checkOut: daysAgo(3),
      createdAt: daysAgo(15),
      totalCost: 360,
      refundAmount: 360,
      stripePaymentIntentId: "pi_seed_status_refunded",
      cancellationReason: "Full refund issued",
    },
    {
      hotelId: hotelC.id,
      userId: guest.id,
      firstName: "Guest",
      lastName: "Traveler",
      email: "guest@user.com",
      phone: "+44 7700 900123",
      adultCount: 2,
      childCount: 1,
      status: "pending",
      paymentStatus: "failed",
      paymentMethod: "card",
      specialRequests: "Accessible room",
      checkIn: daysFromNow(7),
      checkOut: daysFromNow(9),
      createdAt: daysAgo(0),
      totalCost: 240,
    },
  ];

  const savedBookings = [];
  for (const spec of bookingSpecs) {
    const b = await new Booking({
      userId: spec.userId,
      hotelId: spec.hotelId,
      firstName: spec.firstName,
      lastName: spec.lastName,
      email: spec.email,
      phone: spec.phone,
      adultCount: spec.adultCount,
      childCount: spec.childCount,
      checkIn: spec.checkIn,
      checkOut: spec.checkOut,
      totalCost: spec.totalCost,
      status: spec.status,
      paymentStatus: spec.paymentStatus,
      paymentMethod: spec.paymentMethod,
      specialRequests: spec.specialRequests || "",
      stripePaymentIntentId: spec.stripePaymentIntentId,
      cancellationReason: spec.cancellationReason,
      refundAmount: spec.refundAmount || 0,
      createdAt: spec.createdAt,
      updatedAt: spec.createdAt,
    }).save();
    savedBookings.push(b);
  }

  const paidActive = savedBookings.filter(
    (b) =>
      b.paymentStatus === "paid" &&
      b.status !== "cancelled" &&
      b.status !== "refunded"
  );
  for (const hotel of [hotelA, hotelB, hotelC]) {
    const mine = paidActive.filter((b) => b.hotelId === hotel.id);
    hotel.totalBookings = mine.length;
    hotel.totalRevenue = mine.reduce((s, b) => s + (b.totalCost || 0), 0);
    await hotel.save();
  }

  console.log("Seeding reviews (all schema fields)…");
  const completed = savedBookings.filter((b) => b.status === "completed");
  if (completed[0]) {
    await new Review({
      userId: completed[0].userId,
      hotelId: completed[0].hotelId,
      bookingId: completed[0].id,
      rating: 5,
      comment: "Wonderful stay — staff were exceptional and rooms spotless.",
      categories: {
        cleanliness: 5,
        service: 5,
        location: 5,
        value: 4,
        amenities: 5,
      },
      isVerified: true,
      helpfulCount: 12,
    }).save();
  }
  if (completed[1]) {
    await new Review({
      userId: completed[1].userId,
      hotelId: completed[1].hotelId,
      bookingId: completed[1].id,
      rating: 4,
      comment: "Solid value near the attractions. Breakfast could be stronger.",
      categories: {
        cleanliness: 4,
        service: 4,
        location: 5,
        value: 4,
        amenities: 3,
      },
      isVerified: false,
      helpfulCount: 3,
    }).save();
  }

  for (const hotel of [hotelA, hotelB]) {
    const reviews = await Review.find({ hotelId: hotel.id });
    if (reviews.length) {
      hotel.reviewCount = reviews.length;
      hotel.averageRating =
        Math.round(
          (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10
        ) / 10;
      await hotel.save();
    }
  }

  console.log("Seeding analytics snapshot (full metrics + breakdown)…");
  await Analytics.create({
    date: new Date(),
    metrics: {
      totalBookings: savedBookings.length,
      totalRevenue: paidActive.reduce((s, b) => s + (b.totalCost || 0), 0),
      totalUsers: 3,
      totalHotels: 3,
      averageBookingValue: 250,
      conversionRate: 62.5,
      cancellationRate: 25,
      averageRating: 4.5,
    },
    breakdown: {
      byStatus: {
        pending: 2,
        confirmed: 1,
        cancelled: 2,
        completed: 2,
        refunded: 1,
      },
      byPaymentStatus: {
        pending: 1,
        paid: 4,
        failed: 1,
        refunded: 2,
      },
      byDestination: [
        { city: "London", bookings: 4, revenue: 1800 },
        { city: "Edinburgh", bookings: 3, revenue: 570 },
        { city: "Liverpool", bookings: 1, revenue: 0 },
      ],
      byHotelType: [
        { type: "Boutique", bookings: 4, revenue: 1800 },
        { type: "Budget", bookings: 3, revenue: 570 },
        { type: "Apartment", bookings: 1, revenue: 0 },
      ],
    },
  });

  guest.totalBookings = paidActive.filter((b) => b.userId === guest.id).length;
  guest.totalSpent = paidActive
    .filter((b) => b.userId === guest.id)
    .reduce((s, b) => s + (b.totalCost || 0), 0);
  await guest.save();

  admin.totalBookings = paidActive.filter((b) => b.userId === admin.id).length;
  admin.totalSpent = paidActive
    .filter((b) => b.userId === admin.id)
    .reduce((s, b) => s + (b.totalCost || 0), 0);
  await admin.save();

  console.log("Seed complete.");
  console.log("  Admin login: test@user.com / 12345678 (role=admin)");
  console.log("  Owner login: owner@hotel.com / 12345678");
  console.log("  Guest login: guest@user.com / 12345678");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
