import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { z } from "zod";

// 요청 스키마 정의
const bookmarkRequestSchema = z.object({
  digestId: z.number(),
});

export async function POST(req: Request) {
  console.log("북마크 저장 API 요청 수신");

  try {
    const supabase = createClient(cookies());
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "인증되지 않은 사용자입니다." },
        { status: 401 }
      );
    }

    const requestData = await req.json();
    console.log("요청 데이터:", JSON.stringify(requestData));

    const validatedData = bookmarkRequestSchema.safeParse(requestData);

    if (!validatedData.success) {
      console.error("유효성 검사 실패:", validatedData.error);
      return NextResponse.json(
        { success: false, error: "유효하지 않은 북마크 데이터" },
        { status: 400 }
      );
    }

    const { digestId } = validatedData.data;
    const userId = session.user.id;

    // 이미 저장된 북마크가 있는지 확인
    const { data: existingBookmark } = await supabase
      .from("bookmarks")
      .select()
      .eq("user_id", userId)
      .eq("digest_id", digestId)
      .maybeSingle();

    // 이미 존재하면 중복 저장 방지
    if (existingBookmark) {
      return NextResponse.json({
        success: false,
        message: "이미 저장된 북마크입니다.",
        isBookmarked: true,
      });
    }

    // 북마크 저장
    const { data: bookmark, error } = await supabase
      .from("bookmarks")
      .insert({
        user_id: userId,
        digest_id: digestId,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("북마크 저장 오류:", error);
      return NextResponse.json(
        { success: false, error: "북마크 저장 중 오류 발생" },
        { status: 500 }
      );
    }

    console.log("북마크 저장 성공:", bookmark);

    return NextResponse.json({
      success: true,
      message: "북마크가 저장되었습니다.",
      bookmark,
    });
  } catch (error) {
    console.error("북마크 저장 오류:", error);
    return NextResponse.json(
      { success: false, error: "북마크 저장 중 오류 발생" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  console.log("북마크 삭제 API 요청 수신");

  try {
    const supabase = createClient(cookies());
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "인증되지 않은 사용자입니다." },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const digestId = url.searchParams.get("digestId");

    if (!digestId || isNaN(Number(digestId))) {
      return NextResponse.json(
        { success: false, error: "유효하지 않은 digestId 값입니다." },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // 북마크 삭제
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", userId)
      .eq("digest_id", Number(digestId));

    if (error) {
      console.error("북마크 삭제 오류:", error);
      return NextResponse.json(
        { success: false, error: "북마크 삭제 중 오류 발생" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "북마크가 삭제되었습니다.",
    });
  } catch (error) {
    console.error("북마크 삭제 오류:", error);
    return NextResponse.json(
      { success: false, error: "북마크 삭제 중 오류 발생" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  console.log("북마크 조회 API 요청 수신");

  try {
    const supabase = createClient(cookies());
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "인증되지 않은 사용자입니다." },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const digestId = url.searchParams.get("digestId");
    const userId = session.user.id;

    if (digestId) {
      // 특정 다이제스트의 북마크 상태 확인
      const { data: bookmark } = await supabase
        .from("bookmarks")
        .select()
        .eq("user_id", userId)
        .eq("digest_id", Number(digestId))
        .maybeSingle();

      return NextResponse.json({
        success: true,
        isBookmarked: !!bookmark,
        bookmark,
      });
    } else {
      // 사용자의 모든 북마크 불러오기
      const { data: bookmarks, error } = await supabase
        .from("bookmarks")
        .select(
          `
          *,
          digests (*)
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("북마크 목록 조회 오류:", error);
        return NextResponse.json(
          { success: false, error: "북마크 목록 조회 중 오류 발생" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        bookmarks,
      });
    }
  } catch (error) {
    console.error("북마크 조회 오류:", error);
    return NextResponse.json(
      { success: false, error: "북마크 조회 중 오류 발생" },
      { status: 500 }
    );
  }
}
