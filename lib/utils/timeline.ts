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
  // 개발 단계에서는 로그인 없이도 기능이 동작하도록 로컬 스토리지에만 저장
  console.log("타임라인 북마크 저장 (임시):", {
    digestId,
    timelineId,
    seconds,
    text,
    memo,
  });
  return { success: true, data: { id: timelineId } };

  /* 실제 Supabase 구현은 아래와 같이 사용
  const supabase = createClient();
  
  // 유저 세션 확인
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    console.log("사용자 로그인이 필요합니다.");
    return { error: "사용자 로그인이 필요합니다." };
  }
  
  // 사용자 정보 가져오기
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", sessionData.session.user.id)
    .single();
  
  if (userError || !userData) {
    console.error("사용자 정보를 가져오는데 실패했습니다:", userError);
    return { error: "사용자 정보를 가져오는데 실패했습니다." };
  }
  
  // 타임라인 북마크 저장
  const { data, error } = await supabase.from("timeline_bookmarks").upsert(
    {
      user_id: userData.id,
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
  ).select();
  
  if (error) {
    console.error("타임라인 북마크 저장 오류:", error);
    return { error: error.message };
  }
  
  return { data, success: true };
  */
}

// 타임라인 북마크 삭제
export async function deleteTimelineBookmark(
  timelineId: string,
  digestId: number
) {
  // 개발 단계에서는 로그인 없이도 기능이 동작하도록 로컬 스토리지에만 저장
  console.log("타임라인 북마크 삭제 (임시):", {
    timelineId,
    digestId,
  });
  return { success: true };

  /* 실제 Supabase 구현은 아래와 같이 사용
  const supabase = createClient();
  
  // 유저 세션 확인
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    console.log("사용자 로그인이 필요합니다.");
    return { error: "사용자 로그인이 필요합니다." };
  }
  
  // 사용자 정보 가져오기
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", sessionData.session.user.id)
    .single();
  
  if (userError || !userData) {
    console.error("사용자 정보를 가져오는데 실패했습니다:", userError);
    return { error: "사용자 정보를 가져오는데 실패했습니다." };
  }
  
  // 타임라인 북마크 삭제
  const { error } = await supabase
    .from("timeline_bookmarks")
    .delete()
    .eq("timeline_id", timelineId)
    .eq("digest_id", digestId)
    .eq("user_id", userData.id);
  
  if (error) {
    console.error("타임라인 북마크 삭제 오류:", error);
    return { error: error.message };
  }
  
  return { success: true };
  */
}

// 사용자의 타임라인 북마크 목록 가져오기
export async function getUserTimelineBookmarks() {
  // 개발 단계에서는 로컬 스토리지에서 북마크를 로드하여 반환
  const mockData = getMockTimelineBookmarks();
  return { data: mockData, success: true };

  /* 실제 Supabase 구현은 아래와 같이 사용
  const supabase = createClient();
  
  // 유저 세션 확인
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    console.log("사용자 로그인이 필요합니다.");
    return { error: "사용자 로그인이 필요합니다." };
  }
  
  // 사용자 정보 가져오기
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", sessionData.session.user.id)
    .single();
  
  if (userError || !userData) {
    console.error("사용자 정보를 가져오는데 실패했습니다:", userError);
    return { error: "사용자 정보를 가져오는데 실패했습니다." };
  }
  
  // 타임라인 북마크 조회 (digest 정보 포함)
  const { data, error } = await supabase
    .from("timeline_bookmarks")
    .select(`
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
    `)
    .eq("user_id", userData.id)
    .order("created_at", { ascending: false });
  
  if (error) {
    console.error("타임라인 북마크 조회 오류:", error);
    return { error: error.message };
  }
  
  return { data, success: true };
  */
}

// 특정 다이제스트의 타임라인 북마크 목록 가져오기
export async function getDigestTimelineBookmarks(digestId: number) {
  // 개발 단계에서는 모의 데이터 반환
  const allBookmarks = getMockTimelineBookmarks();
  const filteredBookmarks = allBookmarks.filter(
    (bookmark) => bookmark.digest_id === digestId
  );
  return { data: filteredBookmarks, success: true };

  /* 실제 Supabase 구현은 아래와 같이 사용
  const supabase = createClient();
  
  // 유저 세션 확인
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    console.log("사용자 로그인이 필요합니다.");
    return { error: "사용자 로그인이 필요합니다." };
  }
  
  // 사용자 정보 가져오기
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", sessionData.session.user.id)
    .single();
  
  if (userError || !userData) {
    console.error("사용자 정보를 가져오는데 실패했습니다:", userError);
    return { error: "사용자 정보를 가져오는데 실패했습니다." };
  }
  
  // 특정 다이제스트의 타임라인 북마크 조회
  const { data, error } = await supabase
    .from("timeline_bookmarks")
    .select()
    .eq("user_id", userData.id)
    .eq("digest_id", digestId)
    .order("seconds", { ascending: true });
  
  if (error) {
    console.error("다이제스트 타임라인 북마크 조회 오류:", error);
    return { error: error.message };
  }
  
  return { data, success: true };
  */
}

