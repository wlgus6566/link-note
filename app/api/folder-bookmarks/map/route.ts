import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 타입 선언 수정
interface FolderBookmark {
  folder_id: number;
  bookmark_id: number;
  bookmarks: { digest_id: number }[];
}

// GET: 사용자의 모든 폴더와, 각 폴더에 포함된 북마크 ID를 맵으로 반환
export async function GET(req: Request) {
  console.log("폴더-북마크 맵 API 요청 수신");

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

    // 1. 사용자의 모든 폴더 가져오기
    const { data: folders, error: folderError } = await supabase
      .from("folders")
      .select("id")
      .eq("user_id", userId as any);

    if (folderError) {
      console.error("폴더 목록 조회 오류:", folderError);
      return NextResponse.json(
        { success: false, error: "폴더 목록 조회 중 오류 발생" },
        { status: 500 }
      );
    }

    // 타입 안전하게 처리
    const folderList = (folders || []) as Array<{ id: number }>;

    // 폴더 ID가 없으면 빈 맵 반환
    if (folderList.length === 0) {
      return NextResponse.json({
        success: true,
        folderBookmarksMap: {},
      });
    }

    // 2. 사용자의 모든 폴더-북마크 관계 가져오기
    const { data: allFolderBookmarks, error: bookmarksError } = (await supabase
      .from("folder_bookmarks")
      .select(
        `
        folder_id,
        bookmark_id,
        bookmarks:bookmark_id (
          digest_id
        )
      `
      )) as any; // 타입 오류 해결을 위해 any로 캐스팅

    if (bookmarksError) {
      console.error("폴더-북마크 관계 조회 오류:", bookmarksError);
      return NextResponse.json(
        { success: false, error: "폴더-북마크 관계 조회 중 오류 발생" },
        { status: 500 }
      );
    }

    // 데이터 구조 로깅
    if (allFolderBookmarks && allFolderBookmarks.length > 0) {
      console.log(
        "폴더-북마크 데이터 예시:",
        JSON.stringify(allFolderBookmarks[0], null, 2)
      );
    }

    // 3. 폴더별 북마크 ID 맵 구성
    const folderBookmarksMap: Record<string, number[]> = {};

    // 배열인 것을 고려하여 접근 방식 수정
    allFolderBookmarks.forEach((item: any) => {
      const folderId = item.folder_id;
      const digestId = item.bookmarks && item.bookmarks[0]?.digest_id;

      if (digestId) {
        if (!folderBookmarksMap[folderId]) {
          folderBookmarksMap[folderId] = [];
        }

        if (!folderBookmarksMap[folderId].includes(digestId)) {
          folderBookmarksMap[folderId].push(digestId);
        }
      }
    });

    console.log(
      `${Object.keys(folderBookmarksMap).length}개 폴더의 북마크 맵 생성 완료`
    );

    return NextResponse.json({
      success: true,
      folderBookmarksMap,
    });
  } catch (error) {
    console.error("폴더-북마크 맵 조회 중 오류 발생:", error);
    return NextResponse.json(
      { success: false, error: "폴더-북마크 맵 조회 중 오류 발생" },
      { status: 500 }
    );
  }
}
