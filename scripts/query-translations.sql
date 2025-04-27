-- 번역 테이블 구조 확인
\d translated_paragraphs;

-- 테이블의 모든 번역 조회
SELECT id, digest_id, language, created_at, updated_at
FROM translated_paragraphs
ORDER BY updated_at DESC;

-- 특정 다이제스트의 번역 확인
SELECT id, digest_id, language, json_array_length(data) as paragraphs_count, created_at, updated_at
FROM translated_paragraphs
WHERE digest_id = :digest_id
ORDER BY language;

-- 특정 언어로 된 번역 조회
SELECT id, digest_id, language, json_array_length(data) as paragraphs_count
FROM translated_paragraphs
WHERE language = 'en'
ORDER BY updated_at DESC;

-- RLS 정책 확인
SELECT 
    tablename,
    policyname,
    roles,
    cmd,
    permissive
FROM pg_policies
WHERE tablename = 'translated_paragraphs';

-- 권한이 없는 경우 디버깅
SELECT
    grantee, privilege_type
FROM
    information_schema.role_table_grants
WHERE
    table_name = 'translated_paragraphs';

-- 테이블 검사 및 정리 (문제 해결 후)
VACUUM ANALYZE translated_paragraphs; 