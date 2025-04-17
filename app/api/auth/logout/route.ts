import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Supabase 클라이언트 생성
    const supabase = createClient();

    // 로그아웃
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("로그아웃 오류:", error);
      return NextResponse.json(
        { error: "로그아웃 중 오류가 발생했습니다: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "성공적으로 로그아웃되었습니다",
    });
  } catch (error: any) {
    console.error("로그아웃 처리 오류:", error);
    return NextResponse.json(
      { error: "로그아웃 중 오류가 발생했습니다: " + error.message },
      { status: 500 }
    );
  }
}
