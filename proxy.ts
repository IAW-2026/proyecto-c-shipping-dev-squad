import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { verifyShipmentToken } from "@/lib/shipmentToken";

const isPublicApiRoute = createRouteMatcher([
  "/api/shipments(.*)",
]);

const isShipmentDetailRoute = createRouteMatcher(["/dashboard/shipments/:orderId"]);
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);
const isAdminRoute = createRouteMatcher(["/dashboard/admin(.*)"]);
const isOperatorRoute = createRouteMatcher(["/dashboard/operator(.*)"]);
const isDashboardClientRoute = createRouteMatcher(["/dashboard/buyer(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicApiRoute(req)) {
    return NextResponse.next();
  }

  // Si viene un token firmado válido de la app buyer, dejamos pasar sin
  // pedir sesión de Clerk. Si no hay token o no es válido, seguimos abajo
  // con el flujo normal (auth.protect()).
  if (isShipmentDetailRoute(req)) {
    const token = req.nextUrl.searchParams.get("token");
    const orderId = req.nextUrl.pathname.split("/").pop() ?? "";

    if (token) {
      const verified = await verifyShipmentToken(token, orderId);
      if (verified) {
        const response = NextResponse.next();
        const theme = req.nextUrl.searchParams.get("theme");
        if (theme === "light" || theme === "dark") {
          response.cookies.set("token_theme", theme, {
            maxAge: 300,
            path: "/",
            sameSite: "lax",
          });
        }
        return response;
      }
    }
  }

  if (isProtectedRoute(req)) {
    await auth.protect();

    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as any)?.role
              ?? (sessionClaims?.publicMetadata as any)?.role
              ?? (sessionClaims as any)?.role
              ?? null;

    if (isAdminRoute(req) && role !== "admin") {
      const redirect = role === "logistics_operator" ? "/dashboard/operator" : "/dashboard/buyer"
      return NextResponse.redirect(new URL(redirect, req.url))
    }

    if (isOperatorRoute(req) && role !== "logistics_operator" && role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard/buyer", req.url))
    }

    if (isDashboardClientRoute(req) && role !== "buyer" && role !== null) {
        const redirect = role === "admin" ? "/dashboard/admin" : "/dashboard/operator"
        return NextResponse.redirect(new URL(redirect, req.url))
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};