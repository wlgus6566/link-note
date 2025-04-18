import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    // 유저 세션 확인
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      return NextResponse.json(
        { error: "로그인이 필요합니다" },
        { status: 401 }
      );
    }

    // 쿼리 파라미터 가져오기
    const url = new URL(req.url);
    const digestId = url.searchParams.get("digest_id");

    let query = supabase
      .from("timeline_bookmarks")
      .select(
        `
        id,
        timeline_id,
        seconds,
        text,
        memo,
        created_at,
        updated_at,
        digest_id,
        digests (
          id, 
          title, 
          source_url, 
          image,
          video_info,
          source_type
        )
      `
      )
      .eq("user_id", sessionData.session.user.id as any);

    // 다이제스트 ID로 필터링
    if (digestId) {
      query = query.eq("digest_id", digestId as any);
    }

    // 정렬
    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      return NextResponse.json(
        { error: "타임라인 목록을 가져오는데 실패했습니다" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error("타임라인 목록 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
