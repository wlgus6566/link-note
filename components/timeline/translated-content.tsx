"use client";

import { Button } from "@/components/ui/button";
import { TranslatedParagraph } from "@/types/digest";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Clock, BookmarkPlus, BookmarkCheck } from "lucide-react";
import { useState } from "react";

interface TranslatedContentProps {
  isTranslating: boolean;
  translationError: string | null;
  translatedParagraphs: TranslatedParagraph[];
  userLanguage: string;
  bookmarkedItems: Record<string, any>;
  handleSeekTo: (seconds: number) => void;
  handleBookmark: (id: string, seconds: number, text: string) => void;
  fetchTranslatedTimeline: (pageId: string) => void;
  pageId: string | null;
}

export function TranslatedContent({
  isTranslating,
  translationError,
  translatedParagraphs,
  userLanguage,
  bookmarkedItems,
  handleSeekTo,
  handleBookmark,
  fetchTranslatedTimeline,
  pageId,
}: TranslatedContentProps) {
  const [activeParagraph, setActiveParagraph] = useState<string | null>(null);

  if (isTranslating) {
    return (
      <div className="space-y-6 py-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-primary-color" />
            <p className="text-sm text-neutral-medium">
              번역 중입니다. 잠시만 기다려주세요...
            </p>
          </div>
        </div>

        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="space-y-3 mb-6">
            <Skeleton className="h-5 w-32 bg-gray-200" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full bg-gray-200" />
              <Skeleton className="h-4 w-[90%] bg-gray-200" />
              <Skeleton className="h-4 w-[80%] bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 번역 오류 표시
  if (translationError) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
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
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-neutral-dark mb-2">
          번역 오류
        </h3>
        <p className="text-neutral-medium mb-6">{translationError}</p>
        <Button
          onClick={() => pageId && fetchTranslatedTimeline(pageId)}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          다시 시도
        </Button>
      </div>
    );
  }

  // 번역 결과가 없는 경우
  if (!translatedParagraphs || translatedParagraphs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-neutral-dark mb-2">
          번역 결과 없음
        </h3>
        <p className="text-neutral-medium mb-6">
          번역된 콘텐츠가 없습니다. 번역을 시작하려면 아래 버튼을 클릭하세요.
        </p>
        <Button
          onClick={() => pageId && fetchTranslatedTimeline(pageId)}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          번역 시작
        </Button>
      </div>
    );
  }

  // 번역된 콘텐츠 표시
  return (
    <div className="space-y-6 py-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-neutral-dark">
            번역된 타임라인
          </h2>
          <span className="text-xs px-2 py-1 bg-primary-light text-primary-color rounded-full">
            {userLanguage.toUpperCase()}
          </span>
        </div>
      </div>

      {translatedParagraphs.map((paragraph, index) => {
        // 각 문단의 고유 ID 생성
        const paragraphId = `translated-par-${paragraph.index || index + 1}`;

        // 초로 변환된 시간 계산
        const secondsTime = paragraph.start
          .split(":")
          .reduce((acc, time) => 60 * acc + parseInt(time), 0);

        // 북마크 상태 확인
        const isBookmarked = !!bookmarkedItems[paragraphId];

        return (
          <motion.div
            key={`par-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group"
          >
            <div
              className={` border border-border-line rounded-lg p-4 hover:shadow-md transition-shadow ${
                activeParagraph === paragraph.start
                  ? "bg-primary-light"
                  : isBookmarked
                  ? "bg-blue-50"
                  : "bg-gray-50"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div
                  className="flex items-center gap-2 text-sm text-primary-color font-medium cursor-pointer hover:underline"
                  onClick={() => {
                    handleSeekTo(secondsTime);
                    setActiveParagraph(paragraph.start);
                  }}
                >
                  <Clock className="h-4 w-4" />
                  {paragraph.start}
                </div>
                <button
                  onClick={() =>
                    handleBookmark(paragraphId, secondsTime, paragraph.text)
                  }
                  className="text-neutral-medium hover:text-primary-color transition-colors"
                  aria-label={
                    isBookmarked ? "타임라인에서 제거" : "타임라인에 추가"
                  }
                >
                  {isBookmarked ? (
                    <BookmarkCheck className="h-5 w-5 text-primary-color" />
                  ) : (
                    <BookmarkPlus className="h-5 w-5" />
                  )}
                </button>
              </div>
              <button
                onClick={() => {
                  handleSeekTo(secondsTime);
                  setActiveParagraph(paragraph.start);
                }}
                className=" text-left text-neutral-dark leading-relaxed"
              >
                {paragraph.text}
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
