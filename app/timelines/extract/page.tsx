"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Clock,
  Link2,
  Play,
  Bookmark,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BottomNav from "@/components/bottom-nav";
import { motion } from "framer-motion";
import { TimelineAccordion } from "@/components/timeline/TimelineAccordion";

export default function TimelineExtractPage() {
  const [url, setUrl] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionComplete, setExtractionComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [videoInfo, setVideoInfo] = useState<any>(null);
  const [bookmarkedItems, setBookmarkedItems] = useState<
    Record<string, boolean>
  >({});
  const [showTimeline, setShowTimeline] = useState(true);

  // 샘플 타임라인 데이터 (실제 구현 시 API에서 가져올 데이터)
  const sampleTimelineGroups = [
    {
      range: "00:00 - 05:00",
      subtitles: [
        {
          start: "00:15",
          end: "00:20",
          text: "안녕하세요, 오늘은 React 기초에 대해 알아보겠습니다.",
          startSeconds: 15,
        },
        {
          start: "01:30",
          end: "01:40",
          text: "React는 Facebook에서 개발한 JavaScript 라이브러리입니다.",
          startSeconds: 90,
        },
        {
          start: "02:45",
          end: "03:00",
          text: "컴포넌트 기반 아키텍처를 사용하여 UI를 구성합니다.",
          startSeconds: 165,
        },
        {
          start: "04:20",
          end: "04:35",
          text: "Virtual DOM을 사용하여 효율적인 렌더링을 제공합니다.",
          startSeconds: 260,
        },
      ],
    },
    {
      range: "05:00 - 10:00",
      subtitles: [
        {
          start: "05:10",
          end: "05:25",
          text: "이제 첫 번째 React 컴포넌트를 만들어 보겠습니다.",
          startSeconds: 310,
        },
        {
          start: "06:30",
          end: "06:45",
          text: "JSX 문법을 사용하면 HTML과 유사한 코드를 작성할 수 있습니다.",
          startSeconds: 390,
        },
        {
          start: "08:15",
          end: "08:30",
          text: "props를 통해 컴포넌트 간에 데이터를 전달할 수 있습니다.",
          startSeconds: 495,
        },
        {
          start: "09:45",
          end: "10:00",
          text: "state를 사용하여 컴포넌트의 상태를 관리할 수 있습니다.",
          startSeconds: 585,
        },
      ],
    },
  ];

  const steps = [
    "링크 분석 중...",
    "영상 정보 추출 중...",
    "자막 데이터 추출 중...",
    "타임라인 생성 중...",
    "추출 완료!",
  ];

  const handleExtract = () => {
    if (!url.trim()) return;

    setIsExtracting(true);
    setProgress(0);
    setCurrentStep(0);

    // 진행 상태 시뮬레이션 (실제 구현 시 API 호출로 대체)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setExtractionComplete(true);
          setVideoInfo({
            title: "React 기초 강의 - 컴포넌트, Props, State 완벽 정리",
            channelTitle: "코딩애플",
            publishedAt: "2023-05-15T09:00:00Z",
            viewCount: "125000",
            thumbnailUrl: "/placeholder.svg?height=480&width=720",
          });
          return 100;
        }

        // 단계 업데이트
        const newProgress = prev + 5;
        if (newProgress > 20 && currentStep === 0) setCurrentStep(1);
        if (newProgress > 40 && currentStep === 1) setCurrentStep(2);
        if (newProgress > 70 && currentStep === 2) setCurrentStep(3);
        if (newProgress > 90 && currentStep === 3) setCurrentStep(4);

        return newProgress;
      });
    }, 200);

    return () => clearInterval(interval);
  };

  const handleReset = () => {
    setUrl("");
    setIsExtracting(false);
    setExtractionComplete(false);
    setProgress(0);
    setCurrentStep(0);
    setVideoInfo(null);
    setBookmarkedItems({});
  };

  const handleBookmark = (id: string, seconds: number, text: string) => {
    setBookmarkedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSeekTo = (seconds: number) => {
    // 실제 구현 시 영상 재생 기능 추가
    console.log(`Seek to ${seconds} seconds`);
  };

  return (
    <div className="flex flex-col min-h-screen pb-24">
      <header className="sticky top-0 z-10 bg-white border-b border-border-line">
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
            타임라인 추출
          </div>
          <div className="w-5"></div>
        </div>
      </header>

      <main className="flex-1 container px-5 py-6">
        <div className="max-w-3xl mx-auto">
          {!isExtracting ? (
            <div className="space-y-6">
              <div className="text-center space-y-2 mb-8">
                <h1 className="text-2xl font-bold text-neutral-dark">
                  타임라인 추출하기
                </h1>
                <p className="text-neutral-medium">
                  YouTube 링크를 붙여넣으면 타임라인을 추출합니다.
                </p>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Link2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-medium" />
                  <Input
                    type="text"
                    placeholder="YouTube 링크를 붙여넣으세요"
                    className="pl-9 bg-gray-50 border-gray-200"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleExtract}
                  className="bg-primary-color hover:bg-primary-color/90"
                >
                  추출하기
                </Button>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center">
                    <Clock className="h-5 w-5 text-primary-color" />
                  </div>
                  <div>
                    <h2 className="font-medium text-neutral-dark">
                      타임라인 추출이란?
                    </h2>
                    <p className="text-sm text-neutral-medium">
                      영상의 자막을 분석하여 시간별로 정리합니다.
                    </p>
                  </div>
                </div>

                <ul className="space-y-2 text-sm text-neutral-medium">
                  <li className="flex items-start gap-2">
                    <span className="text-primary-color">•</span>
                    <span>영상의 주요 내용을 시간별로 확인할 수 있습니다.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-color">•</span>
                    <span>
                      중요한 부분을 북마크하여 나중에 쉽게 찾아볼 수 있습니다.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-color">•</span>
                    <span>타임라인은 내 라이브러리에 저장됩니다.</span>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {!extractionComplete ? (
                <div className="space-y-6">
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm font-medium">
                        {steps[currentStep]}
                      </div>
                      <div className="text-sm text-gray-500">{progress}%</div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-color rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl flex items-start gap-3 border border-gray-200">
                    <Link2 className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm font-medium mb-1 break-all">
                        {url}
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        <span>추출 중...</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Loader2 className="h-8 w-8 text-primary-color animate-spin" />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col bg-white rounded-xl overflow-hidden border border-border-line shadow-sm"
                  >
                    <div className="relative w-full h-48 md:h-64">
                      <Image
                        src={videoInfo.thumbnailUrl || "/placeholder.svg"}
                        alt={videoInfo.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <button className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center hover:bg-primary-color transition-colors">
                          <Play className="h-6 w-6 text-white" />
                        </button>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <h2 className="text-xl font-bold text-neutral-dark">
                        {videoInfo.title}
                      </h2>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <div className="w-9 h-9 rounded-full overflow-hidden bg-secondary-color border border-border-line">
                            <Image
                              src="/placeholder.svg?height=40&width=40"
                              alt="채널 이미지"
                              width={36}
                              height={36}
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-medium text-sm text-neutral-dark">
                              {videoInfo.channelTitle}
                            </div>
                            <div className="text-xs text-neutral-medium">
                              {new Date(
                                videoInfo.publishedAt
                              ).toLocaleDateString("ko-KR", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </div>
                          </div>
                        </div>

                        <div className="text-sm text-neutral-medium">
                          조회수 {formatViewCount(videoInfo.viewCount)}회
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-10"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1.5">
                        <h2 className="text-xl font-bold text-neutral-dark">
                          타임라인
                        </h2>
                        <div className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-primary-light text-primary-color text-xs">
                          {/* {sampleTimelineGroups.reduce(
                            (acc, group) => acc + group.subtitles.length,
                            0
                          )}
                          개 항목 */}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-sm text-neutral-medium rounded-full px-3"
                        onClick={() => setShowTimeline(!showTimeline)}
                      >
                        {showTimeline ? "타임라인 숨기기" : "타임라인 보기"}
                      </Button>
                    </div>

                    {showTimeline && (
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <TimelineAccordion
                          timelineGroups={sampleTimelineGroups}
                          onSeek={handleSeekTo}
                          bookmarkedItems={bookmarkedItems}
                          onBookmark={handleBookmark}
                        />
                      </div>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col gap-4"
                  >
                    <Button className="w-full py-3 bg-primary-color hover:bg-primary-color/90">
                      <Bookmark className="mr-2 h-5 w-5" />
                      타임라인 저장하기
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full py-3"
                      onClick={handleReset}
                    >
                      <X className="mr-2 h-5 w-5" />
                      다시 시작하기
                    </Button>
                  </motion.div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

// 조회수 포맷 함수
function formatViewCount(count: string): string {
  if (!count) return "0";

  const num = Number.parseInt(count, 10);
  if (isNaN(num)) return "0";

  if (num >= 10000) {
    return `${Math.floor(num / 10000)}만`;
  } else if (num >= 1000) {
    return `${Math.floor(num / 1000)}천`;
  }

  return `${num}`;
}
