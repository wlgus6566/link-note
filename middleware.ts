import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Database } from "@/types/supabase";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;

  // 인증 미들웨어 클라이언트 생성
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          res.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // 세션 확인
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 접근 제어 설정
  // 1. 인증 관련 페이지 (로그인하지 않은 사용자만 접근 가능)
  const authPages = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ];

  // 2. 항상 공개 페이지 (로그인 여부와 관계없이 모두 접근 가능)
  const publicPages = [
    "/",
    "/auth/callback",
    "/api", // API 경로는 별도 인증 로직 있음
  ];

  // 3. 정적 리소스 경로 (항상 접근 가능)
  const isStaticResource =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/favicon.ico");

  // 인증된 사용자가 로그인/가입 페이지에 접근하려는 경우 홈으로 리다이렉션
  if (session && authPages.some((page) => pathname === page)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 비인증 사용자 접근 제어:
  // - 인증 페이지, 공개 페이지, 정적 리소스는 그대로 접근 허용
  // - 그 외 모든 페이지는 로그인 페이지로 리다이렉션
  if (
    !session &&
    !authPages.some((page) => pathname === page) &&
    !publicPages.some((page) => pathname.startsWith(page)) &&
    !isStaticResource
  ) {
    // 현재 URL을 callbackUrl로 저장하여 로그인 후 돌아올 수 있게 함
    const callbackUrl = encodeURIComponent(
      req.nextUrl.pathname + req.nextUrl.search
    );
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, req.url)
    );
  }

  return res;
}

// 미들웨어가 적용되는 경로 설정
export const config = {
  matcher: [
    /*
     * 다음 경로에는 미들웨어를 적용하지 않음:
     * - _next/static (정적 파일)
     * - _next/image (이미지 최적화 API)
     * - favicon.ico (파비콘)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
