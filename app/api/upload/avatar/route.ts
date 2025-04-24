import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";

export const maxDuration = 10;

export async function POST(request: NextRequest) {
  try {
    const { user, session } = await getSession();
    if (!user || !session) {
      return NextResponse.json(
        { error: "로그인이 필요합니다" },
        { status: 401 }
      );
    }

    const userId = user.id;

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "파일이 없습니다" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "이미지 파일만 업로드 가능합니다" },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "이미지 크기는 5MB 이하여야 합니다" },
        { status: 400 }
      );
    }

    const fileBuffer = await file.arrayBuffer();
    const fileData = new Uint8Array(fileBuffer);
    const fileExtension = file.type.split("/")[1];

    // ✅ 고정 파일명 사용
    const fileName = `avatar-latest.${fileExtension}`;
    const path = `avatars/${userId}/${fileName}`;

    const supabase = await createClient();

    // ✅ 덮어쓰기 허용
    const uploadResult = await supabase.storage
      .from("users")
      .upload(path, fileData, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadResult.error) {
      console.error("Storage 업로드 오류:", uploadResult.error);
      return NextResponse.json(
        { error: "이미지 업로드 실패" },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from("users")
      .getPublicUrl(path);
    const avatarUrl = publicUrlData?.publicUrl;

    if (!avatarUrl) {
      return NextResponse.json(
        { error: "공개 URL 생성 실패" },
        { status: 500 }
      );
    }

    // 기존 삭제 불필요! upsert로 덮어쓰기 됨

    const { error: updateError } = await supabase
      .from("users")
      .update({ avatar: avatarUrl })
      .eq("auth_id", user.id);

    if (updateError) {
      console.error("사용자 업데이트 오류:", updateError);
      return NextResponse.json(
        { error: "사용자 정보 업데이트에 실패했습니다" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: avatarUrl });
  } catch (error) {
    console.error("이미지 업로드 처리 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
