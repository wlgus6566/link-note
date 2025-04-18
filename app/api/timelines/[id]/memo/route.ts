import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
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

    // 메모 내용 파싱
    let memo = "";
    try {
      const body = await req.json();
      memo = body.memo || "";
    } catch (e) {
      return NextResponse.json(
        { error: "메모 내용을 읽을 수 없습니다" },
        { status: 400 }
      );
    }

    console.log(
      `메모 업데이트 요청: ID=${bookmarkId}, 메모 길이=${memo.length}`
    );
    console.log(
      "쿠키 이름 목록:",
      req.cookies
        .getAll()
        .map((c) => c.name)
        .join(", ")
    );

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
    console.log("사용자 ID:", userId);

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

    // 2. 메모 업데이트
    const { data: updateResult, error: updateError } = await supabase
      .from("timeline_bookmarks")
      .update({
        memo,
        updated_at: new Date().toISOString(),
      } as any)
      .eq("id", bookmarkId as any)
      .select()
      .single();

    if (updateError) {
      console.error("메모 업데이트 오류:", updateError.message);
      return NextResponse.json(
        { error: "메모 업데이트에 실패했습니다" },
        { status: 500 }
      );
    }

    // 타입 단언으로 업데이트 결과 접근
    const updatedData = updateResult as any;
    console.log("메모 업데이트 성공:", updatedData.id);
    return NextResponse.json({
      success: true,
      message: "메모가 성공적으로 업데이트되었습니다",
      data: updatedData,
    });
  } catch (error: any) {
    console.error("메모 API 오류:", error);
    return NextResponse.json(
      { error: "메모 업데이트 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
