import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// 타임라인 북마크 삭제 API
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // params 해결
    const resolvedParams = await params;

    // ID 유효성 검사
    const bookmarkId = resolvedParams?.id;
    if (!bookmarkId || isNaN(Number(bookmarkId))) {
      return NextResponse.json(
        { error: "유효하지 않은 북마크 ID입니다" },
        { status: 400 }
      );
    }

    console.log(`타임라인 북마크 삭제 요청: ID=${bookmarkId}`);

    // Supabase 클라이언트 생성
    const supabase = await createClient();

    // 사용자 세션 가져오기
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) {
      console.error("세션 오류:", sessionError.message);
      return NextResponse.json(
        { error: "인증 세션 확인 중 오류가 발생했습니다" },
        { status: 500 }
      );
    }

    if (!sessionData.session) {
      console.log("세션 없음");
      return NextResponse.json(
        { error: "로그인이 필요합니다" },
        { status: 401 }
      );
    }

    const userId = sessionData.session.user.id;
    console.log("삭제 요청 사용자 ID:", userId);

    // 1. 해당 북마크가 존재하고 사용자의 것인지 확인
    const { data: bookmark, error: fetchError } = await supabase
      .from("timeline_bookmarks")
      .select("id, user_id")
      .eq("id", bookmarkId as any)
      .single();

    if (fetchError) {
      console.error("북마크 조회 오류:", fetchError.message);
      return NextResponse.json(
        { error: "북마크를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 북마크 데이터 타입 변환 및 소유권 확인
    const bookmarkData = bookmark as any;
    if (bookmarkData.user_id !== userId) {
      console.log("북마크 소유권 오류:", bookmarkData.user_id, "≠", userId);
      return NextResponse.json(
        { error: "해당 북마크에 대한 접근 권한이 없습니다" },
        { status: 403 }
      );
    }

    // 2. 북마크 삭제
    const { error: deleteError } = await supabase
      .from("timeline_bookmarks")
      .delete()
      .eq("id", bookmarkId as any);

    if (deleteError) {
      console.error("북마크 삭제 오류:", deleteError.message);
      return NextResponse.json(
        { error: "북마크 삭제에 실패했습니다" },
        { status: 500 }
      );
    }

    console.log(`북마크 ID ${bookmarkId} 삭제 성공`);
    return NextResponse.json({
      success: true,
      message: "북마크가 성공적으로 삭제되었습니다",
    });
  } catch (error: any) {
    console.error("북마크 삭제 API 오류:", error);
    return NextResponse.json(
      { error: "북마크 삭제 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
