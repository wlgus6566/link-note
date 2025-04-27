-- 기존의 RLS 정책 제거
DROP POLICY IF EXISTS translated_paragraphs_auth_all ON translated_paragraphs;
DROP POLICY IF EXISTS translated_paragraphs_anon_select ON translated_paragraphs;

-- 테이블이 없는 경우를 대비해 CREATE IF NOT EXISTS 사용
CREATE TABLE IF NOT EXISTS translated_paragraphs (
  id BIGSERIAL PRIMARY KEY,
  digest_id BIGINT NOT NULL REFERENCES digests(id) ON DELETE CASCADE,
  language VARCHAR(10) NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (digest_id, language)
);

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_translated_paragraphs_digest_id ON translated_paragraphs(digest_id);
CREATE INDEX IF NOT EXISTS idx_translated_paragraphs_language ON translated_paragraphs(language);

-- RLS 활성화
ALTER TABLE translated_paragraphs ENABLE ROW LEVEL SECURITY;

-- 모든 인증된 사용자는 SELECT 가능
CREATE POLICY translated_paragraphs_auth_select
  ON translated_paragraphs
  FOR SELECT
  TO authenticated
  USING (true);

-- 모든 인증된 사용자는 INSERT 가능
CREATE POLICY translated_paragraphs_auth_insert
  ON translated_paragraphs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 모든 인증된 사용자는 UPDATE 가능
CREATE POLICY translated_paragraphs_auth_update
  ON translated_paragraphs
  FOR UPDATE
  TO authenticated
  USING (true);

-- 모든 인증된 사용자는 DELETE 가능
CREATE POLICY translated_paragraphs_auth_delete
  ON translated_paragraphs
  FOR DELETE
  TO authenticated
  USING (true);

-- 익명 사용자는 읽기만 가능
CREATE POLICY translated_paragraphs_anon_select
  ON translated_paragraphs
  FOR SELECT
  TO anon
  USING (true); 