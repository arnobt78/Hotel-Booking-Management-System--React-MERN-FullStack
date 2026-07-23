# Clerk Auth Complete Implementation Guide

**Portable guide** – Use this to implement the exact same Clerk auth setup in any Next.js project.

### Guest User (Test Account)

- **Dropdown**: "Login with Test Account" on sign-in page
- **Test User**: test@user.com / 12345678
- **URL**: `/sign-in?guest=true` to pre-fill credentials

### Layout

- Server logic in `page.tsx`, client logic in components
- Same layout as landing: logo header, two-column grid, illustration on left
- Uses existing project styles (shadcn, Tailwind, light/dark mode)

---

## Table of Contents

1. [Overview](#overview)
2. [Clerk Dashboard Setup](#clerk-dashboard-setup)
3. [Environment Variables](#environment-variables)
4. [Dependencies](#dependencies)
5. [File Structure](#file-structure)
6. [Implementation](#implementation)
7. [Migration Script (Switching Clerk Apps)](#migration-script-switching-clerk-apps)
8. [Quick Checklist](#quick-checklist)

---

## Overview

### What This Implements

| Feature                 | Description                                             |
| ----------------------- | ------------------------------------------------------- |
| **Guest User Dropdown** | Test account (test@user.com / 12345678) on sign-in page |
| **Custom Sign-In**      | Email/password + Google + GitHub OAuth                  |
| **Custom Sign-Up**      | Clerk SignUp component in project layout                |
| **Profile Dropdown**    | Manage account, Sign out, theme-aware                   |
| **Light/Dark Mode**     | next-themes with system preference                      |
| **Architecture**        | Server logic in page.tsx, client logic in components    |

### Architecture

- **Server Components** (`page.tsx`): Layout, search params, prefetch
- **Client Components**: Forms, dropdowns, OAuth, theme toggle
- **Layout**: Same as landing page (logo, main illustration, grid)

---

## Clerk Dashboard Setup

### 1. Create Application

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. **Create application** → Choose **Individual** (not shared)
3. Enable **Email** and **Password** for sign-up

### 2. Configure Authentication Methods

**User & Authentication → Email, Phone, Username**

- Enable **Email address**
- Enable **Password** (for email/password sign-up)

**User & Authentication → Social Connections**

- Enable **Google**
- Enable **GitHub**
- Configure OAuth credentials in each provider’s dashboard

### 3. Password Settings (for test user)

**User & Authentication → Password**

- Turn **OFF** “Reject compromised passwords” (for test password `12345678`)
- Or use a stronger test password and keep it on

### 4. Create Test User

**Users → Create user**

- Email: `test@user.com`
- Password: `12345678`
- (Or your chosen test credentials)

### 5. Redirect URLs

**Paths** (or equivalent):

- Sign-in URL: `/sign-in`
- Sign-up URL: `/sign-up`
- After sign-in: `/add-job` (or your app’s default)
- After sign-up: `/add-job`

---

## Environment Variables

### `.env.local` (never commit)

```env
# Required - from Clerk Dashboard → API Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# Custom auth paths
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_USER_PROFILE_URL=/user-profile

# Redirect after auth (OAuth + email/password)
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/add-job
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/add-job
```

### Vercel Production

- Add all variables above
- Use **production** keys (`pk_live_*`, `sk_live_*`) for production

---

## Dependencies

```bash
npm install @clerk/nextjs next-themes
# If using shadcn/ui (recommended):
npx shadcn-ui@latest add dropdown-menu button input label select skeleton toast separator
```

Required packages:

- `@clerk/nextjs` – Auth
- `next-themes` – Light/dark mode
- Radix UI (via shadcn) – Dropdowns, forms, etc.

---

## File Structure

```
app/
├── layout.tsx                 # ClerkProvider, html/body
├── providers.tsx              # ThemeProvider, QueryClient, Toaster
├── page.tsx                   # Landing (logo, CTA)
├── sign-in/
│   ├── [[...sign-in]]/
│   │   └── page.tsx           # Server: layout + SignInForm
│   └── sso-callback/
│       └── page.tsx           # OAuth callback
├── sign-up/
│   └── [[...sign-up]]/
│       └── page.tsx           # Server: layout + SignUpWrapper
└── user-profile/
    └── [[...user-profile]]/
        └── page.tsx          # Clerk UserProfile + Back link

components/
├── SignInForm.tsx             # Client: Guest dropdown, email/pass, OAuth
├── SignUpWrapper.tsx         # Client: Clerk SignUp + skeleton
├── UserProfileDropdown.tsx   # Client: Avatar, Manage, Sign out
├── ThemeToggle.tsx           # Client: Light/Dark/System
├── theme-provider.tsx        # next-themes wrapper
└── ui/                       # shadcn components
    ├── button.tsx
    ├── dropdown-menu.tsx
    ├── input.tsx
    ├── label.tsx
    ├── select.tsx
    ├── skeleton.tsx
    ├── separator.tsx
    └── toast.tsx

middleware.ts                 # clerkMiddleware + protected routes
```

---

## Implementation

### 1. Root Layout (`app/layout.tsx`)

```tsx
import { ClerkProvider } from "@clerk/nextjs";
import Providers from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider signInUrl="/sign-in" signUpUrl="/sign-up">
      <html lang="en" suppressHydrationWarning>
        <body suppressHydrationWarning>
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
```

### 2. Providers (`app/providers.tsx`)

```tsx
"use client";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Toaster />
      {children}
    </ThemeProvider>
  );
}
```

### 3. Theme Provider (`components/theme-provider.tsx`)

```tsx
"use client";
import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

### 4. Middleware (`middleware.ts`)

```ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/add-job",
  "/jobs(.*)",
  "/stats",
  "/user-profile(.*)",
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

### 5. Sign-In Page (`app/sign-in/[[...sign-in]]/page.tsx`)

**Server Component** – layout + client form.

```tsx
import Image from "next/image";
import SignInForm from "@/components/SignInForm";

interface SignInPageProps {
  searchParams?: { guest?: string };
}

export default function SignInPage({ searchParams }: SignInPageProps) {
  const isGuest = searchParams?.guest === "true";

  return (
    <main>
      <header className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
        <Image src="/logo.svg" alt="logo" width={164} height={50} priority />
      </header>
      <section className="max-w-7xl mx-auto px-4 sm:px-8 h-screen -mt-20 grid lg:grid-cols-[1fr,400px] items-center">
        <Image
          src="/main.svg"
          alt="illustration"
          className="hidden lg:block"
          width={400}
          height={400}
        />
        <SignInForm isGuest={isGuest} />
      </section>
    </main>
  );
}
```

### 6. Sign-In Form (`components/SignInForm.tsx`)

**Client Component** – Guest dropdown, email/password, OAuth.

```tsx
"use client";

import { OAuthStrategy } from "@clerk/types";
import { useSignIn } from "@clerk/nextjs";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

const testAccounts = {
  "guest-user": {
    name: "Test User",
    email: "test@user.com",
    password: "12345678",
  },
};

interface SignInFormProps {
  isGuest?: boolean;
}

export default function SignInForm({ isGuest = false }: SignInFormProps) {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isGuest) {
      setSelectedRole("guest-user");
      const account = testAccounts["guest-user"];
      setEmail(account.email);
      setPassword(account.password);
    }
  }, [isGuest]);

  const handleRoleSelect = (value: string) => {
    if (value === "clear") {
      setSelectedRole("");
      setEmail("");
      setPassword("");
    } else {
      setSelectedRole(value);
      const account = testAccounts[value as keyof typeof testAccounts];
      if (account) {
        setEmail(account.email);
        setPassword(account.password);
      }
    }
  };

  const handleOAuthSignIn = (strategy: OAuthStrategy) => {
    if (!signIn) return;
    signIn.authenticateWithRedirect({
      strategy,
      redirectUrl: "/sign-in/sso-callback",
      redirectUrlComplete: "/add-job",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoading(true);
    try {
      const result = await signIn!.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive!({ session: result.createdSessionId });
        window.location.href = "/add-job";
        return;
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Invalid email or password.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-muted p-8 rounded-xl">
          <div className="space-y-2 mb-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center">
              <Skeleton className="h-4 w-6 rounded" />
            </div>
          </div>
          <div className="space-y-4 mb-4">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="flex justify-center">
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-muted p-8 rounded-xl">
        <div className="space-y-2 mb-6">
          <h1 className="text-2xl font-medium">Welcome back</h1>
          <p className="text-muted-foreground">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="guest-select">Login with Test Account</Label>
            <Select
              key={`select-${selectedRole || "empty"}`}
              value={selectedRole || undefined}
              onValueChange={handleRoleSelect}
            >
              <SelectTrigger id="guest-select">
                <SelectValue placeholder="Select Role Based Test Account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="guest-user">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Test User</span>
                    <span className="text-xs text-muted-foreground">
                      test@user.com
                    </span>
                  </div>
                </SelectItem>
                {selectedRole && (
                  <SelectItem
                    value="clear"
                    className="opacity-60 focus:opacity-100"
                  >
                    Clear Selection
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-muted px-2 text-muted-foreground">or</span>
          </div>
        </div>

        <div className="space-y-4 mb-4">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => handleOAuthSignIn("oauth_google")}
            disabled={!isLoaded}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => handleOAuthSignIn("oauth_github")}
            disabled={!isLoaded}
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Continue with GitHub
          </Button>
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="text-primary font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
```

### 7. SSO Callback (`app/sign-in/sso-callback/page.tsx`)

```tsx
import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallbackPage() {
  return (
    <>
      <AuthenticateWithRedirectCallback />
      <div id="clerk-captcha" />
    </>
  );
}
```

### 8. Sign-Up Page (`app/sign-up/[[...sign-up]]/page.tsx`)

```tsx
import Image from "next/image";
import SignUpWrapper from "@/components/SignUpWrapper";

export default function SignUpPage() {
  return (
    <main>
      <header className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
        <Image src="/logo.svg" alt="logo" width={164} height={50} priority />
      </header>
      <section className="max-w-7xl mx-auto px-4 sm:px-8 h-screen -mt-20 grid lg:grid-cols-[1fr,400px] items-center">
        <Image
          src="/main.svg"
          alt="illustration"
          className="hidden lg:block"
          width={400}
          height={400}
        />
        <div className="flex justify-center">
          <SignUpWrapper />
        </div>
      </section>
    </main>
  );
}
```

### 9. Sign-Up Wrapper (`components/SignUpWrapper.tsx`)

```tsx
"use client";

import { useAuth } from "@clerk/nextjs";
import { SignUp } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton";

export default function SignUpWrapper() {
  const { isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div className="w-full max-w-[400px]">
        <div className="bg-muted p-8 rounded-xl">
          <div className="space-y-2 mb-6">
            <Skeleton className="h-8 w-52" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="space-y-4 mb-4">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center">
              <Skeleton className="h-4 w-6 rounded" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="flex justify-center mt-4">
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <SignUp
      signInUrl="/sign-in"
      afterSignUpUrl="/add-job"
      appearance={{
        elements: { rootBox: "mx-auto" },
      }}
    />
  );
}
```

### 10. User Profile Page (`app/user-profile/[[...user-profile]]/page.tsx`)

```tsx
import Link from "next/link";
import { UserProfile } from "@clerk/nextjs";
import { ArrowLeft } from "lucide-react";

export default function UserProfilePage() {
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Link
          href="/add-job"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
        <div className="flex justify-center">
          <UserProfile />
        </div>
      </div>
    </div>
  );
}
```

### 11. User Profile Dropdown (`components/UserProfileDropdown.tsx`)

```tsx
"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings, LogOut } from "lucide-react";

function getAvatarUrl(
  imageUrl: string | undefined,
  name: string | undefined,
  email: string | undefined,
  avatarError: boolean,
  hasImage: boolean,
): string | null {
  if (avatarError || !imageUrl || imageUrl.trim() === "") {
    if (hasImage) return null;
    const seed = name || email || "user";
    return `https://robohash.org/${encodeURIComponent(seed)}.png?size=80x80`;
  }
  return imageUrl;
}

export default function UserProfileDropdown() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [avatarError, setAvatarError] = useState(false);

  const name =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.username ||
    "User";
  const email = user?.primaryEmailAddress?.emailAddress || "";
  const hasImage = user?.hasImage ?? false;
  const avatarUrl = getAvatarUrl(
    user?.imageUrl,
    name,
    email,
    avatarError,
    hasImage,
  );

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
          <div className="h-9 w-9 rounded-full border-2 overflow-hidden">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="h-full w-full object-cover"
                onError={() => setAvatarError(true)}
                referrerPolicy="no-referrer"
              />
            ) : (
              <Skeleton className="h-full w-full rounded-none" />
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <p className="font-medium">{name}</p>
          <p className="text-xs text-muted-foreground">{email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href="/user-profile"
            className="flex items-center cursor-pointer"
          >
            <Settings className="mr-2 h-4 w-4" />
            Manage account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => signOut({ redirectUrl: "/" })}
          className="cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-xs text-muted-foreground">
          Secured by Clerk
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### 12. Theme Toggle (`components/ThemeToggle.tsx`)

```tsx
"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### 13. Navbar (with Theme + Profile)

```tsx
import LinksDropdown from "./LinksDropdown";
import ThemeToggle from "./ThemeToggle";
import UserProfileDropdown from "./UserProfileDropdown";

export default function Navbar() {
  return (
    <nav className="bg-muted py-4 sm:px-16 lg:px-24 px-4 flex items-center justify-between">
      <div>
        <LinksDropdown />
      </div>
      <div className="flex items-center gap-x-4">
        <ThemeToggle />
        <UserProfileDropdown />
      </div>
    </nav>
  );
}
```

### 14. Adapt for Your Project

- Replace `/add-job` with your app’s default post-login route everywhere.
- Replace `logo.svg` and `main.svg` with your assets or remove the illustration.
- Adjust `isProtectedRoute` in middleware to match your protected paths.
- If you don’t use Prisma/Job, adapt the migration script to your model and `clerkId` field.

---

## Migration Script (Switching Clerk Apps)

When you create a new Clerk application, user IDs change. Use this script to reassign jobs (or similar data) to the new user.

### `scripts/db-migrate-clerkid.ts`

```ts
/**
 * Migrate records from old clerkId to new clerkId
 * Run: npx tsx scripts/db-migrate-clerkid.ts <OLD_CLERK_ID> <NEW_CLERK_ID>
 *
 * Get OLD_CLERK_ID from db-inspect output.
 * Get NEW_CLERK_ID from Clerk Dashboard → Users → your user.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const [oldClerkId, newClerkId] = process.argv.slice(2);

  if (!oldClerkId || !newClerkId) {
    console.error(
      "\nUsage: npx tsx scripts/db-migrate-clerkid.ts <OLD_CLERK_ID> <NEW_CLERK_ID>\n",
    );
    process.exit(1);
  }

  const count = await prisma.job.updateMany({
    where: { clerkId: oldClerkId },
    data: { clerkId: newClerkId },
  });

  console.log(
    `\nMigrated ${count.count} record(s) from ${oldClerkId} to ${newClerkId}\n`,
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### Inspect script (to find clerkIds)

```ts
/**
 * Run: npx tsx scripts/db-inspect.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const jobs = await prisma.job.findMany();
  const clerkIdCounts = jobs.reduce<Record<string, number>>((acc, job) => {
    acc[job.clerkId] = (acc[job.clerkId] || 0) + 1;
    return acc;
  }, {});

  console.log("Jobs per clerkId:");
  for (const [clerkId, count] of Object.entries(clerkIdCounts)) {
    console.log(`  ${clerkId}: ${count} job(s)`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

## Quick Checklist

### Clerk Dashboard

- [ ] Create **Individual** application
- [ ] Enable Email + Password
- [ ] Enable Google + GitHub OAuth
- [ ] Turn off “Reject compromised passwords” (if using `12345678`)
- [ ] Create test user: `test@user.com` / `12345678`

### Environment

- [ ] Add all `.env.local` variables
- [ ] Use production keys on Vercel

### Code

- [ ] `ClerkProvider` in root layout with `signInUrl` and `signUpUrl`
- [ ] `ThemeProvider` wrapping app
- [ ] `suppressHydrationWarning` on `html` and `body`
- [ ] Middleware with `clerkMiddleware` and protected routes
- [ ] SSO callback at `/sign-in/sso-callback`
- [ ] `window.location.href` (not `router.push`) after sign-in to avoid RSC 404

### Assets

- [ ] `/public/logo.svg` and `/public/main.svg` (or equivalent)

---

## Notes

1. **Guest URL**: Use `/sign-in?guest=true` to pre-fill the test account.
2. **Redirect**: Use `window.location.href` after sign-in to avoid RSC 404 with Clerk middleware.
3. **Avatar**: RoboHash fallback when OAuth image fails; `referrerPolicy="no-referrer"` for external images.
4. **Theme**: `modal={false}` on profile dropdown to avoid body scroll issues.
