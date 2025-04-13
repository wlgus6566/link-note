import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { digests } from "@/db/schema";
import { NewDigest } from "@/db/schema";
import { desc } from "drizzle-orm";

// 요청 스키마 정의
const requestSchema = z.object({
  title: z.string(),
  summary: z.string(),
  readTime: z.string(),
  tags: z.array(z.string()),
  content: z.string(),
  image_suggestions: z
    .array(
      z.object({
        caption: z.string(),
        placement: z.string(),
      })
    )
    .optional(),
  generatedImages: z
    .array(
      z.object({
        url: z.string(),
        caption: z.string(),
      })
    )
    .optional(),
  sourceUrl: z.string().url(),
  sourceType: z.enum(["YouTube", "Instagram", "Medium", "Other"]),
  // YouTube 동영상 정보 스키마 추가
  videoInfo: z
    .object({
      channelId: z.string().optional(),
      channelTitle: z.string().optional(),
      publishedAt: z.string().optional(),
      viewCount: z.string().optional(),
      description: z.string().optional(),
      title: z.string().optional(),
    })
    .optional(),
});

export async function POST(req: Request) {
  console.log("다이제스트 저장 API 요청 수신");
  try {
    const requestData = await req.json();
    console.log("요청 데이터:", JSON.stringify(requestData));

    const validatedData = requestSchema.safeParse(requestData);

    if (!validatedData.success) {
      console.error("유효성 검사 실패:", validatedData.error);
      return NextResponse.json(
        { success: false, error: "유효하지 않은 다이제스트 데이터" },
        { status: 400 }
      );
    }

    const data = validatedData.data;

    // 디버깅을 위한 로깅 추가
    console.log("생성된 이미지:", JSON.stringify(data.generatedImages));
    console.log("이미지 제안:", JSON.stringify(data.image_suggestions));

    // 기본 이미지 URL 설정 (생성된 이미지가 없는 경우를 대비)
    let imageUrl = "/placeholder.svg?height=400&width=800";

    // 생성된 이미지가 있으면 첫 번째 이미지를 대표 이미지로 사용
    if (data.generatedImages && data.generatedImages.length > 0) {
      imageUrl = data.generatedImages[0].url;
      console.log("대표 이미지 URL:", imageUrl);
    } else if (data.image_suggestions && data.image_suggestions.length > 0) {
      // 이미지 제안은 있지만 생성된 이미지가 없는 경우 (fallback)
      console.log("생성된 이미지가 없어 YouTube 이미지 URL 생성 시도");

      if (data.sourceUrl) {
        const videoId = extractYouTubeVideoId(data.sourceUrl);
        if (videoId) {
          imageUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
          console.log("YouTube 썸네일 URL 생성:", imageUrl);

          // generatedImages 배열 생성
          data.generatedImages = [
            {
              url: imageUrl,
              caption: data.image_suggestions[0].caption || "콘텐츠 이미지",
            },
          ];
        }
      }
    }

    // Prisma로 새 다이제스트 저장
    const newDigest = await db
      .insert(digests)
      .values({
        title: data.title,
        summary: data.summary,
        readTime: data.readTime || "3분",
        tags: data.tags,
        content: data.content,
        sourceUrl: data.sourceUrl,
        sourceType: data.sourceType,
        date: new Date(),
        imageSuggestions: data.image_suggestions || [],
        generatedImages: data.generatedImages || [],
        author: {
          name: "AI 요약",
          role: "자동 생성",
          avatar: "/placeholder.svg",
        },
        videoInfo: data.videoInfo || {},
        image: imageUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    console.log(
      "다이제스트 저장 성공, 반환 데이터:",
      JSON.stringify(newDigest)
    );

    return NextResponse.json({
      success: true,
      message: "다이제스트 저장 성공",
      digest: newDigest,
    });
  } catch (error) {
    console.error("다이제스트 저장 오류:", error);
    return NextResponse.json(
      { success: false, error: "다이제스트 저장 중 오류 발생" },
      { status: 500 }
    );
  }
}

// YouTube 비디오 ID 추출 함수
function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;

  // YouTube URL 패턴 확인
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?\/]+)/,
    /youtube\.com\/watch\?.*v=([^&]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

// 저장된 모든 요약 가져오기
export async function GET() {
  try {
    // orderBy 메서드 수정 - desc() 함수 이용
    const allDigests = await db
      .select()
      .from(digests)
      .orderBy(desc(digests.createdAt));

    return NextResponse.json({
      success: true,
      data: allDigests,
    });
  } catch (error) {
    console.error("요약 목록 조회 API 에러:", error);

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
