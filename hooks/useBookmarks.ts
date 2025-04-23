import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { BookmarkItem, FolderType, SortType } from "@/types/digest";
import { sortBookmarks } from "@/lib/bookmarks";

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [filteredBookmarks, setFilteredBookmarks] = useState<BookmarkItem[]>(
    []
  );
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 필터링 상태
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState("전체");
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortType>("latest");

  // 북마크 불러오기
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

      // 북마크 데이터 가져오기
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

  // 폴더 목록 불러오기
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

  // 폴더별 북마크 필터링 로직
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

    // 폴더 필터링
    if (activeFolder) {
      filtered = filtered.filter(
        (bookmark) => bookmark.folder_id === activeFolder
      );
    }

    // 정렬 적용
    filtered = sortBookmarks(filtered, sortBy);

    setFilteredBookmarks(filtered);
  }, [searchQuery, activeTag, bookmarks, activeFolder, sortBy]);

  // 북마크 삭제
  const deleteBookmark = async (digestId: number) => {
    try {
      const response = await fetch(`/api/bookmarks?digestId=${digestId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      if (result.success) {
        // 북마크 목록에서 삭제된 항목 제거
        const updatedBookmarks = bookmarks.filter(
          (bookmark) => bookmark.digest_id !== digestId
        );
        setBookmarks(updatedBookmarks);
        return true;
      }
      return false;
    } catch (error) {
      console.error("북마크 삭제 오류:", error);
      return false;
    }
  };

  // 인기 태그 (모든 태그에서 최대 6개)
  const popularTags = allTags.slice(0, 6);

  // 데이터 새로고침
  const refreshData = async () => {
    await fetchBookmarks();
  };

  // 정렬 적용
  const applySort = (sortType: SortType) => {
    setSortBy(sortType);
    setFilteredBookmarks(sortBookmarks(filteredBookmarks, sortType));
  };

  return {
    bookmarks,
    filteredBookmarks,
    folders,
    allTags,
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
    setSortBy,
    applySort,
    fetchBookmarks,
    refreshData,
    deleteBookmark,
  };
}
