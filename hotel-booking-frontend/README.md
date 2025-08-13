# MERN Hotel Booking Frontend - React-Vite, Express.js Project

A modern, responsive frontend for the MERN Hotel Booking platform, built with React, TypeScript, Vite, and Tailwind CSS. This app provides a seamless hotel search, booking, and management experience, integrating with a Node.js/Express backend and third-party services like Stripe and Cloudinary.

- **Live-Demo:** []()

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Environment Variables](#environment-variables)
- [Setup & Installation](#setup--installation)
- [Running the Frontend Locally](#running-the-frontend-locally)
- [Key Components & Pages](#key-components--pages)
- [API & Data Flow](#api--data-flow)
- [Styling & Assets](#styling--assets)
- [Deployment (Netlify)](#deployment-netlify)
- [Extending & Reusing](#extending--reusing)
- [Keywords](#keywords)
- [Conclusion](#conclusion)
- [Happy Coding! 🎉](#happy-coding-)

---

## Project Overview

This frontend is the user-facing part of a full-stack hotel booking platform. Users can search for hotels, filter results, view hotel details, register/login, book rooms, and manage their bookings. The app is optimized for performance, accessibility, and mobile responsiveness.

---

## Features

- User registration and login
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

---

## Project Structure

```bash
hotel-booking-frontend/
├── public/
│   └── vite.svg                # App icon
├── src/
│   ├── api-client.ts           # API calls to backend
│   ├── assets/                 # Static assets
│   ├── components/             # Reusable UI components
│   ├── config/                 # App configuration (filters, etc.)
│   ├── contexts/               # React context providers
│   ├── forms/                  # Form components (Booking, Guest, Hotel)
│   ├── hooks/                  # Custom React hooks
│   ├── layouts/                # Layout components
│   ├── pages/                  # Route-level pages (Home, Search, Detail, etc.)
│   ├── index.css               # Tailwind and global styles
│   ├── main.tsx                # App entry point
│   └── vite-env.d.ts           # Vite/TypeScript env types
├── index.html                  # HTML template with SEO metadata
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md                   # This file
```

---

## Technology Stack

- **React 18**: UI library
- **TypeScript**: Type safety
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **React Query**: Data fetching and caching
- **React Router**: Client-side routing
- **Stripe**: Payment processing
- **Cloudinary**: Image hosting
- **ESLint**: Linting and code quality
- **Jest/Playwright**: Testing (see e2e-tests)

---

## Environment Variables

Create a `.env` file in the frontend root with:

```env
VITE_API_BASE_URL=http://localhost:7001
VITE_STRIPE_PUB_KEY=your_stripe_publishable_key
```

- `VITE_API_BASE_URL`: URL of your backend server (local or deployed)
- `VITE_STRIPE_PUB_KEY`: Stripe publishable key for payments

---

## Setup & Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/mern-hotel-booking.git
   cd mern-hotel-booking/hotel-booking-frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env` and fill in your credentials.

---

## Running the Frontend Locally

- **Development mode:**

```bash
   npm run dev
   ```

The app will run on [http://localhost:5174](http://localhost:5174) by default.

- **Production build:**

   ```bash
   npm run build
   npm run preview
   ```

---

## Key Components & Pages

- **Home**: Landing page with hero, search bar, and featured hotels
- **Search**: Hotel search results with filters and pagination
- **Detail**: Hotel details, image gallery, and booking form
- **Booking**: Booking summary and Stripe payment
- **MyBookings**: User's booking history
- **MyHotels**: Hotel management for owners
- **Register/SignIn**: User authentication
- **Header/Footer**: Navigation and site info
- **Toast**: Notification system

### Example: Using a Component

```tsx
import SearchBar from './components/SearchBar';

function HomePage() {
   return (
      <div>
         <SearchBar />
         {/* ...other content... */}
      </div>
   );
}
```

---

## API & Data Flow

- All API calls are made via `src/api-client.ts` using fetch and React Query.
- Authentication is managed with cookies and JWT.
- Data is fetched and cached with React Query for performance.
- Payments are handled via Stripe Elements and the backend API.
- Images are uploaded to Cloudinary via the backend.

---

## Styling & Assets

- **Tailwind CSS** is used for all styling. Customize via `tailwind.config.js`.
- **SVG Icon**: Located at `public/vite.svg` and used as favicon and social image.
- **Responsive**: All pages are mobile-friendly.

---

## Deployment (Netlify)

1. **Push your code to GitHub.**
2. **Connect your repo to Netlify.**
3. **Set build command:** `npm run build`
4. **Set publish directory:** `dist`
5. **Add environment variables in Netlify dashboard.**
6. **All routes are handled via SPA fallback (see `netlify.toml`).**

---

## Extending & Reusing

- **Components**: All UI components are reusable and can be imported anywhere.
- **Hooks**: Custom hooks in `src/hooks/` for context and logic.
- **Forms**: Modular form components for booking, guest info, and hotel management.
- **API Client**: Centralized API logic for easy integration with other projects.
- **Config**: Easily add new filters or options via `src/config/`.

---

## Keywords

`React`, `TypeScript`, `Vite`, `Tailwind CSS`, `Stripe`, `Cloudinary`, `React Query`, `React Router`, `Hotel Booking`, `MERN`, `SPA`, `Frontend`, `Reusable Components`, `Open Source`, `Netlify`, `Learning`, `Project Based Learning`

---

## Conclusion

This frontend is designed for real-world hotel booking applications, learning, and rapid prototyping. It is modular, extensible, and ready for production deployment. Pair it with the backend for a complete MERN stack experience!

---

## Happy Coding! 🎉

Feel free to use this project repository and extend this project further!

If you have any questions or want to share your work, reach out via GitHub or my portfolio at [https://arnob-mahmud.vercel.app/](https://arnob-mahmud.vercel.app/).

**Enjoy building and learning!** 🚀

Thank you! 😊

---
