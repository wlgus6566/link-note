"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Filter,
  Bookmark,
  MoreVertical,
  Share2,
  Trash2,
  X,
  Folder,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BottomNav from "@/components/bottom-nav";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { FolderSelectionModal } from "@/components/ui/folder-selection-modal";
import { BottomPopup } from "@/components/bottom-popup";
interface FolderType {
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
  folder_id?: string;
  digests: Digest;
  folders?: {
    id: string;
    name: string;
    description: string | null;
  };
}

export default function LibraryPage() {
  const [showTagFilter, setShowTagFilter] = useState(false);
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
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [folderBookmarks, setFolderBookmarks] = useState<
    Record<string, number[]>
  >({});
  const [isLoadingFolderData, setIsLoadingFolderData] = useState(false);
  const [showFolderDropdown, setShowFolderDropdown] = useState(false);

  // 바깥 영역 클릭 시 폴더 드롭다운 닫기 이벤트 추가
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showFolderDropdown && !target.closest(".folder-dropdown")) {
        setShowFolderDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFolderDropdown]);

  // 북마크 불러오기 함수 최적화 - 폴더 필터링 관련 코드 제거
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

      // 북마크 데이터 가져오기 - 이제 한 번의 호출로 폴더 정보 포함
      const bookmarksResponse = await fetch("/api/bookmarks", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      const bookmarksData = await bookmarksResponse.json();

      if (bookmarksData.error) {
        setError("북마크를 불러오는데 실패했습니다.");
        console.error("북마크 조회 오류:", bookmarksData.error);
        return;
      }

      if (bookmarksData.bookmarks) {
        // 북마크 데이터 가공
        console.log("북마크 데이터:", bookmarksData.bookmarks);
        const formattedBookmarks = bookmarksData.bookmarks.map(
          (bookmark: any) => ({
            ...bookmark,
            digests: {
              ...bookmark.digests,
              tags: Array.isArray(bookmark.digests.tags)
                ? bookmark.digests.tags
                : JSON.parse(bookmark.digests.tags || "[]"),
            },
          })
        );

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

        // 폴더 목록 불러오기
        fetchFolders();
      }
    } catch (error) {
      console.error("북마크 불러오기 오류:", error);
      setError("북마크를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 폴더 목록 불러오기 함수 다시 추가
  const fetchFolders = async () => {
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
    }
  };

  // 데이터 새로고침 함수 단순화
  const refreshFolderData = async () => {
    console.log("북마크 데이터 새로고침 시작");
    await fetchBookmarks();
    console.log("북마크 데이터 새로고침 완료");
  };

  // 폴더별 북마크 필터링 로직 수정
  useEffect(() => {
    if (bookmarks.length === 0) return;

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

    // 폴더 필터링 - 이제 bookmark.folder_id로 필터링
    if (activeFolder) {
      filtered = filtered.filter(
        (bookmark) => bookmark.folder_id === activeFolder
      );
    }

    setFilteredBookmarks(filtered);
  }, [searchQuery, activeTag, bookmarks, activeFolder]);

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

    const hours = hourMatch ? Number.parseInt(hourMatch[1]) : 0;
    const minutes = minuteMatch ? Number.parseInt(minuteMatch[1]) : 0;
    const seconds = secondMatch ? Number.parseInt(secondMatch[1]) : 0;

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

    const num = Number.parseInt(count, 10);
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

  // 바텀 팝업의 '다른 재생목록에 저장' 버튼 클릭 함수 수정
  const handleSaveToFolder = () => {
    setShowFolderModal(true);
  };

  // 컴포넌트 마운트 시 데이터 불러오기
  useEffect(() => {
    // 북마크 데이터 로드 (폴더 데이터도 함께 로드됨)
    fetchBookmarks();
  }, []);

  return (
    <div className="flex flex-col min-h-screen pb-24">
      <header className="header">
        <div className="container px-5 py-4">
          <div className="flex items-center mb-4">
            <Bookmark className="h-5 w-5 text-primary-color mr-2" />
            <h1 className="text-xl font-bold text-neutral-dark">
              콘텐츠 저장소
            </h1>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-medium" />
            <Input
              className="search-input"
              placeholder="제목, 태그 검색"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* 태그 필터 부분 수정 - 필터 아이콘 옆에 일부 태그 표시하고 확장 가능하도록 */}
          {/* <div className="flex items-center justify-between">
            <div className="flex-1 flex items-center flex-wrap gap-2 overflow-hidden">
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
              {activeTag !== "전체" ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="category-btn active"
                  onClick={() => setActiveTag("전체")}
                >
                  {activeTag} <X className="h-3 w-3 ml-1" />
                </Button>
              ) : (
                // 인기 태그 중 일부만 표시 (최대 3개)
                popularTags.slice(0, 3).map((tag) => (
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
                ))
              )}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full bg-white border-border-line flex-shrink-0 hover:border-primary-color hover:text-primary-color ml-2"
              onClick={() => setShowTagFilter(!showTagFilter)}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div> */}

          {/* 확장 가능한 태그 필터 */}
          <AnimatePresence>
            {showTagFilter && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden mt-2 mb-4"
              >
                <div className="bg-white p-3 rounded-xl border border-border-line shadow-sm">
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <Button
                        key={tag}
                        variant="outline"
                        size="sm"
                        className={`category-btn ${
                          activeTag === tag ? "active" : "inactive"
                        }`}
                        onClick={() => {
                          setActiveTag(tag);
                          setShowTagFilter(false);
                        }}
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <main className="flex-1">
        <div className="container px-5 py-4">
          {/* 폴더 선택 UI 개선 - 커스텀 드롭다운으로 변경 */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-neutral-medium">
              {filteredBookmarks.length}개 항목
            </div>

            {/* 폴더 드롭다운 버튼에 클래스 추가 */}
            <div className="relative folder-dropdown">
              <button
                className="flex items-center gap-2 bg-white border border-border-line rounded-full px-4 py-1.5 text-sm text-neutral-dark focus:outline-none focus:border-primary-color hover:border-primary-color transition-colors"
                onClick={() => setShowFolderDropdown(!showFolderDropdown)}
              >
                <Folder className="h-4 w-4 text-neutral-medium" />
                <span>
                  {activeFolder
                    ? folders.find((f) => f.id === activeFolder)?.name
                    : "모든 폴더"}
                </span>
                <ChevronDown className="h-4 w-4 text-neutral-medium" />
              </button>

              {showFolderDropdown && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-border-line z-10 overflow-hidden">
                  <div className="max-h-60 overflow-y-auto py-1">
                    <button
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-primary-light hover:text-primary-color ${
                        !activeFolder
                          ? "bg-primary-light text-primary-color"
                          : "text-neutral-dark"
                      }`}
                      onClick={() => {
                        setActiveFolder(null);
                        setShowFolderDropdown(false);
                      }}
                    >
                      모든 폴더
                    </button>
                    {folders.map((folder) => (
                      <button
                        key={folder.id}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-primary-light hover:text-primary-color ${
                          activeFolder === folder.id
                            ? "bg-primary-light text-primary-color"
                            : "text-neutral-dark"
                        }`}
                        onClick={() => {
                          setActiveFolder(folder.id);
                          setShowFolderDropdown(false);
                        }}
                      >
                        {folder.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="space-y-4 grid">
              {Array(4)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl overflow-hidden border border-border-line shadow-sm flex"
                  >
                    <Skeleton className="h-32 w-1/3 flex-shrink-0" />
                    <div className="p-3 flex-1">
                      <Skeleton className="h-4 w-20 mb-1" />
                      <Skeleton className="h-5 w-full mb-1" />
                      <Skeleton className="h-5 w-1/2 mb-1" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-4/5 mb-2" />
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
              className="space-y-4 grid"
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
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>

      <BottomNav />

      {/* 바텀 팝업 */}
      <BottomPopup
        isOpen={showBottomPopup}
        onClose={() => setShowBottomPopup(false)}
        title={selectedBookmark?.digests.title}
      >
        <Button
          variant="ghost"
          className="w-full justify-start py-3 px-4 rounded-lg h-auto"
          onClick={handleSaveToFolder}
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
      </BottomPopup>

      {/* 폴더 선택 모달 */}
      <FolderSelectionModal
        isOpen={showFolderModal}
        onClose={() => setShowFolderModal(false)}
        digestId={selectedBookmark?.digest_id.toString() || ""}
        title={selectedBookmark?.digests.title || ""}
        onSuccess={() => {
          // 성공적으로 폴더에 추가한 후 폴더 데이터 새로고침
          refreshFolderData();
          setShowFolderModal(false);
          setShowBottomPopup(false);
        }}
      />
    </div>
  );
}
