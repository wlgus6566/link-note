import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { digests } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // params 확인 로깅
    console.log("받은 params:", params);

    // params 객체에서 id 비동기적으로 추출
    const id = params?.id;
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
