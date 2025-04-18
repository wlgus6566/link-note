import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { z } from "zod";

// 요청 스키마 정의
const bookmarkRequestSchema = z.object({
  digest_id: z
    .union([z.number(), z.string()])
    .transform((val) => (typeof val === "string" ? parseInt(val) : val)),
  folder_id: z
    .union([z.number(), z.string()])
    .optional()
    .transform((val) =>
      val === undefined
        ? undefined
        : typeof val === "string"
        ? parseInt(val)
        : val
    ),
});

export async function POST(req: Request) {
  console.log("북마크 저장 API 요청 수신");

  try {
    const supabase = await createClient();
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

    const { digest_id, folder_id } = validatedData.data;
    const userId = session.user.id;

    // 이미 저장된 북마크가 있는지 확인
    const { data: existingBookmark } = await supabase
      .from("bookmarks")
      .select()
      .eq("user_id", userId)
      .eq("digest_id", digest_id)
      .maybeSingle();

    let bookmarkId;

    if (existingBookmark) {
      bookmarkId = existingBookmark.id;
      console.log("이미 저장된 북마크 사용:", bookmarkId);
    } else {
      // 북마크 저장
      const { data: bookmark, error } = await supabase
        .from("bookmarks")
        .insert({
          user_id: userId,
          digest_id: digest_id,
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

      bookmarkId = bookmark.id;
      console.log("새 북마크 생성 완료:", bookmarkId);
    }

    // folder_id가 제공된 경우, 폴더-북마크 관계 생성
    if (folder_id) {
      // 이미 해당 폴더에 북마크가 있는지 확인
      const { data: existingRelation } = await supabase
        .from("folder_bookmarks")
        .select()
        .eq("folder_id", folder_id)
        .eq("bookmark_id", bookmarkId)
        .maybeSingle();

      if (existingRelation) {
        console.log("이미 폴더에 북마크가 저장되어 있습니다.");
      } else {
        // 폴더-북마크 관계 생성
        const { error: folderError } = await supabase
          .from("folder_bookmarks")
          .insert({
            folder_id: folder_id,
            bookmark_id: bookmarkId,
            created_at: new Date().toISOString(),
          });

        if (folderError) {
          console.error("폴더-북마크 관계 저장 오류:", folderError);
          // 북마크는 이미 저장되었지만 폴더 관계 저장에 실패한 경우
          return NextResponse.json(
            { success: false, error: "폴더에 북마크 저장 중 오류 발생" },
            { status: 500 }
          );
        }

        console.log(`북마크를 폴더(${folder_id})에 저장 완료`);
      }
    }

    return NextResponse.json({
      success: true,
      message: "북마크가 저장되었습니다.",
      bookmarkId,
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
    const supabase = await createClient();
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
    const supabase = await createClient();
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
