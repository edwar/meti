import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rutas que no requieren autenticación
const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/api/auth",
  "/services",
];

// Rutas de admin
const adminRoutes = ["/admin"];

// Rutas de advisor
const advisorRoutes = ["/advisor"];

// Rutas de client
const clientRoutes = ["/client", "/checkout", "/call"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir rutas públicas
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Permitir archivos estáticos y API routes de auth
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Para otras rutas, permitir que better-auth maneje la sesión
  // El middleware de better-auth se encargará de la verificación
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
