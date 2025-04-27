import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  type TimelineGroup,
  type SubtitleItem,
  groupSubtitlesIntoParagraphs,
  translateAllSubtitlesOnce,
} from "@/lib/utils/youtube";
import { getYoutubeVideoData } from "@/lib/utils/youtube";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const url = new URL(req.url);
    const digestId = context.params.id;
    const targetLanguage = url.searchParams.get("lang") || "ko";

    // 이미 번역된 데이터가 있는지 확인
    const { data: existingTranslation, error: translationCheckError } =
      await supabase
        .from("translated_paragraphs")
        .select("data")
        .eq("digest_id", digestId)
        .eq("language", targetLanguage)
        .single();

    // 이미 번역된 데이터가 있으면 바로 반환
    if (
      !translationCheckError &&
      existingTranslation &&
      existingTranslation.data
    ) {
      console.log(`✅ 기존 번역 데이터를 찾았습니다. 바로 반환합니다.`);
      return NextResponse.json({
        success: true,
        translatedParagraphs: existingTranslation.data,
      });
    }

    // URL 우선순위:
    // 1. URL 매개변수로 전달된 YouTube URL
    // 2. 다이제스트 ID를 통해 Supabase에서 가져온 URL
    let youtubeUrl = url.searchParams.get("youtube_url");

    if (!youtubeUrl) {
      // 다이제스트 ID로 Supabase에서 URL 가져오기
      console.log(`🔍 다이제스트 ID ${digestId}로 소스 URL 조회 중...`);
      const { data: digest, error } = await supabase
        .from("digests")
        .select("source_url")
        .eq("id", digestId)
        .single();

      if (error || !digest) {
        console.error("❌ 다이제스트 조회 실패:", error);
        return NextResponse.json(
          { error: "다이제스트를 찾을 수 없습니다." },
          { status: 404 }
        );
      }

      youtubeUrl = digest.source_url;
      console.log(`🔗 소스 URL 조회 완료: ${youtubeUrl}`);
    }

    if (!youtubeUrl) {
      return NextResponse.json(
        { error: "유튜브 URL이 제공되지 않았습니다." },
        { status: 400 }
      );
    }

    // ✅ 유튜브 데이터 가져오기
    console.log(`🎬 유튜브 데이터 요청: ${youtubeUrl}`);
    const youtubeData = await getYoutubeVideoData(youtubeUrl);

    if (
      !youtubeData ||
      !youtubeData.timeline ||
      youtubeData.timeline.length === 0
    ) {
      return NextResponse.json(
        { error: "유튜브 자막을 가져오지 못했습니다." },
        { status: 404 }
      );
    }

    // timeline에서 모든 자막을 추출
    const allSubtitles: SubtitleItem[] = youtubeData.timeline.flatMap(
      (group: TimelineGroup) => group.subtitles || []
    );

    // 자막 통계 로깅
    const emptySubtitles = allSubtitles.filter(
      (s) => !s.text || !s.text.trim()
    ).length;
    const nonEmptySubtitles = allSubtitles.length - emptySubtitles;

    console.log(
      `🎥 자막 가져오기 완료 (총 ${allSubtitles.length}개 자막, 빈 자막: ${emptySubtitles}개, 내용 있는 자막: ${nonEmptySubtitles}개)`
    );
    console.log(
      `🕒 첫 자막 시간: ${allSubtitles[0]?.start}, 마지막 자막 시간: ${
        allSubtitles[allSubtitles.length - 1]?.start
      }`
    );

    // 필터링 여부 (기본값: 필터링하지 않음)
    const filterEmpty = url.searchParams.get("filter_empty") === "true";

    // 필터링 옵션이 활성화되면 빈 자막 제거
    const subtitlesToTranslate = filterEmpty
      ? allSubtitles.filter((s) => s.text && s.text.trim().length > 0)
      : allSubtitles;

    if (filterEmpty) {
      console.log(
        `🧹 빈 자막 필터링: ${allSubtitles.length}개 → ${subtitlesToTranslate.length}개`
      );
    }

    if (subtitlesToTranslate.length === 0) {
      return NextResponse.json(
        { error: "번역할 자막이 없습니다." },
        { status: 404 }
      );
    }

    // 번역 수행
    const translatedSubtitles = await translateAllSubtitlesOnce(
      subtitlesToTranslate,
      targetLanguage
    );

    if (translatedSubtitles.length === 0) {
      return NextResponse.json(
        { error: "번역된 데이터가 없습니다." },
        { status: 500 }
      );
    }

    // 번역 결과 통계
    const emptyTranslated = translatedSubtitles.filter(
      (s) => !s.text || !s.text.trim()
    ).length;
    const nonEmptyTranslated = translatedSubtitles.length - emptyTranslated;

    console.log(`✅ 번역 완료 (${translatedSubtitles.length}개 자막)`);
    console.log(
      `📊 번역 통계: 내용 있는 자막 ${nonEmptyTranslated}개 (${Math.round(
        (nonEmptyTranslated / translatedSubtitles.length) * 100
      )}%), 빈 자막 ${emptyTranslated}개`
    );
    console.log(
      `🕒 첫 번역 자막 시간: ${
        translatedSubtitles[0]?.start
      }, 마지막 번역 자막 시간: ${
        translatedSubtitles[translatedSubtitles.length - 1]?.start
      }`
    );

    const translatedParagraphs = groupSubtitlesIntoParagraphs(
      translatedSubtitles,
      { filterEmpty }
    );
    console.log(
      `✅ 10문장 단위 문단화 완료 (${translatedParagraphs.length}개 문단)`
    );
    console.log(
      `🕒 첫 문단 시간: ${translatedParagraphs[0]?.start}, 마지막 문단 시간: ${
        translatedParagraphs[translatedParagraphs.length - 1]?.start
      }`
    );

    // 번역 결과를 데이터베이스에 저장
    try {
      // 기존 번역 데이터 확인
      const { data: existingData } = await supabase
        .from("translated_paragraphs")
        .select("id")
        .eq("digest_id", digestId)
        .eq("language", targetLanguage)
        .single();

      if (existingData) {
        // 기존 데이터 업데이트
        await supabase
          .from("translated_paragraphs")
          .update({
            data: translatedParagraphs,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingData.id);

        console.log(
          `✅ 기존 번역 데이터 업데이트 완료 (ID: ${existingData.id})`
        );
      } else {
        // 새 데이터 삽입
        const { data: insertedData, error: insertError } = await supabase
          .from("translated_paragraphs")
          .insert({
            digest_id: digestId,
            language: targetLanguage,
            data: translatedParagraphs,
          })
          .select("id")
          .single();

        if (insertError) {
          console.error("❌ 번역 데이터 저장 오류:", insertError);
        } else {
          console.log(`✅ 새 번역 데이터 저장 완료 (ID: ${insertedData.id})`);
        }
      }
    } catch (dbError) {
      console.error("❌ 번역 데이터 DB 저장 오류:", dbError);
      // DB 저장 실패해도 사용자에게는 번역 결과 반환
    }

    // 응답 반환
    return NextResponse.json({
      success: true,
      videoId: youtubeData.videoId,
      videoTitle: youtubeData.videoInfo?.title || "제목 없음",
      videoDuration: youtubeData.videoInfo?.duration || "PT0S",
      totalSubtitles: translatedSubtitles.length,
      totalParagraphs: translatedParagraphs.length,
      translatedSubtitles,
      translatedParagraphs,
    });
  } catch (error) {
    console.error("❗ 서버 오류 발생:", error);
    return NextResponse.json(
      {
        error: "자막 번역 중 서버 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
