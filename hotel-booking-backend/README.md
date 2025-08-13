# MERN Hotel Booking Backend - React-Vite, Express.js Project

A robust, scalable backend for a full-stack hotel booking application, built with Node.js, Express, MongoDB, and TypeScript. This backend powers the MERN Hotel Booking platform, providing secure authentication, hotel management, booking, and user APIs.

- **Live-Demo:** []()

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Environment Variables](#environment-variables)
- [Setup & Installation](#setup--installation)
- [Running the Backend Locally](#running-the-backend-locally)
- [API Endpoints](#api-endpoints)
- [Deployment (Render)](#deployment-render)
- [Extending & Reusing](#extending--reusing)
- [Keywords](#keywords)
- [Conclusion](#conclusion)
- [Happy Coding! 🎉](#happy-coding-)

---

## Project Overview

This backend is the core of a modern hotel booking platform. It handles user authentication, hotel CRUD operations, booking management, and integrates with third-party services like Stripe for payments and Cloudinary for image uploads. Designed for learning, production, and extensibility.

---

## Features

- User registration, login, and JWT-based authentication
- Secure password hashing with bcrypt
- Hotel CRUD: add, edit, delete, and list hotels
- Booking management: create, view, and manage bookings
- Image upload and storage via Cloudinary
- Payment integration with Stripe
- RESTful API with clear separation of concerns
- TypeScript for type safety and maintainability
- Environment-based configuration
- CORS and cookie management for secure frontend-backend communication

---

## Project Structure

```bash
hotel-booking-backend/
├── src/
│   ├── index.ts              # Entry point, Express app setup
│   ├── middleware/           # (Auth, error handling, etc.)
│   ├── models/               # Mongoose models (User, Hotel)
│   ├── routes/               # Express route handlers (auth, hotels, bookings, users)
│   └── shared/               # (Types moved to shared/types.ts at project root)
├── package.json
├── tsconfig.json
├── .env                      # Environment variables (see below)
└── README.md                 # This file
```

---

## Technology Stack

- **Node.js** & **Express**: Server and REST API
- **MongoDB** & **Mongoose**: Database and ODM
- **TypeScript**: Type safety
- **Cloudinary**: Image hosting
- **Stripe**: Payment processing
- **JWT**: Authentication
- **bcryptjs**: Password hashing
- **dotenv**: Environment variable management

---

## Environment Variables

Create a `.env` file in the backend root with the following:

```env
MONGODB_CONNECTION_STRING=your_mongodb_connection_string
JWT_SECRET_KEY=your_jwt_secret
FRONTEND_URL=http://localhost:5174

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe
STRIPE_API_KEY=your_stripe_secret_key
```

---

## Setup & Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/mern-hotel-booking.git
    cd mern-hotel-booking/hotel-booking-backend
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Configure environment variables:**

    - Copy `.env.example` to `.env` and fill in your credentials.

4. **Build the project:**

    ```bash
    npm run build
    ```

---

## Running the Backend Locally

```bash
npm run dev
```

- **Development mode (with hot reload):**

  ```bash
  npm run dev
  ```

- **Production mode:**

  ```bash
  npm start
  ```

- The server will run on [http://localhost:7001](http://localhost:7001) by default.

---

## API Endpoints

### Authentication

- `POST /api/auth/login` — User login
- `POST /api/auth/logout` — User logout
- `GET /api/auth/validate-token` — Validate JWT

### Users

- `POST /api/users/register` — Register a new user
- `GET /api/users/me` — Get current user profile

### Hotels

- `GET /api/hotels` — List all hotels
- `GET /api/hotels/:id` — Get hotel by ID
- `GET /api/hotels/search` — Search hotels (by filters)
- `POST /api/my-hotels` — Add a new hotel (auth required)
- `PUT /api/my-hotels/:id` — Update hotel (auth required)
- `DELETE /api/my-hotels/:id` — Delete hotel (auth required)

### Bookings

- `GET /api/my-bookings` — List bookings for current user
- `POST /api/hotels/:id/bookings` — Book a hotel
- `POST /api/hotels/:id/bookings/payment-intent` — Create Stripe payment intent

### Example: Register a User

```http
POST /api/users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

---

## Deployment (Render)

1. **Push your code to GitHub.**
2. **Create a new Web Service on [Render](https://render.com/):**
    - Connect your repo.
    - Set build command: `npm run build`
    - Set start command: `npm start`
    - Add all required environment variables in the Render dashboard.
3. **Set up a MongoDB Atlas cluster and update your connection string.**
4. **Set up Cloudinary and Stripe accounts for production keys.**
5. **Point your frontend (Netlify) to the Render backend URL.**

---

## Extending & Reusing

- **Models:** Add new fields or models in `src/models/`.
- **Routes:** Add new endpoints in `src/routes/`.
- **Middleware:** Add authentication, logging, or error handling in `src/middleware/`.
- **Types:** Use and extend types from `shared/types.ts` for type safety across backend and frontend.
- **API:** The RESTful structure makes it easy to integrate with any frontend or mobile app.

---

## Keywords

`Node.js`, `Express`, `MongoDB`, `Mongoose`, `TypeScript`, `Cloudinary`, `Stripe`, `JWT`, `bcryptjs`, `REST API`, `MERN`, `Hotel Booking`, `Authentication`, `Booking System`, `Full Stack`, `Render`, `Netlify`, `Open Source`, `Reusable`, `Learning`, `Project Based Learning`

---

## Conclusion

This backend is designed for real-world hotel booking applications, learning, and rapid prototyping. It is modular, extensible, and ready for production deployment. Pair it with the frontend for a complete MERN stack experience!

---

## Happy Coding! 🎉

Feel free to use this project repository and extend this project further!

If you have any questions or want to share your work, reach out via GitHub or my portfolio at [https://arnob-mahmud.vercel.app/](https://arnob-mahmud.vercel.app/).

**Enjoy building and learning!** 🚀

Thank you! 😊

---
