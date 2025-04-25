import React, { useState, useEffect } from "react";
import { FolderPlus, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { NewFolderModal } from "./new-folder-modal";

export interface Folder {
  id: number | string;
  name: string;
  user_id: string;
  created_at: string;
}

interface FolderSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  digestId: string;
  title: string;
  onSuccess: (folderId: string) => void;
  activeFolder?: string;
  onChangeFolder?: (
    digestId: string,
    newFolderId: string
  ) => Promise<{ success: boolean; error?: string; message?: string }>;
}

export function FolderSelectionModal({
  isOpen,
  onClose,
  digestId,
  title,
  onSuccess,
  activeFolder,
  onChangeFolder,
}: FolderSelectionModalProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [savingToFolder, setSavingToFolder] = useState(false);

  useEffect(() => {
    if (isOpen) {
      console.log("activeFolder:", activeFolder, typeof activeFolder);
      fetchFolders();
    }
  }, [isOpen, activeFolder]);

  const fetchFolders = async () => {
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

      console.log("폴더 목록 조회 API 요청 시작");

      // 폴더 목록 API 호출
      const response = await fetch("/api/folders", {
        method: "GET",
        credentials: "include", // 쿠키 포함
      });

      console.log("API 응답 상태:", response.status, response.statusText);

      const data = await response.json();
      console.log("API 응답 데이터:", data);

      if (!response.ok) {
        throw new Error(data.error || "폴더 목록을 불러오는데 실패했습니다.");
      }
      console.log("폴더 목록 불러오기 완료:", data.folders);

      if (data.folders) {
        setFolders(data.folders);
        console.log("폴더 목록 로드 완료:", data.folders.length, "개의 폴더");
      } else {
        throw new Error("폴더 목록을 불러오는데 실패했습니다.");
      }
    } catch (err) {
      console.error("폴더 목록 불러오기 오류:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("폴더 목록을 불러오는데 실패했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFolderSelect = async (
    folderId: number | string,
    folderName: string
  ) => {
    console.log("폴더 선택 이벤트 발생:", folderId, folderName);
    console.log("activeFolder와 비교:", {
      selectedId: folderId,
      activeFolder,
      isEqual: String(folderId) === String(activeFolder),
      selectedIdType: typeof folderId,
      activeFolderType: typeof activeFolder,
    });

    try {
      setSavingToFolder(true);

      // 이미 같은 폴더가 선택된 경우 처리
      if (String(folderId) === String(activeFolder)) {
        toast.info("이미 해당 폴더에 저장된 북마크입니다.");
        onClose();
        return;
      }

      // activeFolder가 있고 onChangeFolder 함수도 있으면 폴더 변경 로직 수행
      if (activeFolder && onChangeFolder) {
        console.log("폴더 변경 로직 수행:", {
          digestId,
          newFolderId: String(folderId),
        });

        const result = await onChangeFolder(digestId, String(folderId));

        if (result.success) {
          toast.success(`"${folderName}" 폴더로 이동했습니다.`);
          onSuccess(String(folderId));
          onClose();
        } else {
          throw new Error(result.error || "폴더 변경에 실패했습니다.");
        }
      } else {
        // 기존 로직: 북마크를 새 폴더에 저장
        const response = await fetch("/api/folder-bookmarks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            folderId: String(folderId),
            digestId: digestId,
          }),
          credentials: "include",
        });

        const data = await response.json();
        console.log("북마크 폴더 저장 API 응답:", data);

        if (!response.ok) {
          const errorMsg =
            data.error || "폴더에 북마크를 저장하는데 실패했습니다.";
          console.error("API 오류:", response.status, errorMsg);
          throw new Error(errorMsg);
        }

        console.log("북마크를 폴더에 저장 완료:", data);
        toast.success(`"${folderName}" 폴더에 저장했습니다.`);

        // 성공 콜백 호출 - 폴더 ID 전달
        onSuccess(String(folderId));
        onClose();
      }
    } catch (err) {
      console.error("폴더에 북마크 저장/변경 오류:", err);
      toast.error("폴더 작업에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSavingToFolder(false);
    }
  };

  // 새 폴더 생성 후 성공 처리
  const handleNewFolderSuccess = (folderId: string, folderName: string) => {
    console.log("새 폴더 생성 성공:", folderId, folderName);

    // API에서 가져온 값으로 폴더 목록 새로고침
    fetchFolders();
    setShowNewFolderModal(false);

    // 새 폴더를 자동으로 선택하는 옵션 제공
    toast("새 폴더 생성 완료", {
      description: "새 폴더에 저장하시겠습니까?",
      action: {
        label: "저장하기",
        onClick: () => handleFolderSelect(folderId, folderName),
      },
      duration: 5000,
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center">
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
              className="relative bg-white rounded-xl shadow-lg w-full max-w-md mx-4 z-[101] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-lg font-semibold text-neutral-dark">
                    폴더 선택
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

                <div className="mb-4">
                  <p className="text-sm text-neutral-dark mb-2 line-clamp-1">
                    "{title}" 북마크를 저장할 폴더를 선택해주세요.
                  </p>
                </div>

                <Button
                  variant="outline"
                  className="w-full mb-4 flex items-center justify-center space-x-1 py-5 border-dashed border-2"
                  onClick={() => setShowNewFolderModal(true)}
                  disabled={savingToFolder}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  <span>새 폴더 만들기</span>
                </Button>

                <div className="max-h-60 overflow-y-auto">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="animate-spin h-8 w-8 border-4 border-primary-color/20 border-t-primary-color rounded-full"></div>
                      <p className="text-sm text-neutral-dark mt-3">
                        불러오는 중...
                      </p>
                    </div>
                  ) : error ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <p className="text-red-500 text-sm">{error}</p>
                      <Button
                        variant="link"
                        className="mt-2"
                        onClick={fetchFolders}
                      >
                        다시 시도
                      </Button>
                    </div>
                  ) : folders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <FolderPlus className="h-12 w-12 text-neutral-300" />
                      <p className="text-neutral-500 mt-3">
                        폴더가 없습니다. 새 폴더를 생성해주세요.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {folders.map((folder) => (
                        <button
                          key={folder.id}
                          className={`w-full text-left py-3 px-4 rounded-md hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-color/30 ${
                            String(folder.id) === String(activeFolder)
                              ? "bg-primary-light text-primary-color"
                              : "text-neutral-dark"
                          }`}
                          onClick={() =>
                            handleFolderSelect(folder.id, folder.name)
                          }
                          disabled={savingToFolder}
                        >
                          <p className="font-medium text-neutral-dark">
                            {folder.name}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end mt-5">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="rounded-md"
                    disabled={savingToFolder}
                  >
                    취소
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <NewFolderModal
        isOpen={showNewFolderModal}
        onClose={() => setShowNewFolderModal(false)}
        onSuccess={handleNewFolderSuccess}
      />
    </>
  );
}
