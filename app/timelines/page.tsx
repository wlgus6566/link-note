"use client";

import type React from "react";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Clock,
  Play,
  Edit,
  Calendar,
  LogIn,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import BottomNav from "@/components/bottom-nav";
import { getUserTimelineBookmarks, formatTime } from "@/lib/utils/timeline";
import type { TimelineBookmark } from "@/types/timeline";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { SimpleToast } from "@/components/ui/toast";
import { MemoPopup } from "@/components/ui/memo-popup";
import { YouTubePopup } from "@/components/ui/youtube-popup";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { useAuth } from "@/lib/hooks/useAuth";

// 그룹화된 북마크 타입 정의
interface GroupedBookmarks {
  digestId: number;
  digestTitle: string;
  sourceUrl: string;
  sourceType: string;
  image?: string;
  videoInfo?: {
    videoId?: string;
    channelId?: string;
    channelTitle?: string;
    publishedAt?: string;
    viewCount?: string;
    duration?: string;
  };
  bookmarkCount: number;
  bookmarks: TimelineBookmark[];
}

export default function TimelinesPage() {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<TimelineBookmark[]>([]);
  const [groupedBookmarks, setGroupedBookmarks] = useState<GroupedBookmarks[]>(
    []
  );
  const [filteredGroups, setFilteredGroups] = useState<GroupedBookmarks[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showMemoPopup, setShowMemoPopup] = useState(false);
  const [currentBookmark, setCurrentBookmark] =
    useState<TimelineBookmark | null>(null);
  const [youtubePopup, setYoutubePopup] = useState({
    isOpen: false,
    videoId: "",
    startTime: 0,
  });
  const [expandedDigests, setExpandedDigests] = useState<
    Record<number, boolean>
  >({});
  const [authError, setAuthError] = useState<string | null>(null);
  const fetchingRef = useRef(false);

  // useAuth 훅 사용
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // 북마크 데이터 가져오기 (인증 의존성 제거)
  const fetchBookmarks = useCallback(async () => {
    if (fetchingRef.current || !isAuthenticated) return;

    try {
      setFetching(true);
      fetchingRef.current = true;

      const response = await getUserTimelineBookmarks();

      if (response.success && response.data) {
        // API 응답을 TimelineBookmark 타입에 맞게 변환
        const bookmarkData = response.data.map((item: any) => ({
          ...item,
          user_id: 0, // user_id가 응답에 없으므로 기본값 설정
        }));

        setBookmarks(bookmarkData);

        // 북마크를 digest_id 기준으로 그룹화
        const grouped = groupBookmarksByDigest(bookmarkData);
        setGroupedBookmarks(grouped);
        setFilteredGroups(grouped);
      } else {
        console.error("북마크 로드 오류:", response.error);
        setToastMessage("북마크를 불러오는데 실패했습니다.");
        setShowToast(true);
      }
    } catch (error) {
      console.error("북마크 로드 오류:", error);
      setToastMessage("북마크를 불러오는데 실패했습니다.");
      setShowToast(true);
    } finally {
      setFetching(false);
      fetchingRef.current = false;
    }
  }, [isAuthenticated]);

  // 북마크를 digest_id 기준으로 그룹화하는 함수
  const groupBookmarksByDigest = (
    bookmarks: TimelineBookmark[]
  ): GroupedBookmarks[] => {
    const groupsMap: Record<number, GroupedBookmarks> = {};

    bookmarks.forEach((bookmark) => {
      const digestId = bookmark.digest_id;

      if (!groupsMap[digestId]) {
        groupsMap[digestId] = {
          digestId,
          digestTitle: bookmark.digests?.title || "제목 없음",
          sourceUrl: bookmark.digests?.source_url || "",
          sourceType: bookmark.digests?.source_type || "",
          image: bookmark.digests?.image,
          videoInfo: bookmark.digests?.video_info,
          bookmarkCount: 0,
          bookmarks: [],
        };
      }

      groupsMap[digestId].bookmarks.push(bookmark);
      groupsMap[digestId].bookmarkCount += 1;
    });

    // 각 그룹 내에서 북마크를 시간순으로 정렬
    Object.values(groupsMap).forEach((group) => {
      group.bookmarks.sort((a, b) => a.seconds - b.seconds);
    });

    return Object.values(groupsMap);
  };

  // 인증 상태에 따른 UI 처리 및 북마크 로드
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      setAuthError("로그인이 필요한 서비스입니다.");
    } else {
      setAuthError(null);
      fetchBookmarks();
    }

    setLoading(false);
  }, [isAuthenticated, authLoading, fetchBookmarks]);

  useEffect(() => {
    if (!groupedBookmarks.length) return;

    let result = [...groupedBookmarks];

    // 검색 필터링
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (group) =>
          group.digestTitle.toLowerCase().includes(query) ||
          group.bookmarks.some(
            (bookmark) =>
              bookmark.text.toLowerCase().includes(query) ||
              (bookmark.memo && bookmark.memo.toLowerCase().includes(query))
          )
      );
    }

    // 정렬 - 각 그룹의 가장 최신/오래된 북마크 기준으로 정렬
    result = result.sort((a, b) => {
      // 각 그룹의 가장 최신 북마크 찾기
      const aLatest =
        sortOrder === "newest"
          ? a.bookmarks.reduce(
              (latest, current) =>
                new Date(current.created_at) > new Date(latest.created_at)
                  ? current
                  : latest,
              a.bookmarks[0]
            )
          : a.bookmarks.reduce(
              (oldest, current) =>
                new Date(current.created_at) < new Date(oldest.created_at)
                  ? current
                  : oldest,
              a.bookmarks[0]
            );

      const bLatest =
        sortOrder === "newest"
          ? b.bookmarks.reduce(
              (latest, current) =>
                new Date(current.created_at) > new Date(latest.created_at)
                  ? current
                  : latest,
              b.bookmarks[0]
            )
          : b.bookmarks.reduce(
              (oldest, current) =>
                new Date(current.created_at) < new Date(oldest.created_at)
                  ? current
                  : oldest,
              b.bookmarks[0]
            );

      return sortOrder === "newest"
        ? new Date(bLatest.created_at).getTime() -
            new Date(aLatest.created_at).getTime()
        : new Date(aLatest.created_at).getTime() -
            new Date(bLatest.created_at).getTime();
    });

    setFilteredGroups(result);
  }, [searchQuery, sortOrder, groupedBookmarks]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSort = () => {
    setSortOrder(sortOrder === "newest" ? "oldest" : "newest");
  };

  const handleMemoClick = (bookmark: TimelineBookmark) => {
    setCurrentBookmark(bookmark);
    setShowMemoPopup(true);
  };

  const handleMemoSave = async (memo: string) => {
    if (!currentBookmark) return;

    try {
      // API 호출 시 fetch 상태 로깅
      console.log(
        `메모 저장 API 호출: 북마크 ID ${currentBookmark.id}, 메모 길이 ${memo.length}자`
      );

      const response = await fetch(
        `/api/timelines/${currentBookmark.id}/memo`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ memo }),
          credentials: "include",
        }
      );

      // 응답 상태 확인
      if (!response.ok) {
        const errorText = await response.text();
        console.error("메모 저장 API 오류 응답:", response.status, errorText);
        throw new Error(`API 오류: ${response.status} ${errorText}`);
      }

      const result = await response.json();

      if (result.error) {
        console.error("메모 저장 결과 오류:", result.error);
        throw new Error(result.error);
      }

      // 메모 업데이트 성공
      console.log("메모 저장 성공:", result);
      setToastMessage("메모가 저장되었습니다");
      setShowToast(true);

      // 북마크 목록 업데이트
      setBookmarks((prevBookmarks) =>
        prevBookmarks.map((bookmark) =>
          bookmark.id === currentBookmark.id ? { ...bookmark, memo } : bookmark
        )
      );

      // 그룹화된 북마크도 업데이트
      const updatedGroups = groupedBookmarks.map((group) => {
        const updatedBookmarks = group.bookmarks.map((bookmark) =>
          bookmark.id === currentBookmark.id ? { ...bookmark, memo } : bookmark
        );
        return { ...group, bookmarks: updatedBookmarks };
      });

      setGroupedBookmarks(updatedGroups);
      setFilteredGroups(updatedGroups);
    } catch (error) {
      console.error("메모 저장 오류:", error);
      setToastMessage("메모 저장에 실패했습니다");
      setShowToast(true);
    }

    setShowMemoPopup(false);
  };

  const handlePlayClick = (bookmark: TimelineBookmark) => {
    if (!bookmark.digests?.source_url) return;

    const videoId = getYouTubeVideoId(bookmark.digests.source_url);
    if (!videoId) return;

    // 팝업으로 재생하기
    setYoutubePopup({
      isOpen: true,
      videoId,
      startTime: bookmark.seconds,
    });
  };

  const closeYoutubePopup = () => {
    setYoutubePopup({
      ...youtubePopup,
      isOpen: false,
    });
  };

  const toggleDigestExpand = (digestId: number) => {
    setExpandedDigests((prev) => ({
      ...prev,
      [digestId]: !prev[digestId],
    }));
  };

  const redirectToLogin = () => {
    router.push("/login"); // 로그인 페이지 경로
  };

  const getYouTubeVideoId = (url: string): string => {
    if (!url) return "";

    const watchRegex = /youtube\.com\/watch\?v=([^&]+)/;
    const watchMatch = url.match(watchRegex);
    if (watchMatch) return watchMatch[1];

    const shortRegex = /youtu\.be\/([^?&]+)/;
    const shortMatch = url.match(shortRegex);
    if (shortMatch) return shortMatch[1];

    const embedRegex = /youtube\.com\/embed\/([^?&]+)/;
    const embedMatch = url.match(embedRegex);
    if (embedMatch) return embedMatch[1];

    return "";
  };

  const renderSkeletons = () => {
    return Array(3)
      .fill(0)
      .map((_, i) => (
        <div
          key={i}
          className="mb-4 border border-border-line rounded-lg overflow-hidden"
        >
          <div className="flex gap-4 p-4 border-b border-border-line">
            <Skeleton className="w-24 h-16 rounded-md bg-secondary-color" />
            <div className="flex-1">
              <Skeleton className="w-3/4 h-5 mb-2 bg-secondary-color" />
              <Skeleton className="w-1/4 h-4 mb-2 bg-secondary-color" />
              <Skeleton className="w-1/2 h-4 bg-secondary-color" />
            </div>
          </div>
          <div className="p-2">
            <Skeleton className="w-full h-12 mb-2 bg-secondary-color" />
            <Skeleton className="w-full h-12 bg-secondary-color" />
          </div>
        </div>
      ));
  };

  // 단일 북마크 렌더링 함수
  const renderSingleBookmark = (bookmark: TimelineBookmark) => {
    return (
      <motion.li
        key={bookmark.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-2 border border-border-line rounded-lg mb-4"
      >
        <div className="flex gap-4">
          <div className="relative w-32 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
            {bookmark.digests?.source_type === "YouTube" ? (
              <Image
                src={`https://i.ytimg.com/vi/${getYouTubeVideoId(
                  bookmark.digests.source_url || ""
                )}/mqdefault.jpg`}
                alt={bookmark.digests?.title || ""}
                fill
                className="object-cover"
              />
            ) : (
              <Image
                src={
                  bookmark.digests?.image ||
                  "/placeholder.svg?height=90&width=160" ||
                  "/placeholder.svg" ||
                  "/placeholder.svg"
                }
                alt={bookmark.digests?.title || "북마크 이미지"}
                fill
                className="object-cover"
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center hover:bg-primary-color transition-colors"
                onClick={() => handlePlayClick(bookmark)}
              >
                <Play className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {/* <div className="flex items-center text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              <span>
                {new Date(bookmark.created_at).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div> */}
            <button
              onClick={() => handlePlayClick(bookmark)}
              className="text-sm font-medium text-neutral-dark hover:text-primary-color line-clamp-1 mb-1 transition-colors"
            >
              {bookmark.digests?.title || "제목 없음"}
            </button>

            <div className="flex items-center text-xs text-neutral-medium mb-1.5">
              <Badge
                variant="outline"
                onClick={() => handlePlayClick(bookmark)}
                className="mr-2 bg-gray-50 border-gray-200 cursor-pointer"
              >
                {formatTime(bookmark.seconds)}
              </Badge>
            </div>

            {/* <p className="text-sm text-neutral-dark line-clamp-2 mb-1.5">
              {bookmark.text}
            </p> */}

            {/* 메모가 있는 경우 */}
            {bookmark.memo && (
              <button
                onClick={() => handleMemoClick(bookmark)}
                aria-label="메모 편집"
                className="flex items-start mt-2 w-full bg-blue-50 border border-gray-200 rounded-md p-1 relative group"
              >
                <span className="mr-1 p-1 rounded-full bg-white border border-border-line hover:border-primary-color hover:text-primary-color">
                  <Edit className="h-2 w-2" />
                </span>
                <p className="flex-1 text-left text-xs text-neutral-dark line-clamp-1">
                  {bookmark.memo}
                </p>
              </button>
            )}

            {/* 메모가 없는 경우 */}
            {!bookmark.memo && (
              <button
                className="mt-2 text-xs text-neutral-medium flex items-center gap-1 hover:text-primary-color transition-colors"
                onClick={() => handleMemoClick(bookmark)}
              >
                <Edit className="h-3 w-3" />
                메모 추가하기
              </button>
            )}
            <p className="text-xs text-neutral-medium mt-1">
              {bookmark.digests?.video_info?.channelTitle || ""}{" "}
              {/* {bookmark.digests?.video_info?.viewCount &&
                `· 조회수 ${formatViewCount(
                  bookmark.digests?.video_info?.viewCount
                )}`} */}
            </p>
          </div>
        </div>
      </motion.li>
    );
  };

  // 그룹화된 북마크 렌더링 함수
  const renderGroupedBookmarks = (group: GroupedBookmarks) => {
    return (
      <motion.li
        key={group.digestId}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="border border-border-line rounded-lg overflow-hidden mb-4"
      >
        {/* 콘텐츠 헤더 */}
        <div
          className="flex gap-4 p-2 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => toggleDigestExpand(group.digestId)}
        >
          <div className="relative w-32 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
            {group.sourceType === "YouTube" ? (
              <Image
                src={`https://i.ytimg.com/vi/${getYouTubeVideoId(
                  group.sourceUrl || ""
                )}/mqdefault.jpg`}
                alt={group.digestTitle}
                fill
                className="object-cover"
              />
            ) : (
              <Image
                src={group.image || "/placeholder.svg?height=90&width=160"}
                alt={group.digestTitle || "북마크 이미지"}
                fill
                className="object-cover"
              />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <h3 className="text-sm font-medium text-neutral-dark line-clamp-2 mb-1">
                {group.digestTitle}
              </h3>
              {expandedDigests[group.digestId] ? (
                <ChevronUp className="h-4 w-4 text-neutral-medium flex-shrink-0 mt-1" />
              ) : (
                <ChevronDown className="h-4 w-4 text-neutral-medium flex-shrink-0 mt-1" />
              )}
            </div>

            <div className="flex items-center text-xs text-neutral-medium mb-1.5">
              <Badge
                variant="outline"
                className="mr-2 bg-gray-50 border-gray-200 p-1"
              >
                <Clock className="h-3 w-3 mr-1" /> {group.bookmarkCount}개
              </Badge>
              <p className="text-xs text-neutral-medium flex-1">
                {group.videoInfo?.channelTitle || ""}
                {/* {group.videoInfo?.viewCount &&
                  ` · 조회수 ${formatViewCount(group.videoInfo.viewCount)}`} */}
              </p>
            </div>

            <div className="flex flex-wrap gap-1 mt-1">
              {group.bookmarks.slice(0, 3).map((bookmark, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="bg-gray-50 border-gray-200 text-xs"
                >
                  {formatTime(bookmark.seconds)}
                </Badge>
              ))}
              {group.bookmarks.length > 3 && (
                <Badge
                  variant="outline"
                  className="bg-gray-50 border-gray-200 text-xs"
                >
                  +{group.bookmarks.length - 3}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* 북마크 목록 (확장 시) */}
        <AnimatePresence>
          {expandedDigests[group.digestId] && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-border-line overflow-hidden"
            >
              <ul className="divide-y divide-border-line">
                {group.bookmarks.map((bookmark) => (
                  <li key={bookmark.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handlePlayClick(bookmark)}
                        className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-primary-color/10 transition-colors"
                      >
                        <Play className="h-4 w-4 text-primary-color" />
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant="outline"
                            onClick={() => handlePlayClick(bookmark)}
                            className="bg-gray-50 border-gray-200 cursor-pointer hover:border-primary-color transition-colors"
                          >
                            {formatTime(bookmark.seconds)}
                          </Badge>
                          {/* <span className="text-xs text-neutral-medium">
                            {new Date(bookmark.created_at).toLocaleDateString(
                              "ko-KR",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </span> */}
                        </div>

                        <p className="text-sm text-neutral-dark mb-2">
                          {bookmark.text}
                        </p>

                        {/* 메모가 있는 경우 */}
                        {bookmark.memo && (
                          <button
                            onClick={() => handleMemoClick(bookmark)}
                            aria-label="메모 편집"
                            className="flex items-start mt-1 w-full bg-gray-50 border border-gray-200 rounded-md p-2 relative group hover:border-primary-color/50 transition-colors"
                          >
                            <span className="mr-2 rounded-full bg-white border border-border-line group-hover:border-primary-color group-hover:text-primary-color transition-colors">
                              <Edit className="h-3 w-3" />
                            </span>
                            <p className="flex-1 text-left text-xs text-neutral-dark">
                              {bookmark.memo}
                            </p>
                          </button>
                        )}

                        {/* 메모가 없는 경우 */}
                        {!bookmark.memo && (
                          <button
                            className="mt-1 text-xs text-neutral-medium flex items-center gap-1 hover:text-primary-color transition-colors"
                            onClick={() => handleMemoClick(bookmark)}
                          >
                            <Edit className="h-3 w-3" />
                            메모 추가하기
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.li>
    );
  };

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Header
        title={"타임라인 저장소"}
        showBackButton={true}
        backUrl="back"
        rightElement={
          <Link href="/profile">
            <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center border border-primary-color/30">
              <span className="text-sm font-medium text-primary-color">
                김링
              </span>
            </div>
          </Link>
        }
      />
      <div className="container px-5 py-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-medium" />
            <Input
              type="text"
              placeholder="타임라인 검색"
              className="pl-9 bg-gray-50 border-gray-200"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-neutral-medium">
            {filteredGroups.length}개의 콘텐츠, {bookmarks.length}개의 타임라인
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 text-sm border border-border-line px-3"
            onClick={handleSort}
          >
            <Clock className="h-4 w-4" />
            {sortOrder === "newest" ? "최신순" : "오래된순"}
          </Button>
        </div>
      </div>

      <main className="flex-1">
        {fetching || loading ? (
          // 로딩 중
          <div className="container px-5">{renderSkeletons()}</div>
        ) : isAuthenticated === true && filteredGroups.length === 0 ? (
          // 인증됨 but 북마크 없음
          <div className="flex flex-col items-center justify-center h-64 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-neutral-medium" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              타임라인 북마크가 없습니다
            </h3>
            <p className="text-neutral-medium mb-6 text-sm">
              영상을 시청하는 중 원하는 시점을 저장하면 여기에 보관됩니다.
            </p>
            <Button asChild variant="outline" className="px-4 rounded-full">
              <Link href="/">콘텐츠 둘러보기</Link>
            </Button>
          </div>
        ) : isAuthenticated === true ? (
          // 인증됨 and 북마크 있음
          <div className="container px-5">
            {filteredGroups.map((group) =>
              // 북마크가 1개인 경우 단일 북마크로 표시
              group.bookmarkCount === 1
                ? renderSingleBookmark(group.bookmarks[0])
                : // 북마크가 2개 이상인 경우 그룹으로 표시
                  renderGroupedBookmarks(group)
            )}
          </div>
        ) : (
          // 인증되지 않음
          <div className="flex flex-col items-center justify-center h-64 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <LogIn className="w-8 h-8 text-neutral-medium" />
            </div>
            <h3 className="text-lg font-medium mb-2">로그인이 필요합니다</h3>
            <p className="text-neutral-medium mb-6 text-sm">
              타임라인 북마크를 이용하시려면 로그인해주세요.
            </p>
            <Button
              onClick={redirectToLogin}
              className="px-4 rounded-full bg-primary-color hover:bg-primary-color/90"
            >
              로그인하기
            </Button>
          </div>
        )}
      </main>

      <BottomNav />

      <SimpleToast
        isVisible={showToast}
        message={toastMessage}
        onClose={() => setShowToast(false)}
      />

      <MemoPopup
        isOpen={showMemoPopup}
        onClose={() => setShowMemoPopup(false)}
        onSave={handleMemoSave}
        initialMemo={currentBookmark?.memo || ""}
        title="타임라인 메모"
      />

      <YouTubePopup
        isOpen={youtubePopup.isOpen}
        videoId={youtubePopup.videoId}
        startTime={youtubePopup.startTime}
        onClose={closeYoutubePopup}
      />
    </div>
  );
}

const formatViewCount = (count: string): string => {
  if (!count) return "0";

  const num = Number.parseInt(count, 10);
  if (isNaN(num)) return "0";

  if (num >= 10000) {
    return `${Math.floor(num / 10000)}만회`;
  } else if (num >= 1000) {
    return `${Math.floor(num / 1000)}천회`;
  }

  return `${num}회`;
};
