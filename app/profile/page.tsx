"use client";

import Link from "next/link";
import Image from "next/image";
import { Settings, BookOpen, Share2, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BottomNav from "@/components/bottom-nav";
import { motion } from "framer-motion";

export default function ProfilePage() {
  // 샘플 사용자 데이터
  const user = {
    name: "김링크",
    username: "@kimlink",
    bio: "디지털 콘텐츠 큐레이터 | 지식 관리 애호가",
    joinDate: "2025년 4월",
    stats: {
      saved: 128,
      shared: 32,
    },
    avatar: "/placeholder.svg?height=100&width=100",
  };

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
      title: "건강한 식습관을 위한 10가지 팁",
      source: "Instagram",
      date: "4월 8일",
      image: "/placeholder.svg?height=200&width=400",
    },
    {
      id: 3,
      title: "효율적인 재택근무를 위한 환경 구성하기",
      source: "Medium",
      date: "4월 5일",
      image: "/placeholder.svg?height=200&width=400",
    },
  ];

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
            <div className="flex items-start gap-4 mb-4">
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-primary-color/50">
                <Image
                  src={user.avatar || "/placeholder.svg"}
                  alt={user.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-lg text-neutral-dark">
                  {user.name}
                </h2>
                <p className="text-sm text-primary-color">{user.username}</p>
                <p className="text-sm mt-1 text-neutral-medium">{user.bio}</p>
              </div>
            </div>

            <div className="flex gap-3 mb-4">
              <div className="flex-1 rounded-lg p-3 text-center border border-border-line bg-secondary-color">
                <div className="font-bold text-lg text-primary-color">
                  {user.stats.saved}
                </div>
                <div className="text-xs text-neutral-medium">저장됨</div>
              </div>
              <div className="flex-1 rounded-lg p-3 text-center border border-border-line bg-secondary-color">
                <div className="font-bold text-lg text-primary-color">
                  {user.stats.shared}
                </div>
                <div className="text-xs text-neutral-medium">공유됨</div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1 bg-primary-color hover:bg-primary-color/90 h-10 text-sm text-white">
                프로필 편집
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
