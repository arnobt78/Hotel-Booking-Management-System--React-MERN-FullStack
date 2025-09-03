# 🏨 MernHolidays - Full-Stack Hotel Booking Platform

A comprehensive, production-ready hotel booking platform built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring advanced search, booking management, analytics dashboard, and payment integration.

![MernHolidays](https://img.shields.io/badge/MERN-Stack-blue?style=for-the-badge&logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/React-18.2.0-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0.2-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.5-38B2AC?style=for-the-badge&logo=tailwind-css)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Key Components](#-key-components)
- [Database Schema](#-database-schema)
- [Authentication & Authorization](#-authentication--authorization)
- [Payment Integration](#-payment-integration)
- [Search & Filtering](#-search--filtering)
- [Analytics Dashboard](#-analytics-dashboard)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🏨 Hotel Management

- **Multi-role System**: User, Hotel Owner, and Admin roles
- **Hotel CRUD Operations**: Create, read, update, delete hotel listings
- **Image Upload**: Cloudinary integration for hotel image management
- **Advanced Hotel Details**: Location, amenities, policies, contact information
- **Hotel Analytics**: Booking statistics, revenue tracking, occupancy rates

### 🔍 Advanced Search & Filtering

- **Smart Search**: Destination-based hotel discovery
- **Multi-filter System**: Price range, star rating, hotel types, facilities
- **Geolocation Support**: Location-based search with coordinates
- **Sorting Options**: Price, rating, distance, relevance
- **Pagination**: Efficient data loading for large datasets

### 📅 Booking System

- **Real-time Availability**: Check-in/check-out date validation
- **Guest Management**: Adult and child count tracking
- **Payment Integration**: Stripe payment processing
- **Booking Status**: Pending, confirmed, cancelled, completed, refunded
- **Booking History**: Complete booking logs and analytics

### 📊 Analytics Dashboard

- **Real-time Metrics**: Revenue, bookings, occupancy rates
- **Performance Charts**: Revenue trends, booking patterns
- **Forecasting**: Predictive analytics for business insights
- **Hotel Performance**: Individual hotel analytics
- **User Analytics**: User behavior and preferences

### 🔐 Authentication & Security

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Granular permissions
- **Password Security**: bcrypt password hashing
- **Rate Limiting**: API request throttling
- **CORS Protection**: Cross-origin resource sharing security

### 🎨 Modern UI/UX

- **Responsive Design**: Mobile-first approach
- **Shadcn UI Components**: Modern, accessible UI components
- **Tailwind CSS**: Utility-first CSS framework
- **Dark/Light Mode**: Theme customization
- **Loading States**: Smooth user experience
- **Toast Notifications**: User feedback system

---

## 🛠 Tech Stack

### Frontend

- **React 18.2.0** - Modern UI library with hooks
- **TypeScript 5.0.2** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **React Router DOM** - Client-side routing
- **React Query** - Server state management
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn UI** - Modern component library
- **Lucide React** - Beautiful icons
- **React Hook Form** - Form validation and handling
- **Stripe React** - Payment processing

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type-safe development
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **Cloudinary** - Cloud image storage
- **Stripe** - Payment processing
- **Swagger** - API documentation
- **Helmet** - Security middleware
- **Morgan** - HTTP request logger
- **CORS** - Cross-origin resource sharing

### Development Tools

- **Nodemon** - Development server with auto-restart
- **ESLint** - Code linting
- **Playwright** - End-to-end testing
- **Git** - Version control

---

## 📁 Project Structure

```
hotel-booking/
├── hotel-booking-frontend/          # React frontend application
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   │   ├── ui/                 # Shadcn UI components
│   │   │   ├── AdvancedSearch.tsx  # Advanced search component
│   │   │   ├── Hero.tsx           # Landing page hero section
│   │   │   ├── Header.tsx         # Navigation header
│   │   │   └── ...
│   │   ├── pages/                 # Page components
│   │   │   ├── Home.tsx           # Landing page
│   │   │   ├── Search.tsx        # Hotel search page
│   │   │   ├── Detail.tsx        # Hotel details page
│   │   │   ├── Booking.tsx       # Booking page
│   │   │   ├── MyHotels.tsx      # Hotel management
│   │   │   ├── MyBookings.tsx    # Booking management
│   │   │   ├── AnalyticsDashboard.tsx # Analytics
│   │   │   └── ...
│   │   ├── forms/                # Form components
│   │   ├── hooks/               # Custom React hooks
│   │   ├── contexts/            # React contexts
│   │   ├── layouts/             # Layout components
│   │   └── api-client.ts        # API client functions
│   ├── package.json
│   └── vite.config.ts
├── hotel-booking-backend/         # Node.js backend application
│   ├── src/
│   │   ├── routes/              # API route handlers
│   │   │   ├── auth.ts          # Authentication routes
│   │   │   ├── hotels.ts        # Hotel management routes
│   │   │   ├── bookings.ts      # Booking routes
│   │   │   ├── analytics.ts     # Analytics routes
│   │   │   └── ...
│   │   ├── models/              # MongoDB models
│   │   ├── middleware/         # Express middleware
│   │   ├── index.ts            # Server entry point
│   │   └── swagger.ts          # API documentation
│   └── package.json
├── shared/                       # Shared TypeScript types
│   └── types.ts
├── e2e-tests/                   # End-to-end tests
└── data/                        # Sample data and images
```

---

## 🚀 Installation & Setup

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Git

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/hotel-booking.git
cd hotel-booking
```

### Step 2: Install Dependencies

#### Backend Setup

```bash
cd hotel-booking-backend
npm install
```

#### Frontend Setup

```bash
cd hotel-booking-frontend
npm install
```

### Step 3: Environment Configuration

Create environment files for both frontend and backend (see [Environment Variables](#-environment-variables) section).

### Step 4: Start Development Servers

#### Backend Server

```bash
cd hotel-booking-backend
npm run dev
# Server runs on http://localhost:7002
```

#### Frontend Server

```bash
cd hotel-booking-frontend
npm run dev
# Frontend runs on http://localhost:5174
```

### Step 5: Access the Application

- **Frontend**: <http://localhost:5174>
- **Backend API**: <http://localhost:7002>
- **API Documentation**: <http://localhost:7002/api-docs>

---

## 🔧 Environment Variables

### Backend (.env)

Create a `.env` file in the `hotel-booking-backend` directory:

```env
# Server Configuration
PORT=7002
NODE_ENV=development

# MongoDB Connection
MONGODB_CONNECTION_STRING=mongodb://localhost:27017/hotel-booking
# OR for MongoDB Atlas:
# MONGODB_CONNECTION_STRING=mongodb+srv://username:password@cluster.mongodb.net/hotel-booking

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Stripe Configuration (for payments)
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5174

# Optional: Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Frontend (.env)

Create a `.env` file in the `hotel-booking-frontend` directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:7002

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key

# Optional: Analytics
VITE_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
```

### How to Get Environment Variables

#### 1. MongoDB Atlas Setup

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string from "Connect" button
4. Replace `<password>` with your database password

#### 2. Cloudinary Setup

1. Create account at [Cloudinary](https://cloudinary.com/)
2. Go to Dashboard → API Keys
3. Copy Cloud Name, API Key, and API Secret

#### 3. Stripe Setup

1. Create account at [Stripe](https://stripe.com/)
2. Go to Developers → API Keys
3. Copy Publishable Key and Secret Key (use test keys for development)

#### 4. JWT Secret

Generate a secure random string:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 📚 API Documentation

### Authentication Endpoints

#### POST /api/auth/register

Register a new user account.

```typescript
interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: Address;
}
```

#### POST /api/auth/login

Authenticate user and get JWT token.

```typescript
interface LoginData {
  email: string;
  password: string;
}
```

#### POST /api/auth/logout

Logout user and invalidate session.

#### GET /api/auth/validate-token

Validate JWT token and return user data.

### Hotel Management Endpoints

#### GET /api/hotels

Get all hotels with pagination and filtering.

```typescript
interface HotelSearchParams {
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  adultCount?: string;
  childCount?: string;
  page?: string;
  facilities?: string[];
  types?: string[];
  stars?: string[];
  maxPrice?: string;
  sortOption?: string;
}
```

#### GET /api/hotels/:id

Get specific hotel details.

#### POST /api/my-hotels

Create a new hotel (requires authentication).

```typescript
interface HotelFormData {
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
  imageFiles: File[];
}
```

#### PUT /api/my-hotels/:id

Update hotel details.

#### DELETE /api/my-hotels/:id

Delete hotel listing.

### Booking Endpoints

#### POST /api/hotels/:id/bookings

Create a new booking.

```typescript
interface BookingData {
  firstName: string;
  lastName: string;
  email: string;
  adultCount: number;
  childCount: number;
  checkIn: Date;
  checkOut: Date;
  totalCost: number;
}
```

#### GET /api/my-bookings

Get user's booking history.

#### GET /api/bookings/hotel/:id

Get all bookings for a specific hotel.

### Analytics Endpoints

#### GET /api/analytics/dashboard

Get comprehensive analytics data.

```typescript
interface AnalyticsData {
  totalRevenue: number;
  totalBookings: number;
  averageRating: number;
  occupancyRate: number;
  revenueTrends: RevenueData[];
  bookingTrends: BookingData[];
  topHotels: HotelAnalytics[];
}
```

#### GET /api/analytics/forecast

Get predictive analytics data.

#### GET /api/analytics/performance

Get performance metrics.

### Health Check Endpoints

#### GET /api/health

Basic health check with status and uptime.

#### GET /api/health/detailed

Detailed system metrics including memory usage and performance data.

---

## 🧩 Key Components

### AdvancedSearch Component

A comprehensive search component with multiple filters and real-time suggestions.

```typescript
// Usage Example
<AdvancedSearch
  onSearch={(searchData) => {
    // Handle search with advanced filters
    console.log(searchData);
  }}
  isExpanded={false}
/>
```

**Features:**

- Destination autocomplete with API suggestions
- Date range selection
- Guest count management
- Advanced filters (price, rating, facilities)
- Quick search for popular destinations

### Hero Component

Landing page hero section with gradient background and search integration.

```typescript
// Usage Example
<Hero
  onSearch={(searchData) => {
    // Handle search from hero section
  }}
/>
```

**Features:**

- Full-width gradient background
- Integrated search component
- Feature highlights
- Responsive design

### AnalyticsDashboard Component

Comprehensive analytics dashboard with charts and metrics.

```typescript
// Usage Example
<AnalyticsDashboard />
```

**Features:**

- Revenue charts and trends
- Booking analytics
- Performance metrics
- Forecasting data
- Interactive charts with Recharts

### BookingLogModal Component

Modal for viewing detailed booking information.

```typescript
// Usage Example
<BookingLogModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  hotelId="hotel-id"
  hotelName="Hotel Name"
/>
```

**Features:**

- Detailed booking information
- Status management
- Payment details
- Guest information

---

## 🗄 Database Schema

### User Model

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
  preferences?: UserPreferences;
  totalBookings?: number;
  totalSpent?: number;
  lastLogin?: Date;
  isActive?: boolean;
  emailVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
```

### Hotel Model

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
  location?: Location;
  contact?: Contact;
  policies?: Policies;
  amenities?: Amenities;
  totalBookings?: number;
  totalRevenue?: number;
  averageRating?: number;
  reviewCount?: number;
  occupancyRate?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
```

### Booking Model

```typescript
interface BookingType {
  _id: string;
  userId: string;
  hotelId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  adultCount: number;
  childCount: number;
  checkIn: Date;
  checkOut: Date;
  totalCost: number;
  status: "pending" | "confirmed" | "cancelled" | "completed" | "refunded";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentMethod?: string;
  specialRequests?: string;
  cancellationReason?: string;
  refundAmount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
```

---

## 🔐 Authentication & Authorization

### JWT Implementation

The application uses JWT tokens for secure authentication:

```typescript
// Token generation
const token = jwt.sign(
  { userId: user._id, email: user.email, role: user.role },
  process.env.JWT_SECRET!,
  { expiresIn: process.env.JWT_EXPIRES_IN }
);

// Token verification middleware
const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.auth_token;
  if (!token) {
    return res.status(401).json({ message: "Access denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};
```

### Role-based Access Control

Different user roles have different permissions:

- **User**: Can book hotels, view their bookings
- **Hotel Owner**: Can manage their hotels, view analytics
- **Admin**: Full access to all features

```typescript
// Role verification middleware
const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
};
```

---

## 💳 Payment Integration

### Stripe Integration

The application integrates with Stripe for secure payment processing:

```typescript
// Create payment intent
const paymentIntent = await stripe.paymentIntents.create({
  amount: totalCost * 100, // Convert to cents
  currency: "usd",
  metadata: {
    hotelId,
    userId,
    bookingId,
  },
});

// Payment confirmation
const confirmPayment = await stripe.paymentIntents.confirm(paymentIntentId, {
  payment_method: paymentMethodId,
});
```

### Payment Flow

1. User selects hotel and dates
2. System calculates total cost
3. Stripe payment intent is created
4. User completes payment
5. Booking is confirmed
6. Confirmation email is sent

---

## 🔍 Search & Filtering

### Advanced Search Implementation

The search system supports multiple filtering options:

```typescript
// Search query building
const buildSearchQuery = (searchParams: SearchParams) => {
  const query: any = {};

  if (searchParams.destination) {
    query.$or = [
      { city: { $regex: searchParams.destination, $options: "i" } },
      { country: { $regex: searchParams.destination, $options: "i" } },
      { name: { $regex: searchParams.destination, $options: "i" } },
    ];
  }

  if (searchParams.maxPrice) {
    query.pricePerNight = { $lte: parseInt(searchParams.maxPrice) };
  }

  if (searchParams.facilities?.length) {
    query.facilities = { $all: searchParams.facilities };
  }

  if (searchParams.types?.length) {
    query.type = { $in: searchParams.types };
  }

  return query;
};
```

### Filter Components

Reusable filter components for different criteria:

```typescript
// Price Filter Component
const PriceFilter = ({ onPriceChange }: PriceFilterProps) => {
  const [priceRange, setPriceRange] = useState([0, 1000]);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Price Range</label>
      <Slider
        value={priceRange}
        onChange={setPriceRange}
        min={0}
        max={1000}
        step={10}
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>£{priceRange[0]}</span>
        <span>£{priceRange[1]}</span>
      </div>
    </div>
  );
};
```

---

## 📊 Analytics Dashboard

### Real-time Analytics

The analytics dashboard provides comprehensive insights:

```typescript
// Analytics data structure
interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalBookings: number;
    averageRating: number;
    occupancyRate: number;
  };
  trends: {
    revenue: RevenueData[];
    bookings: BookingData[];
    ratings: RatingData[];
  };
  topPerformers: {
    hotels: HotelAnalytics[];
    destinations: DestinationAnalytics[];
  };
  forecasts: {
    revenue: ForecastData[];
    bookings: ForecastData[];
  };
}
```

### Chart Components

Interactive charts using Recharts library:

```typescript
// Revenue Chart Component
const RevenueChart = ({ data }: { data: RevenueData[] }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#8884d8"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
```

---

## 🧪 Testing

### End-to-End Testing

The project includes comprehensive E2E tests using Playwright:

```bash
# Run E2E tests
cd e2e-tests
npm install
npm test
```

### Test Structure

```typescript
// Example test: Hotel search functionality
test("should search hotels with filters", async ({ page }) => {
  await page.goto("/search");

  // Fill search form
  await page.fill('[data-testid="destination-input"]', "London");
  await page.selectOption('[data-testid="adult-count"]', "2");
  await page.click('[data-testid="search-button"]');

  // Verify results
  await expect(page.locator('[data-testid="hotel-card"]')).toHaveCount(5);
});
```

### Test Coverage

- Authentication flows
- Hotel search and filtering
- Booking process
- Hotel management
- Analytics dashboard
- API endpoints

---

## 🚀 Deployment

### Backend Deployment (Railway/Heroku)

1. **Prepare for deployment:**

```bash
cd hotel-booking-backend
npm run build
```

2. **Environment variables setup:**

   - Set all required environment variables in your hosting platform
   - Ensure MongoDB connection string is production-ready
   - Configure CORS for production domain

3. **Deploy to Railway:**

```bash
# Connect your GitHub repository
# Railway will auto-deploy on push to main branch
```

### Frontend Deployment (Netlify/Vercel)

1. **Build the application:**

```bash
cd hotel-booking-frontend
npm run build
```

2. **Deploy to Netlify:**

```bash
# Connect your GitHub repository
# Netlify will auto-deploy on push to main branch
```

3. **Environment variables:**
   - Set `VITE_API_BASE_URL` to your production backend URL
   - Configure Stripe keys for production

### Production Checklist

- [ ] Environment variables configured
- [ ] Database connection secured
- [ ] CORS settings updated
- [ ] SSL certificates installed
- [ ] Error monitoring setup
- [ ] Performance monitoring enabled
- [ ] Backup strategy implemented

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch:**

```bash
git checkout -b feature/amazing-feature
```

3. **Make your changes and commit:**

```bash
git commit -m 'Add amazing feature'
```

4. **Push to your branch:**

```bash
git push origin feature/amazing-feature
```

5. **Open a Pull Request**

### Contribution Guidelines

- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow the existing code style
- Ensure all tests pass

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🎯 Learning Outcomes

### What You'll Learn

- **Full-Stack Development**: Complete MERN stack application
- **TypeScript**: Type-safe development practices
- **Modern React**: Hooks, Context API, React Query
- **Database Design**: MongoDB schema design and relationships
- **Authentication**: JWT-based authentication system
- **Payment Integration**: Stripe payment processing
- **File Upload**: Cloudinary image management
- **API Design**: RESTful API with Swagger documentation
- **State Management**: Server and client state management
- **Testing**: End-to-end testing with Playwright
- **Deployment**: Production deployment strategies

### Key Concepts Demonstrated

- **Component Architecture**: Reusable, modular components
- **Form Handling**: Complex forms with validation
- **Search & Filtering**: Advanced search with multiple criteria
- **Analytics**: Real-time data visualization
- **Security**: Authentication, authorization, and data protection
- **Performance**: Optimization techniques and best practices
- **User Experience**: Responsive design and accessibility

---

## 🔗 Useful Resources

### Documentation

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Tools & Libraries

- [Vite](https://vitejs.dev/) - Fast build tool
- [Shadcn UI](https://ui.shadcn.com/) - Component library
- [React Query](https://tanstack.com/query/latest) - Data fetching
- [Stripe](https://stripe.com/docs) - Payment processing
- [Cloudinary](https://cloudinary.com/documentation) - Image management

### Best Practices

- [React Best Practices](https://react.dev/learn)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/intro.html)
- [MongoDB Best Practices](https://docs.mongodb.com/manual/data-modeling/)
- [API Design Best Practices](https://restfulapi.net/)

---

## 🎉 Happy Coding! 🎉

Feel free to use this project repository and extend this project further!

If you have any questions or want to share your work, reach out via GitHub or my portfolio at [https://arnob-mahmud.vercel.app/](https://arnob-mahmud.vercel.app/).

**Enjoy building and learning!** 🚀

Thank you! 😊
