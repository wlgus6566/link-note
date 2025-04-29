"use client";
import { YouTubePlayer } from "@/types/digest";
import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Share2,
  Info,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/bottom-nav";
import { useRouter } from "next/navigation";
import { motion, type PanInfo, AnimatePresence } from "framer-motion";
import { TimelineAccordion } from "@/components/timeline/timeline-accordion";
import { TimelinePlayerSection } from "@/components/timeline/timeline-player";
import { TranslatedContent } from "@/components/timeline/translated-content";
import type { TimelineGroup } from "@/lib/utils/youtube";
import {
  syncLocalTimelineBookmarks,
  saveTimelineBookmark,
  deleteTimelineBookmark,
  formatTime,
} from "@/lib/utils/timeline";
import {
  saveTimelineData,
  getTimelineData,
  saveTranslatedData,
  getTranslatedData,
} from "@/lib/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TimelineBookmarkButton } from "@/components/timeline/timeline-bookmark-button";
import { TimelineGuideSheet } from "@/components/timeline/timeline-guide-sheet";
import { useAuth } from "@/lib/hooks/useAuth";
import { Header } from "@/components/Header";
import { FolderSelectionModal } from "@/components/ui/folder-selection-modal";
import { MemoPopup } from "@/components/ui/memo-popup";
import { useToast } from "@/components/ui/toast";
import { BookmarksPopup } from "@/components/ui/bookmarks-popup";
import type {
  TimelineBookmarkItem,
  YouTubePopupState,
  TranslatedParagraph,
  YouTubeAPI,
} from "@/types/digest";

// 전역 속성 선언
declare global {
  interface Window {
    YT?: YouTubeAPI;
    onYouTubeIframeAPIReady?: (() => void) | null;
    syncTimer?: NodeJS.Timeout;
    ytPlayer?: any;
  }
}

