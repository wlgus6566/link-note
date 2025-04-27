import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const url = new URL(req.url);
    const digestId = url.searchParams.get("digestId");
    const language = url.searchParams.get("language") || "en";

    if (!digestId) {
      return NextResponse.json(
        { error: "다이제스트 ID가 제공되지 않았습니다" },
        { status: 400 }
      );
    }

    // 번역된 데이터 조회
    const { data, error } = await supabase
      .from("translated_paragraphs")
      .select("*")
      .eq("digest_id", digestId)
      .eq("language", language)
      .single();

    // 데이터가 없는 경우도 정상 응답으로 처리 (404 대신)
    if (error && error.code === "PGRST116") {
      console.log(
        `번역 데이터 없음: digest_id=${digestId}, language=${language}`
      );
      return NextResponse.json({
        success: true,
        data: null,
        translatedParagraphs: [],
        message: "번역된 데이터가 없습니다",
      });
    } else if (error) {
      console.error("번역 데이터 조회 오류:", error);
      return NextResponse.json(
        {
          success: false,
          error: "번역 데이터를 가져오는데 실패했습니다",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data?.data || null,
      translatedParagraphs: data?.data || [],
    });
  } catch (error) {
    console.error("번역 데이터 API 오류:", error);
    return NextResponse.json(
      {
        success: false,
        error: "서버 오류가 발생했습니다",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { digestId, language, translatedData } = body;

    console.log("POST 요청 받음:", {
      digestId,
      language,
      translatedDataLength: translatedData?.length,
    });

    if (!digestId || !language || !translatedData) {
      return NextResponse.json(
        {
          success: false,
          error: "필수 데이터가 누락되었습니다",
          received: { digestId, language, hasTranslatedData: !!translatedData },
        },
        { status: 400 }
      );
    }

    // digestId를 정수로 확실히 변환
    const numericDigestId = parseInt(digestId, 10);
    if (isNaN(numericDigestId)) {
      return NextResponse.json(
        { success: false, error: "유효하지 않은 digestId 형식입니다" },
        { status: 400 }
      );
    }

    // 기존 번역 데이터 확인
    const { data: existingTranslation, error: checkError } = await supabase
      .from("translated_paragraphs")
      .select("id")
      .eq("digest_id", numericDigestId)
      .eq("language", language)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("기존 번역 데이터 조회 오류:", checkError);
      return NextResponse.json(
        {
          success: false,
          error: "기존 번역 데이터 확인 중 오류가 발생했습니다",
          details: checkError.message,
        },
        { status: 500 }
      );
    }

    let result;

    if (existingTranslation) {
      console.log(`기존 데이터 업데이트: id=${existingTranslation.id}`);
      // 기존 데이터 업데이트
      result = await supabase
        .from("translated_paragraphs")
        .update({
          data: translatedData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingTranslation.id);
    } else {
      console.log(
        `새 데이터 삽입: digest_id=${numericDigestId}, language=${language}`
      );
      // 새 데이터 삽입
      result = await supabase.from("translated_paragraphs").insert({
        digest_id: numericDigestId,
        language: language,
        data: translatedData,
      });
    }

    if (result.error) {
      console.error("번역 데이터 저장 오류:", result.error);
      return NextResponse.json(
        {
          success: false,
          error: "번역 데이터 저장에 실패했습니다",
          details: result.error.message,
          code: result.error.code,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "번역 데이터가 성공적으로 저장되었습니다",
    });
  } catch (error) {
    console.error("번역 데이터 저장 API 오류:", error);
    return NextResponse.json(
      {
        success: false,
        error: "서버 오류가 발생했습니다",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
