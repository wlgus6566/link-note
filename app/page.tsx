"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BookOpen,
  Search,
  FileText,
  Tag,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BottomNav from "@/components/bottom-nav";
import { motion } from "framer-motion";

export default function Home() {
  const router = useRouter();
  const [url, setUrl] = useState("");

  // 샘플 콘텐츠 데이터
  const recentContent = [
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
  ];

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

  return (
    <div className="flex flex-col min-h-screen">
      <header className="header">
        <div className="container flex items-center justify-between h-16 px-5">
          <Link href="/" className="flex items-center gap-1.5">
            <Image
              src="/images/logo_00.png"
              alt="logo"
              width={20}
              height={20}
            />
            <span className="text-lg font-bold text-neutral-dark">
              Link Digest
            </span>
          </Link>
          <Link href="/profile">
            <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center border border-primary-color/30">
              <span className="text-sm font-medium text-primary-color">
                김링
              </span>
            </div>
          </Link>
        </div>
      </header>

      <main className="flex-1 pb-24">
        <motion.section
          className="w-full pt-8 pb-14 md:py-20 relative overflow-hidden"
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
                  src="/images/logo_00.png"
                  alt="logo"
                  width={64}
                  height={64}
                  className="relative z-10"
                />
              </motion.div>

              <div className="space-y-8 max-w-[320px] md:max-w-[600px]">
                <motion.h1
                  className="text-3xl md:text-4xl font-bold tracking-tight leading-tight text-neutral-dark"
                  variants={itemVariants}
                >
                  콘텐츠를
                  <span className="text-primary-color">스마트하게</span>
                  <br />
                  정리하세요
                </motion.h1>
                <motion.p
                  className="text-base text-neutral-medium md:text-lg max-w-[500px] mx-auto"
                  variants={itemVariants}
                >
                  링크 한 줄로, 당신만의 블로그
                  <br /> 콘텐츠가 완성됩니다.
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
                      핵심 요약
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center mb-2 border border-primary-color/30">
                      <Tag className="h-5 w-5 text-primary-color" />
                    </div>
                    <span className="text-xs text-neutral-medium">
                      자동 태그
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center mb-2 border border-primary-color/30">
                      <Search className="h-5 w-5 text-primary-color" />
                    </div>
                    <span className="text-xs text-neutral-medium">
                      쉬운 검색
                    </span>
                  </div>
                </motion.div>
              </div>

              <motion.div
                className="w-full max-w-lg pt-4"
                variants={itemVariants}
              >
                <form onSubmit={handleSubmit} className="relative">
                  <div className="flex items-center p-1.5 bg-white rounded-2xl border border-border-line shadow-sm">
                    <Input
                      className="flex-1 h-14 border-0 shadow-none text-base focus:ring-0 pl-5 pr-4 rounded-xl bg-transparent text-neutral-dark"
                      placeholder="링크를 붙여넣으세요."
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      required
                    />
                    <Button
                      type="submit"
                      className="h-12 px-4 bg-primary-color hover:bg-primary-color/90 rounded-xl text-base text-white font-medium"
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

        <section className="w-full py-8">
          <div className="container px-5">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Sparkles className="h-5 w-5 text-primary-color mr-2" />
                <h2 className="text-xl font-bold text-neutral-dark">
                  최근 추가됨
                </h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-color font-medium p-0 hover:bg-transparent"
              >
                전체보기
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {recentContent.slice(0, 4).map((content, index) => (
                <Link
                  href={`/digest/${content.id}`}
                  key={content.id}
                  className="group"
                >
                  <motion.div
                    className="bg-white rounded-xl overflow-hidden transition-all duration-200 border border-border-line shadow-sm h-full flex flex-col group-hover:border-primary-color"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="relative h-24 w-full">
                      <Image
                        src={content.image || "/placeholder.svg"}
                        alt={content.title}
                        fill
                        className="object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                      />
                      <div className="absolute top-2 left-2">
                        <div className="px-2 py-0.5 bg-white text-neutral-dark rounded-full text-[10px]">
                          {content.source}
                        </div>
                      </div>
                    </div>
                    <div className="p-3 flex-1 flex flex-col">
                      <h3 className="font-medium text-sm mb-1 line-clamp-2 text-neutral-dark group-hover:text-primary-color transition-colors">
                        {content.title}
                      </h3>
                      <div className="mt-auto pt-2">
                        <div className="text-xs text-neutral-medium">
                          {content.date}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
