import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// 사용자 정보 업데이트 스키마
const updateUserSchema = z.object({
  name: z.string().optional(),
  bio: z.string().optional(),
  avatar: z.string().optional(),
});

// GET: 현재 로그인된 사용자 정보 조회
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    // 세션 확인
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: "로그인이 필요합니다" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Supabase Auth의 사용자 정보
    const { data: userInfo, error: userInfoError } =
      await supabase.auth.getUser();

    if (userInfoError || !userInfo?.user) {
      return NextResponse.json(
        { error: "인증된 사용자 정보를 불러오지 못했습니다." },
        { status: 401 }
      );
    }

    // Custom users 테이블의 사용자 정보
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("auth_id", userId as any)
      .single();

    if (userError) {
      // 사용자 정보가 없으면 생성
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert([
          {
            auth_id: userId as any,
            email: session.user.email || "",
            name:
              session.user.user_metadata?.name ||
              session.user.user_metadata?.full_name ||
              "사용자",
            avatar: session.user.user_metadata?.avatar_url,
          },
        ] as any)
        .select()
        .single();

      if (createError) {
        console.error("사용자 프로필 생성 오류:", createError);
        return NextResponse.json(
          { error: "사용자 프로필을 생성하는데 실패했습니다" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        user: {
          ...newUser,
          email: session.user.email,
          auth_metadata: userInfo.user.user_metadata,
        },
      });
    }

    // 사용자 정보 반환
    return NextResponse.json({
      user: {
        ...userData,
        email: session.user.email,
        auth_metadata: userInfo.user.user_metadata,
      },
    });
  } catch (error) {
    console.error("사용자 정보 조회 오류:", error);
    return NextResponse.json(
      { error: "사용자 정보 조회 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// PATCH: 사용자 정보 업데이트
export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();

    // 세션 확인
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return NextResponse.json(
        { error: "로그인이 필요합니다" },
        { status: 401 }
      );
    }

    const userId = userData.user.id;

    // 요청 본문 파싱
    const requestBody = await req.json();

    // 유효성 검사
    const validationResult = updateUserSchema.safeParse(requestBody);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "유효하지 않은 요청 데이터입니다" },
        { status: 400 }
      );
    }

    const { name, bio, avatar } = validationResult.data;

    // 업데이트할 필드 설정
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;

    // 사용자 정보 업데이트
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update(updateData)
      .eq("auth_id", userId as any)
      .select()
      .single();

    if (updateError) {
      console.error("사용자 정보 업데이트 오류:", updateError);
      return NextResponse.json(
        { error: "사용자 정보 업데이트에 실패했습니다" },
        { status: 500 }
      );
    }

    // 업데이트된 사용자 정보 반환
    return NextResponse.json({
      user: updatedUser,
      message: "사용자 정보가 성공적으로 업데이트되었습니다",
    });
  } catch (error) {
    console.error("사용자 정보 업데이트 오류:", error);
    return NextResponse.json(
      { error: "사용자 정보 업데이트 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