// 로컬 스토리지의 북마크를 Supabase와 동기화
export async function syncLocalTimelineBookmarks(digestId: number) {
  // 개발 단계에서는 동기화 작업을 시뮬레이션
  console.log(
    `다이제스트 ID ${digestId}의 북마크 동기화 작업이 시뮬레이션됩니다.`
  );
  return { success: true, syncCount: 5 };

  /* 실제 구현은 아래와 같이 사용
  if (typeof window === "undefined") return;

  try {
    const bookmarkKey = `bookmarks_timeline_${digestId}`;
    const storedBookmarks = localStorage.getItem(bookmarkKey);

    if (!storedBookmarks) return;

    const parsedBookmarks: Record<string, BookmarkItem> = JSON.parse(storedBookmarks);
    const bookmarkEntries = Object.entries(parsedBookmarks);

    for (const [id, bookmark] of bookmarkEntries) {
      await saveTimelineBookmark(
        digestId,
        bookmark.id,
        bookmark.seconds,
        bookmark.text,
        bookmark.memo
      );
    }

    console.log(`${bookmarkEntries.length}개의 북마크가 동기화되었습니다.`);
    return { success: true, syncCount: bookmarkEntries.length };
  } catch (error) {
    console.error("북마크 동기화 오류:", error);
    return { error: "북마크 동기화 실패" };
  }
  */
}

// 모의 타임라인 북마크 데이터 생성
function getMockTimelineBookmarks() {
  const bookmarks = [
    {
      id: 1,
      user_id: 1,
      digest_id: 1,
      timeline_id: "bookmark-1",
      seconds: 120,
      text: "GPT-4의 주요 특징 소개",
      memo: "다음 프로젝트에 적용해볼 만한 기능들",
      created_at: "2025-04-10T12:30:00Z",
      updated_at: "2025-04-10T12:30:00Z",
      digests: {
        id: 1,
        title: "GPT-4 완벽 가이드: 새로운 기능과 활용법",
        source_url: "https://www.youtube.com/watch?v=example1",
        source_type: "YouTube",
        image: "/placeholder.svg?height=400&width=800",
        video_info: {
          videoId: "example1",
          channelId: "UC123456",
          channelTitle: "AI 전문가",
          publishedAt: "2025-04-01T10:00:00Z",
          viewCount: "15000",
        },
      },
    },
    {
      id: 2,
      user_id: 1,
      digest_id: 1,
      timeline_id: "bookmark-2",
      seconds: 360,
      text: "GPT-4 활용 사례: 코드 작성 도우미",
      memo: null,
      created_at: "2025-04-10T12:35:00Z",
      updated_at: "2025-04-10T12:35:00Z",
      digests: {
        id: 1,
        title: "GPT-4 완벽 가이드: 새로운 기능과 활용법",
        source_url: "https://www.youtube.com/watch?v=example1",
        source_type: "YouTube",
        image: "/placeholder.svg?height=400&width=800",
        video_info: {
          videoId: "example1",
          channelId: "UC123456",
          channelTitle: "AI 전문가",
          publishedAt: "2025-04-01T10:00:00Z",
          viewCount: "15000",
        },
      },
    },
    {
      id: 3,
      user_id: 1,
      digest_id: 2,
      timeline_id: "bookmark-3",
      seconds: 180,
      text: "React 18의 새로운 기능: 동시성 모드",
      memo: "프로젝트에 적용해야 할 부분",
      created_at: "2025-04-12T09:15:00Z",
      updated_at: "2025-04-12T09:15:00Z",
      digests: {
        id: 2,
        title: "React 18 심층 분석: 동시성과 성능 최적화",
        source_url: "https://www.youtube.com/watch?v=example2",
        source_type: "YouTube",
        image: "/placeholder.svg?height=400&width=800",
        video_info: {
          videoId: "example2",
          channelId: "UC789012",
          channelTitle: "React 마스터",
          publishedAt: "2025-04-05T14:30:00Z",
          viewCount: "24000",
        },
      },
    },
    {
      id: 4,
      user_id: 1,
      digest_id: 3,
      timeline_id: "bookmark-4",
      seconds: 240,
      text: "Next.js 14의 서버 컴포넌트 동작 방식",
      memo: "서버 컴포넌트와 클라이언트 컴포넌트의 차이점",
      created_at: "2025-04-14T15:20:00Z",
      updated_at: "2025-04-14T15:20:00Z",
      digests: {
        id: 3,
        title: "Next.js 14 완벽 가이드: 서버 컴포넌트의 모든 것",
        source_url: "https://www.youtube.com/watch?v=example3",
        source_type: "YouTube",
        image: "/placeholder.svg?height=400&width=800",
        video_info: {
          videoId: "example3",
          channelId: "UC345678",
          channelTitle: "Next.js 개발자",
          publishedAt: "2025-04-08T11:45:00Z",
          viewCount: "18500",
        },
      },
    },
    {
      id: 5,
      user_id: 1,
      digest_id: 4,
      timeline_id: "bookmark-5",
      seconds: 420,
      text: "TypeScript 5.0의 새로운 타입 기능",
      memo: null,
      created_at: "2025-04-15T10:30:00Z",
      updated_at: "2025-04-15T10:30:00Z",
      digests: {
        id: 4,
        title: "TypeScript 5.0 실전 활용법",
        source_url: "https://www.youtube.com/watch?v=example4",
        source_type: "YouTube",
        image: "/placeholder.svg?height=400&width=800",
        video_info: {
          videoId: "example4",
          channelId: "UC567890",
          channelTitle: "TypeScript 전문가",
          publishedAt: "2025-04-10T09:00:00Z",
          viewCount: "12300",
        },
      },
    },
  ];

  return bookmarks;
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
