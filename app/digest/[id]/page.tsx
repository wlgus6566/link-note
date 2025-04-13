"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Bookmark, Share2, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import BottomNav from "@/components/bottom-nav";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import React from "react";

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
      if (digest && digest.id === parseInt(pageId)) {
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
          if (isMounted) {
            setDigest(result.data);
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
      <div className="flex flex-col min-h-screen bg-white">
        <header className="sticky top-0 z-10 bg-white border-b">
          <div className="container flex items-center justify-between h-16 px-5">
            <Button variant="ghost" size="sm" className="p-0" asChild>
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="text-sm font-medium">오류 발생</div>
            <div className="w-5"></div>
          </div>
        </header>

        <main className="flex-1 container px-5 py-8 flex items-center justify-center">
          <div className="max-w-md w-full bg-white p-8 space-y-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
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
            <h1 className="text-xl font-bold text-gray-900">요약 로드 실패</h1>
            <p className="text-gray-600">{error}</p>
            <Button
              onClick={() => router.push("/")}
              className="bg-blue-500 hover:bg-blue-600 text-white"
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
      <div className="flex flex-col min-h-screen bg-white pb-16">
        <header className="sticky top-0 z-10 bg-white border-b">
          <div className="container flex items-center justify-between h-16 px-5">
            <Button variant="ghost" size="sm" className="p-0" asChild>
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full"
              >
                <Bookmark className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <article className="max-w-3xl mx-auto px-5 py-8">
            {/* 태그 스켈레톤 */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-14 rounded-full" />
            </div>

            {/* 제목 스켈레톤 */}
            <div className="mb-4">
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-8 w-1/2" />
            </div>

            {/* 메타데이터 스켈레톤 */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-5 w-36 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex flex-col items-end">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>

            {/* 이미지 스켈레톤 */}
            <Skeleton className="h-64 md:h-80 w-full mb-8 rounded-xl" />

            {/* 내용 스켈레톤 */}
            <div className="space-y-6">
              <Skeleton className="h-24 w-full rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </article>
        </main>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white pb-16">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="container flex items-center justify-between h-16 px-5">
          <Button variant="ghost" size="sm" className="p-0" asChild>
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full"
            >
              <Bookmark className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <article className="max-w-3xl mx-auto px-5 py-8">
          {/* 태그 및 메타데이터 */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {digest.tags.map((tag: string) => (
              <Link href={`/tag/${tag}`} key={tag}>
                <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs hover:bg-blue-200 transition-colors">
                  {tag}
                </span>
              </Link>
            ))}
          </div>

          {/* 제목 */}
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
            {digest.title}
          </h1>

          {/* 저자 정보 및 메타데이터 */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={digest.author?.avatar || "/placeholder.svg"}
                alt={digest.author?.name || "작성자"}
              />
              <AvatarFallback>
                {digest.author?.name?.charAt(0) || "A"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-medium">
                {digest.author?.name || "AI 요약"}
              </div>
              <div className="text-sm text-gray-500">
                {digest.author?.role || "자동 생성"}
              </div>
            </div>
            <div className="flex flex-col items-end text-sm text-gray-500">
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
          </div>

          {/* 메인 이미지 */}
          <div className="relative h-64 md:h-80 w-full mb-8 rounded-xl overflow-hidden">
            <Image
              src={digest.image || "/placeholder.svg?height=400&width=800"}
              alt={digest.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* 요약 */}
          <div className="mb-8 p-5 bg-gray-50 border-l-4 border-blue-500 rounded-r-lg">
            <p className="text-base italic text-gray-700">{digest.summary}</p>
          </div>

          {/* 본문 콘텐츠 */}
          <div
            className="prose prose-blue prose-lg max-w-none mb-10"
            dangerouslySetInnerHTML={{ __html: digest.content }}
          />

          {/* 저장 및 공유 버튼 */}
          <div className="flex items-center justify-center gap-4 py-6 border-t border-b mb-10">
            <Button
              variant="outline"
              size="lg"
              className="gap-2 rounded-full px-6"
            >
              <Bookmark className="h-5 w-5" />
              <span>저장하기</span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="gap-2 rounded-full px-6"
            >
              <Share2 className="h-5 w-5" />
              <span>공유하기</span>
            </Button>
          </div>

          {/* 원본 콘텐츠 링크 */}
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-sm font-medium mb-3">원본 콘텐츠</h3>
            <Link
              href={digest.sourceUrl}
              target="_blank"
              className="flex items-center justify-center w-full p-3.5 bg-gray-100 rounded-xl text-sm text-blue-600 font-medium hover:bg-gray-200 transition-colors"
            >
              원본 보기
            </Link>
          </div>
        </article>
      </main>

      <BottomNav />
    </div>
  );
}
