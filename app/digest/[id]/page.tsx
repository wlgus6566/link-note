"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Share2,
  Info,
  MapPinIcon as MapPinCheckInside,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/bottom-nav";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { motion, type PanInfo, AnimatePresence } from "framer-motion";
import { TimelineAccordion } from "@/components/timeline/TimelineAccordion";
import type { TimelineGroup } from "@/lib/utils/youtube";
import {
  syncLocalTimelineBookmarks,
  saveTimelineBookmark,
  deleteTimelineBookmark,
} from "@/lib/utils/timeline";
import { saveTimelineData, getTimelineData } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { log } from "console";
import { TimelineBookmarkButton } from "@/components/ui/timeline-bookmark-button";
import { TimelineGuideSheet } from "@/components/ui/timeline-guide-sheet";
import { BookmarksPopup } from "@/components/ui/bookmarks-popup";
import { useAuth } from "@/lib/hooks/useAuth";
import { Header } from "@/components/Header";
import { FolderSelectionModal } from "@/components/ui/folder-selection-modal";
import { MemoPopup } from "@/components/ui/memo-popup";
import { DesignToast } from "@/components/ui/toast";
// YouTube API 타입 선언
declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string | HTMLElement,
        options: {
          videoId: string;
          playerVars?: {
            playsinline?: number;
            rel?: number;
            modestbranding?: number;
            [key: string]: any;
          };
          events?: {
            onReady?: (event: any) => void;
            onError?: (event: any) => void;
            onStateChange?: (event: any) => void;
            [key: string]: any;
          };
        }
      ) => {
        seekTo: (seconds: number, allowSeekAhead: boolean) => void;
        playVideo: () => void;
        pauseVideo: () => void;
        getCurrentTime: () => number;
      };
      ready: (callback: () => void) => void;
    };
    onYouTubeIframeAPIReady: (() => void) | null;
    syncTimer?: NodeJS.Timeout; // number 대신 NodeJS.Timeout으로 수정
  }
}

interface BookmarkItem {
  id: string;
  seconds: number;
  text: string;
  memo?: string;
  timestamp: number;
}

interface YouTubePopupState {
  isOpen: boolean;
  videoId: string;
  startTime: number;
}

