import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieAEcrire = { name: string; value: string; options: CookieOptions };

// Middleware exécuté avant chaque page protégée :
//  - rafraîchit la session Supabase (cookies)
//  - redirige vers /login si un visiteur non connecté tente
//    d'accéder à /dashboard ou /super-admin
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieAEcrire[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const estProtegee =
    pathname.startsWith("/dashboard") || pathname.startsWith("/super-admin");

  if (estProtegee && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Utilisateur connecté sur /login : redirection selon rôle
  if (pathname === "/login" && user) {
    const url = request.nextUrl.clone();
    const { data: profil } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    url.pathname =
      profil?.role === "super_admin"
        ? "/super-admin"
        : profil?.role === "sous_compte"
          ? "/dashboard/scanner"
          : "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Sous-compte : accès UNIQUEMENT à /dashboard/scanner (et /login pour se déconnecter)
  if (user && pathname.startsWith("/dashboard") && pathname !== "/dashboard/scanner") {
    const { data: profil } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (profil?.role === "sous_compte") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard/scanner";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/super-admin/:path*", "/login"],
};
