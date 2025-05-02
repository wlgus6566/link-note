"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, FileText, Clock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { useUserStore } from "@/store/userStore";
import { getUserInitials } from "@/lib/utils";
import { useBookmarks } from "@/hooks/useBookmarks";
import { formatViewCount, formatTimeAgo } from "@/lib/utils";

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [url, setUrl] = useState("");
  const { isAuthenticated, isLoading } = useUserStore();
  const {
    filteredBookmarks,
    fetchBookmarks,
    loading: bookmarksLoading,
    searchQuery,
    setSearchQuery,
  } = useBookmarks();
  const fetchedRef = useRef(false);

  // 검색 파라미터가 변경될 때마다 검색어 업데이트
  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      setSearchQuery(query);
    }
  }, [searchParams, setSearchQuery]);

  // 컴포넌트 마운트 시 데이터 불러오기 (중복 요청 방지)
  useEffect(() => {
    if (
      isAuthenticated &&
      !fetchedRef.current &&
      filteredBookmarks.length === 0
    ) {
      console.log("메인 페이지: 북마크 가져오기");
      fetchBookmarks();
      fetchedRef.current = true;
    }
  }, [isAuthenticated, fetchBookmarks, filteredBookmarks.length]);

  // 가장 최근에 저장된 콘텐츠 5개만 표시
  const recentContent = filteredBookmarks
    .slice() // 원본 배열을 변경하지 않기 위해 복사
    .sort((a, b) => {
      // 최신순 정렬 (created_at 기준)
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    })
    .slice(0, 5); // 최대 5개 항목만 표시

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      // URL이 있으면 요약 페이지로 이동
      router.push(`/summarizing?url=${encodeURIComponent(url)}`);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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

  // 랜덤 재생 시간 생성 (실제 데이터에는 없으므로)
  const getRandomDuration = () => {
    const minutes = Math.floor(Math.random() * 30) + 5;
    const seconds = Math.floor(Math.random() * 60);
    return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
  };

  // 랜덤 조회수 생성 (실제 데이터에는 없으므로)
  const getRandomViewCount = () => {
    return Math.floor(Math.random() * 100000) + 1000;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        leftElement={
          <Link href="/" className="flex items-center gap-1.5">
            <Image src="/images/logo_2.png" alt="logo" width={20} height={20} />
            <span className="text-lg font-bold text-neutral-dark">
              TubeLink
            </span>
          </Link>
        }
        showBackButton={false}
        rightElement={
          <Link href="/profile">
            <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center border border-primary-color/30">
              <span className="text-sm font-medium text-primary-color">
                {isLoading ? "..." : isAuthenticated ? getUserInitials() : "게"}
              </span>
            </div>
          </Link>
        }
      />
      <main className="flex-1 pb-24">
        <motion.section
          className="w-full py-5 md:py-20 relative overflow-hidden"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <div className="container px-5 relative z-10">
            <div className="flex flex-col items-center justify-center space-y-8 text-center">
              <motion.div
                className="relative"
                variants={itemVariants}
                animate={{ y: [0, -10, 0] }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 3,
                  ease: "easeInOut",
                }}
              >
                <Image
                  src="/images/logo_2.png"
                  alt="logo"
                  width={100}
                  height={80}
                  className="relative z-10"
                />
              </motion.div>

              <div className="!mt-5 space-y-8 max-w-[320px] md:max-w-[600px]">
                <motion.h1
                  className="text-3xl md:text-4xl font-bold tracking-tight leading-tight text-neutral-dark"
                  variants={itemVariants}
                >
                  YouTube 영상을 <br />
                  <span className="text-primary-color">스마트하게</span>
                  <br />
                  정리하세요
                </motion.h1>
                <motion.p
                  className="!mt-5 text-base text-neutral-medium md:text-lg max-w-[500px] mx-auto"
                  variants={itemVariants}
                >
                  중요한 순간을 담아두고, 핵심만 빠르게 요약하세요. AI가 어색함
                  없이, 당신의 언어로 완벽하게 전해드립니다.
                </motion.p>

                <motion.div
                  className="flex justify-center mt-6 gap-8"
                  variants={itemVariants}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center mb-2 border border-primary-color/30">
                      <FileText className="h-5 w-5 text-primary-color" />
                    </div>
                    <span className="text-xs text-neutral-medium">
                      AI 자동 요약
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center mb-2 border border-primary-color/30">
                      <Clock className="h-5 w-5 text-primary-color" />
                    </div>
                    <span className="text-xs text-neutral-medium">
                      타임라인 북마크
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center mb-2 border border-primary-color/30">
                      <Globe className="h-5 w-5 text-primary-color" />
                    </div>
                    <span className="text-xs text-neutral-medium">
                      AI 다국어 번역
                    </span>
                  </div>
                </motion.div>
              </div>

              <motion.div className="w-full max-w-lg" variants={itemVariants}>
                <form onSubmit={handleSubmit} className="relative">
                  <div className="flex items-center p-1.5 bg-white rounded-2xl border border-border-line shadow-sm">
                    <Input
                      className="flex-1 h-14 border-0 shadow-none text-base focus:ring-0 pl-5 pr-4 rounded-xl bg-transparent text-neutral-dark"
                      placeholder="YouTube 영상 링크를 붙여넣으세요."
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      required
                    />
                    <Button
                      type="submit"
                      className="h-12 px-4 bg-primary-color hover:bg-primary-hover text-white font-medium rounded-xl text-base"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>

          {/* Background decorative elements */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary-light rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-primary-light rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-primary-light rounded-full blur-3xl"></div>
        </motion.section>

        {recentContent.length > 0 && (
          <section className="w-full py-8">
            <div className="container px-5">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <h2 className="text-xl font-bold text-neutral-dark">
                    최근 추가된 콘텐츠
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary-color font-medium p-0 hover:bg-transparent"
                  asChild
                >
                  <Link href="/digest">전체보기</Link>
                </Button>
              </div>

              {bookmarksLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((_, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-xl p-3 animate-pulse"
                    >
                      <div className="flex gap-3">
                        <div className="relative w-full aspect-video rounded-lg bg-gray-200 flex-shrink-0 h-[180px]"></div>
                      </div>
                      <div className="flex gap-3 mt-3">
                        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gray-200"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {recentContent.map((content, index) => (
                    <Link
                      href={`/digest/${content.digest_id}`}
                      key={content.id}
                      className="group block"
                    >
                      <motion.div
                        className="flex flex-col"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        {/* 썸네일 영역 */}
                        <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-3">
                          <Image
                            src={content.digests.image || "/placeholder.svg"}
                            alt={content.digests.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {/* 영상 길이 표시 */}
                          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 text-white text-xs rounded">
                            {getRandomDuration()}
                          </div>
                        </div>

                        {/* 콘텐츠 정보 영역 */}
                        <div className="flex gap-3 px-2">
                          {/* 제목 및 정보 */}
                          <div className="flex-1">
                            <h3 className="font-medium text-base mb-1 line-clamp-2 text-neutral-dark group-hover:text-primary-color transition-colors">
                              {content.digests.title}
                            </h3>
                            <p className="text-sm text-neutral-medium">
                              {content?.digests?.video_info?.channelTitle} •
                              조회수{" "}
                              {formatViewCount(
                                Number(
                                  content?.digests?.video_info?.viewCount
                                ) || 0
                              )}{" "}
                              • {formatTimeAgo(content.created_at)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
