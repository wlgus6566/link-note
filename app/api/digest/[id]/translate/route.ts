import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  type TimelineGroup,
  type SubtitleItem,
  groupSubtitlesIntoParagraphs,
  getVideoTranscript,
  secondsToTimestamp,
  translateParagraphs, // ✨ 문단 번역 함수 (새로 추가한 것)
  getYoutubeVideoData,
} from "@/lib/utils/youtube";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const resolvedParams = await params;
    const digestId = resolvedParams.id;

    // --- 사용자 설정에서 targetLanguage 가져오기 시작 ---
    let targetLanguage = "ko"; // 기본 언어 설정
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      try {
        // user_settings 테이블에서 language 컬럼 조회 (user_id로 필터링)
        const { data: settings, error: settingsError } = await supabase
          .from("user_settings") // 테이블 이름 확인 필요
          .select("language")
          .eq("user_id", user.id) // 컬럼 이름 확인 필요
          .single();

        if (settingsError) {
          console.error("❌ 사용자 설정 조회 오류:", settingsError.message);
          // 오류 발생 시 기본 언어 사용
        } else if (settings && settings.language) {
          targetLanguage = settings.language;
          console.log(`✅ 사용자 설정 언어 적용: ${targetLanguage}`);
        } else {
          console.log(
            `🤔 사용자 설정에 언어가 없습니다. 기본 언어(${targetLanguage}) 사용.`
          );
        }
      } catch (e) {
        console.error("❌ 사용자 설정 조회 중 예외 발생:", e);
      }
    } else {
      console.log(
        "👤 사용자가 로그인하지 않았습니다. 기본 언어(${targetLanguage}) 사용."
      );
    }
    // --- 사용자 설정에서 targetLanguage 가져오기 끝 ---

    // 1. 기존 번역 데이터가 있는지 확인
    const { data: existingTranslation, error: translationCheckError } =
      await supabase
        .from("translated_paragraphs")
        .select("data")
        .eq("digest_id", digestId)
        .eq("language", targetLanguage)
        .maybeSingle();

    if (existingTranslation?.data) {
      console.log(`✅ 기존 번역 데이터를 찾았습니다. 바로 반환합니다.`);
      return NextResponse.json({
        success: true,
        translatedParagraphs: existingTranslation.data,
      });
    }

    // 2. YouTube URL 가져오기
    const url = new URL(req.url);
    let youtubeUrl = url.searchParams.get("youtube_url");
    if (!youtubeUrl) {
      const { data: digest } = await supabase
        .from("digests")
        .select("source_url")
        .eq("id", digestId)
        .single();

      if (!digest?.source_url) {
        return NextResponse.json(
          { error: "다이제스트를 찾을 수 없습니다." },
          { status: 404 }
        );
      }

      youtubeUrl = digest.source_url;
    }

    // 3. 자막 가져오기
    const youtubeData = await getYoutubeVideoData(youtubeUrl || "");
    const { groupedParagraphs } = await getVideoTranscript(youtubeData.videoId);

    // // 5. 문단 텍스트만 뽑아서 번역 요청
    const paragraphTexts = groupedParagraphs.map((p) => p.text || "");
    const translatedTexts = await translateParagraphs(
      paragraphTexts,
      targetLanguage
    );

    const finalParagraphs: any = groupedParagraphs.map((p, idx) => ({
      ...p,
      text: translatedTexts[idx] || p.text,
    }));

    // 6. Supabase에 저장
    try {
      const { data: existing } = await supabase
        .from("translated_paragraphs")
        .select("id")
        .eq("digest_id", digestId)
        .eq("language", targetLanguage)
        .maybeSingle();

      if (existing?.id) {
        await supabase
          .from("translated_paragraphs")
          .update({
            data: finalParagraphs,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
        console.log(`✅ 기존 데이터 업데이트 완료`);
      } else {
        const { error: insertError } = await supabase
          .from("translated_paragraphs")
          .insert({
            digest_id: digestId,
            language: targetLanguage,
            data: finalParagraphs,
          });

        if (insertError) console.error("❌ 새 데이터 삽입 실패:", insertError);
        else console.log("✅ 새 번역 데이터 저장 완료");
      }
    } catch (dbError) {
      console.error("❌ DB 저장 중 오류 발생:", dbError);
    }

    return NextResponse.json({
      success: true,
      videoId: youtubeData.videoId,
      videoTitle: youtubeData.videoInfo?.title || "제목 없음",
      videoDuration: youtubeData.videoInfo?.duration || "PT0S",
      totalParagraphs: finalParagraphs.length,
      translatedParagraphs: finalParagraphs,
    });
  } catch (error) {
    console.error("❗ 서버 오류 발생:", error);
    return NextResponse.json(
      {
        error: "문단 번역 중 서버 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
