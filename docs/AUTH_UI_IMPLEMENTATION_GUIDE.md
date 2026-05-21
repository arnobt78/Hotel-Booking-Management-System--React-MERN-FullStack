# Authentication UI Implementation Guide

## Complete Setup for Flicker-Free, Hydration-Safe Auth UI with NextAuth.js

This guide covers the complete implementation of a smooth, professional authentication UI in Next.js applications using NextAuth.js (Auth.js). It addresses all common issues including hydration mismatches, login/logout flickers, OAuth redirects, and avatar handling.

---

## Table of Contents

1. [Overview](#overview)
2. [Key Challenges Solved](#key-challenges-solved)
3. [Architecture](#architecture)
4. [Implementation](#implementation)
   - [AuthContext Setup](#1-authcontext-setup)
   - [Navbar Component](#2-navbar-component)
   - [LoginDialog Component](#3-logindialog-component)
   - [Avatar Handling](#4-avatar-handling)
5. [Configuration](#configuration)
6. [Common Issues & Solutions](#common-issues--solutions)
7. [Quick Setup Checklist](#quick-setup-checklist)

---

## Overview

This implementation provides:

- **No page refresh** on login/logout (smooth client-side transitions)
- **No hydration errors** (SSR-safe localStorage handling)
- **No UI flickers** (Login button doesn't flash before profile circle)
- **OAuth redirect handling** (skeleton shows while returning from Google)
- **Welcome/Goodbye toast messages** with user's name and emojis
- **Smart avatar system** (Google image with RoboHash fallback)
- **Dropdown menu** without body scroll issues

---

## Key Challenges Solved

| Challenge | Solution |
|-----------|----------|
| Hydration mismatch | `mounted` state + deferred localStorage read |
| Login flicker on page refresh | `wasAuthenticated` localStorage persistence |
| OAuth return flicker | Set flags BEFORE redirect to Google |
| Logout flicker | Immediate localStorage clear + state update |
| Body scroll on dropdown | `modal={false}` on DropdownMenu |
| Google image not loading | `referrerPolicy="no-referrer"` + `onError` fallback |

---

## Architecture

### State Management Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        RENDERING LOGIC                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. isAuthenticated?                                            │
│     └── YES → Show Profile Dropdown                             │
│                                                                 │
│  2. mounted && isLoading && wasAuthenticated?                   │
│     └── YES → Show Skeleton (prevents Login flicker)            │
│                                                                 │
│  3. Otherwise                                                   │
│     └── Show Login Button (default for SSR consistency)         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### localStorage Keys

```typescript
// Keys for persisting auth state
const AUTH_STATE_KEY = "navbar_was_authenticated";  // Tracks if user was logged in
const OAUTH_PENDING_KEY = "oauth_login_pending";    // Tracks pending OAuth redirect
```

---

## Implementation

### 1. AuthContext Setup

The AuthContext provides centralized auth state and a logout function that doesn't cause page refresh.

```typescript
// src/context/AuthContext.tsx

import { createContext, useContext, ReactNode, useEffect } from "react";
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "next-auth/react";

interface User {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
}

interface AuthContextType {
  user: User | undefined;
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
  loginWithRedirect: () => Promise<void>;
  logout: () => Promise<void>;  // No page refresh!
  getAccessTokenSilently: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  
  const user = session?.user as User | undefined;
  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";
  const userId = user?.id || null;

  // Store user ID in localStorage for API calls
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    if (userId && user) {
      localStorage.setItem("user_id", userId);
    } else {
      localStorage.removeItem("user_id");
      localStorage.removeItem("access_token");
    }
  }, [userId, user]);

  // Login function - redirects to Google OAuth
  const loginWithRedirect = async () => {
    await nextAuthSignIn("google", {
      callbackUrl: window.location.origin,
    });
  };

  // IMPORTANT: Logout WITHOUT page refresh for smooth UI transition
  const logout = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user_id");
      localStorage.removeItem("access_token");
    }
    // redirect: false prevents page refresh
    await nextAuthSignOut({ redirect: false });
  };

  const getAccessTokenSilently = async (): Promise<string> => {
    if (session?.user && (session.user as { accessToken?: string }).accessToken) {
      return (session.user as { accessToken: string }).accessToken;
    }
    const storedToken = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (storedToken) return storedToken;
    throw new Error("No access token available");
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    userId,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
```

---

### 2. Navbar Component

The Navbar handles all the complex auth UI states with proper SSR/hydration handling.

```typescript
// src/components/layout/Navbar.tsx

import { memo, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { User, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { LoginDialog } from "../auth/LoginDialog";
import { RegisterDialog } from "../auth/RegisterDialog";
import { toast } from "sonner";

// Keys for persisting auth state in localStorage
const AUTH_STATE_KEY = "navbar_was_authenticated";
const OAUTH_PENDING_KEY = "oauth_login_pending";

const Navbar = memo(() => {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // IMPORTANT: Initialize to false for SSR consistency
  // Will be updated from localStorage after mount
  const [wasAuthenticated, setWasAuthenticated] = useState(false);
  
  // Track previous auth state for welcome/goodbye messages
  const prevAuthRef = useRef<boolean | null>(null);
  const prevUserNameRef = useRef<string | null>(null);

  // STEP 1: Initialize wasAuthenticated from localStorage AFTER mount
  // This prevents hydration mismatch (server has no localStorage)
  useEffect(() => {
    setMounted(true);
    const storedAuth = localStorage.getItem(AUTH_STATE_KEY) === "true";
    setWasAuthenticated(storedAuth);
  }, []);

  // STEP 2: Sync auth state to localStorage and handle OAuth cleanup
  useEffect(() => {
    if (!mounted) return;  // Only run after mount
    
    const oauthPending = localStorage.getItem(OAUTH_PENDING_KEY) === "true";
    
    if (isAuthenticated) {
      // Login successful
      localStorage.setItem(AUTH_STATE_KEY, "true");
      localStorage.removeItem(OAUTH_PENDING_KEY);
      setWasAuthenticated(true);
    } else if (!isLoading) {
      // Session finished loading, user not authenticated
      if (oauthPending) {
        // OAuth was cancelled or failed
        localStorage.removeItem(AUTH_STATE_KEY);
        localStorage.removeItem(OAUTH_PENDING_KEY);
      } else {
        localStorage.removeItem(AUTH_STATE_KEY);
      }
      setWasAuthenticated(false);
    }
  }, [isAuthenticated, isLoading, mounted]);

  // STEP 3: Show welcome/goodbye toast messages
  useEffect(() => {
    if (prevAuthRef.current === null) {
      prevAuthRef.current = isAuthenticated;
      prevUserNameRef.current = user?.name || null;
      return;
    }

    // User just logged in
    if (!prevAuthRef.current && isAuthenticated && user) {
      const firstName = user.name?.split(' ')[0] || 'User';
      toast.success(
        <div className="flex items-center gap-2">
          <span className="text-2xl">👋</span>
          <div>
            <p className="font-semibold">Welcome back, {firstName}!</p>
            <p className="text-sm text-gray-500">Let&apos;s cook something amazing together!</p>
          </div>
        </div>,
        { duration: 4000 }
      );
      setIsLoggingOut(false);
    }

    // User just logged out
    if (prevAuthRef.current && !isAuthenticated && isLoggingOut) {
      const firstName = prevUserNameRef.current?.split(' ')[0] || 'User';
      toast.success(
        <div className="flex items-center gap-2">
          <span className="text-2xl">👋</span>
          <div>
            <p className="font-semibold">Goodbye, {firstName}!</p>
            <p className="text-sm text-gray-500">We&apos;ll cook together again soon!</p>
          </div>
        </div>,
        { duration: 4000 }
      );
      setIsLoggingOut(false);
    }

    prevAuthRef.current = isAuthenticated;
    prevUserNameRef.current = user?.name || null;
  }, [isAuthenticated, user, isLoggingOut]);

  // Reset avatar error when user changes
  useEffect(() => {
    setAvatarError(false);
  }, [user?.image, user?.email]);

  // Avatar URL: Google image or RoboHash fallback
  const getAvatarUrl = () => {
    if (avatarError) {
      return `https://robohash.org/${user?.name || user?.email || "user"}.png?size=80x80`;
    }
    if (user?.image && user.image.trim() !== "") {
      return user.image;
    }
    return `https://robohash.org/${user?.name || user?.email || "user"}.png?size=80x80`;
  };

  // Logout handler - clears localStorage immediately for smooth UI
  const handleLogout = async () => {
    setIsLoggingOut(true);
    if (typeof window !== "undefined") {
      localStorage.removeItem(AUTH_STATE_KEY);
      localStorage.removeItem(OAUTH_PENDING_KEY);
    }
    setWasAuthenticated(false);
    await logout();
  };

  return (
    <nav className="...">
      {/* ... Logo and other nav items ... */}
      
      <div className="flex items-center gap-2">
        {/* Auth Section - SSR-safe three-state rendering */}
        {isAuthenticated ? (
          /* STATE 1: Authenticated - Show profile dropdown */
          <DropdownMenu modal={false}> {/* modal={false} prevents body scroll */}
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-full p-0"
              >
                <div className="h-9 w-9 rounded-full border-2 overflow-hidden">
                  {/* IMPORTANT: Standard img tag with referrerPolicy for Google images */}
                  <img
                    src={getAvatarUrl()}
                    alt={user?.name || "User"}
                    className="h-full w-full object-cover"
                    onError={() => setAvatarError(true)}
                    referrerPolicy="no-referrer"  // Required for Google images!
                  />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" forceMount>
              <DropdownMenuLabel>
                <p>{user?.name || "User"}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* ... Menu items ... */}
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : mounted && isLoading && wasAuthenticated ? (
          /* STATE 2: Loading + was authenticated - Show skeleton
             CRITICAL: Only after mount to avoid hydration mismatch */
          <Skeleton className="h-9 w-9 rounded-full" />
        ) : (
          /* STATE 3: Not authenticated - Show login button
             This is also the default for SSR consistency */
          <>
            <Button
              variant="ghost"
              onClick={() => setIsLoginDialogOpen(true)}
            >
              <User className="h-4 w-4" />
              <span>Login</span>
            </Button>
            <LoginDialog
              open={isLoginDialogOpen}
              onOpenChange={setIsLoginDialogOpen}
              onSwitchToRegister={() => setIsRegisterDialogOpen(true)}
            />
            <RegisterDialog
              open={isRegisterDialogOpen}
              onOpenChange={setIsRegisterDialogOpen}
              onSwitchToLogin={() => setIsLoginDialogOpen(true)}
            />
          </>
        )}
      </div>
    </nav>
  );
});

Navbar.displayName = "Navbar";
export default Navbar;
```

---

### 3. LoginDialog Component

The LoginDialog sets localStorage flags BEFORE OAuth redirect to prevent flicker when returning.

```typescript
// src/components/auth/LoginDialog.tsx

import { useState, useCallback } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToRegister?: () => void;
}

export function LoginDialog({ open, onOpenChange, onSwitchToRegister }: LoginDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Email/Password sign-in (no redirect, smooth UI)
  const handleCredentialsSignIn = useCallback(async (data: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,  // IMPORTANT: No page refresh
      });

      if (result?.error) {
        toast.error("Invalid email or password.");
        setIsLoading(false);
      } else if (result?.ok) {
        toast.success("Signed in successfully!");
        onOpenChange(false);
        router.refresh();  // Refresh server components
        setTimeout(() => setIsLoading(false), 100);
      }
    } catch (error) {
      toast.error("Failed to sign in.");
      setIsLoading(false);
    }
  }, [router, onOpenChange]);

  // Google OAuth sign-in
  // CRITICAL: Set localStorage flags BEFORE redirect to prevent flicker on return
  const handleGoogleSignIn = useCallback(async () => {
    setIsLoading(true);
    try {
      // Set flags BEFORE redirect so Navbar shows skeleton when returning
      if (typeof window !== "undefined") {
        localStorage.setItem("navbar_was_authenticated", "true");
        localStorage.setItem("oauth_login_pending", "true");
      }
      
      await signIn("google", {
        callbackUrl: window.location.origin,
        redirect: true,
      });
    } catch (error) {
      // Clear flags on error
      if (typeof window !== "undefined") {
        localStorage.removeItem("navbar_was_authenticated");
        localStorage.removeItem("oauth_login_pending");
      }
      toast.error("Failed to sign in with Google.");
      setIsLoading(false);
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Welcome Back</DialogTitle>
        </DialogHeader>
        
        {/* Email/Password Form */}
        <form onSubmit={/* ... */}>
          {/* ... form fields ... */}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        {/* Google OAuth Button */}
        <Button
          type="button"
          disabled={isLoading}
          onClick={handleGoogleSignIn}
        >
          {/* Google icon */}
          {isLoading ? "Signing in..." : "Continue with Google"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
```

---

### 4. Avatar Handling

#### Why RoboHash?

RoboHash generates unique robot/alien avatars based on any text input. It's perfect as a fallback when users don't have a profile image.

```typescript
// Avatar URL logic
const getAvatarUrl = () => {
  // If Google image failed to load, use RoboHash
  if (avatarError) {
    return `https://robohash.org/${user?.name || user?.email || "user"}.png?size=80x80`;
  }
  
  // Use Google image if available (OAuth users)
  if (user?.image && user.image.trim() !== "") {
    return user.image;
  }
  
  // Fallback to RoboHash for email/password users
  return `https://robohash.org/${user?.name || user?.email || "user"}.png?size=80x80`;
};
```

#### Google Image Requirements

```tsx
<img
  src={getAvatarUrl()}
  alt={user?.name || "User"}
  onError={() => setAvatarError(true)}  // Fallback on load error
  referrerPolicy="no-referrer"          // REQUIRED for Google images!
/>
```

**Why `referrerPolicy="no-referrer"`?**
Google's image servers may block requests that include a referrer header from different domains. Setting `no-referrer` ensures the image loads correctly.

---

## Configuration

### auth.ts (NextAuth Configuration)

Ensure the Google profile image is passed through the session:

```typescript
// auth.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      // ... credentials config
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id;
        if (user.image) token.picture = user.image;
      }
      
      // IMPORTANT: Get Google profile picture from OAuth profile
      if (profile && account?.provider === "google") {
        const googleProfile = profile as { picture?: string };
        if (googleProfile.picture) {
          token.picture = googleProfile.picture;
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        // Pass the picture to session
        if (token.picture) {
          session.user.image = token.picture as string;
        }
      }
      return session;
    },
  },
});
```

### TypeScript Types (Optional)

```typescript
// types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      accessToken?: string;
    } & DefaultSession["user"];
  }
  interface User extends DefaultUser {
    id: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    accessToken?: string;
    picture?: string;
  }
}
```

---

## Common Issues & Solutions

### 1. Hydration Mismatch Error

**Error:**
```
Hydration failed because the server rendered HTML didn't match the client.
```

**Cause:** Reading from localStorage during initial render (localStorage doesn't exist on server).

**Solution:**
```typescript
// WRONG: Causes hydration mismatch
const [wasAuth, setWasAuth] = useState(() => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("key") === "true";
  }
  return false;
});

