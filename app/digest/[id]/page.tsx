"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Share2,
  Calendar,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import BottomNav from "@/components/bottom-nav";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function DigestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [digest, setDigest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageId, setPageId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // params가 Promise이므로 useEffect에서 비동기적으로 처리
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

  useEffect(() => {
    // pageId가 설정된 경우에만 요약 데이터 가져오기
    if (!pageId) return;

    let isMounted = true;

    // 이미 데이터를 불러왔는지 확인하는 플래그
    let isDataFetched = false;

    const fetchDigest = async () => {
      // 이미 데이터가 있으면 중복 API 호출 방지
      if (digest && digest.id === Number.parseInt(pageId)) {
        console.log(
          `ID ${pageId}의 다이제스트 데이터가 이미 로드되어 있습니다.`
        );
        return;
      }

      // 이미 데이터를 가져오는 중이면 중복 호출 방지
      if (isDataFetched) {
        console.log("이미 데이터를 가져오는 중입니다.");
        return;
      }

      isDataFetched = true;

      try {
        setLoading(true);

        console.log(`다이제스트 데이터 가져오기 시작: ID=${pageId}`);

        // API 호출로 데이터 가져오기
        const response = await fetch(`/api/digest/${pageId}`, {
          // 캐시 방지 설정 추가
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        });
        const result = await response.json();

        if (result.success) {
          console.log("API에서 다이제스트 데이터 가져오기 성공:", result.data);

          // 데이터 설정 전에 추가 정보 가져오기 (채널 정보)
          const digestData = result.data;

          // YouTube 데이터인 경우 채널 정보 가져오기
          if (digestData.sourceType === "YouTube" && digestData.sourceUrl) {
            try {
              const videoId = getYouTubeVideoId(digestData.sourceUrl);

              // 채널 썸네일 URL 구성
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
          // API 응답 실패 처리
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

    // API 호출은 한 번만 실행되도록 setTimeout으로 지연
    const timeoutId = setTimeout(() => {
      fetchDigest();
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [pageId, digest]);

  // 에러 발생 시 UI
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
          <div className="max-w-md w-full bg-white p-8 space-y-6 text-center rounded-xl border border-border-line shadow-sm">
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

  // 로딩 중 UI
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
                <Bookmark className="h-5 w-5 text-neutral-dark" />
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
            {/* 태그 스켈레톤 */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              <Skeleton className="h-6 w-16 rounded-full bg-secondary-color" />
              <Skeleton className="h-6 w-20 rounded-full bg-secondary-color" />
              <Skeleton className="h-6 w-14 rounded-full bg-secondary-color" />
            </div>

            {/* 제목 스켈레톤 */}
            <div className="mb-4">
              <Skeleton className="h-8 w-3/4 mb-2 bg-secondary-color" />
              <Skeleton className="h-8 w-1/2 bg-secondary-color" />
            </div>

            {/* 메타데이터 스켈레톤 */}
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

            {/* 이미지 스켈레톤 */}
            <Skeleton className="h-64 md:h-80 w-full mb-8 rounded-xl bg-secondary-color" />

            {/* 내용 스켈레톤 */}
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
              onClick={() => setIsSaved(!isSaved)}
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
        </div>
      </header>

      <main className="flex-1">
        <article className="max-w-3xl mx-auto px-5 py-8">
          {/* 태그 및 메타데이터 */}
          <motion.div
            className="flex flex-wrap gap-1.5 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {digest.tags.map((tag: string) => (
              <Link href={`/tag/${tag}`} key={tag}>
                <span className="tag">{tag}</span>
              </Link>
            ))}
          </motion.div>

          {/* 제목 */}
          <motion.h1
            className="text-2xl md:text-3xl font-bold tracking-tight mb-4 text-neutral-dark"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {digest.title}
          </motion.h1>

          {/* 저자 정보 및 메타데이터 */}
          <motion.div
            className="flex items-center gap-4 mb-6 pb-6 border-b border-border-line"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Avatar className="h-12 w-12 border-2 border-primary-color/50">
              <AvatarImage
                src={digest.author?.avatar || "/placeholder.svg"}
                alt={digest.author?.name || "작성자"}
              />
              <AvatarFallback className="bg-primary-light text-primary-color">
                {digest.author?.name?.charAt(0) || "A"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-medium text-neutral-dark">
                {digest.author?.name || "AI 요약"}
              </div>
              <div className="text-sm text-neutral-medium">
                {digest.author?.role || "자동 생성"}
              </div>
            </div>
            <div className="flex flex-col items-end text-sm text-neutral-medium">
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {new Date(digest.date).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{digest.readTime}</span>
              </div>
            </div>
          </motion.div>

          {/* 메인 이미지 또는 YouTube 영상 */}
          <motion.div
            className="mb-8 rounded-xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {digest.sourceType === "YouTube" && digest.sourceUrl ? (
              <div className="flex flex-col bg-white rounded-xl overflow-hidden border border-border-line shadow-sm">
                {/* YouTube 영상 임베드 */}
                <div className="relative w-full h-48 md:h-80">
                  <iframe
                    src={`https://www.youtube.com/embed/${getYouTubeVideoId(
                      digest.sourceUrl
                    )}`}
                    title={digest.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute top-0 left-0 w-full h-full border-0"
                  />
                </div>

                {/* 유튜브 영상 정보 */}
                <div className="p-4 space-y-3">
                  {/* 제목 */}
                  <h2 className="text-xl font-bold text-neutral-dark">
                    {digest.title}
                  </h2>

                  {/* 유튜버 정보, 업로드 날짜, 조회수 */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-secondary-color border border-border-line">
                        {digest.videoInfo?.channelId ? (
                          <Image
                            src={`https://yt3.googleusercontent.com/ytc/${digest.videoInfo.channelId}=s88-c-k-c0x00ffffff-no-rj`}
                            alt={
                              digest.videoInfo?.channelTitle || "채널 이미지"
                            }
                            width={36}
                            height={36}
                            className="object-cover"
                          />
                        ) : (
                          <Image
                            src="/placeholder.svg?height=40&width=40"
                            alt="채널 이미지"
                            width={36}
                            height={36}
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-sm text-neutral-dark">
                          {digest.videoInfo?.channelTitle || "채널명 없음"}
                        </div>
                        <div className="text-xs text-neutral-medium">
                          {/* 업로드 날짜 포맷팅 */}
                          {digest.videoInfo?.publishedAt
                            ? new Date(
                                digest.videoInfo.publishedAt
                              ).toLocaleDateString("ko-KR", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "날짜 정보 없음"}
                        </div>
                      </div>
                    </div>

                    {/* 조회수 */}
                    <div className="text-sm text-neutral-medium">
                      {digest.videoInfo?.viewCount
                        ? `조회수 ${formatViewCount(
                            digest.videoInfo.viewCount
                          )}회`
                        : "조회수 정보 없음"}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative h-64 md:h-80 w-full bg-white rounded-xl border border-border-line shadow-sm">
                <Image
                  src={digest.image || "/placeholder.svg?height=400&width=800"}
                  alt={digest.title}
                  fill
                  className="object-cover opacity-80"
                  priority
                />
              </div>
            )}
          </motion.div>

          {/* 요약 */}
          <motion.div
            className="mb-8 p-5 bg-primary-light rounded-lg border-l-4 border-primary-color"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-base italic text-neutral-dark">
              {digest.summary}
            </p>
          </motion.div>

          {/* 본문 콘텐츠 */}
          <motion.div
            className="prose prose-blue prose-lg max-w-none mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            dangerouslySetInnerHTML={{ __html: digest.content }}
          />

          {/* 저장 및 공유 버튼 */}
          <motion.div
            className="flex items-center justify-center gap-4 py-6 border-t border-b border-border-line mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              variant="outline"
              size="lg"
              className="gap-2 rounded-full px-6 bg-white border-border-line hover:border-primary-color hover:bg-primary-light"
              onClick={() => setIsSaved(!isSaved)}
            >
              {isSaved ? (
                <BookmarkCheck className="h-5 w-5 text-primary-color" />
              ) : (
                <Bookmark className="h-5 w-5 text-neutral-dark" />
              )}
              <span className="text-neutral-dark">
                {isSaved ? "저장됨" : "저장하기"}
              </span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="gap-2 rounded-full px-6 bg-white border-border-line hover:border-primary-color hover:bg-primary-light"
            >
              <Share2 className="h-5 w-5 text-neutral-dark" />
              <span className="text-neutral-dark">공유하기</span>
            </Button>
          </motion.div>

          {/* 원본 콘텐츠 링크 */}
          <motion.div
            className="mt-8 pt-6 border-t border-border-line"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <h3 className="text-sm font-medium mb-3 text-neutral-dark">
              원본 콘텐츠
            </h3>
            <Link
              href={digest.sourceUrl}
              target="_blank"
              className="flex items-center justify-center w-full p-3.5 bg-white rounded-xl text-sm text-primary-color font-medium hover:bg-primary-light transition-colors border border-border-line"
            >
              원본 보기
            </Link>
          </motion.div>
        </article>
      </main>

      <BottomNav />
    </div>
  );
}

// YouTube URL에서 비디오 ID를 추출하는 함수
function getYouTubeVideoId(url: string): string {
  if (!url) return "";

  // 일반 YouTube URL (https://www.youtube.com/watch?v=VIDEO_ID)
  const watchRegex = /youtube\.com\/watch\?v=([^&]+)/;
  const watchMatch = url.match(watchRegex);
  if (watchMatch) return watchMatch[1];

  // 짧은 URL (https://youtu.be/VIDEO_ID)
  const shortRegex = /youtu\.be\/([^?&]+)/;
  const shortMatch = url.match(shortRegex);
  if (shortMatch) return shortMatch[1];

  // 임베드 URL (https://www.youtube.com/embed/VIDEO_ID)
  const embedRegex = /youtube\.com\/embed\/([^?&]+)/;
  const embedMatch = url.match(embedRegex);
  if (embedMatch) return embedMatch[1];

  return "";
}

// 유틸리티 함수: 조회수 포맷
function formatViewCount(count: string | number): string {
  if (!count) return "0";

  const num = typeof count === "string" ? Number.parseInt(count, 10) : count;

  if (isNaN(num)) return "0";

  // 조회수 포맷팅 (예: 1,234,567)
  return num.toLocaleString("ko-KR");
}
