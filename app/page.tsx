"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BookOpen,
  Plus,
  Search,
  FileText,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BottomNav from "@/components/bottom-nav";
import ContentCard from "@/components/content-card";

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
      // 실제 구현에서는 API 호출 후 응답에 따라 리디렉션
      router.push("/summarizing");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b  z-30">
        <div className="container flex items-center justify-between h-16 px-5">
          <Link href="/" className="flex items-center gap-1.5">
            <BookOpen className="w-5 h-5 text-blue-500" />
            <span className="text-lg font-bold">Link Digest</span>
          </Link>
          <Link href="/profile">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-sm font-medium text-blue-600">김링</span>
            </div>
          </Link>
        </div>
      </header>

      <main className="flex-1 pb-20">
        <section className="w-full pt-5 pb-14 md:py-20 bg-gradient-to-b from-blue-50 to-white relative overflow-hidden">
          {/* 배경 장식 요소 */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 w-64 h-64 bg-blue-100 rounded-full opacity-20 blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-100 rounded-full opacity-20 blur-3xl"></div>
          </div>

          <div className="container px-5 relative z-10">
            <div className="flex flex-col items-center justify-center space-y-8 text-center">
              <div className="flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-2">
                <BookOpen className="w-10 h-10 text-blue-500" />
              </div>

              <div className="space-y-8 max-w-[320px] md:max-w-[600px]">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
                  콘텐츠를 <span className="text-blue-500">스마트하게</span>
                  <br />
                  정리하세요
                </h1>
                <p className="text-base text-gray-600 md:text-lg max-w-[500px] mx-auto">
                  링크만 입력하면 AI가 콘텐츠를 분석하여 핵심 내용을 요약해
                  드립니다. 복잡한 정보를 한눈에 파악하세요.
                </p>

                <div className="flex justify-center mt-6 gap-8">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                      <FileText className="h-5 w-5 text-blue-500" />
                    </div>
                    <span className="text-xs text-gray-600">핵심 요약</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                      <Tag className="h-5 w-5 text-blue-500" />
                    </div>
                    <span className="text-xs text-gray-600">자동 태그</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                      <Search className="h-5 w-5 text-blue-500" />
                    </div>
                    <span className="text-xs text-gray-600">쉬운 검색</span>
                  </div>
                </div>
              </div>

              <div className="w-full max-w-lg pt-4">
                <form onSubmit={handleSubmit} className="relative">
                  <div className="flex items-center p-1.5 bg-white rounded-2xl shadow-lg border border-gray-100">
                    <Input
                      className="flex-1 h-14 border-0 shadow-none text-base focus:ring-0 pl-5 pr-4 rounded-xl"
                      placeholder="링크를 붙여넣으세요."
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      required
                    />
                    <Button
                      type="submit"
                      className="h-12 px-4 bg-blue-500 hover:bg-blue-600 rounded-xl text-base font-medium"
                    >
                      <span className="mr-2">요약하기</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
        {/* 
        <section className="w-full py-8">
          <div className="container px-5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">추천 콘텐츠</h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-500 font-medium p-0"
              >
                전체보기
              </Button>
            </div>

            <div className="space-y-5">
              {recentContent.map((content) => (
                <ContentCard key={content.id} content={content} />
              ))}
            </div>
          </div>
        </section> */}

        <section className="w-full py-8">
          <div className="container px-5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">최근 추가됨</h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-500 font-medium p-0"
              >
                전체보기
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {recentContent.slice(0, 4).map((content) => (
                <Link
                  href={`/digest/${content.id}`}
                  key={content.id}
                  className="group"
                >
                  <div className="bg-white rounded-xl overflow-hidden shadow-sm transition-all duration-200 group-hover:shadow-md h-full flex flex-col">
                    <div className="relative h-24 w-full">
                      <Image
                        src={content.image || "/placeholder.svg"}
                        alt={content.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2 left-2">
                        <div className="px-2 py-0.5 bg-black/60 text-white rounded-full text-[10px]">
                          {content.source}
                        </div>
                      </div>
                    </div>
                    <div className="p-3 flex-1 flex flex-col">
                      <h3 className="font-medium text-sm mb-1 line-clamp-2">
                        {content.title}
                      </h3>
                      <div className="mt-auto pt-2">
                        <div className="text-xs text-gray-500">
                          {content.date}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* <div className="fixed bottom-20 right-5 z-20">
        <Button className="h-14 w-14 rounded-full bg-blue-500 hover:bg-blue-600 shadow-lg">
          <Plus className="h-6 w-6" />
        </Button>
      </div> */}

      <BottomNav />
    </div>
  );
}
