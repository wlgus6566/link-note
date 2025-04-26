-- 번역된 문단을 저장하기 위한 새 테이블 생성
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

-- 테이블에 대한 RLS(Row Level Security) 설정
ALTER TABLE translated_paragraphs ENABLE ROW LEVEL SECURITY;

-- 인증된 사용자는 모든 작업 가능
CREATE POLICY translated_paragraphs_auth_all
  ON translated_paragraphs
  FOR ALL
  TO authenticated
  USING (true);

-- 익명 사용자는 읽기만 가능
CREATE POLICY translated_paragraphs_anon_select
  ON translated_paragraphs
  FOR SELECT
  TO anon
  USING (true); 