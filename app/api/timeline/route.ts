import { NextResponse } from "next/server";
import { db } from "@/db";
import { timelines } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

// GET: 다이제스트 ID로 타임라인 데이터 가져오기
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const digestId = searchParams.get("digestId");

    if (!digestId) {
      return NextResponse.json(
        { success: false, error: "다이제스트 ID가 필요합니다." },
        { status: 400 }
      );
    }

    // 인증 확인 (선택적)
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // 인증 상태 로깅
    if (session?.user) {
      console.log("인증된 사용자의 타임라인 조회 요청:", session.user.id);
    } else {
      console.log("인증되지 않은 사용자의 타임라인 조회 요청");
    }

    const [timeline] = await db
      .select()
      .from(timelines)
      .where(eq(timelines.digestId, parseInt(digestId)));

    return NextResponse.json({
      success: true,
      data: timeline?.data || [],
      authenticated: !!session,
    });
  } catch (error) {
    console.error("타임라인 조회 오류:", error);
    return NextResponse.json(
      {
        success: false,
        error: "타임라인 데이터 조회 중 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// POST: 새 타임라인 데이터 저장 또는 기존 데이터 업데이트
export async function POST(request: Request) {
  try {
    // 인증 확인 - 서버용 Supabase 클라이언트 사용
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // 미인증 사용자 처리 (선택적)
    if (!session) {
      console.log("인증되지 않은 사용자의 타임라인 저장 요청");
      // 인증이 필요한 경우 아래 주석 해제
      // return NextResponse.json(
      //   { success: false, error: "인증이 필요합니다." },
      //   { status: 401 }
      // );
    }

    // 요청 본문에서 데이터 추출
    const { digestId, timelineData } = await request.json();

    if (!digestId || !timelineData) {
      return NextResponse.json(
        {
          success: false,
          error: "다이제스트 ID와 타임라인 데이터가 필요합니다.",
        },
        { status: 400 }
      );
    }

    // 기존 타임라인 확인
    const [existing] = await db
      .select()
      .from(timelines)
      .where(eq(timelines.digestId, digestId));

    let result;

    if (existing) {
      // 기존 데이터 업데이트
      result = await db
        .update(timelines)
        .set({
          data: timelineData,
          updatedAt: new Date(),
        })
        .where(eq(timelines.digestId, digestId))
        .returning();
    } else {
      // 새 데이터 삽입
      result = await db
        .insert(timelines)
        .values({
          digestId: digestId,
          data: timelineData,
        })
        .returning();
    }

    return NextResponse.json({
      success: true,
      data: result[0],
    });
  } catch (error) {
    console.error("타임라인 저장 오류:", error);
    return NextResponse.json(
      {
        success: false,
        error: "타임라인 데이터 저장 중 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
