import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid"; // 고유 토큰 생성을 위해 uuid 사용

// 요청 본문 유효성 검사를 위한 스키마
const shareRequestSchema = z.object({
  digestId: z.number().int().positive(),
  type: z.enum(["digest", "timeline_bookmark"]), // 현재는 digest만 사용하지만 확장성 고려
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 사용자 인증 확인 (선택 사항: 공유 링크 생성 시 로그인 필요 여부에 따라 결정)
    const {
      data: { user },
    } = await supabase.auth.getUser();
    // if (!user) {
    //   return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 });
    // }

    const body = await request.json();
    const validationResult = shareRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "잘못된 요청 데이터입니다.",
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { digestId, type } = validationResult.data;

    // 고유 토큰 생성
    const token = uuidv4();

    // 데이터베이스에 공유 정보 저장 (shared_links 테이블 예시)
    // 실제 테이블 이름과 컬럼에 맞게 조정 필요
    const { data: sharedLink, error: dbError } = await supabase
      .from("shared_links") // Supabase에 생성할 테이블 이름
      .insert([
        {
          token: token,
          digest_id: digestId,
          item_type: type, // 'type' 대신 'item_type' 등 충돌 피하는 이름 사용 권장
          user_id: user?.id || null, // 로그인 사용자 ID (선택적)
          // expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 예: 7일 후 만료 (선택적)
        },
      ])
      .select()
      .single(); // 단일 결과 반환 및 오류 시 throw

    if (dbError) {
      console.error("공유 링크 DB 저장 오류:", dbError);
      return NextResponse.json(
        { success: false, error: "공유 링크 저장 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    if (!sharedLink) {
      console.error("공유 링크 DB 저장 후 데이터 반환 실패");
      return NextResponse.json(
        {
          success: false,
          error: "공유 링크 저장 후 데이터 확인에 실패했습니다.",
        },
        { status: 500 }
      );
    }

    console.log("생성된 공유 링크 정보:", sharedLink);

    return NextResponse.json({ success: true, token: token });
  } catch (error) {
    console.error("공유 API 오류:", error);
    return NextResponse.json(
      { success: false, error: "공유 처리 중 알 수 없는 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
