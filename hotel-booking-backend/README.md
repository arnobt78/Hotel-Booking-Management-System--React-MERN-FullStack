# Hotel Booking Management System Backend - React, Express.js MERN Project

A production-ready, scalable backend API for the Hotel Booking Management System. Built with Node.js, Express.js, TypeScript, and MongoDB, featuring secure authentication, real-time booking management, and third-party integrations.

- **Frontend-Live-Demo:** [https://hotel-mern-booking.vercel.app/](https://hotel-mern-booking.vercel.app/)
- **Backend-Live-Demo:** [https://hotel-booking-backend.arnobmahmud.com](https://hotel-booking-backend.arnobmahmud.com)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../LICENSE)
![MernHolidays](https://img.shields.io/badge/MERN-Stack-blue?style=for-the-badge&logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/React-18.2.0-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0.2-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.5-38B2AC?style=for-the-badge&logo=tailwind-css)

---

## 🎯 Backend Overview

### **What This Backend Provides**

This backend serves as the **core API engine** for a comprehensive hotel booking platform. It handles all server-side operations including user authentication, hotel management, booking processing, payment integration, and business analytics.

### **Core Responsibilities**

- **🔐 Authentication & Authorization**: JWT-based secure user management
- **🏨 Hotel Management**: CRUD operations for hotel listings and details
- **📅 Booking System**: Real-time booking creation and management
- **💳 Payment Processing**: Stripe integration for secure transactions
- **📊 Analytics Engine**: Business insights and performance metrics
- **🖼️ File Management**: Cloudinary integration for image handling
- **🔒 Security**: Rate limiting, CORS, input validation, and data protection

### **Architecture Highlights**

```bash
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Express.js    │    │   MongoDB      │    │   JWT Auth      │
│   (API Server)  │◄──►│   (Database)   │◄──►│   (Security)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Multer        │    │   Cloudinary    │    │   Stripe        │
│  (File Upload)  │    │  (Image Mgmt)   │    │  (Payments)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 🚀 Quick Start

### **Prerequisites**

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Git

### **Installation**

```bash
# Clone the repository
git clone https://github.com/arnobt78/MERN-Hotel-Booking--React-FullStack.git
cd hotel-booking-backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure environment variables (see below)
# Start development server
npm run dev
```

### **Environment Configuration**

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Database
MONGODB_CONNECTION_STRING=mongodb+srv://username:password@cluster.mongodb.net/hotel-booking

# Authentication
JWT_SECRET_KEY=your-super-secure-jwt-secret-key-here

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5174

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Stripe (Payment Processing)
STRIPE_API_KEY=sk_test_your-stripe-secret-key
```

---

## 📁 Project Structure

```bash
hotel-booking-backend/
├── src/
│   ├── index.ts                    # Server entry point & Express app setup
│   ├── swagger.ts                  # API documentation configuration
│   ├── middleware/
│   │   └── auth.ts                 # JWT authentication middleware
│   ├── models/
│   │   ├── user.ts                 # User data model
│   │   ├── hotel.ts                # Hotel data model
│   │   ├── booking.ts              # Booking data model
│   │   ├── review.ts               # Review data model
│   │   └── analytics.ts            # Analytics data model
│   ├── routes/
│   │   ├── auth.ts                 # Authentication endpoints
│   │   ├── users.ts                # User management endpoints
│   │   ├── hotels.ts               # Hotel search & public endpoints
│   │   ├── my-hotels.ts            # Hotel owner management
│   │   ├── bookings.ts             # Booking management
│   │   ├── my-bookings.ts          # User booking history
│   │   ├── business-insights.ts    # Analytics & business insights
│   │   └── health.ts               # Health check endpoints
│   └── shared/
│       └── types.ts               # Shared TypeScript types
├── dist/                          # Compiled JavaScript output
├── package.json                   # Dependencies & scripts
├── tsconfig.json                  # TypeScript configuration
└── README.md                      # This file
```

---

## 🔧 Technology Stack

### **Core Technologies**

- **Node.js 18+**: JavaScript runtime environment
- **Express.js 4.18+**: Web application framework
- **TypeScript 5.0+**: Type-safe JavaScript development
- **MongoDB 6.0+**: NoSQL database
- **Mongoose 7.0+**: MongoDB object modeling

### **Authentication & Security**

- **JWT**: JSON Web Token authentication
- **bcryptjs**: Password hashing and verification
- **express-rate-limit**: API rate limiting
- **helmet**: Security middleware
- **cors**: Cross-origin resource sharing

### **File & Media Handling**

- **Multer**: File upload middleware
- **Cloudinary**: Cloud image storage and management

### **Payment Processing**

- **Stripe**: Payment gateway integration
- **Stripe Node.js SDK**: Official Stripe library

### **Development & Monitoring**

- **Morgan**: HTTP request logging
- **Swagger**: API documentation
- **Nodemon**: Development server with auto-restart

---

## 🔌 API Endpoints

### **Authentication Routes** (`/api/auth`)

| Method | Endpoint          | Description        | Auth Required |
| ------ | ----------------- | ------------------ | ------------- |
| `POST` | `/login`          | User login         | ❌            |
| `POST` | `/logout`         | User logout        | ✅            |
| `GET`  | `/validate-token` | Validate JWT token | ✅            |

### **User Management** (`/api/users`)

| Method | Endpoint    | Description              | Auth Required |
| ------ | ----------- | ------------------------ | ------------- |
| `POST` | `/register` | Create new user account  | ❌            |
| `GET`  | `/me`       | Get current user profile | ✅            |

### **Hotel Management** (`/api/hotels`)

| Method | Endpoint  | Description                | Auth Required |
| ------ | --------- | -------------------------- | ------------- |
| `GET`  | `/`       | List all hotels            | ❌            |
| `GET`  | `/:id`    | Get hotel by ID            | ❌            |
| `GET`  | `/search` | Search hotels with filters | ❌            |

### **Hotel Owner Routes** (`/api/my-hotels`)

| Method   | Endpoint | Description        | Auth Required |
| -------- | -------- | ------------------ | ------------- |
| `POST`   | `/`      | Create new hotel   | ✅            |
| `GET`    | `/`      | List user's hotels | ✅            |
| `GET`    | `/:id`   | Get specific hotel | ✅            |
| `PUT`    | `/:id`   | Update hotel       | ✅            |
| `DELETE` | `/:id`   | Delete hotel       | ✅            |

### **Booking Management** (`/api/bookings`)

| Method | Endpoint      | Description        | Auth Required |
| ------ | ------------- | ------------------ | ------------- |
| `POST` | `/hotels/:id` | Create booking     | ✅            |
| `GET`  | `/hotel/:id`  | Get hotel bookings | ✅            |

### **User Bookings** (`/api/my-bookings`)

| Method | Endpoint | Description                | Auth Required |
| ------ | -------- | -------------------------- | ------------- |
| `GET`  | `/`      | Get user's booking history | ✅            |

### **Business Insights** (`/api/business-insights`)

| Method | Endpoint       | Description              | Auth Required |
| ------ | -------------- | ------------------------ | ------------- |
| `GET`  | `/dashboard`   | Analytics dashboard data | ✅            |
| `GET`  | `/forecast`    | Business forecasting     | ✅            |
| `GET`  | `/performance` | Performance metrics      | ✅            |

### **Health Check** (`/api/health`)

| Method | Endpoint    | Description             | Auth Required |
| ------ | ----------- | ----------------------- | ------------- |
| `GET`  | `/`         | Basic health check      | ❌            |
| `GET`  | `/detailed` | Detailed system metrics | ❌            |

---

## 🔐 Authentication System

### **Dual Authentication Strategy**

This backend implements a **dual authentication system** to support both modern browsers and privacy-focused browsers (incognito, Tor):

```typescript
// Authentication middleware
const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  // First, check Authorization header (for privacy browsers)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY!);
      req.userId = decoded.userId;
      return next();
    } catch (error) {
      // Continue to cookie check
    }
  }

  // Fallback to cookie-based auth (for normal browsers)
  const token = req.cookies.auth_token;
  if (!token) {
    return res.status(401).json({ message: "unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY!);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: "unauthorized" });
  }
};
```

### **Login Response**

```typescript
// Login endpoint returns both cookie and token
res.cookie("auth_token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  path: "/",
});

res.status(200).json({
  userId: user._id,
  token: token, // For privacy-focused browsers
  message: "Login successful",
});
```

---

## 🗄️ Database Models

### **User Model**

```typescript
interface UserType {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "user" | "admin" | "hotel_owner";
  phone?: string;
  address?: Address;
  totalBookings?: number;
  totalSpent?: number;
  lastLogin?: Date;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
```

### **Hotel Model**

```typescript
interface HotelType {
  _id: string;
  userId: string;
  name: string;
  city: string;
  country: string;
  description: string;
  type: string[];
  adultCount: number;
  childCount: number;
  facilities: string[];
  pricePerNight: number;
  starRating: number;
  imageUrls: string[];
  contact?: Contact;
  policies?: Policies;
  totalBookings?: number;
  totalRevenue?: number;
  averageRating?: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
```

### **Booking Model**

```typescript
interface BookingType {
  _id: string;
  userId: string;
  hotelId: string;
  firstName: string;
  lastName: string;
  email: string;
  adultCount: number;
  childCount: number;
  checkIn: Date;
  checkOut: Date;
  totalCost: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  paymentStatus: "pending" | "paid" | "failed";
  createdAt?: Date;
  updatedAt?: Date;
}
```

---

## 🔒 Security Features

### **Rate Limiting**

```typescript
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);
```

### **CORS Configuration**

```typescript
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  }),
);
```

### **Input Validation**

```typescript
import { body } from "express-validator";

const validateHotel = [
  body("name").notEmpty().withMessage("Name is required"),
  body("city").notEmpty().withMessage("City is required"),
  body("pricePerNight").isNumeric().withMessage("Price must be a number"),
  body("facilities").isArray().withMessage("Facilities must be an array"),
];
```

---

## 💳 Payment Integration

### **Stripe Payment Flow**

```typescript
// Create payment intent
export const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    const { numberOfNights } = req.body;
    const hotelId = req.params.hotelId;

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    const totalCost = hotel.pricePerNight * numberOfNights;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCost * 100, // Convert to cents
      currency: "usd",
      metadata: {
        hotelId,
        userId: req.userId,
      },
    });

    res.json({
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating payment intent" });
  }
};
```

---

## 🖼️ File Upload System

### **Cloudinary Integration**

```typescript
// Image upload middleware
const uploadImages = async (imageFiles: any[]) => {
  const uploadPromises = imageFiles.map(async (image) => {
    const b64 = Buffer.from(image.buffer).toString("base64");
    let dataURI = "data:" + image.mimetype + ";base64," + b64;

    const res = await cloudinary.v2.uploader.upload(dataURI, {
      folder: "hotel-booking",
      transformation: [
        { width: 800, height: 600, crop: "fill" },
        { quality: "auto" },
      ],
    });

    return res.url;
  });

  return await Promise.all(uploadPromises);
};
```

---

## 📊 Analytics Engine

### **Business Insights API**

```typescript
// Analytics dashboard endpoint
export const getAnalyticsDashboard = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    // Get user's hotels
    const hotels = await Hotel.find({ userId });
    const hotelIds = hotels.map((hotel) => hotel._id);

    // Calculate metrics
    const totalRevenue = await Booking.aggregate([
      { $match: { hotelId: { $in: hotelIds } } },
      { $group: { _id: null, total: { $sum: "$totalCost" } } },
    ]);

    const totalBookings = await Booking.countDocuments({
      hotelId: { $in: hotelIds },
    });

    res.json({
      totalRevenue: totalRevenue[0]?.total || 0,
      totalBookings,
      averageRating: 4.5,
      occupancyRate: 75.2,
      // More metrics...
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching analytics" });
  }
};
```

---

## 🚀 Deployment

### **Coolify Deployment (VPS)**

1. **Connect Repository**
   - Add your GitHub repository to Coolify
   - Set root directory: `hotel-booking-backend`

2. **Build Configuration**

   ```bash
   Build Command: npm run build
   Start Command: npm start
   ```

3. **Environment Variables**
   - Set all required environment variables in Coolify
   - Ensure `NODE_ENV=production`

4. **Deploy**
   - Coolify deploys from your VPS; trigger redeploy after pushing changes
   - Monitor deployment logs for any issues

### **Production Checklist**

- [ ] Environment variables configured
- [ ] MongoDB Atlas cluster set up
- [ ] Cloudinary production account
- [ ] Stripe production keys
- [ ] CORS settings updated for production domain
- [ ] Rate limiting configured
- [ ] Error monitoring enabled

---

## 🧪 Testing

### **API Testing**

```bash
# Test health endpoint (replace with your backend URL)
curl https://your-backend-domain.com/api/health

# Test authentication
curl -X POST https://your-backend-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### **Load Testing**

```bash
# Install artillery for load testing
npm install -g artillery

# Run load test
artillery quick --count 20 --num 10 https://your-backend-domain.com/api/health
```

---

## 🔧 Development Commands

```bash
# Development with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Lint code
npm run lint
```

---

## 📈 Performance Optimization

### **Database Optimization**

- **Indexing**: Strategic indexes on frequently queried fields
- **Aggregation**: Efficient data aggregation for analytics
- **Pagination**: Implemented for large datasets
- **Caching**: Redis integration ready for high-traffic scenarios

### **API Optimization**

- **Compression**: Gzip compression enabled
- **Rate Limiting**: Prevents API abuse
- **Request Validation**: Early validation to prevent unnecessary processing
- **Error Handling**: Comprehensive error handling with proper HTTP status codes

---

## 🔗 Integration Examples

### **Frontend Integration**

```typescript
// Example: Fetch hotels with search
const searchHotels = async (searchParams: SearchParams) => {
  const queryParams = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) queryParams.append(key, value.toString());
  });

  const response = await fetch(
    `${API_BASE_URL}/api/hotels/search?${queryParams}`,
  );

  if (!response.ok) {
    throw new Error("Error fetching hotels");
  }

  return response.json();
};
```

### **Mobile App Integration**

```typescript
// Example: React Native integration
const apiClient = {
  baseURL: "https://your-backend-domain.com/api",

  async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    return response.json();
  },
};
```

---

## 🎯 Key Features Summary

### **✅ Production Ready**

- **Scalable Architecture**: Modular design for easy scaling
- **Security First**: Comprehensive security measures
- **Error Handling**: Robust error handling and logging
- **Performance Optimized**: Efficient database queries and caching

### **✅ Developer Friendly**

- **TypeScript**: Full type safety throughout
- **Clear Documentation**: Comprehensive API documentation
- **Modular Design**: Easy to extend and maintain
- **Testing Ready**: Built with testing in mind

### **✅ Business Ready**

- **Payment Processing**: Complete Stripe integration
- **Analytics**: Real-time business insights
- **Multi-tenant**: Supports multiple hotel owners
- **Audit Trail**: Complete booking and transaction history

---

## 🚀 Happy Coding! 🎉

This backend is designed to be **production-ready**, **developer-friendly**, and **business-focused**. Whether you're learning full-stack development, building a startup, or extending an existing platform, this backend provides a solid foundation.

**Key Benefits:**

- 🎓 **Learning Resource**: Complete MERN stack backend implementation
- 🏢 **Business Ready**: Production-grade features and security
- 🔧 **Extensible**: Easy to add new features and integrations
- 📚 **Well Documented**: Comprehensive documentation and examples

**Get Started Today!** 🚀

This is an **open-source project** - feel free to use, enhance, and extend this project further!

If you have any questions or want to share your work, reach out via GitHub or my portfolio at [https://www.arnobmahmud.com/](https://www.arnobmahmud.com/).

**Enjoy building and learning!** 🚀

Thank you! 😊
