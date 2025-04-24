"use client";

import Link from "next/link";
import Image from "next/image";
import { Settings, BookOpen, Share2, Bell, User, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BottomNav from "@/components/bottom-nav";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/hooks/useAuth";
import { useState, useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const { isAuthenticated, isLoading: authLoading, user: authUser } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const calledRef = useRef(false);

  // 샘플 저장된 콘텐츠
  const savedContent = [
    {
      id: 1,
      title: "인공지능의 미래: 2025년 전망",
      source: "YouTube",
      date: "4월 10일",
      image: "/placeholder.svg?height=200&width=400",
    },
    {
      id: 2,
      title: "최신 프론트엔드 기술 트렌드",
      source: "YouTube",
      date: "4월 8일",
      image: "/placeholder.svg?height=200&width=400",
    },
    {
      id: 3,
      title: "효율적인 코딩 습관과 개발 환경 구성하기",
      source: "YouTube",
      date: "4월 5일",
      image: "/placeholder.svg?height=200&width=400",
    },
  ];

  // 사용자 정보 가져오기
  useEffect(() => {
    if (calledRef.current || authLoading || !isAuthenticated) return;
    calledRef.current = true;
    const fetchUserProfile = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch("/api/users");
        const data = await response.json();

        if (response.ok) {
          setUser(data.user);
          setError(null);
        } else {
          setError(data.error || "프로필 정보를 불러오는데 실패했습니다");
        }
      } catch (err) {
        setError("프로필 정보를 불러오는데 실패했습니다");
        console.error("프로필 조회 오류:", err);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && isAuthenticated) {
      fetchUserProfile();
    }
  }, [isAuthenticated, authLoading]);

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

  return (
    <div className="flex flex-col min-h-screen pb-24">
      <header className="header">
        <div className="container flex items-center justify-between h-16 px-5">
          <div className="flex items-center">
            <User className="h-5 w-5 text-primary-color mr-2" />
            <h1 className="text-xl font-bold text-neutral-dark">프로필</h1>
          </div>
          <Link href="/settings">
            <Settings className="w-5 h-5 text-neutral-medium hover:text-primary-color transition-colors" />
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="container px-5 py-6">
          <motion.div
            className="bg-white rounded-xl p-5 mb-6 border border-border-line shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {loading || authLoading ? (
              <>
                <div className="flex items-start gap-4 mb-4">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-6 w-32 mb-1" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-40 mt-2" />
                  </div>
                </div>
                <div className="flex gap-3 mb-4">
                  <Skeleton className="flex-1 h-16 rounded-lg" />
                  <Skeleton className="flex-1 h-16 rounded-lg" />
                </div>
              </>
            ) : error ? (
              <div className="text-center py-4">
                <p className="text-red-500 mb-2">{error}</p>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="mx-auto"
                >
                  다시 시도
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-primary-color/50">
                    <Image
                      // src={user?.avatar || user?.auth_metadata?.avatar_url}
                      src={user?.auth_metadata?.avatar_url}
                      alt={user?.name || "프로필 이미지"}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-bold text-lg text-neutral-dark">
                      {user?.name || "사용자"}
                    </h2>
                    <p className="text-sm text-neutral-dark">{user?.email}</p>
                    <p className="text-sm mt-1 text-neutral-medium">
                      {user?.bio || "소개가 없습니다"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mb-4">
                  <div className="flex-1 rounded-lg p-3 text-center border border-border-line bg-secondary-color">
                    <div className="font-bold text-lg text-primary-color">
                      {user?.saved_count || 0}
                    </div>
                    <div className="text-xs text-neutral-medium">저장됨</div>
                  </div>
                  <div className="flex-1 rounded-lg p-3 text-center border border-border-line bg-secondary-color">
                    <div className="font-bold text-lg text-primary-color">
                      {user?.shared_count || 0}
                    </div>
                    <div className="text-xs text-neutral-medium">공유됨</div>
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-2">
              <Button
                className="flex-1 bg-primary-color hover:bg-primary-color/90 h-10 text-sm text-white"
                asChild
              >
                <Link href="/settings?tab=account">프로필 편집</Link>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 bg-white border-border-line hover:border-primary-color hover:bg-primary-light"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 bg-white border-border-line hover:border-primary-color hover:bg-primary-light"
              >
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>

          {/* 공지사항 배너 */}
          <div className="bg-[#E3F2FD] p-4 rounded-xl mb-4">
            <div className="flex items-center gap-3">
              <Info size={24} className="text-[#1976D2]" />
              <div className="flex-1">
                <h3 className="font-medium text-[#1976D2] mb-1">
                  새로운 기능 업데이트
                </h3>
                <p className="text-sm text-neutral-dark">
                  이제 타임라인을 친구와 공유할 수 있습니다.
                </p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="saved" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-10 mb-4 bg-secondary-color">
              <TabsTrigger
                value="saved"
                className="text-sm data-[state=active]:bg-primary-light data-[state=active]:text-primary-color"
              >
                저장됨
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="text-sm data-[state=active]:bg-primary-light data-[state=active]:text-primary-color"
              >
                활동
              </TabsTrigger>
            </TabsList>

            <TabsContent value="saved" className="space-y-4">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                {savedContent.map((content, index) => (
                  <motion.div key={content.id} variants={itemVariants}>
                    <Link href={`/digest/${content.id}`}>
                      <div className="flex gap-3 bg-white rounded-xl p-3 border border-border-line shadow-sm hover:border-primary-color transition-all group">
                        <div className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden">
                          <Image
                            src={content.image || "/placeholder.svg"}
                            alt={content.title}
                            fill
                            className="object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                          />
                        </div>
                        <div className="flex flex-col">
                          <h3 className="font-medium text-sm line-clamp-2 text-neutral-dark group-hover:text-primary-color transition-colors">
                            {content.title}
                          </h3>
                          <div className="mt-auto flex items-center gap-2 text-xs text-neutral-medium">
                            <span>{content.source}</span>
                            <span>•</span>
                            <span>{content.date}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>

              <Button
                variant="outline"
                className="w-full text-sm bg-white border-border-line hover:text-primary-color hover:border-primary-color hover:bg-primary-light"
              >
                저장된 모든 콘텐츠 보기
              </Button>
            </TabsContent>

            <TabsContent value="activity">
              <div className="bg-white rounded-xl p-5 text-center border border-border-line shadow-sm">
                <div className="w-16 h-16 rounded-full bg-secondary-color flex items-center justify-center mx-auto mb-3 border border-border-line">
                  <BookOpen className="h-8 w-8 text-neutral-medium" />
                </div>
                <h3 className="font-medium mb-1 text-neutral-dark">
                  최근 활동 없음
                </h3>
                <p className="text-sm text-neutral-medium mb-4">
                  콘텐츠와의 최근 상호작용이 여기에 표시됩니다.
                </p>
                <Button className="bg-primary-color hover:bg-primary-color/90 text-sm text-white">
                  콘텐츠 탐색하기
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
