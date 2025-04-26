import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// 사용자 설정 가져오기
export async function GET(req: NextRequest) {
  try {
    // Supabase 클라이언트 생성
    const supabase = await createClient();

    // 사용자 세션 가져오기
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) {
      console.error("세션 오류:", sessionError.message);
      return NextResponse.json(
        { error: "인증 세션 확인 중 오류가 발생했습니다" },
        { status: 500 }
      );
    }

    if (!sessionData.session) {
      return NextResponse.json(
        { error: "로그인이 필요합니다" },
        { status: 401 }
      );
    }

    const userId = sessionData.session.user.id;

    // user_settings 테이블에서 사용자 설정 가져오기
    const { data: settings, error: settingsError } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    // 설정이 없거나 오류가 발생한 경우 기본 설정 반환
    if (settingsError || !settings) {
      // 기본 설정
      const defaultSettings = {
        language: "ko",
        theme: "light",
        auto_translate: false,
        notification: true,
      };

      return NextResponse.json({
        success: true,
        settings: defaultSettings,
        isDefault: true,
      });
    }

    return NextResponse.json({
      success: true,
      settings,
      isDefault: false,
    });
  } catch (error: any) {
    console.error("설정 가져오기 오류:", error);
    return NextResponse.json(
      { error: "설정을 가져오는 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// 사용자 설정 업데이트
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { language, theme, auto_translate, notification } = body;

    // Supabase 클라이언트 생성
    const supabase = await createClient();

    // 사용자 세션 가져오기
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) {
      console.error("세션 오류:", sessionError.message);
      return NextResponse.json(
        { error: "인증 세션 확인 중 오류가 발생했습니다" },
        { status: 500 }
      );
    }

    if (!sessionData.session) {
      return NextResponse.json(
        { error: "로그인이 필요합니다" },
        { status: 401 }
      );
    }

    const userId = sessionData.session.user.id;

    // 이미 설정이 있는지 확인
    const { data: existingSettings } = await supabase
      .from("user_settings")
      .select("id")
      .eq("user_id", userId)
      .single();

    // 설정 업데이트 또는 생성
    let result;
    if (existingSettings) {
      // 기존 설정 업데이트
      const { data, error } = await supabase
        .from("user_settings")
        .update({
          language,
          theme,
          auto_translate,
          notification,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .select();

      if (error) {
        throw new Error(error.message);
      }

      result = data;
    } else {
      // 새 설정 생성
      const { data, error } = await supabase
        .from("user_settings")
        .insert({
          user_id: userId,
          language,
          theme,
          auto_translate,
          notification,
        })
        .select();

      if (error) {
        throw new Error(error.message);
      }

      result = data;
    }

    return NextResponse.json({
      success: true,
      settings: result[0],
    });
  } catch (error: any) {
    console.error("설정 업데이트 오류:", error);
    return NextResponse.json(
      { error: "설정을 업데이트하는 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
