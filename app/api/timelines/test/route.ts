import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    console.log(
      "테스트 API 요청 헤더:",
      req.headers.get("cookie")?.substring(0, 50) + "..."
    );

    // Supabase 클라이언트 생성 - await 추가
    const supabase = await createClient();

    // 유저 세션 확인
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error("세션 확인 오류:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data.session) {
      return NextResponse.json({
        message: "로그인 세션이 없습니다",
        authenticated: false,
        cookieNames: req.cookies.getAll().map((c) => c.name),
      });
    }

    return NextResponse.json({
      message: "로그인 되어 있습니다",
      authenticated: true,
      userId: data.session.user.id,
      email: data.session.user.email,
      cookieNames: req.cookies.getAll().map((c) => c.name),
    });
  } catch (error: any) {
    console.error("테스트 API 오류:", error);
    return NextResponse.json(
      { error: "테스트 API 요청 중 오류가 발생했습니다: " + error.message },
      { status: 500 }
    );
  }
}
