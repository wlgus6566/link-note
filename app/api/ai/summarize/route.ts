import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateBlogSummary } from "@/lib/utils/ai";
import { createClient } from "@/lib/supabase/server";

// 요청 스키마 정의
const requestSchema = z.object({
  videoInfo: z.object({
    title: z.string(),
    description: z.string().optional(),
    channelTitle: z.string(),
    publishedAt: z.string(),
  }),
  transcript: z.string(),
  sourceUrl: z.string().optional(),
});

// 요약 콘텐츠에서 "내용..." 패턴 제거 함수
function replaceEllipsisWithContent(content: string): string {
  // <p>내용...</p> 패턴을 찾아 실제 콘텐츠로 대체
  const ellipsisPattern = /<p>\s*내용\.{3}\s*<\/p>/g;

  // 트랜스크립트 중 첫 200자를 활용하여 간략한 내용으로 대체
  const enhancedContent = content.replace(ellipsisPattern, (match) => {
    return `<p>이 섹션에서는 해당 주제에 대한 주요 내용과 인사이트를 다룹니다.</p>`;
  });

  // <h2>섹션 제목</h2><p>내용...</p> 패턴 개선
  const sectionEllipsisPattern =
    /(<h[23]>.+?<\/h[23]>)\s*<p>\s*내용\.{3}\s*<\/p>/g;
  const finalContent = enhancedContent.replace(
    sectionEllipsisPattern,
    (match, heading) => {
      const headingText = heading.replace(/<\/?h[23]>/g, "");
      return `${heading}<p>${headingText}에 대한 중요한 정보와 분석을 포함하고 있습니다.</p>`;
    }
  );

  return finalContent;
}

export async function POST(request: NextRequest) {
  try {
    // 요청 본문 가져오기
    const body = await request.json();

    // 요청 검증
    const { videoInfo, transcript, sourceUrl } = requestSchema.parse(body);

    // --- 사용자 설정 언어 가져오기 시작 ---
    const supabase = await createClient();
    let targetLanguage = "ko"; // 기본 언어
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      try {
        const { data: settings, error: settingsError } = await supabase
          .from("user_settings")
          .select("language")
          .eq("user_id", user.id)
          .single();
        if (!settingsError && settings?.language) {
          targetLanguage = settings.language;
        }
      } catch (e) {
        console.error("Summarize API: 사용자 설정 조회 오류", e);
      }
    }
    console.log(`Summarize API: 목표 언어 설정됨 - ${targetLanguage}`);
    // --- 사용자 설정 언어 가져오기 끝 ---

    // AI를 사용하여 블로그 요약 생성 (언어 전달)
    let blogSummary = await generateBlogSummary({
      title: videoInfo.title,
      description: videoInfo.description || "",
      channelTitle: videoInfo.channelTitle,
      publishedAt: videoInfo.publishedAt,
      transcript: transcript,
      targetLanguage: targetLanguage, // 가져온 언어 전달
    });

    // "내용..." 패턴 대체
    if (blogSummary && blogSummary.content) {
      blogSummary.content = replaceEllipsisWithContent(blogSummary.content);
    }

    // 요약 데이터에 소스 URL 추가 (있는 경우)
    if (sourceUrl) {
      blogSummary = {
        ...blogSummary,
        sourceUrl,
      };
    }

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
