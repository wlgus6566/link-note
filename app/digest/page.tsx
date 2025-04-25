"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Search,
  Share2,
  Trash2,
  Folder,
  Calendar,
  BookText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderSelectionModal } from "@/components/ui/folder-selection-modal";
import { BottomPopup } from "@/components/bottom-popup";
import { Header } from "@/components/Header";
import { BookmarkItem } from "@/types/digest";
import { useBookmarks } from "@/hooks/useBookmarks";
import { BookmarkCard } from "@/components/bookmark-card";
import { SortDropdown } from "@/components/sort-dropdown";
import { FolderFilter } from "@/components/folder-filter";
import { TagFilter } from "@/components/tag-filter";
import { getUserInitials } from "@/lib/utils";

export default function DigestPage() {
  const {
    bookmarks,
    filteredBookmarks,
    folders,
    popularTags,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    activeTag,
    setActiveTag,
    activeFolder,
    setActiveFolder,
    sortBy,
    applySort,
    fetchBookmarks,
    refreshData,
    deleteBookmark,
    changeBookmarkFolder,
  } = useBookmarks();

  const [showBottomPopup, setShowBottomPopup] = useState(false);
  const [selectedBookmark, setSelectedBookmark] = useState<BookmarkItem | null>(
    null
  );
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showTagFilter, setShowTagFilter] = useState(false);
  const fetchedRef = useRef(false);

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

    const success = await deleteBookmark(selectedBookmark.digest_id);
    if (success) {
      setShowBottomPopup(false);
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

  // 바텀 팝업의 '다른 재생목록에 저장' 버튼 클릭 함수
  const handleSaveToFolder = () => {
    setShowBottomPopup(false);
    setShowFolderModal(true);
  };

  // 컴포넌트 마운트 시 데이터 불러오기 (중복 요청 방지)
  useEffect(() => {
    if (!fetchedRef.current && bookmarks.length === 0) {
      console.log("다이제스트 페이지: 북마크 데이터 요청");
      fetchBookmarks();
      fetchedRef.current = true;
    }
  }, [fetchBookmarks, bookmarks.length]);

  return (
    <div className="flex flex-col min-h-screen pb-24">
      <Header
        title={"콘텐츠 저장소"}
        showBackButton={true}
        backUrl="back"
        rightElement={
          <Link href="/profile">
            <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center border border-primary-color/30">
              <span className="text-sm font-medium text-primary-color">
                {getUserInitials()}
              </span>
            </div>
          </Link>
        }
      />

      <main className="flex-1">
        <div className="container px-5 py-4">
          {/* 검색 및 필터 영역 */}
          <div className="mb-6">
            <div className="relative mb-4">
              <Input
                className="pl-10 bg-white border-border-line rounded-xl h-12"
                placeholder="저장된 콘텐츠 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-medium" />
            </div>

            {/* 폴더 필터 */}
            <FolderFilter
              folders={folders}
              activeFolder={activeFolder}
              onFolderSelect={setActiveFolder}
            />

            {/* 정렬 및 필터 옵션 */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-neutral-medium">
                {filteredBookmarks.length}개 항목
              </div>
              <div className="flex gap-2">
                <SortDropdown sortBy={sortBy} onSortChange={applySort} />
              </div>
            </div>

            {/* 태그 필터링 */}
            {showTagFilter && (
              <TagFilter
                tags={popularTags}
                activeTag={activeTag}
                onTagSelect={setActiveTag}
              />
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-4">
              {Array(4)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl overflow-hidden border border-border-line shadow-sm"
                  >
                    <Skeleton className="h-24 w-full" />
                    <div className="p-3">
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-2/3 mb-2" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                ))}
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-neutral-medium mb-3">{error}</p>
              <Button
                variant="outline"
                onClick={() => refreshData()}
                className="rounded-full px-4"
              >
                다시 시도
              </Button>
            </div>
          ) : filteredBookmarks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <BookText className="w-8 h-8 text-neutral-medium" />
              </div>
              <h3 className="text-lg font-medium mb-2">
                저장된 콘텐츠가 없습니다
              </h3>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-2 gap-4"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.05,
                  },
                },
              }}
              initial="hidden"
              animate="visible"
            >
              {filteredBookmarks.map((bookmark) => (
                <BookmarkCard
                  key={bookmark.id}
                  bookmark={bookmark}
                  onOpenMenu={handleOpenMenu}
                />
              ))}
            </motion.div>
          )}
        </div>
      </main>

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
        activeFolder={activeFolder || selectedBookmark?.folder_id}
        isOpen={showFolderModal}
        onClose={() => setShowFolderModal(false)}
        digestId={selectedBookmark?.digest_id.toString() || ""}
        title={selectedBookmark?.digests.title || ""}
        onSuccess={() => {
          // 성공적으로 폴더에 추가한 후 폴더 데이터 새로고침
          refreshData();
          setShowFolderModal(false);
          setShowBottomPopup(false);
        }}
        onChangeFolder={(digestId, newFolderId) =>
          changeBookmarkFolder(parseInt(digestId), newFolderId)
        }
      />
    </div>
  );
}
