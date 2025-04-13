"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Filter, Grid, List, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BottomNav from "@/components/bottom-nav";
import { motion } from "framer-motion";

export default function LibraryPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // 샘플 데이터
  const savedContent = [
    {
      id: 1,
      title: "인공지능의 미래: 2025년 전망",
      source: "YouTube",
      date: "4월 10일",
      summary:
        "이 영상은 2025년 인공지능 기술의 발전 방향과 산업에 미치는 영향에 대해 분석합니다. 특히 생성형 AI와 자율주행 기술의 발전이 주목됩니다.",
      tags: ["AI", "기술", "미래", "트렌드"],
      image: "/placeholder.svg?height=200&width=400",
    },
    {
      id: 2,
      title: "건강한 식습관을 위한 10가지 팁",
      source: "Instagram",
      date: "4월 8일",
      summary:
        "영양사가 추천하는 건강한 식습관을 위한 10가지 실천 가능한 팁을 소개합니다. 균형 잡힌 식단과 규칙적인 식사 시간의 중요성이 강조됩니다.",
      tags: ["건강", "식습관", "영양", "웰빙"],
      image: "/placeholder.svg?height=200&width=400",
    },
    {
      id: 3,
      title: "효율적인 재택근무를 위한 환경 구성하기",
      source: "Medium",
      date: "4월 5일",
      summary:
        "재택근무의 생산성을 높이기 위한 환경 구성과 습관에 대해 다룹니다. 적절한 조명, 인체공학적 가구, 업무 루틴 설정의 중요성을 설명합니다.",
      tags: ["재택근무", "생산성", "업무환경"],
      image: "/placeholder.svg?height=200&width=400",
    },
    {
      id: 4,
      title: "마케팅에서의 색상 심리학",
      source: "블로그",
      date: "4월 3일",
      summary:
        "다양한 색상이 소비자 행동과 브랜드 인식에 미치는 영향에 대해 설명합니다.",
      tags: ["마케팅", "심리학", "디자인"],
      image: "/placeholder.svg?height=200&width=400",
    },
    {
      id: 5,
      title: "초보자를 위한 명상 가이드",
      source: "YouTube",
      date: "4월 1일",
      summary: "초보자를 위한 명상 시작 방법을 단계별로 안내합니다.",
      tags: ["명상", "웰빙", "정신건강"],
      image: "/placeholder.svg?height=200&width=400",
    },
  ];

  // 콘텐츠 기반 인기 태그
  const popularTags = ["기술", "웰빙", "생산성", "AI", "건강", "디자인"];

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
            <h1 className="text-xl font-bold text-neutral-dark">내 보관함</h1>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-medium" />
            <Input
              className="search-input"
              placeholder="저장된 콘텐츠 검색"
              type="search"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="category-filter">
              <Button
                variant="outline"
                size="sm"
                className="category-btn active"
              >
                전체
              </Button>
              {popularTags.map((tag) => (
                <Button
                  key={tag}
                  variant="outline"
                  size="sm"
                  className="category-btn inactive"
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
              {savedContent.length}개 항목
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

          <motion.div
            className={
              viewMode === "grid" ? "grid grid-cols-2 gap-4" : "space-y-4 grid"
            }
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {savedContent.map((content, index) => (
              <Link
                href={`/digest/${content.id}`}
                key={content.id}
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
                      src={content.image || "/placeholder.svg"}
                      alt={content.title}
                      fill
                      className="object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute top-2 left-2">
                      <div className="px-2 py-0.5 bg-white rounded-full text-[10px] text-neutral-dark">
                        {content.source}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-3 ${
                      viewMode === "grid" ? "flex-1 flex flex-col" : "flex-1"
                    }`}
                  >
                    <div className="text-xs text-neutral-medium mb-1">
                      {content.date}
                    </div>
                    <h3 className="font-medium text-sm mb-1 line-clamp-2 text-neutral-dark group-hover:text-primary-color transition-colors">
                      {content.title}
                    </h3>

                    {viewMode === "list" && (
                      <p className="text-xs text-neutral-medium line-clamp-2 mb-2">
                        {content.summary}
                      </p>
                    )}

                    <div
                      className={`flex flex-wrap gap-1 ${
                        viewMode === "grid" ? "mt-auto" : ""
                      }`}
                    >
                      {content.tags
                        .slice(0, viewMode === "grid" ? 2 : 3)
                        .map((tag) => (
                          <span key={tag} className="tag">
                            {tag}
                          </span>
                        ))}
                      {content.tags.length > (viewMode === "grid" ? 2 : 3) && (
                        <span className="text-xs bg-secondary-color text-neutral-medium px-1.5 py-0.5 rounded-full">
                          +{content.tags.length - (viewMode === "grid" ? 2 : 3)}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
