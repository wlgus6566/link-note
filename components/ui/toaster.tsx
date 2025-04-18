"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { SimpleToast } from "@/components/ui/toast";

export function Toaster() {
  const { toasts } = useToast();
  const [visibleToasts, setVisibleToasts] = useState<Record<string, boolean>>(
    {}
  );

  useEffect(() => {
    // 새 토스트가 추가되면 visible 상태를 true로 설정
    const newVisibleToasts = { ...visibleToasts };
    toasts.forEach((toast) => {
      if (toast.open) {
        newVisibleToasts[toast.id] = true;
      }
    });
    setVisibleToasts(newVisibleToasts);
  }, [toasts]);

  const handleClose = (id: string) => {
    setVisibleToasts((prev) => ({ ...prev, [id]: false }));
  };

  // React Node를 문자열로 변환하는 함수
  const nodeToString = (node: React.ReactNode): string => {
    if (node === null || node === undefined) return "";
    if (typeof node === "string") return node;
    if (typeof node === "number") return node.toString();
    if (typeof node === "boolean") return node ? "true" : "false";

    // 객체나 배열인 경우 "알림" 기본값 반환
    return "알림";
  };

  return (
    <>
      {toasts.map(function ({ id, title, description, ...props }) {
        const titleStr = nodeToString(title);
        const descStr = nodeToString(description);
        const message = titleStr || descStr || "알림";

        return (
          <SimpleToast
            key={id}
            isVisible={visibleToasts[id] || false}
            message={message}
            onClose={() => handleClose(id)}
          />
        );
      })}
    </>
  );
}