// CORRECT: Read after mount
const [wasAuth, setWasAuth] = useState(false);
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
  setWasAuth(localStorage.getItem("key") === "true");
}, []);

// In render: only use wasAuth after mounted
{mounted && wasAuth ? <Skeleton /> : <LoginButton />}
```

### 2. Login Button Flickers Before Profile Circle

**Cause:** Session takes time to load on page refresh.

**Solution:** Persist `wasAuthenticated` in localStorage:
```typescript
// On login success
localStorage.setItem("navbar_was_authenticated", "true");

// On page load, show skeleton while session loads
{isLoading && wasAuthenticated ? <Skeleton /> : <LoginButton />}
```

### 3. Google OAuth Return Shows Login Button

**Cause:** localStorage flags not set before redirect.

**Solution:** Set flags BEFORE redirecting to Google:
```typescript
const handleGoogleSignIn = async () => {
  localStorage.setItem("navbar_was_authenticated", "true");
  localStorage.setItem("oauth_login_pending", "true");
  await signIn("google", { callbackUrl: "/" });
};
```

### 4. Logout Shows Skeleton/Profile Before Login Button

**Cause:** localStorage not cleared immediately.

**Solution:** Clear localStorage BEFORE calling logout:
```typescript
const handleLogout = async () => {
  localStorage.removeItem("navbar_was_authenticated");
  localStorage.removeItem("oauth_login_pending");
  setWasAuthenticated(false);  // Update state immediately
  await logout();
};
```

### 5. Dropdown Menu Causes Page Scroll/Shift

**Cause:** Radix UI dropdown locks body scroll by default.

**Solution:** Set `modal={false}`:
```tsx
<DropdownMenu modal={false}>
  {/* ... */}
