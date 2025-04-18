import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { z } from "zod";

// 폴더-북마크 관계 요청 스키마
const folderBookmarkRequestSchema = z.object({
  folder_id: z.number(),
  bookmark_id: z.number(),
});

// 폴더-북마크 연결 요청 스키마
const FolderBookmarkSchema = z.object({
  folderId: z.string().uuid("유효한 폴더 ID가 필요합니다"),
  digestId: z.string().uuid("유효한 다이제스트 ID가 필요합니다"),
});

// POST: 북마크를 폴더에 추가
export async function POST(request: Request) {
  try {
    const supabase = createClient();

    // 세션 확인
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: "로그인이 필요합니다" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 요청 내용 파싱
    const body = await request.json();

    // 요청 검증
    const validationResult = FolderBookmarkSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.errors
        .map((err) => err.message)
        .join(", ");
      return NextResponse.json({ error: errors }, { status: 400 });
    }

    const { folderId, digestId } = validationResult.data;

    // 폴더 소유권 확인
    const { data: folderData, error: folderError } = await supabase
      .from("folders")
      .select("id")
      .eq("id", folderId)
      .eq("user_id", userId)
      .single();

    if (folderError || !folderData) {
      console.error("폴더 소유권 확인 오류:", folderError);
      return NextResponse.json(
        { error: "해당 폴더에 접근 권한이 없습니다" },
        { status: 403 }
      );
    }

    // 다이제스트 존재 확인
    const { data: digestData, error: digestError } = await supabase
      .from("digests")
      .select("id")
      .eq("id", digestId)
      .single();

    if (digestError || !digestData) {
      console.error("다이제스트 확인 오류:", digestError);
      return NextResponse.json(
        { error: "해당 다이제스트가 존재하지 않습니다" },
        { status: 404 }
      );
    }

    // 북마크 존재 확인 또는 생성
    let bookmarkId;

    const { data: existingBookmark, error: bookmarkError } = await supabase
      .from("bookmarks")
      .select("id")
      .eq("user_id", userId)
      .eq("digest_id", digestId)
      .maybeSingle();

    if (bookmarkError) {
      console.error("북마크 조회 오류:", bookmarkError);
      return NextResponse.json(
        { error: "북마크 확인에 실패했습니다" },
        { status: 500 }
      );
    }

    // 북마크가 없는 경우 생성
    if (!existingBookmark) {
      const { data: newBookmark, error: createBookmarkError } = await supabase
        .from("bookmarks")
        .insert({
          user_id: userId,
          digest_id: digestId,
        })
        .select("id")
        .single();

      if (createBookmarkError || !newBookmark) {
        console.error("북마크 생성 오류:", createBookmarkError);
        return NextResponse.json(
          { error: "북마크 생성에 실패했습니다" },
          { status: 500 }
        );
      }

      bookmarkId = newBookmark.id;
    } else {
      bookmarkId = existingBookmark.id;
    }

    // 폴더-북마크 중복 확인
    const { data: existingFolderBookmark } = await supabase
      .from("folder_bookmarks")
      .select("id")
      .eq("folder_id", folderId)
      .eq("bookmark_id", bookmarkId)
      .maybeSingle();

    if (existingFolderBookmark) {
      return NextResponse.json({
        message: "이미 해당 폴더에 추가된 북마크입니다",
        success: true,
      });
    }

    // 폴더-북마크 연결 생성
    const { data: folderBookmark, error: folderBookmarkError } = await supabase
      .from("folder_bookmarks")
      .insert({
        folder_id: folderId,
        bookmark_id: bookmarkId,
      })
      .select("*")
      .single();

    if (folderBookmarkError) {
      console.error("폴더-북마크 연결 오류:", folderBookmarkError);
      return NextResponse.json(
        { error: "폴더에 북마크 추가 실패" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "북마크가 폴더에 성공적으로 추가되었습니다",
        folderBookmark,
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("폴더-북마크 API 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// DELETE: 폴더에서 북마크 제거
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const folderId = url.searchParams.get("folderId");
    const bookmarkId = url.searchParams.get("bookmarkId");

    if (!folderId || !bookmarkId) {
      return NextResponse.json(
        { error: "폴더 ID와 북마크 ID가 필요합니다" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // 세션 확인
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: "로그인이 필요합니다" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 폴더 소유권 확인
    const { data: folderData, error: folderError } = await supabase
      .from("folders")
      .select("id")
      .eq("id", folderId)
      .eq("user_id", userId)
      .single();

    if (folderError || !folderData) {
      console.error("폴더 소유권 확인 오류:", folderError);
      return NextResponse.json(
        { error: "해당 폴더에 접근 권한이 없습니다" },
        { status: 403 }
      );
    }

    // 폴더-북마크 연결 삭제
    const { error: deleteError } = await supabase
      .from("folder_bookmarks")
      .delete()
      .eq("folder_id", folderId)
      .eq("bookmark_id", bookmarkId);

    if (deleteError) {
      console.error("폴더-북마크 연결 삭제 오류:", deleteError);
      return NextResponse.json(
        { error: "폴더에서 북마크 제거 실패" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "북마크가 폴더에서 제거되었습니다",
      success: true,
    });
  } catch (error) {
    console.error("폴더-북마크 삭제 API 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// 폴더의 북마크 목록 조회
export async function GET(req: Request) {
  console.log("폴더의 북마크 목록 조회 API 요청 수신");

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

    const userId = session.user.id;
    const url = new URL(req.url);
    const folderId = url.searchParams.get("folder_id");

    if (!folderId) {
      return NextResponse.json(
        { success: false, error: "folder_id가 필요합니다." },
        { status: 400 }
      );
    }

    // 폴더가 사용자의 것인지 확인
    const { data: folder, error: folderError } = await supabase
      .from("folders")
      .select("*")
      .eq("id", folderId)
      .eq("user_id", userId)
      .single();

    if (folderError || !folder) {
      console.error("폴더 확인 오류:", folderError);
      return NextResponse.json(
        {
          success: false,
          error: "폴더를 찾을 수 없거나 접근 권한이 없습니다.",
        },
        { status: 404 }
      );
    }

    // 폴더의 북마크 목록 조회
    const { data: folderBookmarks, error } = await supabase
      .from("folder_bookmarks")
      .select(
        `
        *,
        bookmarks:bookmark_id (
          *,
          digests:digest_id (*)
        )
      `
      )
      .eq("folder_id", folderId);

    if (error) {
      console.error("폴더-북마크 목록 조회 오류:", error);
      return NextResponse.json(
        { success: false, error: "폴더-북마크 목록 조회 중 오류 발생" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      folderBookmarks,
    });
  } catch (error) {
    console.error("폴더-북마크 목록 조회 중 오류 발생:", error);
    return NextResponse.json(
      { success: false, error: "폴더-북마크 목록 조회 중 오류 발생" },
      { status: 500 }
    );
  }
}
