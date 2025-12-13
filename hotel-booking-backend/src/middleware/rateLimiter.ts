// src/middleware/rateLimiter.ts

import rateLimit from "express-rate-limit";

// Ograničenje za osjetljive rute poput login/registracije
// 5 pokušaja unutar 15 minuta po IP adresi
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuta
  max: 5, // Maksimalno 5 zahtjeva po IP adresi
  message: JSON.stringify({
    message: "Too many requests, please try again after 15 minutes",
    status: 429,
  }),
  standardHeaders: true,
  legacyHeaders: false,
});

// Ograničenje za opće javne rute (ako ih ima)
export const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minuta
  max: 100, // Maksimalno 100 zahtjeva po IP adresi
  message: "Too many requests created from this IP, please try again after an hour",
  standardHeaders: true,
  legacyHeaders: false,
});