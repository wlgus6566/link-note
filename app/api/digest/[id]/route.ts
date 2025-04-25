import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { digests } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Supabase 클라이언트 생성 - await 추가
    const supabase = await createClient();

    // 현재 세션 가져오기
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("세션 조회 오류:", sessionError);
      return NextResponse.json(
        {
          success: false,
          error: "세션 조회 중 오류가 발생했습니다: " + sessionError.message,
        },
        { status: 500 }
      );
    }

    // params 확인 로깅
    const resolvedParams = await params;
    console.log("받은 params:", resolvedParams);

    // params 객체에서 id 비동기적으로 추출
    const id = resolvedParams?.id;
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "ID가 제공되지 않았습니다.",
        },
        { status: 400 }
      );
    }

    // ID 파라미터 처리 - 문자열 또는 숫자 모두 처리 가능하도록
    console.log("요청된 ID 문자열:", id);

    // 숫자로 변환
    const parsedId = Number.parseInt(id);
    console.log("파싱된 ID 숫자:", parsedId);

    if (isNaN(parsedId)) {
      return NextResponse.json(
        {
          success: false,
          error: "유효하지 않은 ID입니다.",
        },
        { status: 400 }
      );
    }

    // 데이터베이스에서 ID로 다이제스트 조회
    console.log(`데이터베이스에서 ID ${parsedId}의 다이제스트 조회 중...`);
    const [digest] = await db
      .select()
      .from(digests)
      .where(eq(digests.id, parsedId));

    // 다이제스트를 찾지 못한 경우
    if (!digest) {
      console.log(`ID ${parsedId}에 해당하는 다이제스트를 찾을 수 없습니다.`);
      return NextResponse.json(
        {
          success: false,
          error: "해당 ID의 다이제스트를 찾을 수 없습니다.",
          id: parsedId, // 요청된 ID 반환
        },
        { status: 404 }
      );
    }

    console.log(
      `ID ${parsedId} 다이제스트를 성공적으로 찾았습니다:`,
      digest.title
    );
    return NextResponse.json({
      success: true,
      data: digest,
    });
  } catch (error) {
    console.error("요약 조회 API 에러:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Supabase 클라이언트 생성 - await 추가
    const supabase = await createClient();

    // 현재 세션 가져오기
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: "인증되지 않은 사용자입니다.",
        },
        { status: 401 }
      );
    }

    // params 확인 로깅
    const resolvedParams = await params;
    console.log("다이제스트 삭제 요청 params:", resolvedParams);

    // params 객체에서 id 비동기적으로 추출
    const id = resolvedParams?.id;
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "ID가 제공되지 않았습니다.",
        },
        { status: 400 }
      );
    }

    // ID 파라미터 처리
    console.log("삭제 요청된 다이제스트 ID 문자열:", id);

    // 숫자로 변환
    const parsedId = Number.parseInt(id);
    console.log("파싱된 다이제스트 ID 숫자:", parsedId);

    if (isNaN(parsedId)) {
      return NextResponse.json(
        {
          success: false,
          error: "유효하지 않은 다이제스트 ID입니다.",
        },
        { status: 400 }
      );
    }

    // 다이제스트 존재 여부 확인
    const [existingDigest] = await db
      .select()
      .from(digests)
      .where(eq(digests.id, parsedId));

    if (!existingDigest) {
      console.log(`ID ${parsedId}에 해당하는 다이제스트를 찾을 수 없습니다.`);
      return NextResponse.json(
        {
          success: false,
          error: "해당 ID의 다이제스트를 찾을 수 없습니다.",
          id: parsedId,
        },
        { status: 404 }
      );
    }

    // 다이제스트 소유자 확인 - 소유자가 지정된 경우에만 체크
    if (existingDigest.userId && existingDigest.userId !== session.user.id) {
      console.log(
        `삭제 권한 없음: 다이제스트 소유자 ${existingDigest.userId}, 요청자 ${session.user.id}`
      );
      return NextResponse.json(
        {
          success: false,
          error: "해당 다이제스트를 삭제할 권한이 없습니다.",
        },
        { status: 403 }
      );
    }

    // 다이제스트 삭제
    const result = await db
      .delete(digests)
      .where(eq(digests.id, parsedId))
      .returning({ id: digests.id });

    console.log(`다이제스트 ID ${parsedId} 삭제 완료:`, result);

    return NextResponse.json({
      success: true,
      message: "다이제스트가 성공적으로 삭제되었습니다.",
      deletedId: parsedId,
    });
  } catch (error) {
    console.error("다이제스트 삭제 API 에러:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "다이제스트 삭제 중 알 수 없는 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
