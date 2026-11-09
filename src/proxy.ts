import { NextResponse, type NextRequest } from "next/server";

/**
 * Redirection optimiste vers la page de connexion quand le cookie de session est absent.
 * Ce n’est PAS le contrôle d’accès : chaque page et action du dashboard vérifie la session en base (requireAdmin).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/connexion") return NextResponse.next();
  if (!request.cookies.has("mk_admin")) {
    return NextResponse.redirect(new URL("/admin/connexion", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