</DropdownMenu>
```

### 6. Google Profile Image Shows Initials/Fallback

**Cause:** Missing `referrerPolicy` or image URL not passed through session.

**Solution:**
1. Add `referrerPolicy="no-referrer"` to img tag
2. Ensure `profile.picture` is passed in auth.ts jwt callback
3. Use standard `<img>` tag instead of Next.js `<Image>` for external URLs

---

## Quick Setup Checklist

- [ ] **AuthContext** with `signOut({ redirect: false })`
- [ ] **Navbar** with three-state rendering (auth / loading+wasAuth / login)
- [ ] **mounted state** to defer localStorage read (prevents hydration error)
- [ ] **wasAuthenticated** persisted in localStorage
- [ ] **OAuth flags** set BEFORE redirect to Google
- [ ] **Logout clears localStorage** immediately before signOut
- [ ] **DropdownMenu** with `modal={false}`
- [ ] **Avatar img** with `referrerPolicy="no-referrer"` and `onError` fallback
- [ ] **auth.ts** passes `profile.picture` to session
- [ ] **Toast messages** for welcome/goodbye (optional but nice!)

---

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER ACTIONS                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  PAGE REFRESH (while logged in):                                    │
│  ─────────────────────────────────                                  │
│  1. SSR renders Login button (no localStorage)                      │
│  2. Client hydrates with Login button (matches SSR ✓)               │
│  3. useEffect runs → mounted=true, wasAuth=true (from localStorage) │
│  4. isLoading=true, wasAuth=true → Skeleton appears                 │
│  5. Session loads → isAuthenticated=true → Profile dropdown         │
│                                                                     │
│  GOOGLE LOGIN:                                                      │
│  ─────────────                                                      │
│  1. User clicks "Continue with Google"                              │
│  2. Set localStorage flags (wasAuth=true, oauthPending=true)        │
│  3. Redirect to Google                                              │
│  4. User authenticates with Google                                  │
│  5. Redirect back to app                                            │
│  6. SSR renders Login button                                        │
│  7. Client hydrates → mounted=true, wasAuth=true                    │
│  8. isLoading=true, wasAuth=true → Skeleton appears                 │
│  9. Session loads → isAuthenticated=true → Profile + Welcome toast  │
│                                                                     │
│  LOGOUT:                                                            │
│  ───────                                                            │
│  1. User clicks "Log out"                                           │
│  2. Clear localStorage immediately                                  │
│  3. Set wasAuth=false, isLoggingOut=true                            │
│  4. Call signOut({ redirect: false })                               │
│  5. Session clears → isAuthenticated=false                          │
│  6. Login button appears + Goodbye toast                            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Dependencies

```json
{
  "next-auth": "^5.x",
  "sonner": "^1.x",
  "@radix-ui/react-dropdown-menu": "^2.x",
  "lucide-react": "^0.x"
}
```

---

## Related Files

- `src/context/AuthContext.tsx` - Centralized auth state
- `src/components/layout/Navbar.tsx` - Main navigation with auth UI
- `src/components/auth/LoginDialog.tsx` - Login modal with OAuth
- `src/components/auth/RegisterDialog.tsx` - Registration modal
- `auth.ts` - NextAuth configuration
- `types/next-auth.d.ts` - TypeScript augmentations

---

## Credits

This implementation was developed for the Recipe Guide and Dev-Blog projects, addressing real-world authentication UI challenges in Next.js 15 with NextAuth.js v5.

**Last Updated:** January 2026
