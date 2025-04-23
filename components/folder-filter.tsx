import React from "react";
import { Plus } from "lucide-react";
import { FolderType } from "@/types/digest";

interface FolderFilterProps {
  folders: FolderType[];
  activeFolder: string | null;
  onFolderSelect: (folderId: string | null) => void;
  onAddFolder?: () => void;
}

export const FolderFilter: React.FC<FolderFilterProps> = ({
  folders,
  activeFolder,
  onFolderSelect,
  onAddFolder,
}) => {
  return (
    <div className="flex overflow-x-auto gap-2 pb-2 mb-2 no-scrollbar">
      <button
        className={`${
          !activeFolder
            ? "bg-primary-color text-white"
            : "bg-white border border-border-line text-neutral-medium"
        } text-sm font-medium px-4 py-2 rounded-full whitespace-nowrap`}
        onClick={() => onFolderSelect(null)}
      >
        전체 폴더
      </button>

      {folders.map((folder) => (
        <button
          key={folder.id}
          className={`${
            activeFolder === folder.id
              ? "bg-primary-color text-white"
              : "bg-white border border-border-line text-neutral-medium"
          } text-sm font-medium px-4 py-2 rounded-full whitespace-nowrap`}
          onClick={() => onFolderSelect(folder.id)}
        >
          {folder.name}
        </button>
      ))}

      {onAddFolder && (
        <button
          className="bg-white border border-border-line text-neutral-medium text-sm font-medium px-4 py-2 rounded-full whitespace-nowrap flex items-center gap-1"
          onClick={onAddFolder}
        >
          <Plus className="h-4 w-4" />새 폴더
        </button>
      )}
    </div>
  );
};
