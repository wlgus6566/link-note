"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Filter,
  Grid,
  List,
  Bookmark,
  MoreVertical,
  Share2,
  Trash2,
  X,
  Folder,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BottomNav from "@/components/bottom-nav";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { FolderSelectionModal } from "@/components/ui/folder-selection-modal";

interface Folder {
  id: string;
  name: string;
  description: string | null;
  user_id: string;
  created_at: string;
}

interface Digest {
  id: number;
  title: string;
  summary: string;
  tags: string[];
  source_type: string;
  source_url: string;
  created_at: string;
  date: string;
  image: string;
  video_info?: {
    channelTitle?: string;
    viewCount?: string;
    duration?: string;
  };
}

interface BookmarkItem {
  id: number;
  user_id: string;
  digest_id: number;
  created_at: string;
  digests: Digest;
}

export default function LibraryPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [filteredBookmarks, setFilteredBookmarks] = useState<BookmarkItem[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState("전체");
  const [allTags, setAllTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [showBottomPopup, setShowBottomPopup] = useState(false);
  const [selectedBookmark, setSelectedBookmark] = useState<BookmarkItem | null>(
    null
  );
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [loadingFolders, setLoadingFolders] = useState(false);

  // 폴더 목록 불러오기 함수
  const fetchFolders = async () => {
    setLoadingFolders(true);
    try {
      const response = await fetch("/api/folders");
      const data = await response.json();

      if (!response.ok) {
        console.error("폴더 목록 불러오기 오류:", data.error);
        return;
      }

      setFolders(data.folders || []);
    } catch (error) {
      console.error("폴더 목록 불러오기 오류:", error);
    } finally {
      setLoadingFolders(false);
    }
  };

  // 북마크 불러오기 함수
  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: session } = await supabase.auth.getSession();

      if (!session.session) {
        setError("로그인이 필요합니다.");
        setLoading(false);
        return;
      }
      const { bookmarks, error } = await fetch("/api/bookmarks", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }).then((res) => res.json());
      console.log("북마크 데이터:", bookmarks);
      if (error) {
        setError("북마크를 불러오는데 실패했습니다.");
        console.error("북마크 조회 오류:", error);
      } else if (bookmarks) {
        // 북마크 데이터 가공
        console.log("북마크 데이터:", bookmarks);
        const formattedBookmarks = bookmarks.map((bookmark: any) => ({
          ...bookmark,
          digests: {
            ...bookmark.digests,
            tags: Array.isArray(bookmark.digests.tags)
              ? bookmark.digests.tags
              : JSON.parse(bookmark.digests.tags || "[]"),
          },
        }));

        setBookmarks(formattedBookmarks);
        setFilteredBookmarks(formattedBookmarks);

        // 모든 태그 수집
        const tags = formattedBookmarks.reduce(
          (acc: string[], bookmark: BookmarkItem) => {
            const digestTags = bookmark.digests.tags || [];
            return [
              ...acc,
              ...digestTags.filter((tag: string) => !acc.includes(tag)),
            ];
          },
          []
        );

        setAllTags(tags);
      }
    } catch (error) {
      console.error("북마크 불러오기 오류:", error);
      setError("북마크를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 북마크와 폴더 불러오기
  useEffect(() => {
    fetchBookmarks();
    fetchFolders();
  }, []);

  // 페이지 포커스 시 북마크 다시 불러오기
  useEffect(() => {
    const handleFocus = () => {
      console.log("페이지 포커스 - 북마크 새로고침");
      fetchBookmarks();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // 검색 및 필터링
  useEffect(() => {
    let filtered = [...bookmarks];

    // 검색어 필터링
    if (searchQuery) {
      filtered = filtered.filter(
        (bookmark) =>
          bookmark.digests.title
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          bookmark.digests.summary
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    // 태그 필터링
    if (activeTag !== "전체") {
      filtered = filtered.filter(
        (bookmark) =>
          bookmark.digests.tags && bookmark.digests.tags.includes(activeTag)
      );
    }

    setFilteredBookmarks(filtered);
  }, [searchQuery, activeTag, bookmarks]);

  // 아이템 메뉴 열기
  const handleOpenMenu = (e: React.MouseEvent, bookmark: BookmarkItem) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedBookmark(bookmark);
    setShowBottomPopup(true);
  };

  // 북마크 삭제
  const handleDeleteBookmark = async () => {
    if (!selectedBookmark) return;

    try {
      const response = await fetch(
        `/api/bookmarks?digestId=${selectedBookmark.digest_id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();
      if (result.success) {
        // 북마크 목록에서 삭제된 항목 제거
        const updatedBookmarks = bookmarks.filter(
          (bookmark) => bookmark.id !== selectedBookmark.id
        );
        setBookmarks(updatedBookmarks);
        setFilteredBookmarks(
          filteredBookmarks.filter(
            (bookmark) => bookmark.id !== selectedBookmark.id
          )
        );
        setShowBottomPopup(false);
      }
    } catch (error) {
      console.error("북마크 삭제 오류:", error);
    }
  };

  // 북마크 공유
  const handleShareBookmark = async () => {
    if (!selectedBookmark) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: selectedBookmark.digests.title,
          text: selectedBookmark.digests.summary,
          url: `/digest/${selectedBookmark.digest_id}`,
        });
      } else {
        // 웹 공유 API가 지원되지 않는 경우 URL을 클립보드에 복사
        await navigator.clipboard.writeText(
          `${window.location.origin}/digest/${selectedBookmark.digest_id}`
        );
        alert("링크가 클립보드에 복사되었습니다.");
      }
      setShowBottomPopup(false);
    } catch (error) {
      console.error("공유 오류:", error);
    }
  };

  // ISO 8601 형식의 duration을 mm:ss 또는 hh:mm:ss 형식으로 변환하는 함수
  const formatDuration = (isoDuration: string): string => {
    if (!isoDuration) return "00:00";

    // PT1H30M20S와 같은 형식에서 시간, 분, 초 추출
    const hourMatch = isoDuration.match(/(\d+)H/);
    const minuteMatch = isoDuration.match(/(\d+)M/);
    const secondMatch = isoDuration.match(/(\d+)S/);

    const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
    const minutes = minuteMatch ? parseInt(minuteMatch[1]) : 0;
    const seconds = secondMatch ? parseInt(secondMatch[1]) : 0;

    // 시간이 있는 경우: hh:mm:ss
    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }

    // 시간이 없는 경우: mm:ss
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // 조회수 포맷 함수
  const formatViewCount = (count: string): string => {
    if (!count) return "0";

    const num = parseInt(count, 10);
    if (isNaN(num)) return "0";

    if (num >= 10000) {
      return `${Math.floor(num / 10000)}만회`;
    } else if (num >= 1000) {
      return `${Math.floor(num / 1000)}천회`;
    }

    return `${num}회`;
  };

  // 날짜 포맷 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}월 ${day}일`;
  };

  // 인기 태그 (모든 태그에서 최대 6개)
  const popularTags = allTags.slice(0, 6);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const bottomPopupVariants = {
    hidden: { opacity: 0, y: 100 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
      },
    },
    exit: {
      opacity: 0,
      y: 100,
      transition: {
        duration: 0.2,
      },
    },
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <div className="flex flex-col min-h-screen pb-24">
      <header className="header">
        <div className="container px-5 py-4">
          <div className="flex items-center mb-4">
            <Bookmark className="h-5 w-5 text-primary-color mr-2" />
            <h1 className="text-xl font-bold text-neutral-dark">요약 저장소</h1>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-medium" />
            <Input
              className="search-input"
              placeholder="저장된 콘텐츠 검색"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="category-filter">
              <Button
                variant="outline"
                size="sm"
                className={`category-btn ${
                  activeTag === "전체" ? "active" : "inactive"
                }`}
                onClick={() => setActiveTag("전체")}
              >
                전체
              </Button>
              {popularTags.map((tag) => (
                <Button
                  key={tag}
                  variant="outline"
                  size="sm"
                  className={`category-btn ${
                    activeTag === tag ? "active" : "inactive"
                  }`}
                  onClick={() => setActiveTag(tag)}
                >
                  {tag}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full bg-white border-border-line flex-shrink-0 hover:border-primary-color hover:text-primary-color"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container px-5 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-neutral-medium">
              {filteredBookmarks.length}개 항목
            </div>

            <Tabs
              defaultValue={viewMode}
              className="w-auto"
              onValueChange={(value) => setViewMode(value as "grid" | "list")}
            >
              <TabsList className="h-8 p-1 bg-secondary-color">
                <TabsTrigger
                  value="list"
                  className="h-6 w-6 p-0 data-[state=active]:bg-primary-light data-[state=active]:text-primary-color"
                >
                  <List className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger
                  value="grid"
                  className="h-6 w-6 p-0 data-[state=active]:bg-primary-light data-[state=active]:text-primary-color"
                >
                  <Grid className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {loading ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-2 gap-4"
                  : "space-y-4 grid"
              }
            >
              {Array(4)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={index}
                    className={`bg-white rounded-xl overflow-hidden border border-border-line shadow-sm ${
                      viewMode === "grid" ? "h-full flex flex-col" : "flex"
                    }`}
                  >
                    <Skeleton
                      className={
                        viewMode === "grid"
                          ? "h-32 w-full"
                          : "h-32 w-1/3 flex-shrink-0"
                      }
                    />
                    <div
                      className={`p-3 ${
                        viewMode === "grid" ? "flex-1 flex flex-col" : "flex-1"
                      }`}
                    >
                      <Skeleton className="h-4 w-20 mb-1" />
                      <Skeleton className="h-5 w-full mb-1" />
                      <Skeleton className="h-5 w-1/2 mb-1" />
                      {viewMode === "list" && (
                        <>
                          <Skeleton className="h-4 w-full mb-1" />
                          <Skeleton className="h-4 w-4/5 mb-2" />
                        </>
                      )}
                      <div className="flex gap-1 mt-auto">
                        <Skeleton className="h-5 w-12 rounded-full" />
                        <Skeleton className="h-5 w-12 rounded-full" />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-neutral-medium mb-3">{error}</p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="rounded-full px-4"
              >
                다시 시도
              </Button>
            </div>
          ) : filteredBookmarks.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-neutral-medium mb-1">
                저장된 콘텐츠가 없습니다.
              </p>
              <p className="text-neutral-medium mb-3">
                관심 있는 콘텐츠를 북마크해보세요!
              </p>
              <Button variant="outline" asChild className="rounded-full px-4">
                <Link href="/">새로운 콘텐츠 둘러보기</Link>
              </Button>
            </div>
          ) : (
            <motion.div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-2 gap-4"
                  : "space-y-4 grid"
              }
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredBookmarks.map((bookmark) => (
                <motion.div
                  key={bookmark.id}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  className="group"
                >
                  {viewMode === "grid" ? (
                    <div className="bg-white rounded-xl overflow-hidden transition-all duration-200 border border-border-line shadow-sm group-hover:border-primary-color h-full flex flex-col">
                      <Link
                        href={`/digest/${bookmark.digest_id}`}
                        className="flex-1 flex flex-col"
                      >
                        <div className="relative h-32 w-full">
                          <Image
                            src={bookmark.digests.image || "/placeholder.svg"}
                            alt={bookmark.digests.title}
                            fill
                            className="object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                          />

                          {/* 영상 길이 표시 */}
                          {bookmark.digests.source_type === "YouTube" &&
                            bookmark.digests.video_info?.duration && (
                              <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 text-white text-[10px] rounded">
                                {formatDuration(
                                  bookmark.digests.video_info.duration
                                )}
                              </div>
                            )}
                        </div>

                        <div className="p-3 flex-1 flex flex-col">
                          <div className="text-xs text-neutral-medium mb-1">
                            {formatDate(bookmark.created_at)}
                          </div>
                          <h3 className="font-medium text-sm mb-1 line-clamp-2 text-neutral-dark group-hover:text-primary-color transition-colors">
                            {bookmark.digests.title}
                          </h3>

                          <div className="flex flex-wrap gap-1 mt-auto">
                            {bookmark.digests.tags &&
                              bookmark.digests.tags
                                .slice(0, 2)
                                .map((tag: string) => (
                                  <span key={tag} className="tag">
                                    {tag}
                                  </span>
                                ))}
                            {bookmark.digests.tags &&
                              bookmark.digests.tags.length > 2 && (
                                <span className="text-xs bg-secondary-color text-neutral-medium px-1.5 py-0.5 rounded-full">
                                  +{bookmark.digests.tags.length - 2}
                                </span>
                              )}
                          </div>
                        </div>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full absolute top-3 right-3 p-0 bg-white/80 hover:bg-white border border-border-line group-hover:opacity-100 opacity-60"
                        onClick={(e) => handleOpenMenu(e, bookmark)}
                      >
                        <MoreVertical className="h-4 w-4 text-neutral-dark" />
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl overflow-hidden transition-all duration-200 border border-border-line shadow-sm group-hover:border-primary-color flex relative">
                      <Link
                        href={`/digest/${bookmark.digest_id}`}
                        className="flex flex-1"
                      >
                        <div className="w-2/5 h-26 relative">
                          <Image
                            src={bookmark.digests.image || "/placeholder.svg"}
                            alt={bookmark.digests.title}
                            fill
                            className="object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                          />
                          {/* 영상 길이 표시 */}
                          {bookmark.digests.source_type === "YouTube" &&
                            bookmark.digests.video_info?.duration && (
                              <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 text-white text-[10px] rounded">
                                {formatDuration(
                                  bookmark.digests.video_info.duration
                                )}
                              </div>
                            )}
                        </div>

                        <div className="p-3 pb-2 w-3/5">
                          <h3 className="font-medium text-sm mb-1 line-clamp-2 text-neutral-dark group-hover:text-primary-color transition-colors">
                            {bookmark.digests.title}
                          </h3>

                          {/* 유튜버 이름과 조회수 표시 */}
                          {bookmark.digests.source_type === "YouTube" &&
                          bookmark.digests.video_info ? (
                            <p className="text-xs text-neutral-medium mb-1">
                              {bookmark.digests.video_info.channelTitle || ""} ·
                              조회수{" "}
                              {formatViewCount(
                                bookmark.digests.video_info.viewCount || "0"
                              )}
                            </p>
                          ) : (
                            <p className="text-xs text-neutral-medium mb-1">
                              {formatDate(bookmark.created_at)}
                            </p>
                          )}

                          {/* <p className="text-xs text-neutral-medium line-clamp-2 mb-2">
                            {bookmark.digests.summary}
                          </p> */}
                          <div className="flex flex-wrap gap-1 mt-auto">
                            {bookmark.digests.tags &&
                              bookmark.digests.tags
                                .slice(0, 2)
                                .map((tag: string) => (
                                  <span key={tag} className="tag text-xs">
                                    {tag}
                                  </span>
                                ))}
                          </div>
                        </div>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full absolute top-3 right-3 p-0 bg-white/80 hover:bg-white border border-border-line group-hover:opacity-100 opacity-60"
                        onClick={(e) => handleOpenMenu(e, bookmark)}
                      >
                        <MoreVertical className="h-4 w-4 text-neutral-dark" />
                      </Button>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>

      <BottomNav />

      {/* 바텀 팝업 */}
      <AnimatePresence>
        {showBottomPopup && selectedBookmark && (
          <motion.div
            className="fixed bottom-0 left-0 w-full z-50"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="flex flex-col bg-white border-t border-border-line rounded-t-2xl overflow-hidden">
              <div className="p-4 border-b border-border-line">
                <div className="w-12 h-1 bg-border-line rounded-full mx-auto mb-4" />
                <h3 className="font-medium text-lg line-clamp-1">
                  {selectedBookmark.digests.title}
                </h3>
              </div>

              <div className="p-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start py-3 px-4 rounded-lg h-auto"
                  onClick={() => {
                    setShowFolderModal(true);
                  }}
                >
                  <Folder className="mr-3 h-5 w-5 text-neutral-medium" />
                  <span>다른 재생목록에 저장</span>
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start py-3 px-4 rounded-lg h-auto"
                  onClick={handleShareBookmark}
                >
                  <Share2 className="mr-3 h-5 w-5 text-neutral-medium" />
                  <span>공유하기</span>
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start py-3 px-4 rounded-lg h-auto text-red-500 hover:text-red-600"
                  onClick={handleDeleteBookmark}
                >
                  <Trash2 className="mr-3 h-5 w-5" />
                  <span>저장 취소</span>
                </Button>
              </div>

              <Button
                variant="ghost"
                className="py-4 border-t border-border-line rounded-none"
                onClick={() => setShowBottomPopup(false)}
              >
                취소
              </Button>
            </div>

            <div
              className="fixed inset-0 bg-black/40 -z-10"
              onClick={() => setShowBottomPopup(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 폴더 선택 모달 */}
      <FolderSelectionModal
        isOpen={showFolderModal}
        onClose={() => setShowFolderModal(false)}
        digestId={selectedBookmark?.digest_id.toString() || ""}
        title={selectedBookmark?.digests.title || ""}
        onSuccess={() => {
          setShowFolderModal(false);
          setShowBottomPopup(false);
        }}
      />
    </div>
  );
}
