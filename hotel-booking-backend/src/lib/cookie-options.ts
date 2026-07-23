/**
 * Shared cookie options for auth cookies behind HTTPS reverse proxies.
 * Production: secure + sameSite none (cross-origin FE/BE).
 */
export const authCookieOptions = (maxAgeMs = 86400000) => {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: (isProd ? "none" : "lax") as "none" | "lax",
    maxAge: maxAgeMs,
    path: "/",
  };
};

export const clearAuthCookieOptions = () => {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: (isProd ? "none" : "lax") as "none" | "lax",
    expires: new Date(0),
    path: "/",
  };
};
