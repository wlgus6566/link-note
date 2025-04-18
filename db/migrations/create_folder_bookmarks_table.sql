-- folder_bookmarks 테이블 생성
CREATE TABLE IF NOT EXISTS "folder_bookmarks" (
  "id" SERIAL PRIMARY KEY,
  "folder_id" INTEGER NOT NULL REFERENCES "folders" ("id") ON DELETE CASCADE,
  "bookmark_id" INTEGER NOT NULL REFERENCES "bookmarks" ("id") ON DELETE CASCADE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  UNIQUE ("folder_id", "bookmark_id")
);

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS "folder_bookmarks_folder_id_idx" ON "folder_bookmarks" ("folder_id");
CREATE INDEX IF NOT EXISTS "folder_bookmarks_bookmark_id_idx" ON "folder_bookmarks" ("bookmark_id");

COMMENT ON TABLE "folder_bookmarks" IS '폴더와 북마크의 관계를 저장하는 테이블';
COMMENT ON COLUMN "folder_bookmarks"."folder_id" IS '폴더 ID';
COMMENT ON COLUMN "folder_bookmarks"."bookmark_id" IS '북마크 ID';
COMMENT ON COLUMN "folder_bookmarks"."created_at" IS '생성 시간'; 