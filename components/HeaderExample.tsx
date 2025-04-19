"use client";

import { Header } from "./Header";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck, Share2 } from "lucide-react";
import { useState } from "react";

export function HeaderExample() {
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveBookmark = () => {
    setIsSaved((prev) => !prev);
  };

  // 오른쪽 유틸리티 버튼 예제
  const rightUtilButtons = (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-full hover:bg-primary-light"
        onClick={handleSaveBookmark}
      >
        {isSaved ? (
          <BookmarkCheck className="h-5 w-5 text-primary-color" />
        ) : (
          <Bookmark className="h-5 w-5 text-neutral-dark" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-full hover:bg-primary-light"
      >
        <Share2 className="h-5 w-5 text-neutral-dark" />
      </Button>
    </>
  );

  return (
    <div className="flex flex-col gap-8">
      {/* 기본 헤더 */}
      <Header title="기본 헤더" />

      {/* 뒤로가기 URL 지정 */}
      <Header title="홈으로 가기" backUrl="/" />

      {/* 브라우저 히스토리 뒤로가기 */}
      <Header title="뒤로가기" backUrl="back" />

      {/* 오른쪽 버튼 있는 헤더 */}
      <Header title="버튼이 있는 헤더" rightElement={rightUtilButtons} />

      {/* 뒤로가기 버튼 없는 헤더 */}
      <Header
        title="뒤로가기 없음"
        showBackButton={false}
        rightElement={rightUtilButtons}
      />
    </div>
  );
}
