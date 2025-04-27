import { Bookmark, BookmarkCheck, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TranslatedParagraph } from "@/types/digest-page";
import { motion } from "framer-motion";

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
  if (isTranslating) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <div className="w-12 h-12 rounded-full border-4 border-primary-color border-t-transparent animate-spin"></div>
        <p className="mt-4 text-sm text-neutral-dark">타임라인 번역 중...</p>
      </div>
    );
  }

  if (translationError) {
    return (
      <div className="p-6 text-center">
        <div className="w-16 h-16 mx-auto bg-red-50 rounded-full flex items-center justify-center">
          <span className="text-red-500 text-2xl">!</span>
        </div>
        <h3 className="mt-4 text-lg font-medium text-neutral-dark">
          번역 오류
        </h3>
        <p className="mt-2 text-neutral-medium">{translationError}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => pageId && fetchTranslatedTimeline(pageId)}
          className="mt-4"
        >
          다시 시도
        </Button>
      </div>
    );
  }

  if (!translatedParagraphs || translatedParagraphs.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="w-16 h-16 mx-auto bg-blue-50 rounded-full flex items-center justify-center">
          <Globe className="h-8 w-8 text-blue-500" />
        </div>
        <h3 className="mt-4 text-lg font-medium text-neutral-dark">
          번역된 콘텐츠 없음
        </h3>
        <p className="mt-2 text-neutral-medium">
          자막을 {userLanguage} 언어로 번역하시겠습니까?
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => pageId && fetchTranslatedTimeline(pageId)}
          className="mt-4"
        >
          번역하기
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      className="mb-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1">
          <h2 className="text-lg font-bold text-neutral-dark">
            번역된 스크립트
            <span className="ml-1 text-sm font-normal">({userLanguage})</span>
          </h2>
        </div>
      </div>

      <div className="space-y-4">
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
            <div
              key={`par-${index}`}
              className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary-color transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <button
                  onClick={() => handleSeekTo(secondsTime)}
                  className="text-xs font-semibold text-primary-color bg-primary-light px-2 py-1 rounded hover:bg-primary-color hover:text-white transition-colors"
                >
                  {paragraph.start}
                </button>

                <button
                  onClick={() =>
                    handleBookmark(paragraphId, secondsTime, paragraph.text)
                  }
                  className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-gray-100"
                  aria-label={
                    isBookmarked ? "타임라인에서 제거" : "타임라인에 저장"
                  }
                >
                  {isBookmarked ? (
                    <BookmarkCheck className="h-5 w-5 text-primary-color" />
                  ) : (
                    <Bookmark className="h-5 w-5 text-neutral-dark" />
                  )}
                </button>
              </div>
              <p className="text-base text-neutral-dark whitespace-pre-wrap">
                {paragraph.text}
              </p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
