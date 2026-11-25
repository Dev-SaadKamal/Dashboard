import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({
            request,
          });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Protected dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(url);
    }

    const role = (user.app_metadata?.role || user.user_metadata?.role || "viewer").toLowerCase();

    // /dashboard/users is admin-only
    if (pathname.startsWith("/dashboard/users") && role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard/ecommerce";
      return NextResponse.redirect(url);
    }
  }

  // Redirect authenticated users away from login/auth pages to dashboard
  if (pathname.startsWith("/auth/login") && user) {
    const url = request.nextUrl.clone();
    const redirectTo = request.nextUrl.searchParams.get("redirectTo") || "/dashboard/ecommerce";
    url.pathname = redirectTo;
    url.searchParams.delete("redirectTo");
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
