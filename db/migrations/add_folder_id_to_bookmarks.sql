-- bookmarks 테이블에 folder_id 필드 추가
ALTER TABLE bookmarks ADD COLUMN folder_id UUID REFERENCES folders(id) ON DELETE SET NULL;

-- folder_bookmarks 관계 테이블에서 데이터 마이그레이션
UPDATE bookmarks b
SET folder_id = fb.folder_id
FROM folder_bookmarks fb
WHERE b.id = fb.bookmark_id;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS bookmarks_folder_id_idx ON bookmarks(folder_id);

COMMENT ON COLUMN bookmarks.folder_id IS '북마크가 속한 폴더 ID';

-- 기존 folder_bookmarks 테이블은 일단 유지하되, 필요에 따라 나중에 삭제할 수 있음 