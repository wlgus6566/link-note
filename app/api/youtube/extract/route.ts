import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getYoutubeVideoData } from "@/lib/utils/youtube";

// 요청 스키마 정의
const requestSchema = z.object({
  url: z.string().url("유효한 URL이 아닙니다."),
});

export async function POST(request: NextRequest) {
  try {
    // 요청 본문 가져오기
    const body = await request.json();

    // 요청 검증
    const { url } = requestSchema.parse(body);

    // YouTube 비디오 데이터 추출
    const videoData = await getYoutubeVideoData(url);

    // 성공 응답 반환
    return NextResponse.json({
      success: true,
      data: videoData,
    });
  } catch (error) {
    console.error("YouTube 데이터 추출 API 에러:", error);

    // 에러 응답 반환
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.",
      },
      { status: 400 }
    );
  }
}
