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
  sourceUrl: z.string().url(),
  sourceType: z.enum(["YouTube", "Instagram", "Medium", "Other"]),
});

export async function POST(request: NextRequest) {
  try {
    // 요청 본문 가져오기
    const body = await request.json();

    // 요청 검증
    const digest = requestSchema.parse(body);

    // 날짜 객체 생성 (문자열 대신 Date 객체 사용)
    const currentDate = new Date();

    // 데이터베이스에 저장할 객체 생성
    const newDigest: NewDigest = {
      title: digest.title,
      summary: digest.summary,
      readTime: digest.readTime,
      tags: digest.tags,
      content: digest.content,
      sourceUrl: digest.sourceUrl,
      sourceType: digest.sourceType,
      date: currentDate, // 문자열이 아닌 Date 객체 사용
      imageSuggestions: digest.image_suggestions || [],
      author: {
        name: "AI 요약",
        role: "자동 생성",
        avatar: "/placeholder.svg",
      },
      image: "/placeholder.svg?height=400&width=800", // 기본 이미지 설정
      createdAt: currentDate,
      updatedAt: currentDate,
    };

    // 데이터베이스에 저장
    console.log("다이제스트를 데이터베이스에 저장 중...");
    const [savedDigest] = await db
      .insert(digests)
      .values(newDigest)
      .returning();
    console.log("다이제스트 저장 완료:", savedDigest.id);

    // 성공 응답 반환
    return NextResponse.json({
      success: true,
      data: savedDigest,
    });
  } catch (error) {
    console.error("요약 저장 API 에러:", error);

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