export default function DigestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  // useAuth 훅을 먼저 호출
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  const [digest, setDigest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageId, setPageId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [timelineData, setTimelineData] = useState<TimelineGroup[]>([]);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [currentSegmentId, setCurrentSegmentId] = useState<string | null>(null);

  // 현재 시간에 가장 근접한 타임라인 아이템 찾고, 스크롤 & 하이라이트
  useEffect(() => {
    if (!timelineData.length) return;

    const segments: Array<{ id: string; seconds: number }> =
      timelineData.flatMap((group) => {
        if (group.subtitles?.length) {
          return group.subtitles.map((sub) => ({
            id: String(sub.startSeconds),
            seconds: Number(sub.startSeconds),
          }));
        }
        if (group.items?.length) {
          return group.items.map((it) => ({
            id: String(it.id),
            seconds: Number(it.seconds),
          }));
        }
        return [];
      });

    if (!segments.length) return;

    const active = segments.reduce(
      (prev, seg) =>
        seg.seconds <= currentTime && seg.seconds > prev.seconds ? seg : prev,
      { id: "", seconds: Number.NEGATIVE_INFINITY }
    );
    console.log("active", active);

    if (active.id && active.id !== currentSegmentId) {
      setCurrentSegmentId(active.id);
      const safeId = CSS?.escape
        ? CSS.escape(active.id)
        : active.id.replace(/\./g, ".");
      const el = document.querySelector(`[data-segment-id="${safeId}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [currentTime, timelineData]);

  const [bookmarkedItems, setBookmarkedItems] = useState<
    Record<string, BookmarkItem>
  >({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showAddMemoButton, setShowAddMemoButton] = useState(false);
  const [showMemoPopup, setShowMemoPopup] = useState(false);
  const [currentBookmarkId, setCurrentBookmarkId] = useState<string | null>(
    null
  );
  const [syncNeeded, setSyncNeeded] = useState(false);
  const [youtubePopup, setYoutubePopup] = useState<YouTubePopupState>({
    isOpen: false,
    videoId: "",
    startTime: 0,
  });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showFolderSelectionModal, setShowFolderSelectionModal] =
    useState(false);

  const [activeTab, setActiveTab] = useState<string>("summary");
  const [swipeDirection, setSwipeDirection] = useState<number>(0);
  const contentRef = useRef<HTMLDivElement>(null);

  // YouTube Player 관련 상태와 ref
  const playerRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const [playerReady, setPlayerReady] = useState(false);

  // 타이머 참조를 위한 ref 추가
  const syncTimerRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 스와이프 핸들러 함수 추가
  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const threshold = 50; // 스와이프 감지 임계값

    if (info.offset.x > threshold) {
      // 오른쪽으로 스와이프 - 이전 탭으로
      setActiveTab("summary");
      setSwipeDirection(1);
    } else if (info.offset.x < -threshold) {
      // 왼쪽으로 스와이프 - 다음 탭으로
      setActiveTab("transcript");
      setSwipeDirection(-1);
    }
  };

  // 탭 변경 시 스와이프 방향 설정
  useEffect(() => {
    if (activeTab === "summary") {
      setSwipeDirection(0);
    } else if (activeTab === "transcript") {
      setSwipeDirection(0);
    }
  }, [activeTab]);

  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParams = await params;
        setPageId(resolvedParams.id);
      } catch (error) {
        console.error("params 해결 오류:", error);
        setError("페이지 ID를 가져오는데 실패했습니다.");
      }
    };

    resolveParams();
  }, [params]);

  // 타임라인 데이터 로드 useEffect를 다른 useEffect 이전에 이동
  useEffect(() => {
    if (!pageId || !digest?.id) return;

    let isMounted = true;

    const fetchTimelineData = async () => {
      try {
        console.log("타임라인 데이터 로드 시작...");
        // 로컬 스토리지에서 데이터 확인
        const timelineKey = `timeline_${pageId}`;
        const storedTimeline = localStorage.getItem(timelineKey);
        let parsedTimeline = null;

        if (storedTimeline) {
          try {
            parsedTimeline = JSON.parse(storedTimeline);
            setTimelineData(parsedTimeline);
            console.log(
              `로컬 타임라인 데이터 로드 완료: ${parsedTimeline.length}개 그룹`
            );
          } catch (parseError) {
            console.error("로컬 타임라인 데이터 파싱 오류:", parseError);
          }
        }

        // 로그인한 경우 서버와 데이터 동기화
        if (isAuthenticated) {
          console.log("서버와 타임라인 데이터 동기화 시작...");

          // 로컬 데이터가 있으면 먼저 서버에 POST 요청 전송
          if (
            parsedTimeline &&
            Array.isArray(parsedTimeline) &&
            parsedTimeline.length > 0
          ) {
            console.log("로컬 데이터를 서버에 저장 시도...");
            try {
              const saveResult = await saveTimelineData(
                Number(digest.id),
                parsedTimeline
              );
              if (saveResult.success) {
                console.log("로컬 타임라인 데이터가 서버에 저장되었습니다.");
              } else {
                console.warn("서버 저장 실패:", saveResult.error);
              }
            } catch (saveError) {
              console.error("타임라인 데이터 서버 저장 오류:", saveError);
            }
          }

          // POST 요청 후 서버에서 GET 요청으로 데이터 가져오기
          console.log("서버에서 타임라인 데이터 가져오기 시도...");
          try {
            const response = await getTimelineData(Number(digest.id));

            if (
              response.success &&
              response.data &&
              Array.isArray(response.data) &&
              response.data.length > 0
            ) {
              // 서버 데이터가 있으면 사용
              console.log(
                `서버 타임라인 데이터 로드 완료: ${response.data.length}개 그룹`
              );
              setTimelineData(response.data);

              // 로컬 스토리지도 업데이트
              localStorage.setItem(timelineKey, JSON.stringify(response.data));
            } else {
              console.log("서버에서 타임라인 데이터를 가져오지 못했습니다.");
            }
          } catch (fetchError) {
            console.error("서버 타임라인 데이터 가져오기 오류:", fetchError);
          }
        } else {
          console.log("로그인되지 않았습니다. 로컬 데이터만 사용합니다.");
        }
      } catch (error) {
        console.error("타임라인 데이터 처리 중 오류 발생:", error);
      }
    };

    fetchTimelineData();

    return () => {
      isMounted = false;
    };
  }, [pageId, digest?.id, isAuthenticated]);

  // 인증 상태 변경 감지 및 동기화 필요 상태 설정
  useEffect(() => {
    // isAuthenticated가 true이고, pageId가 있고, syncNeeded가 false일 때만 설정
    // syncNeeded를 의존성 배열에서 제거하여 무한 루프 방지
    if (isAuthenticated === true && pageId && !syncNeeded) {
      console.log("인증 상태 확인: 동기화 필요 상태 설정");
      setSyncNeeded(true);
    }
  }, [isAuthenticated, pageId]); // syncNeeded 의존성 제거

  useEffect(() => {
    if (!pageId) return;

    try {
      const bookmarkKey = `bookmarks_timeline_${pageId}`;
      const storedBookmarks = localStorage.getItem(bookmarkKey);

      if (storedBookmarks) {
        const parsedBookmarks = JSON.parse(storedBookmarks);
        setBookmarkedItems(parsedBookmarks);
        console.log(
          `북마크 데이터 로드 완료: ${
            Object.keys(parsedBookmarks).length
          }개 항목`
        );
      }
    } catch (error) {
      console.error("북마크 데이터 로딩 오류:", error);
    }
  }, [pageId]);

  useEffect(() => {
    if (!pageId) return;

    let isMounted = true;

    let isDataFetched = false;

    const fetchDigest = async () => {
      if (digest && digest.id === Number.parseInt(pageId)) {
        console.log(
          `ID ${pageId}의 다이제스트 데이터가 이미 로드되어 있습니다.`
        );
        return;
      }

      if (isDataFetched) {
        console.log("이미 데이터를 가져오는 중입니다.");
        return;
      }

      isDataFetched = true;

      try {
        setLoading(true);

        console.log(`다이제스트 데이터 가져오기 시작: ID=${pageId}`);

        const response = await fetch(`/api/digest/${pageId}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        });
        const result = await response.json();

        if (result.success) {
          console.log("API에서 다이제스트 데이터 가져오기 성공:", result.data);

          const digestData = result.data;

          if (digestData.sourceType === "YouTube" && digestData.sourceUrl) {
            try {
              const videoId = getYouTubeVideoId(digestData.sourceUrl);

              if (
                !digestData.channelThumbnail &&
                digestData.videoInfo?.channelId
              ) {
                digestData.channelThumbnail = `https://yt3.googleusercontent.com/ytc/${digestData.videoInfo.channelId}=s88-c-k-c0x00ffffff-no-rj`;
              }
            } catch (channelError) {
              console.warn("채널 정보 가져오기 실패:", channelError);
            }
          }

          if (isMounted) {
            setDigest(digestData);
          }
        } else {
          throw new Error(result.error || "요약을 불러오는데 실패했습니다.");
        }
      } catch (error) {
        console.error("요약 불러오기 오류:", error);
        if (isMounted) {
          setError(
            error instanceof Error
              ? error.message
              : "요약을 불러오는데 실패했습니다."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const timeoutId = setTimeout(() => {
      fetchDigest();
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [pageId, digest]);

  // 북마크 상태 확인
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (isAuthenticated !== true || !digest?.id) return;

      try {
        const response = await fetch(`/api/bookmarks?digestId=${digest.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
          cache: "no-store",
        });

        const result = await response.json();
        if (result.success) {
          setIsSaved(result.isBookmarked);
        }
      } catch (error) {
        console.error("북마크 상태 확인 오류:", error);
      }
    };

    checkBookmarkStatus();
  }, [isAuthenticated, digest?.id]);

  // 로컬 스토리지의 북마크를 서버와 동기화
  useEffect(() => {
    // isAuthenticated가 true이고 필요한 데이터가 모두 있을 때만 동기화 실행
    if (isAuthenticated === true && syncNeeded && pageId && digest?.id) {
      // 동기화 시작 시 바로 상태 변경하여 중복 실행 방지
      setSyncNeeded(false);

      // 이전 재시도 타이머가 있으면 초기화
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }

      syncLocalTimelineBookmarks(Number(digest.id))
        .then((result) => {
          if (result?.success) {
            if (result.syncCount > 0) {
              console.log(
                `로컬 북마크 ${result.syncCount}개가 서버와 동기화되었습니다.`
              );
            } else if (result.skipped) {
              console.log("최근에 동기화되어 스킵되었습니다.");
            }
          } else if (result?.error) {
            console.error("북마크 동기화 오류:", result.error);
            // 에러 발생 시 다시 시도할 수 있도록 설정
            retryTimerRef.current = setTimeout(() => {
              setSyncNeeded(true);
              retryTimerRef.current = null;
            }, 30000); // 30초 후 재시도
          }
        })
        .catch((err) => {
          console.error("북마크 동기화 실패:", err);
          // 에러 발생 시 다시 시도할 수 있도록 설정
          retryTimerRef.current = setTimeout(() => {
            setSyncNeeded(true);
            retryTimerRef.current = null;
          }, 30000); // 30초 후 재시도
        });
    }

    // 컴포넌트 언마운트 시 타이머 정리
    return () => {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
    };
  }, [isAuthenticated, syncNeeded, pageId, digest?.id]);

  // YouTube IFrame API 로드 및 초기화
  useEffect(() => {
    if (!digest || digest.sourceType !== "YouTube" || !digest.sourceUrl) return;

    // YouTube IFrame API가 이미 로드되었는지 확인
    if (window.YT && window.YT.Player) {
      initializePlayer();
      return;
    }

    // API 로드
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // API 로드 완료 이벤트 처리
    window.onYouTubeIframeAPIReady = initializePlayer;

    return () => {
      // 컴포넌트 언마운트 시 이벤트 핸들러 제거
      window.onYouTubeIframeAPIReady = null;
    };
  }, [digest]);

  const initializePlayer = () => {
    if (!playerContainerRef.current || !digest?.sourceUrl) return;

    const videoId = getYouTubeVideoId(digest.sourceUrl);
    if (!videoId) return;

    // Player 객체 생성
    playerRef.current = new window.YT.Player(playerContainerRef.current, {
      videoId,
      playerVars: {
        playsinline: 1,
        rel: 0,
        modestbranding: 1,
      },
      events: {
        onReady: () => setPlayerReady(true),
        onError: (e) => console.error("YouTube Player 오류:", e),
      },
    });
  };

  // 탭 변경 시 스크롤 위치 조정
  useEffect(() => {
    if (activeTab === "transcript" && playerContainerRef.current) {
      // 탭 전환 시 스크롤 위치를 영상 위로 조정
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [activeTab]);

  const handleBookmark = async (id: string, seconds: number, text: string) => {
    if (!pageId) return;

    const bookmarkKey = `bookmarks_timeline_${pageId}`;
    const newBookmarkedItems = { ...bookmarkedItems };
    let isAdding = false;

    // 북마크 추가/제거를 로컬 스토리지에 먼저 반영
    if (newBookmarkedItems[id]) {
      // 북마크 제거
      delete newBookmarkedItems[id];
      setToastMessage("타임라인이 삭제되었습니다.");
      setCurrentBookmarkId(null);
      setShowAddMemoButton(false);
      isAdding = false;
    } else {
      // 북마크 추가
      newBookmarkedItems[id] = {
        id,
        seconds,
        text,
        timestamp: Date.now(),
      };
      setToastMessage("타임라인에 저장되었습니다.");
      setCurrentBookmarkId(id);
      setShowAddMemoButton(true);
      isAdding = true;
    }

    // 로컬 스토리지에 저장
    setBookmarkedItems(newBookmarkedItems);
    localStorage.setItem(bookmarkKey, JSON.stringify(newBookmarkedItems));
    setShowToast(true);

    // 토스트 메시지 자동 숨김 타이머 설정
    setTimeout(() => {
      setShowToast(false);
      setShowAddMemoButton(false);
    }, 5000);

    // 로그인한 경우에만 서버에 직접 저장/삭제 API 호출
    if (isAuthenticated === true && digest?.id) {
      try {
        if (isAdding) {
          // 북마크 추가 - 직접 API 호출
          const result = await saveTimelineBookmark(
            Number(digest.id),
            id,
            seconds,
            text
          );
          if (!result.success) {
            console.error("서버 북마크 저장 오류:", result.error);
          } else {
            console.log("서버에 북마크가 저장되었습니다:", id);
          }
        } else {
          // 북마크 삭제 - 직접 API 호출
          const result = await deleteTimelineBookmark(id, Number(digest.id));
          if (!result.success) {
            console.error("서버 북마크 삭제 오류:", result.error);
          } else {
            console.log("서버에서 북마크가 삭제되었습니다:", id);
          }
        }
      } catch (err) {
        console.error("북마크 서버 동기화 오류:", err);
      }

      // 기존 디바운싱 로직도 유지 (백업 동기화)
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
        syncTimerRef.current = null;
      }

      // 3초 후 동기화 트리거 (여러 번 빠르게 북마크 추가/제거 시 최적화)
      syncTimerRef.current = setTimeout(() => {
        setSyncNeeded(true);
        syncTimerRef.current = null;
      }, 3000);
    }
  };

  const handleSaveMemo = async (memo: string) => {
    if (!currentBookmarkId || !pageId) return;

    const bookmarkKey = `bookmarks_timeline_${pageId}`;
    const newBookmarkedItems = { ...bookmarkedItems };

    if (newBookmarkedItems[currentBookmarkId]) {
      // 로컬 스토리지에 메모 추가
      newBookmarkedItems[currentBookmarkId] = {
        ...newBookmarkedItems[currentBookmarkId],
        memo,
      };

      setBookmarkedItems(newBookmarkedItems);
      localStorage.setItem(bookmarkKey, JSON.stringify(newBookmarkedItems));

      // 로그인한 경우에만 서버에 메모 업데이트 시도
      if (isAuthenticated === true && digest?.id) {
        try {
          const bookmark = newBookmarkedItems[currentBookmarkId];
          const result = await saveTimelineBookmark(
            Number(digest.id),
            currentBookmarkId,
            bookmark.seconds,
            bookmark.text,
            memo
          );

          if (!result.success) {
            console.error("서버 메모 저장 오류:", result.error);
          }
        } catch (err) {
          console.error("메모 저장 오류:", err);
        }
      } else if (isAuthenticated !== true) {
        console.log("로그인하지 않았습니다. 로컬에만 메모가 저장됩니다.");
      }

      setToastMessage("타임라인이 저장되었습니다.");
      setShowToast(true);
    }
  };

  const handleCloseToast = () => {
    setShowToast(false);
    setShowAddMemoButton(false);
  };

  const handleAddMemo = () => {
    if (currentBookmarkId) {
      setShowMemoPopup(true);
      setShowToast(false);
    }
  };

  const handleCloseMemoPopup = () => {
    setShowMemoPopup(false);
    setCurrentBookmarkId(null);
  };

  const handleDeleteBookmark = async (id: string) => {
    if (!pageId) return;

    const bookmarkKey = `bookmarks_timeline_${pageId}`;
    const newBookmarkedItems = { ...bookmarkedItems };

    // 북마크가 존재하는지 확인
    if (newBookmarkedItems[id]) {
      // 북마크 제거
      delete newBookmarkedItems[id];
      setToastMessage("타임라인이 삭제되었습니다.");
      setShowToast(true);

      // 로컬 스토리지에 저장
      setBookmarkedItems(newBookmarkedItems);
      localStorage.setItem(bookmarkKey, JSON.stringify(newBookmarkedItems));

      // 로그인한 경우에만 서버에서도 삭제
      if (isAuthenticated === true && digest?.id) {
        try {
          // 북마크 삭제 - 직접 API 호출
          const result = await deleteTimelineBookmark(id, Number(digest.id));
          if (!result.success) {
            console.error("서버 북마크 삭제 오류:", result.error);
          } else {
            console.log("서버에서 북마크가 삭제되었습니다:", id);
          }
        } catch (err) {
          console.error("북마크 서버 동기화 오류:", err);
        }
      }

      // 토스트 메시지 자동 숨김 타이머 설정
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }
  };

  const handleSeekTo = (seconds: number) => {
    if (!digest || digest.sourceType !== "YouTube") return;

    // 북마크 팝업이 열려있다면 닫기
    if (showBookmarksPopup) {
      setShowBookmarksPopup(false);
    }

    // 플레이어가 준비되었으면 어떤 탭에서든 iframe 직접 제어
    if (playerReady && playerRef.current) {
      // seekTo: 첫 번째 인자는 시간(초), 두 번째 인자가 true면 정확한 시간으로 이동
      playerRef.current.seekTo(seconds, true);
      // 영상 재생 시작
      playerRef.current.playVideo();
    } else {
      // 플레이어가 준비되지 않았으면 팝업 사용
      const videoId = getYouTubeVideoId(digest.sourceUrl);
      if (!videoId) return;

      setYoutubePopup({
        isOpen: true,
        videoId,
        startTime: seconds,
      });
    }
  };

  const handleSaveBookmark = () => {
    console.log("북마크 저장 시도");
    console.log(isAuthenticated);
    if (isAuthenticated !== true) {
      toast.error("북마크를 저장하려면 로그인이 필요합니다");
      router.push("/login");
      return;
    }

    setShowFolderSelectionModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!digest?.id) return;

    try {
      const response = await fetch(`/api/bookmarks?digestId=${digest.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      if (result.success) {
        setIsSaved(false);
        setToastMessage("저장이 취소되었습니다.");
        setShowToast(true);
      } else {
        setToastMessage("저장 취소 중 오류가 발생했습니다.");
        setShowToast(true);
      }
    } catch (error) {
      console.error("북마크 삭제 오류:", error);
      setToastMessage("저장 취소 중 오류가 발생했습니다.");
      setShowToast(true);
    } finally {
      setShowConfirmDialog(false);
    }
  };

  // YouTube IFrame API 초기화 (생략)
  useEffect(() => {
    if (!playerReady) return;
    const id = setInterval(() => {
      const t = playerRef.current?.getCurrentTime?.() ?? 0;
      setCurrentTime(t);
    }, 500);
    return () => clearInterval(id);
  }, [playerReady]);

  // 상태 추가 - 북마크 팝업 표시 여부
  const [showBookmarksPopup, setShowBookmarksPopup] = useState(false);
  // 상태 추가 - 가이드 팝업 표시 여부
  const [showGuidePopup, setShowGuidePopup] = useState(false);

  // 컴포넌트 언마운트 시 모든 타이머 정리
  useEffect(() => {
    return () => {
      // 동기화 타이머 정리
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
        syncTimerRef.current = null;
      }

      // 재시도 타이머 정리
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }

      // 윈도우 타이머 정리 (이전 코드와의 호환성)
      if (window.syncTimer) {
        clearTimeout(window.syncTimer);
        window.syncTimer = undefined;
      }
    };
  }, []);

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="header">
          <div className="container flex items-center justify-between h-16 px-5">
            <Button
              variant="ghost"
              size="sm"
              className="p-0 hover:bg-transparent"
              asChild
            >
              <Link href="/">
                <ArrowLeft className="h-5 w-5 text-neutral-dark" />
              </Link>
            </Button>
            <div className="text-sm font-medium text-neutral-dark">
              오류 발생
            </div>
            <div className="w-5"></div>
          </div>
        </header>

        <main className="flex-1 container px-5 py-8 flex items-center justify-center">
          <div className="max-w-sm w-full bg-white p-8 space-y-6 text-center rounded-xl border border-border-line shadow-sm">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto border border-red-500/30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-neutral-dark">
              요약 로드 실패
            </h1>
            <p className="text-neutral-medium">{error}</p>
            <Button
              onClick={() => router.push("/")}
              className="bg-primary-color hover:bg-primary-color/90 text-white"
            >
              홈으로 돌아가기
            </Button>
          </div>
        </main>

        <BottomNav />
      </div>
    );
  }

  if (loading || !digest) {
    return (
      <div className="flex flex-col min-h-screen pb-24">
        <header className="header">
          <div className="container flex items-center justify-between h-16 px-5">
            <Button
              variant="ghost"
              size="sm"
              className="p-0 hover:bg-transparent"
              asChild
            >
              <Link href="/">
                <ArrowLeft className="h-5 w-5 text-neutral-dark" />
              </Link>
            </Button>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full hover:bg-primary-light"
              >
                <MapPinCheckInside className="h-4 w-4 text-primary-color" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full hover:bg-primary-light"
              >
                <Share2 className="h-5 w-5 text-neutral-dark" />
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <article className="max-w-3xl mx-auto px-5 py-8">
            <div className="flex flex-wrap gap-1.5 mb-4">
              <Skeleton className="h-6 w-16 rounded-full bg-secondary-color" />
              <Skeleton className="h-6 w-20 rounded-full bg-secondary-color" />
              <Skeleton className="h-6 w-14 rounded-full bg-secondary-color" />
            </div>

            <div className="mb-4">
              <Skeleton className="h-8 w-3/4 mb-2 bg-secondary-color" />
              <Skeleton className="h-8 w-1/2 bg-secondary-color" />
            </div>

            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border-line">
              <Skeleton className="h-12 w-12 rounded-full bg-secondary-color" />
              <div className="flex-1">
                <Skeleton className="h-5 w-36 mb-2 bg-secondary-color" />
                <Skeleton className="h-4 w-24 bg-secondary-color" />
              </div>
              <div className="flex flex-col items-end">
                <Skeleton className="h-4 w-24 mb-2 bg-secondary-color" />
                <Skeleton className="h-4 w-20 bg-secondary-color" />
              </div>
            </div>

            <Skeleton className="h-64 md:h-80 w-full mb-8 rounded-xl bg-secondary-color" />

            <div className="space-y-6">
              <Skeleton className="h-24 w-full rounded-lg bg-secondary-color" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-40 bg-secondary-color" />
                <Skeleton className="h-4 w-full bg-secondary-color" />
                <Skeleton className="h-4 w-full bg-secondary-color" />
                <Skeleton className="h-4 w-3/4 bg-secondary-color" />
              </div>
            </div>
          </article>
        </main>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-24">
      <Header
        title={digest.title}
        backUrl="back"
        showBackButton={true}
        rightElement={
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-primary-light"
              onClick={handleSaveBookmark}
            >
              {isSaved ? (
                <BookmarkCheck className="h-5 w-5 text-primary-color" />
              ) : (
                <Bookmark className="h-5 w-5 text-neutral-dark" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-primary-light"
            >
              <Share2 className="h-5 w-5 text-neutral-dark" />
            </Button>
          </div>
        }
      />
      {/* <header className="sticky top-0 z-20 bg-white border-b border-border-line">
          <div className="container flex items-center justify-between h-16 px-5">
            <Button
              variant="ghost"
              size="sm"
              className="p-0 hover:bg-transparent"
              asChild
            >
              <Link href="/">
                <ArrowLeft className="h-5 w-5 text-neutral-dark" />
              </Link>
            </Button>
            <h1 className="text-lg font-medium text-neutral-dark truncate max-w-[60%]">
              {digest.title}
            </h1>
           
          </div>
        </header> */}

      <main className="flex-1">
        <div className="container px-0 sm:px-5">
          {/* 비디오 섹션 */}
          {digest.sourceType === "YouTube" && digest.sourceUrl && (
            <div
              className={`w-full ${
                activeTab === "transcript" ? "sticky top-16 z-20" : "mb-4"
              }`}
            >
              <div className="relative w-full aspect-video">
                <div
                  ref={playerContainerRef}
                  className="absolute top-0 left-0 w-full h-full border-0"
                ></div>
              </div>
            </div>
          )}

          {/* 탭 네비게이션 */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div
              className={`sticky ${
                activeTab === "transcript"
                  ? "top-[calc(56.25vw+64px)]"
                  : "top-16"
              } z-10 bg-white border-b border-border-line`}
            >
              <TabsList className="grid w-full grid-cols-2 p-0 h-12">
                <TabsTrigger
                  value="summary"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary-color data-[state=active]:text-primary-color rounded-none h-full"
                >
                  AI 요약 정리
                </TabsTrigger>
                <TabsTrigger
                  value="transcript"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary-color data-[state=active]:text-primary-color rounded-none h-full"
                >
                  스크립트
                </TabsTrigger>
              </TabsList>
            </div>

            {/* 스와이프 가능한 콘텐츠 영역 */}
            <div ref={contentRef} className="overflow-hidden">
              <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                animate={{
                  x: swipeDirection * window.innerWidth,
                  transition: { duration: 0.3 },
                }}
                className="flex w-full"
              >
                <div
                  className={`w-full flex-shrink-0 ${
                    activeTab === "summary" ? "block" : "hidden md:block"
                  }`}
                >
                  <TabsContent value="summary" className="mt-0 p-5">
                    {/* AI 요약 정리 콘텐츠 */}
                    <div className="mb-4 p-5 bg-primary-light rounded-lg border-l-4 border-primary-color">
                      <p className="text-base italic text-neutral-dark">
                        {digest.summary}
                      </p>
                    </div>

                    <motion.div
                      className="prose prose-blue prose-lg max-w-none mb-10"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      dangerouslySetInnerHTML={{ __html: digest.content }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 bg-transparent border border-primary text-primary font-semibold py-3 px-6 rounded-lg w-full"
                    >
                      콘텐츠 저장하기
                    </Button>
                  </TabsContent>
                </div>

                <div
                  className={`w-full flex-shrink-0 ${
                    activeTab === "transcript" ? "block" : "hidden md:block"
                  }`}
                >
                  <TabsContent value="transcript" className="mt-0 p-5">
                    {/* 스크립트 콘텐츠 */}
                    {digest.sourceType === "YouTube" &&
                      timelineData.length > 0 && (
                        <motion.div
                          className="mb-10"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.45 }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5">
                              <h2 className="text-lg font-bold text-neutral-dark">
                                타임라인
                              </h2>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-sm text-neutral-medium rounded-full px-3"
                              onClick={() => setShowGuidePopup(true)}
                            >
                              <Info className="h-4 w-4 bg-primary-color text-white rounded-full p-0.5" />
                              이용가이드
                            </Button>
                          </div>

                          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <TimelineAccordion
                              timelineGroups={timelineData}
                              onSeek={handleSeekTo}
                              currentSegmentId={currentSegmentId || undefined}
                              bookmarkedItems={Object.keys(
                                bookmarkedItems
                              ).reduce(
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
                      )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 bg-transparent border border-primary text-primary font-semibold py-3 px-6 rounded-lg w-full"
                    >
                      콘텐츠 저장하기
                    </Button>
                  </TabsContent>
                </div>
              </motion.div>
            </div>
          </Tabs>
        </div>
      </main>

      <BottomNav />

      {/* 타임라인 북마크 버튼 */}
      <TimelineBookmarkButton
        bookmarkCount={Object.keys(bookmarkedItems).length}
        onClick={() => setShowBookmarksPopup(true)}
        onGuideClick={() => setShowGuidePopup(true)}
      />

      {/* 북마크 팝업 */}
      <AnimatePresence>
        {showBookmarksPopup && (
          <BookmarksPopup
            isOpen={showBookmarksPopup}
            onClose={() => setShowBookmarksPopup(false)}
            bookmarks={bookmarkedItems}
            onBookmarkClick={handleSeekTo}
            onBookmarkDelete={handleDeleteBookmark}
            formatTime={formatTime}
          />
        )}
      </AnimatePresence>

      {/* 폴더 선택 모달    */}
      <AnimatePresence>
        {showFolderSelectionModal && (
          <FolderSelectionModal
            isOpen={showFolderSelectionModal}
            onClose={() => setShowFolderSelectionModal(false)}
            digestId={digest.id}
            title={digest.title}
            onSuccess={() => {
              setShowFolderSelectionModal(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* 타임라인 이용 가이드 */}
      <AnimatePresence>
        {showGuidePopup && (
          <TimelineGuideSheet
            isOpen={showGuidePopup}
            onClose={() => setShowGuidePopup(false)}
            onStartBookmarking={() => {
              setShowGuidePopup(false);
              setActiveTab("transcript");
            }}
          />
        )}
      </AnimatePresence>

      {/* 메모 팝업 */}
      <MemoPopup
        isOpen={showMemoPopup}
        onClose={handleCloseMemoPopup}
        onSave={handleSaveMemo}
        initialMemo={
          (currentBookmarkId && bookmarkedItems[currentBookmarkId]?.memo) || ""
        }
        title="북마크 메모 추가"
      />

      {/* 토스트 메시지 */}
      <DesignToast
        isVisible={showToast}
        message={toastMessage}
        onClose={handleCloseToast}
        showAddButton={showAddMemoButton}
        onAddButtonClick={handleAddMemo}
      />
    </div>
  );
}

function getYouTubeVideoId(url: string): string {
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
}

// formatTime 함수 추가 - 파일 맨 아래, getYouTubeVideoId 함수 위에 추가
function formatTime(seconds: number): string {
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

// 조회수 포맷 함수를 내부 함수로 변경
function formatViewCount(count: string | number): string {
  if (!count) return "0";

  const num = typeof count === "string" ? Number.parseInt(count, 10) : count;
  if (isNaN(num)) return "0";

  if (num >= 10000) {
    return `${Math.floor(num / 10000)}만회`;
  } else if (num >= 1000) {
    return `${Math.floor(num / 1000)}천회`;
  }

  return `${num}회`;
}
