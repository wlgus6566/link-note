import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateBlogSummary } from "@/lib/utils/ai";

// 요청 스키마 정의
const requestSchema = z.object({
  videoInfo: z.object({
    title: z.string(),
    description: z.string().optional(),
    channelTitle: z.string(),
    publishedAt: z.string(),
  }),
  transcript: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    // 요청 본문 가져오기
    const body = await request.json();

    // 요청 검증
    const { videoInfo, transcript } = requestSchema.parse(body);

    // AI를 사용하여 블로그 요약 생성
    const blogSummary = await generateBlogSummary({
      title: videoInfo.title,
      description: videoInfo.description || "",
      channelTitle: videoInfo.channelTitle,
      publishedAt: videoInfo.publishedAt,
      transcript: transcript,
    });

    // 성공 응답 반환
    return NextResponse.json({
      success: true,
      data: blogSummary,
    });
  } catch (error) {
    console.error("AI 요약 API 에러:", error);

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
