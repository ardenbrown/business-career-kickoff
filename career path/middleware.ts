import { NextResponse } from "next/server";

import { auth } from "@/auth";

const protectedRoutes = [
  "/onboarding",
  "/dashboard",
  "/roles",
  "/resume-feedback",
  "/outreach",
  "/application-strategy",
  "/timeline",
  "/jobs",
  "/account",
];

export default auth((req) => {
  const isProtectedRoute = protectedRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route),
  );

  if (!isProtectedRoute || req.auth) {
    return NextResponse.next();
  }

  const signInUrl = new URL("/auth/sign-in", req.nextUrl.origin);
  signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);

  return NextResponse.redirect(signInUrl);
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