export default function DigestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  const { showToast, hideToast } = useToast();

  // 상태 관리
  const [digest, setDigest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageId, setPageId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [timelineData, setTimelineData] = useState<TimelineGroup[]>([]);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [bookmarksInfo, setBookmarksInfo] = useState<TimelineBookmarkItem[]>(
    []
  );
  const [activeFolderId, setActiveFolderId] = useState<string>("");
  const [currentSegmentId, setCurrentSegmentId] = useState<string | null>(null);
  const [bookmarkedItems, setBookmarkedItems] = useState<
    Record<string, TimelineBookmarkItem>
  >({});

  // UI 상태
  const [showAddMemoButton, setShowAddMemoButton] = useState(false);
  const [showMemoPopup, setShowMemoPopup] = useState(false);
  const [currentBookmarkId, setCurrentBookmarkId] = useState<string | null>(
    null
  );
  const [syncNeeded, setSyncNeeded] = useState(false);
  const [showBookmarksPopup, setShowBookmarksPopup] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showFolderSelectionModal, setShowFolderSelectionModal] =
    useState(false);
  const [showGuidePopup, setShowGuidePopup] = useState(false);

  const [activeTab, setActiveTab] = useState<string>("summary");
  const [swipeDirection, setSwipeDirection] = useState<number>(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const [youtubePopup, setYoutubePopup] = useState<YouTubePopupState>({
    isOpen: false,
    videoId: "",
    startTime: 0,
  });

  // 타이머 참조를 위한 ref
  const syncTimerRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 플레이어 준비 상태
  const [playerReady, setPlayerReady] = useState(false);

  // 번역 관련 상태
  const [userLanguage, setUserLanguage] = useState<string>("ko");
  const [translatedTimelineData, setTranslatedTimelineData] = useState<
    TimelineGroup[]
  >([]);
  const [translatedParagraphs, setTranslatedParagraphs] = useState<
    TranslatedParagraph[]
  >([]);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [showTranslateTab, setShowTranslateTab] = useState<boolean>(true);
  const [autoTranslate, setAutoTranslate] = useState<boolean>(false);

  // 플레이어 시간 업데이트 핸들러
  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  // 스와이프 핸들러
  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const threshold = 50;
    if (info.offset.x > threshold) {
      setActiveTab("summary");
      setSwipeDirection(1);
    } else if (info.offset.x < -threshold) {
      setActiveTab("transcript");
      setSwipeDirection(-1);
    }
  };

  // 탭 변경 시 스와이프 방향 설정
  useEffect(() => {
    if (activeTab === "summary" || activeTab === "transcript") {
      setSwipeDirection(0);
    }
  }, [activeTab]);

  // URL 파라미터에서 다이제스트 ID 추출
  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParams = await params;
        setPageId(resolvedParams.id);
      } catch (error) {
        console.error("URL 파라미터 처리 오류:", error);
        setError("페이지 ID를 가져오는데 실패했습니다.");
      }
    };

    resolveParams();
  }, [params]);

  // 현재 재생 시간과 타임라인 항목 연동
  useEffect(() => {
    if (!timelineData.length) return;

    // 모든 세그먼트 추출
    const segments = timelineData.flatMap((group) => {
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

    // 현재 시간과 가장 가까운 세그먼트 찾기
    const active = segments.reduce(
      (prev, seg) =>
        seg.seconds <= currentTime && seg.seconds > prev.seconds ? seg : prev,
      { id: "", seconds: Number.NEGATIVE_INFINITY }
    );

    // 새로운 세그먼트로 스크롤
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
  }, [currentTime, timelineData, currentSegmentId]);

  // 타임라인 데이터 로드
  useEffect(() => {
    if (!pageId || !digest?.id) return;

    let isMounted = true;

    const fetchTimelineData = async () => {
      try {
        // 로컬 스토리지에서 데이터 확인
        const timelineKey = `timeline_${pageId}`;
        const storedTimeline = localStorage.getItem(timelineKey);
        let parsedTimeline = null;

        if (storedTimeline) {
          try {
            parsedTimeline = JSON.parse(storedTimeline);
            setTimelineData(parsedTimeline);
          } catch (parseError) {
            console.error("로컬 타임라인 데이터 파싱 오류:", parseError);
          }
        }

        // 로그인한 경우 서버와 데이터 동기화
        if (isAuthenticated) {
          // 로컬 데이터가 있으면 먼저 서버에 저장
          if (
            parsedTimeline &&
            Array.isArray(parsedTimeline) &&
            parsedTimeline.length > 0
          ) {
            try {
              await saveTimelineData(Number(digest.id), parsedTimeline);
            } catch (saveError) {
              console.error("타임라인 데이터 서버 저장 오류:", saveError);
            }
          }

          // 서버에서 데이터 가져오기
          try {
            const response = await getTimelineData(Number(digest.id));

            if (
              response.success &&
              response.data &&
              Array.isArray(response.data) &&
              response.data.length > 0
            ) {
              // 서버 데이터가 있으면 사용
              setTimelineData(response.data);
              // 로컬 스토리지도 업데이트
              localStorage.setItem(timelineKey, JSON.stringify(response.data));
            }
          } catch (fetchError) {
            console.error("서버 타임라인 데이터 가져오기 오류:", fetchError);
          }
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

  // 북마크 데이터 로드
  useEffect(() => {
    if (!pageId) return;

    try {
      const bookmarkKey = `bookmarks_timeline_${pageId}`;
      const storedBookmarks = localStorage.getItem(bookmarkKey);

      if (storedBookmarks) {
        const parsedBookmarks = JSON.parse(storedBookmarks);
        setBookmarkedItems(parsedBookmarks);
      }
    } catch (error) {
      console.error("북마크 데이터 로딩 오류:", error);
    }
  }, [pageId]);

  // 인증 상태 변경 감지 및 북마크 동기화
  useEffect(() => {
    if (isAuthenticated === true && pageId && !syncNeeded) {
      setSyncNeeded(true);
    }
  }, [isAuthenticated, pageId]);

  // 북마크 서버 동기화
  useEffect(() => {
    if (isAuthenticated !== true || !syncNeeded || !pageId || !digest?.id)
      return;

    // 동기화 시작 시 바로 상태 변경하여 중복 실행 방지
    setSyncNeeded(false);

    // 이전 재시도 타이머가 있으면 초기화
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }

    syncLocalTimelineBookmarks(Number(digest.id))
      .then((result) => {
        if (!result?.success && result?.error) {
          // 에러 발생 시 나중에 다시 시도
          retryTimerRef.current = setTimeout(() => {
            setSyncNeeded(true);
            retryTimerRef.current = null;
          }, 30000); // 30초 후 재시도
        }
      })
      .catch(() => {
        // 예외 발생 시 나중에 다시 시도
        retryTimerRef.current = setTimeout(() => {
          setSyncNeeded(true);
          retryTimerRef.current = null;
        }, 30000);
      });

    // 컴포넌트 언마운트 시 타이머 정리
    return () => {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
    };
  }, [isAuthenticated, syncNeeded, pageId, digest?.id]);

  // 컴포넌트 언마운트 시 모든 타이머 정리
  useEffect(() => {
    return () => {
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
        syncTimerRef.current = null;
      }

      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }

      if (window.syncTimer) {
        clearTimeout(window.syncTimer);
        window.syncTimer = undefined;
      }
    };
  }, []);

  // 다이제스트 데이터 가져오기
  useEffect(() => {
    if (!pageId) return;

    let isMounted = true;
    let isDataFetched = false;

    const fetchDigest = async () => {
      // 이미 데이터가 있거나 가져오는 중이면 중복 요청 방지
      if (digest && digest.id === Number.parseInt(pageId)) {
        return;
      }

      if (isDataFetched) {
        return;
      }

      isDataFetched = true;

      try {
        setLoading(true);
        const response = await fetch(`/api/digest/${pageId}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        });
        const result = await response.json();

        if (result.success) {
          const digestData = result.data;

          // YouTube 채널 썸네일 정보 처리
          if (digestData.sourceType === "YouTube" && digestData.sourceUrl) {
            try {
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

    // 약간의 지연을 두고 데이터 가져오기 (디바운싱)
    const timeoutId = setTimeout(fetchDigest, 100);

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
        if (result.bookmark) {
          setIsSaved(!!result.isBookmarked);
          if (result.bookmark.folder_id) {
            setActiveFolderId(String(result.bookmark.folder_id));
            console.log("활성 폴더 ID 설정:", result.bookmark.folder_id);
          }
        }
      } catch (error) {
        console.error("북마크 상태 확인 오류:", error);
      }
    };

    checkBookmarkStatus();
  }, [isAuthenticated, digest?.id]);

  useEffect(() => {
    if (activeTab === "transcript" && playerInstanceRef.current) {
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
      setCurrentBookmarkId(id);
      setShowAddMemoButton(true);
      isAdding = true;
    }

    // 로컬 스토리지에 저장
    setBookmarkedItems(newBookmarkedItems);
    localStorage.setItem(bookmarkKey, JSON.stringify(newBookmarkedItems));

    // isAdding이 true일 때만 메모 버튼을 표시하고 handleAddMemo를 콜백으로 전달
    showToast(
      isAdding ? "타임라인에 저장되었습니다." : "타임라인이 삭제되었습니다.",
      isAdding, // 추가할 때만 메모 버튼 표시
      isAdding ? handleAddMemo : undefined // 추가할 때만 메모 버튼 콜백 전달
    );

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

      showToast("타임라인이 저장되었습니다.");
    }
  };

  const handleAddMemo = () => {
    console.log("handleAddMemo 호출");
    setShowMemoPopup(true);
    hideToast();
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
      showToast("타임라인이 삭제되었습니다.");

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
    }
  };
  const playerInstanceRef = useRef<YouTubePlayer | null>(null);
  const pendingSeekRef = useRef<number | null>(null);

  const isPlayerReady = () =>
    !!(
      playerInstanceRef.current &&
      typeof playerInstanceRef.current.seekTo === "function"
    );

  const handlePlayerReady = useCallback((player: YouTubePlayer) => {
    playerInstanceRef.current = player;
    console.log("✅ [parent] Player received!", player);
    // 준비 기다리던 seek 한 번에 처리
    if (pendingSeekRef.current !== null) {
      const sec = pendingSeekRef.current;
      pendingSeekRef.current = null;
      player.seekTo(sec, true);
      player.playVideo?.();
    }
  }, []);
  useEffect(() => {
    const id = setTimeout(() => {
      if (!playerInstanceRef.current) {
        console.error("🚨 1초 경과 – 부모 ref 아직 null!");
      }
    }, 1000);
    return () => clearTimeout(id);
  }, []);
  const handleSeekTo = (seconds: number) => {
    if (!isPlayerReady()) {
      pendingSeekRef.current = seconds;
      return;
    }
    try {
      console.log(`▶️ ${seconds}초로 이동`);
      playerInstanceRef.current!.seekTo(seconds, true);
      playerInstanceRef.current!.playVideo?.();
    } catch (err) {
      console.error("❗ seekTo 호출 중 오류:", err);
    }
  };
  const handleSaveBookmark = () => {
    console.log("북마크 저장 시도");
    console.log("인증 상태:", isAuthenticated);
    console.log("북마크 상태:", { isSaved, activeFolderId });

    if (isAuthenticated !== true) {
      router.push("/login");
      return;
    }

    // 이미 저장된 북마크가 있는 경우
    if (isSaved) {
      console.log("이미 북마크가 저장되어 있음, 폴더 선택 모달 열기");
      // 폴더 선택 모달을 열어 이미 저장된 폴더가 활성화되어 있도록 함
      setShowFolderSelectionModal(true);
      return;
    }

    console.log("새 북마크 저장을 위해 폴더 선택 모달 열기");
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
        showToast("저장이 취소되었습니다.");
      } else {
        showToast("저장 취소 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("북마크 삭제 오류:", error);
      showToast("저장 취소 중 오류가 발생했습니다.");
    } finally {
      setShowConfirmDialog(false);
    }
  };

  // 사용자 설정 가져오기
  const fetchUserSettings = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await fetch("/api/settings");
      const data = await response.json();

      if (response.ok && data.success) {
        const settings = data.settings;
        setUserLanguage(settings.language || "ko");
        setAutoTranslate(settings.auto_translate || false);

        // 자동 번역이 켜져 있고 언어가 한국어가 아닌 경우 번역 탭 표시
        if (settings.auto_translate && settings.language !== "ko") {
          setShowTranslateTab(true);

          // 자동 번역 켜진 상태에서 타임라인 데이터가 있으면 번역 시작
          if (timelineData.length > 0 && pageId) {
            fetchTranslatedTimeline(pageId);
          }
        }
      }
    } catch (err) {
      console.error("설정 정보 조회 오류:", err);
    }
  }, [isAuthenticated]);

  // 페이지 로드 시 저장된 번역 데이터 확인 추가
  useEffect(() => {
    const checkForTranslatedData = async () => {
      if (!pageId || !userLanguage) return;

      console.log("페이지 로드 시 번역 데이터 확인 중...");

      // 로컬 스토리지에서 번역 데이터 확인
      const localTranslationKey = `translated_data_${pageId}_${userLanguage}`;
      const storedLocalTranslation = localStorage.getItem(localTranslationKey);

      if (storedLocalTranslation) {
        try {
          const parsedLocalTranslation = JSON.parse(storedLocalTranslation);
          if (
            Array.isArray(parsedLocalTranslation) &&
            parsedLocalTranslation.length > 0
          ) {
            console.log("로컬 스토리지에서 번역 데이터를 찾았습니다.");
            setTranslatedParagraphs(parsedLocalTranslation);
            setShowTranslateTab(true);

            // 로그인 상태라면 서버에도 저장
            if (isAuthenticated === true && !syncNeeded) {
              try {
                await saveTranslatedData(
                  Number(pageId),
                  userLanguage,
                  parsedLocalTranslation
                );
                console.log("로컬 번역 데이터를 서버에 동기화했습니다.");
              } catch (syncError) {
                console.error("번역 데이터 서버 동기화 오류:", syncError);
              }
            }

            return true; // 데이터 찾음
          }
        } catch (parseError) {
          console.error("로컬 번역 데이터 파싱 오류:", parseError);
        }
      }

      // 로그인 상태인 경우 서버에서 데이터 확인
      if (isAuthenticated === true) {
        try {
          const storedTranslationResult = await getTranslatedData(
            Number(pageId),
            userLanguage
          );

          if (
            storedTranslationResult.success &&
            storedTranslationResult.translatedParagraphs?.length > 0
          ) {
            console.log("서버에서 번역 데이터를 찾았습니다.");
            setTranslatedParagraphs(
              storedTranslationResult.translatedParagraphs
            );
            setShowTranslateTab(true);

            // 로컬 스토리지에도 저장
            localStorage.setItem(
              localTranslationKey,
              JSON.stringify(storedTranslationResult.translatedParagraphs)
            );

            return true; // 데이터 찾음
          } else {
            console.log(
              "서버에 저장된 번역 데이터가 없습니다:",
              storedTranslationResult
            );
          }
        } catch (error) {
          console.error("서버 번역 데이터 확인 중 오류:", error);
        }
      }

      return false; // 데이터 못 찾음
    };

    checkForTranslatedData().then((dataFound) => {
      // 자동 번역 설정이 켜져 있고 데이터를 찾지 못한 경우에만 번역 시작
      if (
        !dataFound &&
        autoTranslate &&
        userLanguage !== "ko" &&
        timelineData.length > 0 &&
        pageId
      ) {
        fetchTranslatedTimeline(pageId);
      }
    });
  }, [
    pageId,
    userLanguage,
    isAuthenticated,
    timelineData.length,
    autoTranslate,
  ]);

  // 번역된 타임라인 가져오기
  const fetchTranslatedTimeline = async (id: string) => {
    if (!id || !userLanguage) return;

    try {
      setIsTranslating(true);
      setTranslationError(null);

      // 로컬 스토리지 키
      const localTranslationKey = `translated_data_${id}_${userLanguage}`;

      // 우선 로컬 스토리지에서 번역 데이터 확인
      const storedLocalTranslation = localStorage.getItem(localTranslationKey);
      if (storedLocalTranslation) {
        try {
          const parsedLocalTranslation = JSON.parse(storedLocalTranslation);
          if (
            Array.isArray(parsedLocalTranslation) &&
            parsedLocalTranslation.length > 0
          ) {
            setTranslatedParagraphs(parsedLocalTranslation);
            setShowTranslateTab(true);
            setIsTranslating(false);
            return;
          }
        } catch (parseError) {
          console.error("로컬 번역 데이터 파싱 오류:", parseError);
        }
      }

      // 로그인 상태인 경우 서버에서 데이터 확인
      if (isAuthenticated === true) {
        try {
          const storedTranslationResult = await getTranslatedData(
            Number(id),
            userLanguage
          );

          if (
            storedTranslationResult.success &&
            storedTranslationResult.translatedParagraphs?.length > 0
          ) {
            setTranslatedParagraphs(
              storedTranslationResult.translatedParagraphs
            );
            setShowTranslateTab(true);
            setIsTranslating(false);

            // 로컬 스토리지에도 저장
            localStorage.setItem(
              localTranslationKey,
              JSON.stringify(storedTranslationResult.translatedParagraphs)
            );

            return;
          }
        } catch (error) {
          console.error("서버 번역 데이터 확인 중 오류:", error);
          // 서버 데이터 확인 중 오류가 발생해도 진행 (새로 번역 시도)
        }
      }

      // 저장된 번역 데이터가 없으면 새로 번역
      const response = await fetch(
        `/api/digest/${id}/translate?lang=${userLanguage}`
      );

      const data = await response.json();

      if (response.ok && data.success) {
        // 새로운 번역 API 응답 처리
        if (data.translatedParagraphs && data.translatedParagraphs.length > 0) {
          setTranslatedParagraphs(data.translatedParagraphs);
          setShowTranslateTab(true);

          // 번역 결과를 로컬 스토리지에 저장
          localStorage.setItem(
            localTranslationKey,
            JSON.stringify(data.translatedParagraphs)
          );

          // 로그인 상태이면서 번역이 성공적으로 이루어졌다면 번역 데이터 서버에도 저장
          if (isAuthenticated === true) {
            try {
              const saveResult = await saveTranslatedData(
                Number(id),
                userLanguage,
                data.translatedParagraphs
              );

              if (!saveResult.success) {
                console.error("번역 데이터 저장 실패:", saveResult.error);
              }
            } catch (saveError) {
              console.error("번역 데이터 저장 중 예외 발생:", saveError);
            }
          }
        } else if (data.translatedTimeline) {
          // 이전 버전 호환성 유지
          setTranslatedTimelineData(data.translatedTimeline);
          setShowTranslateTab(true);
        } else {
          setTranslationError("번역 데이터가 없습니다. 다시 시도해 주세요.");
        }
      } else {
        console.error("번역 API 오류:", data.error, data.details);
        setTranslationError(data.error || "번역을 불러오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("번역 가져오기 오류:", error);
      setTranslationError("번역을 불러오는데 실패했습니다.");
    } finally {
      setIsTranslating(false);
    }
  };

  // 인증 상태 변경 후 사용자 설정 가져오기
  useEffect(() => {
    if (isAuthenticated !== true) return;

    fetchUserSettings();
  }, [isAuthenticated, fetchUserSettings]);

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
    return <></>;
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

      <main className="flex-1">
        <div className="container px-0 sm:px-5 md:flex md:gap-6 md:px-5 overflow-visible">
          {/* 비디오 섹션 - 768px 이상에서는 왼쪽에 고정 */}
          {digest.sourceType === "YouTube" && digest.sourceUrl && (
            <TimelinePlayerSection
              sourceType={digest.sourceType}
              sourceUrl={digest.sourceUrl}
              activeTab={activeTab}
              onPlayerReady={handlePlayerReady}
              onTimeUpdate={handleTimeUpdate}
            />
          )}

          {/* 탭 콘텐츠 영역 - 768px 이상에서는 오른쪽에 배치 */}
          <div className="md:w-[55%]">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div
                className={`sticky ${
                  activeTab === "transcript" || activeTab === "translated"
                    ? "top-[calc(56.25vw+64px)] md:top-16"
                    : "top-16"
                } z-10 bg-white border-b border-border-line`}
              >
                <TabsList
                  className={`grid w-full ${
                    showTranslateTab ? "grid-cols-3" : "grid-cols-2"
                  } p-0 h-12`}
                >
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
                    타임라인
                  </TabsTrigger>
                  {showTranslateTab && (
                    <TabsTrigger
                      value="translated"
                      className="data-[state=active]:border-b-2 data-[state=active]:border-primary-color data-[state=active]:text-primary-color rounded-none h-full"
                    >
                      <Globe className="h-4 w-4 mr-1" />
                      번역{" "}
                      <span className="ml-1 text-xs">({userLanguage})</span>
                    </TabsTrigger>
                  )}
                </TabsList>
              </div>

              {/* 모바일에서는 스와이프 기능 유지, 데스크톱에서는 일반 탭 사용 */}
              <div className="md:hidden overflow-hidden" ref={contentRef}>
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
                      activeTab === "summary" ? "block" : "hidden"
                    }`}
                  >
                    <TabsContent
                      forceMount
                      value="summary"
                      className="mt-0 p-5"
                    >
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
                        onClick={handleSaveBookmark}
                        className="mt-4 bg-primary hover:bg-primary-color/90 text-white font-semibold py-3 px-6 rounded-lg w-full"
                      >
                        콘텐츠 저장하기
                      </Button>
                    </TabsContent>
                  </div>

                  <div
                    className={`w-full flex-shrink-0 ${
                      activeTab === "transcript" ? "block" : "hidden"
                    }`}
                  >
                    <TabsContent
                      forceMount
                      value="transcript"
                      className="mt-0 p-5"
                    >
                      {digest.sourceType === "YouTube" &&
                        timelineData.length > 0 && (
                          <motion.div
                            className="mb-10"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.45 }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-1">
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
                                <Info className="h-4 w-4 bg-[#1976D2] text-white rounded-full p-0.5" />
                                이용가이드
                              </Button>
                            </div>

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
                          </motion.div>
                        )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSaveBookmark}
                        className="mt-4 bg-primary hover:bg-primary-color/90 text-white font-semibold py-3 px-6 rounded-lg w-full"
                      >
                        콘텐츠 저장하기
                      </Button>
                    </TabsContent>
                  </div>

                  {showTranslateTab && (
                    <div
                      className={`w-full flex-shrink-0 ${
                        activeTab === "translated" ? "block" : "hidden"
                      }`}
                    >
                      <TabsContent
                        forceMount
                        value="translated"
                        className="mt-0 p-5"
                      >
                        <TranslatedContent
                          isTranslating={isTranslating}
                          translationError={translationError}
                          translatedParagraphs={translatedParagraphs}
                          userLanguage={userLanguage}
                          bookmarkedItems={bookmarkedItems}
                          handleSeekTo={handleSeekTo}
                          handleBookmark={handleBookmark}
                          fetchTranslatedTimeline={fetchTranslatedTimeline}
                          pageId={pageId}
                        />

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSaveBookmark}
                          className="mt-4 bg-primary hover:bg-primary-color/90 text-white font-semibold py-3 px-6 rounded-lg w-full"
                        >
                          콘텐츠 저장하기
                        </Button>
                      </TabsContent>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* 데스크톱에서만 보이는 탭 콘텐츠 */}
              <div className="hidden md:block">
                <TabsContent value="summary" className="mt-0 p-5">
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
                    onClick={handleSaveBookmark}
                    className="mt-4 bg-primary hover:bg-primary-color/90 text-white font-semibold py-3 px-6 rounded-lg w-full"
                  >
                    콘텐츠 저장하기
                  </Button>
                </TabsContent>

                <TabsContent value="transcript" className="mt-0 p-5">
                  {digest.sourceType === "YouTube" &&
                    timelineData.length > 0 && (
                      <motion.div
                        className="mb-10"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1">
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
                            <Info className="h-4 w-4 bg-[#1976D2] text-white rounded-full p-0.5" />
                            이용가이드
                          </Button>
                        </div>

                        <TimelineAccordion
                          timelineGroups={timelineData}
                          onSeek={handleSeekTo}
                          currentSegmentId={currentSegmentId || undefined}
                          bookmarkedItems={Object.keys(bookmarkedItems).reduce(
                            (acc, key) => ({
                              ...acc,
                              [key]: true,
                            }),
                            {}
                          )}
                          onBookmark={handleBookmark}
                        />
                      </motion.div>
                    )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveBookmark}
                    className="mt-4 bg-primary hover:bg-primary-color/90 text-white font-semibold py-3 px-6 rounded-lg w-full"
                  >
                    콘텐츠 저장하기
                  </Button>
                </TabsContent>

                {showTranslateTab && (
                  <TabsContent value="translated" className="mt-0 p-5">
                    <TranslatedContent
                      isTranslating={isTranslating}
                      translationError={translationError}
                      translatedParagraphs={translatedParagraphs}
                      userLanguage={userLanguage}
                      bookmarkedItems={bookmarkedItems}
                      handleSeekTo={handleSeekTo}
                      handleBookmark={handleBookmark}
                      fetchTranslatedTimeline={fetchTranslatedTimeline}
                      pageId={pageId}
                    />

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSaveBookmark}
                      className="mt-4 bg-primary hover:bg-primary-color/90 text-white font-semibold py-3 px-6 rounded-lg w-full"
                    >
                      콘텐츠 저장하기
                    </Button>
                  </TabsContent>
                )}
              </div>
            </Tabs>
          </div>
        </div>
      </main>

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
            activeFolder={activeFolderId}
            onSuccess={(folderId) => {
              // 폴더 ID를 저장하고 북마크 상태를 업데이트
              setActiveFolderId(String(folderId));
              setIsSaved(true);
              setShowFolderSelectionModal(false);
              console.log("북마크가 폴더에 저장됨, 폴더 ID:", folderId);
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
    </div>
  );
}
