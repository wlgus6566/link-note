import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // 요청 헤더 및 쿠키 정보 출력
    console.log("API 요청 헤더:", req.headers);
    console.log("쿠키:", req.headers.get("cookie"));

    // Supabase 클라이언트 생성
    const supabase = createClient();

    // 유저 세션 확인
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) {
      console.error("세션 확인 오류:", sessionError);
      return NextResponse.json(
        { error: sessionError.message },
        { status: 500 }
      );
    }

    if (!sessionData.session) {
      return NextResponse.json(
        {
          message: "로그인 세션이 없습니다",
          authenticated: false,
          cookieStore: Array.from(cookies().getAll()),
          requestCookies: req.headers.get("cookie"),
        },
        { status: 200 }
      );
    }

    // 세션 정보만 반환 (민감한 정보 제외)
    return NextResponse.json({
      message: "로그인 되어 있습니다",
      authenticated: true,
      user: {
        id: sessionData.session.user.id,
        email: sessionData.session.user.email,
        role: sessionData.session.user.role,
      },
      expires_at: sessionData.session.expires_at,
      cookieStore: Array.from(cookies().getAll()),
      requestCookies: req.headers.get("cookie"),
    });
  } catch (error) {
    console.error("세션 조회 오류:", error);
    return NextResponse.json(
      { error: "세션 조회 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
