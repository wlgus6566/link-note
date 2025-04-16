import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 메모 정보 추출
    const bookmarkId = params.id;
    const { memo } = await req.json();

    // Supabase 클라이언트 생성
    const supabase = createClient();

    // 유저 세션 확인
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      return NextResponse.json(
        { error: "로그인이 필요합니다" },
        { status: 401 }
      );
    }

    // 사용자 정보 가져오기
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("auth_id", sessionData.session.user.id)
      .single();

    if (userError || !userData) {
      console.error("사용자 정보 로드 오류:", userError);
      return NextResponse.json(
        { error: "사용자 정보를 가져오는데 실패했습니다" },
        { status: 500 }
      );
    }

    // 북마크 조회 및 소유권 확인
    const { data: bookmarkData, error: bookmarkError } = await supabase
      .from("timeline_bookmarks")
      .select("*")
      .eq("id", bookmarkId)
      .eq("user_id", userData.id)
      .single();

    if (bookmarkError || !bookmarkData) {
      console.error("북마크 소유권 확인 오류:", bookmarkError);
      return NextResponse.json(
        { error: "북마크를 찾을 수 없거나 접근 권한이 없습니다" },
        { status: 403 }
      );
    }

    // 메모 업데이트
    const { data, error } = await supabase
      .from("timeline_bookmarks")
      .update({
        memo,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookmarkId)
      .select()
      .single();

    if (error) {
      console.error("메모 업데이트 오류:", error);
      return NextResponse.json(
        { error: "메모 업데이트에 실패했습니다" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("메모 업데이트 처리 오류:", error);
    return NextResponse.json(
      { error: "메모 업데이트에 실패했습니다" },
      { status: 500 }
    );
  }
}
