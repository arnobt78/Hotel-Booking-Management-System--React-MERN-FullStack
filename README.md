# Hotel Booking Platform - Enhanced Features

A comprehensive hotel booking platform built with React, TypeScript, Node.js, and MongoDB. This project now includes advanced features for API documentation, health monitoring, analytics, and enhanced search capabilities.

## 🚀 New Features Added

### 1. API Documentation (`/api-docs`)

- **Interactive Swagger UI**: Complete API documentation with testing capabilities
- **Endpoint Categories**: Organized by Authentication, Users, Hotels, Bookings, Health & Analytics
- **Authentication Guide**: JWT token-based authentication documentation
- **Rate Limiting Info**: API usage limits and guidelines
- **Error Handling**: Standard error responses and status codes

### 2. API Status Monitoring (`/api-status`)

- **Real-time Health Checks**: Live monitoring of API health status
- **Database Connection Status**: MongoDB connection monitoring
- **System Metrics**: Memory usage, CPU usage, uptime tracking
- **Performance Indicators**: Response times and error rates
- **Auto-refresh**: Updates every 30 seconds for real-time monitoring

### 3. Analytics Dashboard (`/analytics`)

- **Business Intelligence**: Comprehensive analytics and insights
- **Revenue Tracking**: Total revenue, growth percentages, trends
- **Booking Analytics**: Daily booking trends, popular destinations
- **Hotel Performance**: Top-performing hotels with metrics
- **Forecasting**: AI-powered booking and revenue predictions
- **Interactive Charts**: Bar charts, pie charts, line charts, area charts

### 4. Enhanced Search (`/search`)

- **Advanced Filters**: Price range, star rating, hotel type, facilities
- **Quick Search**: Popular destinations with one-click search
- **Sorting Options**: Relevance, price, rating, distance
- **Facility Filters**: WiFi, parking, pool, gym, spa, breakfast
- **Search Radius**: Configurable search area (10-100km)
- **Instant Booking**: Filter for instant booking options

## 🛠️ Technical Stack

### Frontend

- **React 18** with TypeScript
- **React Router** for navigation
- **React Query** for data fetching
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Lucide React** for icons
- **React Hook Form** for form handling

### Backend

- **Node.js** with TypeScript
- **Express.js** framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Swagger UI** for API documentation
- **Helmet** for security headers
- **Morgan** for logging
- **Compression** for response compression
- **Rate Limiting** for API protection

### Additional Libraries

- **Cloudinary** for image uploads
- **Stripe** for payment processing
- **bcryptjs** for password hashing
- **cors** for cross-origin requests

## 📊 Analytics Features

### Dashboard Overview

- Total hotels, users, and bookings
- Revenue growth tracking
- Recent booking trends
- Popular destinations analysis

### Forecasting

- Booking trend predictions
- Revenue forecasting
- Seasonal growth analysis
- Confidence intervals

### Performance Metrics

- System resource monitoring
- Database performance
- Response time tracking
- Error rate monitoring

## 🔍 Search Enhancements

### Advanced Filters

- **Price Range**: Min/max price filtering
- **Star Rating**: 2-5 star hotel filtering

## 🛠️ Development Notes

### Authentication State Persistence

During development, authentication state persists between sessions using HTTP-only cookies. This means:

- **Expected Behavior**: When you close the browser or stop the development server, your login state is preserved
- **Development Tools**: Use the "Clear Auth" and "Clear All" buttons in the header (development mode only)
- **Production Behavior**: In production, this provides better user experience with persistent sessions

### Development Utilities

The application includes development-only utilities accessible from the header:

- **Clear Auth**: Clears authentication cookies and redirects to sign-in
- **Clear All**: Clears all browser storage (localStorage, sessionStorage, cookies)
- **Development Banner**: Yellow banner indicating development mode

### Getting Started

1. **Start Backend**: `cd hotel-booking-backend && npm run dev`
2. **Start Frontend**: `cd hotel-booking-frontend && npm run dev`
3. **Clear Auth State**: If you see unexpected login state, use the "Clear Auth" button
4. **Database**: Ensure MongoDB is running locally or update connection string

- **Hotel Types**: Hotel, Resort, Motel, Hostel, etc.
- **Facilities**: WiFi, parking, pool, gym, spa, breakfast
- **Booking Options**: Instant booking, free cancellation

