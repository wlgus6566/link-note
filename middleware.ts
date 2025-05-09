import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "./lib/supabase/middleware";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  // updateSession을 호출하여 응답 객체를 준비하고, 세션 관련 쿠키를 동기화합니다.
  // 이 response 객체는 이후 supabase.auth.getUser() 호출 시 쿠키 변경이 있다면 업데이트됩니다.
  let response = await updateSession(request);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Supabase 클라이언트를 생성합니다.
  // 이 클라이언트는 request에서 쿠키를 읽고, response에 쿠키를 설정/삭제합니다.
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        // request.cookies와 response.cookies 모두에 설정합니다.
        // 이렇게 하면 getUser 호출 등으로 쿠키가 변경될 때 response에 반영됩니다.
        request.cookies.set({ name, value, ...options });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        // request.cookies와 response.cookies 모두에서 삭제합니다.
        request.cookies.set({ name, value: "", ...options });
        response.cookies.set({ name, value: "", ...options });
      },
    },
  });

  // 현재 사용자 정보를 가져옵니다.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // 인증되지 않은 사용자가 접근할 수 있는 UI 페이지 경로 목록입니다.
  // 예: app/(auth)/login/page.tsx -> /login
  // 필요에 따라 '/register', '/forgot-password' 등을 추가하세요.
  const publicAuthUIPages = [
    "/login",
    "/signup",
    "/auth/callback",
    "/forgot-password",
  ];

  // 보호된 경로에 대한 접근 제어
  if (
    !user && // 사용자가 로그인하지 않았고,
    !publicAuthUIPages.includes(pathname) && // 현재 경로가 공개된 인증 UI 페이지가 아니며,
    !pathname.startsWith("/auth/") // 현재 경로가 /auth/로 시작하는 Supabase 처리 경로도 아니라면
  ) {
    const loginUrl = new URL("/login", request.url);
    // 로그인 페이지로 리디렉션합니다.
    return NextResponse.redirect(loginUrl);
  }

  // 그 외의 경우 (사용자가 있거나, 로그인 페이지/인증 경로 접근 시)
  // updateSession 또는 getUser 호출로 인해 쿠키가 업데이트된 response를 반환합니다.
  return response;
}

// 미들웨어가 실행될 경로 지정
export const config = {
  // 모든 경로에 적용 (필요에 따라 변경 가능)
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
