"use client";

import React, { useState } from "react";
import { BottomPopup } from "@/components/bottom-popup";
import { Button } from "@/components/ui/button";
import { Copy, MessageCircle } from "lucide-react";
import { useToast } from "@/components/ui/toast";

declare global {
  interface Window {
    Kakao: any;
  }
}

interface SharePopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
  token?: string;
}

export function SharePopup({
  isOpen,
  onClose,
  title,
  url,
  token,
}: SharePopupProps) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  // 실제 공유 URL 생성 (token이 있으면 token을 사용, 없으면 현재 URL 사용)
  const shareUrl = token ? `${window.location.origin}/shared/${token}` : url;

  // 카카오톡 공유하기
  const shareKakao = () => {
    if (typeof window !== "undefined" && window.Kakao) {
      if (!window.Kakao.isInitialized()) {
        // 카카오 SDK 초기화 (실제 앱 키로 변경 필요)
        window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_API_KEY);
      }

      window.Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title: title,
          description: "Link Note에서 공유한 콘텐츠입니다.",
          imageUrl: "https://link-note.com/og-image.jpg", // 실제 이미지 URL로 변경 필요
          link: {
            mobileWebUrl: shareUrl,
            webUrl: shareUrl,
          },
        },
        buttons: [
          {
            title: "웹으로 보기",
            link: {
              mobileWebUrl: shareUrl,
              webUrl: shareUrl,
            },
          },
        ],
      });
    } else {
      showToast("카카오톡 공유 기능을 불러오는데 실패했습니다.");
    }
    onClose();
  };

  // 링크 복사하기
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      showToast("링크가 클립보드에 복사되었습니다.");
      setTimeout(() => setCopied(false), 2000);
      onClose();
    } catch (err) {
      showToast("링크 복사에 실패했습니다.");
    }
  };

  return (
    <BottomPopup isOpen={isOpen} onClose={onClose} title="공유하기">
      <div className="grid grid-cols-2 gap-4 p-4">
        <Button
          variant="outline"
          className="flex flex-col border-none items-center justify-center h-24 hover:border-primary-color hover:bg-primary-light"
          onClick={shareKakao}
        >
          <div className="w-10 h-10 rounded-full bg-[#FEE500] flex items-center justify-center mb-2">
            <MessageCircle className="h-5 w-5 text-black" />
          </div>
          <span className="text-sm">카카오톡</span>
        </Button>

        <Button
          variant="outline"
          className="flex flex-col items-center justify-center h-24 border-none hover:border-primary-color hover:bg-primary-light"
          onClick={copyLink}
        >
          <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center mb-2">
            <Copy className="h-5 w-5 text-primary-color" />
          </div>
          <span className="text-sm">{copied ? "복사됨" : "링크 복사"}</span>
        </Button>
      </div>
    </BottomPopup>
  );
}
