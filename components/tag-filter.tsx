import React from "react";

interface TagFilterProps {
  tags: string[];
  activeTag: string;
  onTagSelect: (tag: string) => void;
}

export const TagFilter: React.FC<TagFilterProps> = ({
  tags,
  activeTag,
  onTagSelect,
}) => {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <button
        className={`px-3 py-1 rounded-full text-sm ${
          activeTag === "전체"
            ? "bg-primary-color text-white"
            : "bg-white border border-border-line text-neutral-medium"
        }`}
        onClick={() => onTagSelect("전체")}
      >
        전체
      </button>

      {tags.map((tag) => (
        <button
          key={tag}
          className={`px-3 py-1 rounded-full text-sm ${
            activeTag === tag
              ? "bg-primary-color text-white"
              : "bg-white border border-border-line text-neutral-medium"
          }`}
          onClick={() => onTagSelect(tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  );
};
