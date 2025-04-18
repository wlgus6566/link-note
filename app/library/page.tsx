"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Filter, Grid, List, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BottomNav from "@/components/bottom-nav";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

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
}

interface BookmarkItem {
  id: number;
  user_id: string;
  digest_id: number;
  created_at: string;
  digests: Digest;
}

export default function LibraryPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
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

  // 컴포넌트 마운트 시 북마크 불러오기
  useEffect(() => {
    fetchBookmarks();
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
                  value="grid"
                  className="h-6 w-6 p-0 data-[state=active]:bg-primary-light data-[state=active]:text-primary-color"
                >
                  <Grid className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger
                  value="list"
                  className="h-6 w-6 p-0 data-[state=active]:bg-primary-light data-[state=active]:text-primary-color"
                >
                  <List className="h-4 w-4" />
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
                          : "h-20 w-20 flex-shrink-0"
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
                <Link
                  href={`/digest/${bookmark.digest_id}`}
                  key={bookmark.id}
                  className="group"
                >
                  <motion.div
                    className={`bg-white rounded-xl overflow-hidden transition-all duration-200 border border-border-line shadow-sm group-hover:border-primary-color ${
                      viewMode === "grid" ? "h-full flex flex-col" : "flex"
                    }`}
                    variants={itemVariants}
                    whileHover={{ y: -5 }}
                  >
                    <div
                      className={`relative ${
                        viewMode === "grid"
                          ? "h-32 w-full"
                          : "h-20 w-20 flex-shrink-0"
                      }`}
                    >
                      <Image
                        src={bookmark.digests.image || "/placeholder.svg"}
                        alt={bookmark.digests.title}
                        fill
                        className="object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                      />
                      <div className="absolute top-2 left-2">
                        <div className="px-2 py-0.5 bg-white rounded-full text-[10px] text-neutral-dark">
                          {bookmark.digests.source_type || "기타"}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`p-3 ${
                        viewMode === "grid" ? "flex-1 flex flex-col" : "flex-1"
                      }`}
                    >
                      <div className="text-xs text-neutral-medium mb-1">
                        {formatDate(bookmark.created_at)}
                      </div>
                      <h3 className="font-medium text-sm mb-1 line-clamp-2 text-neutral-dark group-hover:text-primary-color transition-colors">
                        {bookmark.digests.title}
                      </h3>

                      {viewMode === "list" && (
                        <p className="text-xs text-neutral-medium line-clamp-2 mb-2">
                          {bookmark.digests.summary}
                        </p>
                      )}

                      <div
                        className={`flex flex-wrap gap-1 ${
                          viewMode === "grid" ? "mt-auto" : ""
                        }`}
                      >
                        {bookmark.digests.tags &&
                          bookmark.digests.tags
                            .slice(0, viewMode === "grid" ? 2 : 3)
                            .map((tag: string) => (
                              <span key={tag} className="tag">
                                {tag}
                              </span>
                            ))}
                        {bookmark.digests.tags &&
                          bookmark.digests.tags.length >
                            (viewMode === "grid" ? 2 : 3) && (
                            <span className="text-xs bg-secondary-color text-neutral-medium px-1.5 py-0.5 rounded-full">
                              +
                              {bookmark.digests.tags.length -
                                (viewMode === "grid" ? 2 : 3)}
                            </span>
                          )}
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </motion.div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
