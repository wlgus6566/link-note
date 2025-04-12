"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import BottomNav from "@/components/bottom-nav";

export default function SummarizingPage() {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const steps = [
    "링크 분석 중...",
    "콘텐츠 추출 중...",
    "핵심 내용 요약 중...",
    "태그 생성 중...",
    "이미지 추출 중...",
    "요약 완료!",
  ];

  // 가상의 URL (실제로는 URL 파라미터나 상태로 관리)
  const url = "https://example.com/article-about-ai-future";

  // 진행 상태를 시뮬레이션
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(timer);
          setIsComplete(true);
          return 100;
        }

        const newProgress = prevProgress + 2;

        // 진행 단계 업데이트
        if (newProgress < 20) setCurrentStep(0);
        else if (newProgress < 40) setCurrentStep(1);
        else if (newProgress < 60) setCurrentStep(2);
        else if (newProgress < 80) setCurrentStep(3);
        else if (newProgress < 95) setCurrentStep(4);
        else setCurrentStep(5);

        return newProgress;
      });
    }, 100);

    return () => {
      clearInterval(timer);
    };
  }, []);

  // 완료 후 리디렉션 (실제로는 API 응답 후 리디렉션)
  useEffect(() => {
    if (isComplete) {
      const redirectTimer = setTimeout(() => {
        // 실제 구현에서는 여기서 새로 생성된 digest ID로 리디렉션
        window.location.href = "/digest/1";
      }, 1000);

      return () => clearTimeout(redirectTimer);
    }
  }, [isComplete]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="container flex items-center justify-between h-16 px-5">
          <Button variant="ghost" size="sm" className="p-0" asChild>
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="text-sm font-medium">콘텐츠 요약</div>
          <div className="w-5"></div>
        </div>
      </header>

      <main className="flex-1 container px-5 py-8">
        <div className="max-w-md mx-auto">
          {/* 링크 정보 */}
          <div className="mb-8 p-4 bg-gray-50 rounded-xl flex items-start gap-3">
            <Link2 className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-medium mb-1 break-all">{url}</div>
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="h-3.5 w-3.5 mr-1" />
                <span>약 1분 소요</span>
              </div>
            </div>
          </div>

          {/* 진행 상태 */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-medium">{steps[currentStep]}</div>
              <div className="text-sm text-gray-500">{progress}%</div>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* 콘텐츠 스켈레톤 UI */}
          <div className="space-y-6">
            {/* 제목 스켈레톤 */}
            <div className="space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
            </div>

            {/* 태그 스켈레톤 */}
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-14 rounded-full" />
            </div>

            {/* 썸네일 스켈레톤 */}
            <Skeleton className="h-48 w-full rounded-xl" />

            {/* 요약 스켈레톤 */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            {/* 핵심 포인트 스켈레톤 */}
            <div className="space-y-3">
              <Skeleton className="h-5 w-1/3" />
              <div className="space-y-2 pl-6">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
