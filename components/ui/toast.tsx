"use client";

import {
  useEffect,
  ReactNode,
  useState,
  createContext,
  useContext,
  useCallback,
} from "react";
import { X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// 필요한 타입 정의 추가
export type ToastProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export type ToastActionElement = React.ReactNode;

interface SimpleToastProps {
  isVisible: boolean;
  message: string;
  onClose: () => void;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
}

export function SimpleToast({
  isVisible,
  message,
  onClose,
  actionLabel,
  onAction,
  duration = 3000,
}: SimpleToastProps) {
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isVisible) {
      timeoutId = setTimeout(() => {
        //onClose();
      }, duration);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isVisible, onClose, duration]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-md">
      <div className="bg-gray-800 text-white rounded-lg shadow-lg p-4 flex items-center justify-between">
        <div className="flex-1 mr-2">
          <p className="text-sm">{message}</p>
        </div>
        <div className="flex items-center gap-2">
          {actionLabel && onAction && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-red-400 hover:text-red-300 hover:bg-transparent p-0 h-auto"
              onClick={onAction}
            >
              {actionLabel}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-white/70 hover:text-white hover:bg-transparent p-0 h-auto"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// 토스트 컨텍스트 타입 정의
interface ToastContextType {
  isVisible: boolean;
  message: string;
  showAddButton: boolean;
  showToast: (
    message: string,
    showAddButton?: boolean,
    onAddButtonClick?: () => void
  ) => void;
  hideToast: () => void;
  handleAddButtonClick: () => void;
}

// 토스트 컨텍스트 생성
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// 토스트 프로바이더 컴포넌트
export function ToastProvider({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [showAddButton, setShowAddButton] = useState(false);
  const [onAddButtonClickCallback, setOnAddButtonClickCallback] = useState<
    (() => void) | null
  >(null);

  const showToast = useCallback(
    (newMessage: string, showAddBtn = false, onAddBtnClick?: () => void) => {
      setMessage(newMessage);
      setShowAddButton(showAddBtn);
      if (onAddBtnClick) {
        setOnAddButtonClickCallback(() => onAddBtnClick);
      } else {
        setOnAddButtonClickCallback(null);
      }
      setIsVisible(true);
    },
    []
  );

  const hideToast = useCallback(() => {
    setIsVisible(false);
  }, []);

  const handleAddButtonClick = useCallback(() => {
    if (onAddButtonClickCallback) {
      onAddButtonClickCallback();
    }
    hideToast();
  }, [onAddButtonClickCallback, hideToast]);

  return (
    <ToastContext.Provider
      value={{
        isVisible,
        message,
        showAddButton,
        showToast,
        hideToast,
        handleAddButtonClick,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
}

// 토스트 훅
export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

// 디자인 시스템 스타일을 적용한 토스트 컴포넌트
interface DesignToastProps {
  isVisible: boolean;
  message: string;
  onClose?: () => void;
  showAddButton?: boolean;
  onAddButtonClick?: () => void;
  duration?: number;
}

export function DesignToast({
  isVisible,
  message,
  onClose,
  showAddButton,
  onAddButtonClick,
  duration = 5000,
}: DesignToastProps) {
  const [exit, setExit] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isVisible) {
      timeoutId = setTimeout(() => {
        // 먼저 나가는 애니메이션을 시작하고
        setExit(true);
        // 애니메이션이 끝난 후에 닫기 함수 호출
        setTimeout(() => {
          onClose?.();
          setExit(false);
        }, 300); // CSS 애니메이션 지속 시간과 일치해야 함
      }, duration);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isVisible, onClose, duration]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed w-[90%] max-w-md bottom-24 left-1/2 transform -translate-x-1/2 bg-neutral-dark text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 ${
        exit ? "animate-fade-out-down" : "animate-fade-in-up"
      }`}
    >
      <CheckCircle size={20} className="text-[#2BA640]" />
      <span>{message}</span>
      {showAddButton && onAddButtonClick && (
        <button
          onClick={onAddButtonClick}
          className="ml-2 bg-white bg-opacity-60 whitespace-nowrap text-neutral-dark px-2 py-1 rounded-md text-sm transition-colors"
        >
          메모
        </button>
      )}
    </div>
  );
}

// layout.tsx에서 사용하기 위한 전역 토스트 컴포넌트
export function GlobalDesignToast() {
  const toast = useToast();

  if (!toast) {
    return null; // 컨텍스트가 없으면 렌더링하지 않음
  }

  return (
    <DesignToast
      isVisible={toast.isVisible}
      message={toast.message}
      onClose={toast.hideToast}
      showAddButton={toast.showAddButton}
      onAddButtonClick={toast.handleAddButtonClick}
    />
  );
}
