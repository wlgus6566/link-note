import React, { useState, useEffect, useRef } from "react";
import { Filter, ChevronDown, CheckCircle } from "lucide-react";
import { SortType } from "@/types/digest";

interface SortDropdownProps {
  sortBy: SortType;
  onSortChange: (sort: SortType) => void;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({
  sortBy,
  onSortChange,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSortChange = (sortType: SortType) => {
    onSortChange(sortType);
    setShowDropdown(false);
  };

  // 정렬 타입에 따른 표시 텍스트
  const getSortLabel = (sort: SortType): string => {
    switch (sort) {
      case "latest":
        return "최신순";
      case "oldest":
        return "오래된순";
      case "popular":
        return "인기순";
      case "duration":
        return "길이순";
      default:
        return "최신순";
    }
  };

  return (
    <div className="relative sort-dropdown" ref={dropdownRef}>
      <button
        className="flex items-center gap-2 bg-white border border-border-line rounded-full px-4 py-1.5 text-sm text-neutral-dark focus:outline-none focus:border-primary-color hover:border-primary-color transition-colors"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <Filter className="h-4 w-4 text-neutral-medium" />
        <span>{getSortLabel(sortBy)}</span>
        <ChevronDown className="h-4 w-4 text-neutral-medium" />
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-1 min-w-32 bg-white rounded-xl shadow-lg border border-border-line z-10 overflow-hidden">
          <div className="max-h-60 overflow-y-auto py-1 overscroll-contain">
            <div className="flex flex-col py-2">
              {[
                { id: "latest", label: "최신순" },
                { id: "oldest", label: "오래된순" },
                { id: "popular", label: "인기순" },
                { id: "duration", label: "길이순" },
              ].map((option) => (
                <button
                  key={option.id}
                  className="px-3 py-2 text-left hover:bg-neutral-100 text-sm flex items-center"
                  onClick={() => handleSortChange(option.id as SortType)}
                >
                  {sortBy === option.id ? (
                    <CheckCircle className="h-4 w-4 text-primary-color mr-2" />
                  ) : (
                    <span className="w-4 mr-2"></span>
                  )}
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
