# MERN Hotel Booking Website - React, Mongodb, Express.js, Node.js MERN Project

A full-stack hotel booking platform built with the MERN stack (MongoDB, Express, React, Node.js), TypeScript, Stripe, Cloudinary, and Playwright for end-to-end testing. This project demonstrates modern web development best practices, modular architecture, and real-world features for both users and developers.

- **Frontend Live-Demo:** [https://mern-booking-hotel.netlify.app/](https://mern-booking-hotel.netlify.app/)
- **Backend Live-Demo:** [https://mern-hotel-booking-68ej.onrender.com](https://mern-hotel-booking-68ej.onrender.com)

---

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Environment Variables](#environment-variables)
- [Setup & Installation](#setup--installation)
- [Running the Application](#running-the-application)
- [Testing (Playwright)](#testing-playwright)
- [API & Data Flow](#api--data-flow)
- [Deployment](#deployment)
- [Extending & Reusing](#extending--reusing)
- [Keywords](#keywords)
- [Conclusion](#conclusion)
- [Happy Coding! 🎉](#happy-coding-)

---

## Project Structure

```bash
hotel-booking/
├── data/                # Test data and hotel images
│   ├── test-hotel.json
│   ├── test-users.json
│   └── hotel_images/
├── e2e-tests/           # Playwright end-to-end tests
│   ├── tests/
│   ├── tests-examples/
│   ├── package.json
│   └── playwright.config.ts
├── hotel-booking-backend/   # Backend (Node.js, Express, MongoDB)
│   ├── src/
│   ├── package.json
│   └── README.md
├── hotel-booking-frontend/  # Frontend (React, Vite, Tailwind)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── README.md
├── shared/              # Shared TypeScript types
│   └── types.ts
├── netlify.toml         # Netlify SPA routing config
└── README.md            # This file
```

---

## Features

- User registration, login, and JWT authentication
- Hotel search with filters (stars, price, facilities, types)
- Hotel detail pages with image galleries and booking forms
- Booking management and booking history
- Stripe integration for secure payments
- Cloudinary integration for hotel images
- Toast notifications for user feedback
- Pagination and sorting for search results
- Responsive design with Tailwind CSS
- Modern React patterns (hooks, context, code splitting)
- TypeScript for type safety
- End-to-end testing with Playwright

---

## Technology Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, React Query, React Router, Stripe, Cloudinary
- **Backend:** Node.js, Express, MongoDB, Mongoose, TypeScript, JWT, bcryptjs, Stripe, Cloudinary
- **Testing:** Playwright (e2e), Jest (unit, optional)
- **DevOps:** Netlify (frontend), Render (backend), MongoDB Atlas, Cloudinary, Stripe
- **Shared:** TypeScript types for type safety across frontend and backend

---

## Environment Variables

### Backend (`hotel-booking-backend/.env`)

```env
MONGODB_CONNECTION_STRING=
JWT_SECRET_KEY=
FRONTEND_URL=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Stripe
STRIPE_API_KEY=
```

### Frontend (`hotel-booking-frontend/.env`)

```env
VITE_API_BASE_URL=
VITE_STRIPE_PUB_KEY=
```

---

## Setup & Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/mern-hotel-booking.git
    cd mern-hotel-booking
    ```

2. **Install dependencies:**

- Backend: `cd hotel-booking-backend && npm install`
- Frontend: `cd hotel-booking-frontend && npm install`
- E2E Tests: `cd e2e-tests && npm install`

3. **Configure environment variables:**  

- See above for required variables in each `.env` file.

4. **Import test data (optional):**

- Use the files in `data/` to seed your MongoDB database for testing.

---

## Running the Application

- **Backend:**

    ```bash
    cd hotel-booking-backend
    npm run dev   # for development
    npm start     # for production
    ```

- **Frontend:**

    ```bash
    cd hotel-booking-frontend
    npm run dev   # for development
    npm run build && npm run preview   # for production
    ```

- The app will be available at [http://localhost:5174](http://localhost:5174) (frontend) and [http://localhost:7001](http://localhost:7001) (backend).

---

## Testing (Playwright)

- **Run E2E tests:**

    ```bash
    cd e2e-tests
    npm install
    # Start both frontend and backend servers first!
    npx playwright test
    ```

- **Test Data:**  

Use the JSON files in `data/` to seed your database for consistent test results.

- **Test Files:**  

- `e2e-tests/tests/auth.spec.ts` — Authentication flows
- `e2e-tests/tests/manage-hotels.spec.ts` — Hotel management
- `e2e-tests/tests/search-hotels.spec.ts` — Hotel search

---

## API & Data Flow

- **API:**  
The backend exposes RESTful endpoints for authentication, users, hotels, and bookings.

See backend/README.md for full API documentation.

- **Data Flow:**  

- Frontend uses React Query to fetch and cache data from the backend.
- Authentication is managed with JWT and cookies.
- Payments are processed via Stripe.
- Images are uploaded to Cloudinary via the backend.

- **Shared Types:**  

All domain types (User, Hotel, Booking, etc.) are defined in `shared/types.ts` and imported in both frontend and backend for type safety.

---

## Deployment

- **Frontend:** Deploy to Netlify.  

- Build command: `npm run build`
- Publish directory: `dist`
- SPA routing handled via `netlify.toml`

- **Backend:** Deploy to Render.  

- Build command: `npm run build`
- Start command: `npm start`
- Set all required environment variables in Render dashboard.

- **Database:** Use MongoDB Atlas for production.

- **Other Services:**  

- Cloudinary for image uploads  
- Stripe for payments

---

## Extending & Reusing

- **Components:** All UI components are reusable and can be imported anywhere in the frontend.
- **Hooks:** Custom hooks in `src/hooks/` for context and logic.
- **Forms:** Modular form components for booking, guest info, and hotel management.
- **API Client:** Centralized API logic for easy integration with other projects.
- **Config:** Easily add new filters or options via `src/config/`.
- **Backend:** Add new models, routes, or middleware as needed.
- **Types:** Use and extend types from `shared/types.ts` for type safety across backend and frontend.

---

## Keywords

`React`, `TypeScript`, `Vite`, `Tailwind CSS`, `Stripe`, `Cloudinary`, `React Query`, `React Router`, `Node.js`, `Express`, `MongoDB`, `Mongoose`, `JWT`, `bcryptjs`, `REST API`, `MERN`, `SPA`, `Full Stack`, `Reusable Components`, `Open Source`, `Netlify`, `Render`, `Playwright`, `Testing`, `Learning`, `Project Based Learning`

---

## Conclusion

This project is designed for real-world hotel booking applications, learning, and rapid prototyping. It is modular, extensible, and ready for production deployment. Pair the frontend and backend for a complete MERN stack experience!

---

## Happy Coding! 🎉

Feel free to use this project repository and extend this project further!

If you have any questions or want to share your work, reach out via GitHub or my portfolio at [https://arnob-mahmud.vercel.app/](https://arnob-mahmud.vercel.app/).

**Enjoy building and learning!** 🚀

Thank you! 😊

---
