import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Supabase 클라이언트 생성
    const supabase = await createClient();

    // 인증 세션 확인
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("세션 확인 오류:", sessionError);
      return NextResponse.json(
        { error: "세션 확인 중 오류가 발생했습니다: " + sessionError.message },
        { status: 500 }
      );
    }

    if (!session) {
      return NextResponse.json(
        { error: "인증되지 않은 요청입니다" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    console.log(`회원 탈퇴 처리 시작 - 사용자 ID: ${userId}`);

    // 1. 사용자 관련 데이터 삭제 (트랜잭션은 아니지만 순차적으로 처리)
    try {
      // 타임라인 북마크 삭제
      const { error: timelineBookmarksError } = await supabase
        .from("timeline_bookmarks")
        .delete()
        .eq("user_id", userId);

      if (timelineBookmarksError) {
        console.error("타임라인 북마크 삭제 오류:", timelineBookmarksError);
      } else {
        console.log("타임라인 북마크 삭제 완료");
      }

      // 폴더 북마크 삭제
      const { error: folderBookmarksError } = await supabase
        .from("folder_bookmarks")
        .delete()
        .eq("user_id", userId);

      if (folderBookmarksError) {
        console.error("폴더 북마크 삭제 오류:", folderBookmarksError);
      } else {
        console.log("폴더 북마크 삭제 완료");
      }

      // 북마크 삭제
      const { error: bookmarksError } = await supabase
        .from("bookmarks")
        .delete()
        .eq("user_id", userId);

      if (bookmarksError) {
        console.error("북마크 삭제 오류:", bookmarksError);
      } else {
        console.log("북마크 삭제 완료");
      }

      // 폴더 삭제
      const { error: foldersError } = await supabase
        .from("folders")
        .delete()
        .eq("user_id", userId);

      if (foldersError) {
        console.error("폴더 삭제 오류:", foldersError);
      } else {
        console.log("폴더 삭제 완료");
      }

      // 사용자 프로필 정보 소프트 삭제 (완전 삭제 대신 상태 변경)
      const { error: userUpdateError } = await supabase
        .from("users")
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
          name: "[탈퇴한 사용자]",
          bio: null,
          avatar: null,
        })
        .eq("auth_id", userId);

      if (userUpdateError) {
        console.error("사용자 프로필 소프트 삭제 오류:", userUpdateError);
      } else {
        console.log("사용자 프로필 소프트 삭제 완료");
      }
    } catch (dataError: any) {
      console.error("사용자 데이터 삭제 오류:", dataError);
      return NextResponse.json(
        {
          error:
            "사용자 데이터 삭제 중 오류가 발생했습니다: " + dataError.message,
        },
        { status: 500 }
      );
    }

    // 2. 로그아웃 처리
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      console.error("로그아웃 오류:", signOutError);
    } else {
      console.log("로그아웃 완료");
    }

    return NextResponse.json({
      success: true,
      message:
        "회원 탈퇴가 완료되었습니다. 계정 및 관련 데이터가 삭제되었습니다.",
    });
  } catch (error: any) {
    console.error("회원 탈퇴 처리 오류:", error);
    return NextResponse.json(
      { error: "회원 탈퇴 중 오류가 발생했습니다: " + error.message },
      { status: 500 }
    );
  }
}
