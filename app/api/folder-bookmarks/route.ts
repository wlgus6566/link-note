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
  digestId: z.union([z.string(), z.number()]).transform((val) => {
    // 숫자 문자열인 경우 숫자로 변환
    if (typeof val === "string") {
      const parsed = parseInt(val);
      return !isNaN(parsed) ? parsed : val;
    }
    return val;
  }),
});

// POST: 북마크를 폴더에 추가
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

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
      .eq("id", folderId as any)
      .eq("user_id", userId as any)
      .single();

    if (folderError || !folderData) {
      console.error("폴더 소유권 확인 오류:", folderError);
      return NextResponse.json(
        { error: "해당 폴더에 접근 권한이 없습니다" },
        { status: 403 }
      );
    }

    // 다이제스트 존재 확인
    try {
      const { data: digestData, error: digestError } = await supabase
        .from("digests")
        .select("id")
        .eq("id", digestId as any)
        .single();

      // UUID가 아닌 숫자 ID로 다시 시도
      if (digestError) {
        console.log("숫자 ID로 다시 시도:", digestId);
        const digestIdNumber = parseInt(digestId as string);

        if (!isNaN(digestIdNumber)) {
          const { data: numberDigestData, error: numberDigestError } =
            await supabase
              .from("digests")
              .select("id")
              .eq("id", digestIdNumber as any)
              .single();

          if (numberDigestError || !numberDigestData) {
            console.error("숫자 다이제스트 확인 오류:", numberDigestError);
            return NextResponse.json(
              { error: "해당 다이제스트가 존재하지 않습니다" },
              { status: 404 }
            );
          }

          // 여기에 도달하면 숫자 ID로 다이제스트를 찾은 것임
        } else {
          console.error("다이제스트 확인 오류:", digestError);
          return NextResponse.json(
            { error: "해당 다이제스트가 존재하지 않습니다" },
            { status: 404 }
          );
        }
      } else if (!digestData) {
        console.error("다이제스트 데이터 없음");
        return NextResponse.json(
          { error: "해당 다이제스트가 존재하지 않습니다" },
          { status: 404 }
        );
      }
    } catch (error) {
      console.error("다이제스트 검증 오류:", error);
      return NextResponse.json(
        { error: "다이제스트 검증 중 오류가 발생했습니다" },
        { status: 500 }
      );
    }

    // 북마크 존재 확인 또는 생성
    let bookmarkId;
    let digestIdForQuery: string | number = digestId;

    // digestId가 이미 숫자인 경우 변환하지 않음
    if (typeof digestId === "number") {
      digestIdForQuery = digestId;
    }
    // digestId가 숫자 문자열인 경우 숫자로 변환
    else if (typeof digestId === "string") {
      const digestIdNumber = parseInt(digestId);
      if (!isNaN(digestIdNumber)) {
        digestIdForQuery = digestIdNumber;
      }
    }

    console.log(
      "북마크 조회에 사용할 digest_id:",
      digestIdForQuery,
      typeof digestIdForQuery
    );

    try {
      const { data: existingBookmark, error: bookmarkError } = await supabase
        .from("bookmarks")
        .select("id")
        .eq("user_id", userId as any)
        .eq("digest_id", digestIdForQuery as any)
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
        console.log("새 북마크 생성:", {
          user_id: userId,
          digest_id: digestIdForQuery,
        });

        const { data: newBookmark, error: createBookmarkError } = await supabase
          .from("bookmarks")
          .insert({
            user_id: userId as any,
            digest_id: digestIdForQuery as any,
          } as any)
          .select("id")
          .single();

        if (createBookmarkError || !newBookmark) {
          console.error("북마크 생성 오류:", createBookmarkError);
          return NextResponse.json(
            { error: "북마크 생성에 실패했습니다" },
            { status: 500 }
          );
        }

        // 타입 단언을 사용하여 id 속성 접근
        bookmarkId = (newBookmark as any).id;
        console.log("새 북마크 생성 성공:", bookmarkId);
      } else {
        // 타입 단언을 사용하여 id 속성 접근
        bookmarkId = (existingBookmark as any).id;
        console.log("기존 북마크 사용:", bookmarkId);
      }
    } catch (error) {
      console.error("북마크 처리 오류:", error);
      return NextResponse.json(
        { error: "북마크 처리 중 오류가 발생했습니다" },
        { status: 500 }
      );
    }

    // 폴더-북마크 중복 확인
    const { data: existingFolderBookmark } = await supabase
      .from("folder_bookmarks")
      .select("id")
      .eq("folder_id", folderId as any)
      .eq("bookmark_id", bookmarkId as any)
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
        folder_id: folderId as any,
        bookmark_id: bookmarkId as any,
      } as any)
      .select("*")
      .single();

    if (folderBookmarkError) {
      console.error("폴더-북마크 연결 오류:", folderBookmarkError);
      return NextResponse.json(
        { error: "폴더에 북마크 추가 실패" },
        { status: 500 }
      );
    }

    // 북마크의 folder_id 필드 업데이트
    const { error: updateError } = await supabase
      .from("bookmarks")
      .update({ folder_id: folderId as any } as any)
      .eq("id", bookmarkId as any)
      .eq("user_id", userId as any);

    if (updateError) {
      console.error("북마크 폴더 업데이트 오류:", updateError);
      // 이 오류는 치명적이지 않으므로 계속 진행
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

    const supabase = await createClient();

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
      .eq("id", folderId as any)
      .eq("user_id", userId as any)
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
      .eq("folder_id", folderId as any)
      .eq("bookmark_id", bookmarkId as any);

    if (deleteError) {
      console.error("폴더-북마크 연결 삭제 오류:", deleteError);
      return NextResponse.json(
        { error: "폴더에서 북마크 제거 실패" },
        { status: 500 }
      );
    }

    // 북마크의 folder_id 필드를 null로 설정
    const { error: updateError } = await supabase
      .from("bookmarks")
      .update({ folder_id: null } as any)
      .eq("id", bookmarkId as any)
      .eq("user_id", userId as any);

    if (updateError) {
      console.error("북마크 폴더 제거 오류:", updateError);
      // 이 오류는 치명적이지 않으므로 계속 진행
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
      .eq("id", folderId as any)
      .eq("user_id", userId as any)
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
      .eq("folder_id", folderId as any);

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
