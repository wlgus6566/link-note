import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Supabase 클라이언트 생성
    const supabase = createClient();

    // 현재 세션 가져오기
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("세션 조회 오류:", sessionError);
      return NextResponse.json(
        { error: "세션 조회 중 오류가 발생했습니다: " + sessionError.message },
        { status: 500 }
      );
    }

    // 세션이 없는 경우
    if (!session) {
      return NextResponse.json(
        {
          authenticated: false,
          message: "로그인되지 않은 상태입니다",
          cookies: req.cookies.getAll(),
        },
        { status: 401 }
      );
    }

    // 사용자 정보 가져오기
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("사용자 정보 조회 오류:", userError);
      return NextResponse.json(
        {
          error:
            "사용자 정보 조회 중 오류가 발생했습니다: " + userError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user?.id,
        email: user?.email,
        user_metadata: user?.user_metadata,
      },
      session: {
        expires_at: session?.expires_at,
      },
    });
  } catch (error: any) {
    console.error("사용자 정보 처리 오류:", error);
    return NextResponse.json(
      { error: "사용자 정보 처리 중 오류가 발생했습니다: " + error.message },
      { status: 500 }
    );
  }
}
