import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface NewFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (folderId: string, folderName: string) => void;
}

export function NewFolderModal({
  isOpen,
  onClose,
  onSuccess,
}: NewFolderModalProps) {
  const [folderName, setFolderName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingFolders, setExistingFolders] = useState<{ name: string }[]>(
    []
  );
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);

  // 컴포넌트가 마운트될 때 기존 폴더 목록 가져오기
  useEffect(() => {
    if (isOpen) {
      fetchExistingFolders();
    }
  }, [isOpen]);

  // 기존 폴더 목록 가져오기
  const fetchExistingFolders = async () => {
    try {
      const response = await fetch("/api/folders");
      const data = await response.json();

      if (response.ok && data.folders) {
        // 폴더 이름만 추출하여 저장
        setExistingFolders(
          data.folders.map((folder: any) => ({
            name: folder.name,
          }))
        );
      }
    } catch (error) {
      console.error("폴더 목록 불러오기 오류:", error);
    }
  };

  // 폴더 이름 입력값 변경 핸들러
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setFolderName(newName);

    // 이름이 변경될 때마다 에러 초기화
    if (error) {
      setError(null);
    }
  };

  // 폴더명 중복 확인
  const checkDuplicateFolderName = (name: string): boolean => {
    return existingFolders.some(
      (folder) => folder.name.toLowerCase() === name.toLowerCase()
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = folderName.trim();

    if (!trimmedName) {
      setError("폴더명을 입력해주세요.");
      return;
    }

    // 폴더명 중복 확인
    if (checkDuplicateFolderName(trimmedName)) {
      setError("이미 존재하는 폴더명입니다.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const supabase = createClient();
      const { data: session } = await supabase.auth.getSession();

      if (!session.session) {
        toast.error("로그인이 필요합니다.");
        onClose();
        return;
      }

      console.log("새 폴더 생성 API 요청 시작:", trimmedName);

      // 폴더 생성 API 호출
      const response = await fetch("/api/folders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // 쿠키 포함
        body: JSON.stringify({
          name: trimmedName,
          description: "", // 필요한 경우 설명도 추가 가능
        }),
      });

      console.log("API 응답 상태:", response.status, response.statusText);

      const data = await response.json();
      console.log("API 응답 데이터:", data);

      if (!response.ok) {
        throw new Error(data.error || "폴더 생성에 실패했습니다.");
      }

      if (!data.folder || !data.folder.id) {
        throw new Error("폴더 생성에 실패했습니다.");
      }

      toast.success("폴더가 생성되었습니다.");

      // 실제 데이터베이스에서 생성된 ID 사용
      onSuccess(data.folder.id.toString(), trimmedName);
      setFolderName("");
    } catch (err) {
      console.error("폴더 생성 오류:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("폴더 생성에 실패했습니다.");
      }
      toast.error("폴더 생성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-101 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white rounded-xl shadow-lg w-full max-w-sm mx-4 z-50 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-semibold text-neutral-dark">
                  새 폴더 만들기
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-neutral-100"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="folder-name"
                    className="block text-sm font-medium text-neutral-dark mb-1"
                  >
                    폴더명
                  </label>
                  <Input
                    id="folder-name"
                    type="text"
                    value={folderName}
                    onChange={handleNameChange}
                    placeholder="폴더 이름을 입력하세요"
                    className="w-full rounded-md"
                    maxLength={50}
                  />
                  {error && (
                    <p className="text-red-500 text-sm mt-1">{error}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={loading}
                    className="rounded-md px-4"
                  >
                    취소
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || !folderName.trim()}
                    className="rounded-md bg-primary-color hover:bg-primary-color/90 px-4"
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <span className="animate-spin h-4 w-4 border-2 border-white/60 border-t-white rounded-full mr-2"></span>
                        생성 중...
                      </span>
                    ) : (
                      "생성하기"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