### Quick Search

- Popular destinations
- One-click search functionality
- Recent searches
- Search suggestions

## 🏥 Health Monitoring

### API Health Endpoints

- `/api/health` - Basic health status
- `/api/health/detailed` - Detailed system metrics

### Monitoring Features

- Database connection status
- Memory usage tracking
- CPU usage monitoring
- Uptime tracking
- Error rate monitoring

## 🔐 Security Features

### API Protection

- Rate limiting (100 requests per 15 minutes)
- Security headers with Helmet
- CORS configuration
- Input validation
- Error handling

### Authentication

- JWT token-based authentication
- HTTP-only cookies
- Secure password hashing
- Token validation

## 📈 Business Intelligence

### Revenue Analytics

- Total revenue tracking
- Revenue growth percentages
- Revenue forecasting
- Seasonal analysis

### Booking Analytics

- Daily booking trends
- Popular destinations
- Hotel performance metrics
- Booking patterns

### User Analytics

- User growth tracking
- User behavior analysis
- Conversion rates
- User engagement metrics

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd hotel-booking
```

2. **Install dependencies**

```bash
# Backend
cd hotel-booking-backend
npm install

# Frontend
cd ../hotel-booking-frontend
npm install
```

3. **Environment Setup**

```bash
# Backend (.env)
MONGODB_CONNECTION_STRING=your_mongodb_connection
JWT_SECRET_KEY=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
FRONTEND_URL=http://localhost:5174

# Frontend (.env)
VITE_API_BASE_URL=http://localhost:7001
```

4. **Start the application**

```bash
# Backend
cd hotel-booking-backend
npm run dev

# Frontend
cd ../hotel-booking-frontend
npm run dev
```

## 📚 API Documentation

### Access Swagger UI

Visit `http://localhost:7001/api-docs` for interactive API documentation.

### API Endpoints

#### Authentication

- `POST /api/auth/login` - User login
- `GET /api/auth/validate-token` - Validate token
- `POST /api/auth/logout` - User logout

#### Users

- `POST /api/users/register` - Register new user
- `GET /api/users/me` - Get current user

#### Hotels

- `GET /api/hotels` - Get all hotels
- `GET /api/hotels/search` - Search hotels
- `GET /api/hotels/:id` - Get hotel by ID
- `POST /api/my-hotels` - Add hotel
- `GET /api/my-hotels` - Get user's hotels
- `PUT /api/my-hotels/:id` - Update hotel
- `DELETE /api/my-hotels/:id` - Delete hotel

#### Bookings

- `POST /api/hotels/:id/bookings` - Create booking
- `GET /api/my-bookings` - Get user's bookings
- `POST /api/hotels/:id/bookings/payment-intent` - Create payment intent

#### Health & Analytics

- `GET /api/health` - API health status
- `GET /api/health/detailed` - Detailed health info
- `GET /api/analytics/dashboard` - Analytics dashboard
- `GET /api/analytics/forecast` - Booking forecasts
- `GET /api/analytics/performance` - Performance metrics

## 🎯 Key Features

### User Experience

- **Responsive Design**: Mobile-first approach
- **Real-time Updates**: Live data refresh
- **Interactive Charts**: Data visualization
- **Advanced Search**: Comprehensive filtering
- **Quick Actions**: One-click operations

### Developer Experience

- **TypeScript**: Full type safety
- **API Documentation**: Interactive Swagger UI
- **Health Monitoring**: Real-time system status
- **Error Handling**: Comprehensive error management
- **Code Quality**: ESLint and Prettier configuration

### Business Features

- **Analytics Dashboard**: Business intelligence
- **Revenue Tracking**: Financial insights
- **Forecasting**: Predictive analytics
- **Performance Monitoring**: System health
- **Search Optimization**: Advanced filtering

## 🔧 Configuration

### Environment Variables

All sensitive configuration is managed through environment variables for security.

### Database

MongoDB with Mongoose ODM for data modeling and validation.

### File Upload

Cloudinary integration for secure image uploads and storage.

### Payments

Stripe integration for secure payment processing.

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🤝 Support

For support and questions:

- Create an issue in the repository
- Contact: <support@mernholidays.com>

---

**Built with ❤️ using modern web technologies**
