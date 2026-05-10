import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicApiRoute = createRouteMatcher([
  "/api/shipments(.*)",
]);

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);
const isAdminRoute = createRouteMatcher(["/dashboard/admin(.*)"]);
const isOperatorRoute = createRouteMatcher(["/dashboard/operator(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicApiRoute(req)) return;

  if (isProtectedRoute(req)) {
    await auth.protect();

    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as any)?.role
              ?? (sessionClaims?.publicMetadata as any)?.role
              ?? (sessionClaims as any)?.role
              ?? process.env.NEXT_PUBLIC_DEV_ROLE //linea de hardcodeo para testing, eliminar en producción
              ?? null;

    if (isAdminRoute(req) && role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (isOperatorRoute(req) && role !== "logistics_operator" && role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};