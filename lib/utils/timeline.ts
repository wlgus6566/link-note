import { createClient } from "@/lib/supabase/client";
import { BookmarkItem } from "@/types/timeline";
import { timelineBookmarks } from "@/lib/db/schema";

// 타임라인 북마크를 Supabase에 저장
export async function saveTimelineBookmark(
  digestId: number,
  timelineId: string,
  seconds: number,
  text: string,
  memo?: string
) {
  const supabase = createClient();

  // 유저 세션 확인
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    console.log("사용자 로그인이 필요합니다.");
    return { error: "사용자 로그인이 필요합니다." };
  }

  // 타임라인 북마크 저장
  const { data, error } = await supabase
    .from("timeline_bookmarks")
    .upsert(
      {
        user_id: sessionData.session.user.id,
        digest_id: digestId,
        timeline_id: timelineId,
        seconds,
        text,
        memo,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id, digest_id, timeline_id",
      }
    )
    .select();

  if (error) {
    console.error("타임라인 북마크 저장 오류:", error);
    return { error: error.message };
  }

  return { data, success: true };
}

// 타임라인 북마크 삭제
export async function deleteTimelineBookmark(
  timelineId: string,
  digestId: number
) {
  const supabase = createClient();

  // 유저 세션 확인
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    console.log("사용자 로그인이 필요합니다.");
    return { error: "사용자 로그인이 필요합니다." };
  }

  // 타임라인 북마크 삭제
  const { error } = await supabase
    .from("timeline_bookmarks")
    .delete()
    .eq("timeline_id", timelineId)
    .eq("digest_id", digestId)
    .eq("user_id", sessionData.session.user.id);

  if (error) {
    console.error("타임라인 북마크 삭제 오류:", error);
    return { error: error.message };
  }

  return { success: true };
}

// 사용자의 타임라인 북마크 목록 가져오기
export async function getUserTimelineBookmarks() {
  const supabase = createClient();

  // 유저 세션 확인
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    console.log("사용자 로그인이 필요합니다.");
    return { error: "사용자 로그인이 필요합니다." };
  }

  // 타임라인 북마크 조회 (digest 정보 포함)
  const { data, error } = await supabase
    .from("timeline_bookmarks")
    .select(
      `
      id,
      timeline_id,
      seconds,
      text,
      memo,
      created_at,
      updated_at,
      digest_id,
      digests (
        id, 
        title, 
        source_url, 
        image,
        video_info,
        source_type
      )
    `
    )
    .eq("user_id", sessionData.session.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("타임라인 북마크 조회 오류:", error);
    return { error: error.message };
  }

  return { data, success: true };
}

// 특정 다이제스트의 타임라인 북마크 목록 가져오기
export async function getDigestTimelineBookmarks(digestId: number) {
  const supabase = createClient();

  // 유저 세션 확인
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    console.log("사용자 로그인이 필요합니다.");
    return { error: "사용자 로그인이 필요합니다." };
  }

  // 특정 다이제스트의 타임라인 북마크 조회
  const { data, error } = await supabase
    .from("timeline_bookmarks")
    .select()
    .eq("user_id", sessionData.session.user.id)
    .eq("digest_id", digestId)
    .order("seconds", { ascending: true });

  if (error) {
    console.error("다이제스트 타임라인 북마크 조회 오류:", error);
    return { error: error.message };
  }

  return { data, success: true };
}

// 로컬 스토리지의 북마크를 Supabase와 동기화
export async function syncLocalTimelineBookmarks(digestId: number) {
  if (typeof window === "undefined") return;

  try {
    const bookmarkKey = `bookmarks_timeline_${digestId}`;
    const storedBookmarks = localStorage.getItem(bookmarkKey);

    if (!storedBookmarks) return { success: true, syncCount: 0 };

    const parsedBookmarks: Record<string, BookmarkItem> =
      JSON.parse(storedBookmarks);
    const bookmarkEntries = Object.entries(parsedBookmarks);

    if (bookmarkEntries.length === 0) return { success: true, syncCount: 0 };

    // 이미 동기화된 데이터인지 확인
    const syncKey = `sync_status_${digestId}`;
    const lastSyncTime = localStorage.getItem(syncKey);
    const currentTime = Date.now();

    // 마지막 동기화 후 5분 이내면 스킵 (최적화)
    if (lastSyncTime && currentTime - parseInt(lastSyncTime) < 5 * 60 * 1000) {
      console.log("최근에 동기화되었습니다. 스킵합니다.");
      return { success: true, syncCount: 0, skipped: true };
    }

    const supabase = createClient();

    // 유저 세션 확인
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.log("사용자 로그인이 필요합니다.");
      return { error: "사용자 로그인이 필요합니다." };
    }

    // 북마크 일괄 업서트를 위한 데이터 준비
    const batchData = bookmarkEntries.map(([_, bookmark]) => ({
      user_id: sessionData.session.user.id,
      digest_id: digestId,
      timeline_id: bookmark.id,
      seconds: bookmark.seconds,
      text: bookmark.text,
      memo: bookmark.memo,
      updated_at: new Date().toISOString(),
    }));

    // 북마크 일괄 업서트
    const { data, error } = await supabase
      .from("timeline_bookmarks")
      .upsert(batchData, {
        onConflict: "user_id, digest_id, timeline_id",
      });

    if (error) {
      console.error("타임라인 북마크 일괄 동기화 오류:", error);
      return { error: error.message };
    }

    // 동기화 시간 저장
    localStorage.setItem(syncKey, currentTime.toString());

    console.log(
      `${bookmarkEntries.length}개의 북마크가 일괄 동기화되었습니다.`
    );
    return { success: true, syncCount: bookmarkEntries.length };
  } catch (error) {
    console.error("북마크 동기화 오류:", error);
    return { error: "북마크 동기화 실패" };
  }
}

// 시간 포맷팅 함수 (초 -> HH:MM:SS)
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  return `${minutes.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}
