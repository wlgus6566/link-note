"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Clock,
  Play,
  Edit,
  Calendar,
  LogIn,
  LinkIcon,
  ChevronDown,
  ChevronUp,
  Send,
  Loader2,
  X,
  Youtube,
  ExternalLink,
  Bookmark,
  CheckCircle2,
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
import { createClient } from "@/lib/supabase/client";
import { TimelineAccordion } from "@/components/timeline/TimelineAccordion";
import { TimelineGroup } from "@/lib/utils/youtube";
import { getVideoId } from "@/lib/utils/client-youtube";
interface YouTubeVideoInfo {
  title?: string;
  channelTitle?: string;
  publishedAt?: string;
  viewCount?: string;
  channelId?: string;
}

interface BookmarkItem {
  id: string;
  seconds: number;
  text: string;
  timestamp: number;
  memo?: string;
}

export default function TimelinesPage() {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<TimelineBookmark[]>([]);
  const [filteredBookmarks, setFilteredBookmarks] = useState<
    TimelineBookmark[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showMemoPopup, setShowMemoPopup] = useState(false);
  const [currentBookmark, setCurrentBookmark] =
    useState<TimelineBookmark | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [youtubePopup, setYoutubePopup] = useState({
    isOpen: false,
    videoId: "",
    startTime: 0,
  });

  // 타임라인 추출 관련 상태
  const [youtubeLink, setYoutubeLink] = useState("");
  const linkInputRef = useRef<HTMLInputElement>(null);

  const [videoId, setVideoId] = useState<string | null>(null);
  const [loading2, setLoading2] = useState(false);
  const [timelineData, setTimelineData] = useState<TimelineGroup[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [videoInfo, setVideoInfo] = useState<YouTubeVideoInfo | null>(null);
  const [bookmarkedItems, setBookmarkedItems] = useState<
    Record<string, BookmarkItem>
  >({});

  // 북마크 아이템 처리
  const handleBookmark = (id: string, seconds: number, text: string) => {
    if (!videoId) return;

    const bookmarkKey = `bookmarks_timeline_extracted_${videoId}`;
    let newBookmarkedItems = { ...bookmarkedItems };

    if (newBookmarkedItems[id]) {
      delete newBookmarkedItems[id];
    } else {
      newBookmarkedItems[id] = {
        id,
        seconds,
        text,
        timestamp: Date.now(),
      };
    }

    setBookmarkedItems(newBookmarkedItems);
    localStorage.setItem(bookmarkKey, JSON.stringify(newBookmarkedItems));
  };

  // YouTube URL에서 타임라인 추출
  const extractTimeline = async () => {
    if (!youtubeLink) {
      setError("YouTube 링크를 입력해주세요");
      return;
    }

    const extractedVideoId = getVideoId(youtubeLink);
    if (!extractedVideoId) {
      setError("올바른 YouTube 링크가 아닙니다");
      return;
    }

    setLoading2(true);
    setError(null);
    setVideoId(extractedVideoId);

    try {
      // API 호출
      const response = await fetch(
        `/api/extract-timeline?videoId=${extractedVideoId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "타임라인 추출에 실패했습니다");
      }

      // 타임라인 데이터 저장
      setTimelineData(data.timeline || []);
      setVideoInfo(data.videoInfo || null);

      // 로컬 스토리지에 저장
      const timelineKey = `timeline_extracted_${extractedVideoId}`;
      localStorage.setItem(timelineKey, JSON.stringify(data.timeline || []));

      // 북마크 데이터 로드
      const bookmarkKey = `bookmarks_timeline_extracted_${extractedVideoId}`;
      const storedBookmarks = localStorage.getItem(bookmarkKey);
      if (storedBookmarks) {
        setBookmarkedItems(JSON.parse(storedBookmarks));
      } else {
        setBookmarkedItems({});
      }
    } catch (error) {
      console.error("타임라인 추출 오류:", error);
      setError(
        error instanceof Error ? error.message : "타임라인 추출에 실패했습니다"
      );
    } finally {
      setLoading(false);
    }
  };

  // 비디오 재생 시간으로 이동
  const handleSeekTo = (seconds: number) => {
    if (!videoId) return;

    // iframe 찾기
    const iframe = document.querySelector("iframe");
    if (iframe) {
      // YouTube Player API를 통해 특정 시간으로 이동
      iframe.contentWindow?.postMessage(
        JSON.stringify({
          event: "command",
          func: "seekTo",
          args: [seconds, true],
        }),
        "*"
      );
    }
  };

  // 조회수 포맷 함수
  const formatViewCount = (count: string | undefined): string => {
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

  // 엔터 키 이벤트 처리
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      extractTimeline();
    }
  };

  // 사용자 인증 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data: sessionData } = await supabase.auth.getSession();

        setIsAuthenticated(!!sessionData.session);

        if (!sessionData.session) {
          console.log("사용자가 로그인하지 않았습니다.");
          setAuthError("로그인이 필요한 서비스입니다.");
          setLoading(false);
        }
      } catch (error) {
        console.error("인증 상태 확인 오류:", error);
        setAuthError("인증 상태를 확인하는데 실패했습니다.");
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // 북마크 데이터 가져오기 (인증된 경우에만)
  useEffect(() => {
    if (isAuthenticated !== true) return;

    const fetchBookmarks = async () => {
      try {
        setLoading(true);
        const response = await getUserTimelineBookmarks();

        if (response.success && response.data) {
          // API 응답을 TimelineBookmark 타입에 맞게 변환
          const bookmarkData = response.data.map((item: any) => ({
            ...item,
            user_id: 0, // user_id가 응답에 없으므로 기본값 설정
          }));

          setBookmarks(bookmarkData);
          setFilteredBookmarks(bookmarkData);
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
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!bookmarks.length) return;

    let result = [...bookmarks];

    // 정렬
    result = result.sort((a, b) => {
      if (sortOrder === "newest") {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      } else {
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      }
    });

    setFilteredBookmarks(result);
  }, [sortOrder, bookmarks]);

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
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border-b border-border-line">
          <Skeleton className="w-24 h-16 rounded-md bg-secondary-color" />
          <div className="flex-1">
            <Skeleton className="w-3/4 h-5 mb-2 bg-secondary-color" />
            <Skeleton className="w-1/4 h-4 mb-2 bg-secondary-color" />
            <Skeleton className="w-1/2 h-4 bg-secondary-color" />
          </div>
        </div>
      ));
  };

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <div className="container px-5 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-neutral-dark">타임라인</h1>
        </div>

        <AnimatePresence>
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-gray-50 rounded-xl p-4 border border-border-line">
              <div className="flex items-center mb-3">
                <Youtube className="h-5 w-5 text-primary-color mr-2" />
                <h3 className="text-base font-medium">
                  YouTube 링크로 타임라인 추출
                </h3>
              </div>
              <div className="flex gap-2 mb-3">
                <div className="relative flex-1">
                  <Input
                    ref={linkInputRef}
                    type="text"
                    placeholder="YouTube 링크를 붙여넣으세요"
                    className="pr-10"
                    value={youtubeLink}
                    onChange={(e) => setYoutubeLink(e.target.value)}
                  />
                  {youtubeLink && (
                    <button
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      onClick={() => setYoutubeLink("")}
                    >
                      <X className="h-4 w-4 text-neutral-medium hover:text-primary-color" />
                    </button>
                  )}
                </div>

                <Button
                  onClick={extractTimeline}
                  disabled={loading || !youtubeLink}
                  className="bg-primary-color hover:bg-primary-color/90"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span className="ml-2">추출하기</span>
                </Button>

                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </div>
              <p className="text-neutral-medium max-w-md text-xs mt-2">
                YouTube 영상 링크를 입력하면 영상의 타임라인을 추출해
                보여줍니다. 추출된 타임라인 항목은 클릭하면 해당 시간으로 이동할
                수 있습니다.
              </p>
              {/* 비디오 및 타임라인 영역 */}
              {videoId && (
                <>
                  {/* 영상 영역 */}
                  <motion.div
                    className="mb-8 rounded-xl overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex flex-col bg-white rounded-xl overflow-hidden border border-border-line shadow-sm">
                      <div className="relative w-full h-48 md:h-80">
                        <iframe
                          src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1`}
                          title={videoInfo?.title || "YouTube 비디오"}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="absolute top-0 left-0 w-full h-full border-0"
                        />
                      </div>

                      {videoInfo && (
                        <div className="p-4 space-y-3">
                          <h2 className="text-xl font-bold text-neutral-dark">
                            {videoInfo.title || "제목 없음"}
                          </h2>

                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                              <div className="w-9 h-9 rounded-full overflow-hidden bg-secondary-color border border-border-line">
                                {videoInfo.channelId ? (
                                  <Image
                                    src={`https://yt3.googleusercontent.com/ytc/${videoInfo.channelId}=s88-c-k-c0x00ffffff-no-rj`}
                                    alt={
                                      videoInfo.channelTitle || "채널 이미지"
                                    }
                                    width={36}
                                    height={36}
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-200" />
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-sm text-neutral-dark">
                                  {videoInfo.channelTitle || "채널명 없음"}
                                </div>
                                <div className="text-xs text-neutral-medium">
                                  {videoInfo.publishedAt
                                    ? new Date(
                                        videoInfo.publishedAt
                                      ).toLocaleDateString("ko-KR", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      })
                                    : "날짜 정보 없음"}
                                </div>
                              </div>
                            </div>

                            <div className="text-sm text-neutral-medium">
                              {videoInfo.viewCount
                                ? `조회수 ${formatViewCount(
                                    videoInfo.viewCount
                                  )}회`
                                : "조회수 정보 없음"}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* 타임라인 영역 */}
                  {timelineData.length > 0 ? (
                    <motion.div
                      className="mb-10"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.45 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-neutral-dark">
                          타임라인
                        </h2>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <TimelineAccordion
                          timelineGroups={timelineData}
                          onSeek={handleSeekTo}
                          bookmarkedItems={Object.keys(bookmarkedItems).reduce(
                            (acc, key) => ({
                              ...acc,
                              [key]: true,
                            }),
                            {}
                          )}
                          onBookmark={handleBookmark}
                        />
                      </div>
                    </motion.div>
                  ) : loading2 ? (
                    <div className="flex justify-center items-center py-10">
                      <Loader2 className="h-8 w-8 animate-spin text-primary-color" />
                      <span className="ml-2 text-neutral-medium">
                        타임라인 추출 중...
                      </span>
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-neutral-medium mb-2">
                        타임라인 추출에 실패했습니다.
                      </p>
                      <p className="text-sm text-neutral-medium">
                        다른 YouTube 링크를 시도해보세요.
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* 아직 검색하지 않은 경우 안내 메시지 */}
              {/* {!videoId && !loading2 && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary-light rounded-full flex items-center justify-center">
                    <Send className="h-8 w-8 text-primary-color" />
                  </div>
                  <h3 className="font-medium text-lg mb-2">
                    YouTube 링크 입력
                  </h3>
                  <p className="text-neutral-medium max-w-md mx-auto">
                    YouTube 영상 링크를 입력하면 영상의 타임라인을 추출해
                    보여줍니다. 추출된 타임라인 항목은 클릭하면 해당 시간으로
                    이동할 수 있습니다.
                  </p>
                </div>
              )} */}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="container px-5 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <h2 className="text-xl font-bold text-neutral-dark">최근 추가됨</h2>
        </div>
        <Link
          href="/timelines/list"
          className="text-primary-color font-medium p-0 hover:bg-transparent text-sm"
        >
          전체보기
        </Link>
      </div>
      <main className="containerflex-1">
        {loading ? (
          // 로딩 중
          renderSkeletons()
        ) : isAuthenticated === true && filteredBookmarks.length === 0 ? (
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
          <div>
            {/* 북마크 목록 */}
            <ul className="divide-y divide-border-line">
              {filteredBookmarks.map((bookmark) => (
                <motion.li
                  key={bookmark.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-4"
                >
                  <div className="flex gap-4">
                    <div className="relative w-32 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                      {bookmark.digests?.source_type === "YouTube" ? (
                        <Image
                          src={`https://i.ytimg.com/vi/${getYouTubeVideoId(
                            bookmark.digests.source_url || ""
                          )}/mqdefault.jpg`}
                          alt={bookmark.digests.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <Image
                          src={
                            bookmark.digests?.image ||
                            "/placeholder.svg?height=90&width=160" ||
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
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>
                          {new Date(bookmark.created_at).toLocaleDateString(
                            "ko-KR",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>

                      {/* <p className="text-sm text-neutral-dark line-clamp-1 mb-1.5">
                        {bookmark.text}
                      </p> */}

                      {/* 메모가 있는 경우의 UI 개선 */}
                      {bookmark.memo && (
                        <button
                          onClick={() => handleMemoClick(bookmark)}
                          aria-label="메모 편집"
                          className="flex items-start mt-2 w-full bg-gray-50 border border-gray-200 rounded-md p-1 relative group"
                        >
                          <span className="mr-1 p-1 rounded-full bg-white border border-border-line hover:border-primary-color hover:text-primary-color">
                            <Edit className="h-2 w-2" />
                          </span>
                          <p className="flex-1 text-left text-xs text-neutral-dark line-clamp-1">
                            {bookmark.memo}
                          </p>
                        </button>
                      )}

                      {/* 메모가 없는 경우의 UI 개선 */}
                      {!bookmark.memo && (
                        <button
                          className="mt-2 text-xs text-neutral-medium flex items-center gap-1 hover:text-primary-color transition-colors"
                          onClick={() => handleMemoClick(bookmark)}
                        >
                          <Edit className="h-3 w-3" />
                          메모 추가하기
                        </button>
                      )}
                      <p className="text-xs text-neutral-medium mb-1">
                        {bookmark.digests?.video_info?.channelTitle || ""} ·
                        조회수{" "}
                        {formatViewCount(
                          bookmark.digests?.video_info?.viewCount || "0"
                        )}
                      </p>
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
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
