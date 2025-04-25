# Supabase 마이그레이션 문제 해결 가이드

## 현재 상황

- Drizzle ORM으로 생성된 마이그레이션 파일이 적용 과정에서 오류가 발생하고 있습니다.
- 문제: `digests` 테이블에 `user_id` 컬럼을 추가하고 외래 키 제약조건을 설정하는 과정에서 발생
- 오류 메시지: `constraint users_auth_id_key on table users because other objects depend on it`

## 해결 방법 (Supabase 대시보드에서 실행)

### 1단계: 테이블 구조 확인

Supabase 대시보드의 SQL 에디터에서 다음 쿼리를 실행하여 현재 구조를 확인합니다:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'digests';
```

### 2단계: user_id 컬럼 추가

```sql
ALTER TABLE "digests" ADD COLUMN IF NOT EXISTS "user_id" text;
```

### 3단계: 북마크 데이터 기반으로 user_id 값 채우기

```sql
UPDATE "digests" d
SET "user_id" = b."user_id"
FROM "bookmarks" b
WHERE d."id" = b."digest_id" AND d."user_id" IS NULL;
```

### 4단계: 외래 키 제약조건 추가

```sql
ALTER TABLE "digests"
ADD CONSTRAINT "digests_user_id_users_auth_id_fk"
FOREIGN KEY ("user_id") REFERENCES "public"."users"("auth_id")
ON DELETE cascade ON UPDATE no action;
```

### 5단계: 마이그레이션 확인

```sql
-- user_id 컬럼 확인
SELECT COUNT(*) FROM digests WHERE user_id IS NULL;

-- 외래 키 제약조건 확인
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'digests' AND tc.constraint_type = 'FOREIGN KEY';
```

## 프로젝트 조치 사항

### 마이그레이션 상태 동기화

마이그레이션이 수동으로 적용되었으므로 Drizzle ORM 상태를 업데이트해야 합니다:

```bash
# 현재 상태 확인 (실제 변경 없음)
npx drizzle-kit push --dry-run

# 기존 마이그레이션으로 표시
npx drizzle-kit push
```

### API 업데이트

데이터 추가 시 `user_id` 필드가 자동으로 설정되도록 API 코드를 수정해야 합니다:

1. `app/api/digests/route.ts` 파일에서 다이제스트 생성 시 `user_id` 필드 추가
2. 관련 함수에서 `user_id` 설정 확인

## 마이그레이션 문제 방지 팁

1. **단계적 마이그레이션**: 복잡한 변경사항은 작은 단계로 나누어 진행하세요.
2. **테스트 환경**: 중요한 마이그레이션은 항상 개발/테스트 환경에서 먼저 시도하세요.
3. **백업 활용**: 마이그레이션 전 데이터베이스 백업을 확보하세요.
4. **기존 데이터 처리**: 마이그레이션이 기존 데이터에 미치는 영향을 항상 고려하세요.
5. **롤백 계획**: 마이그레이션이 실패할 경우 복구 방법을 준비하세요.

## 관련 리소스

- [Supabase 마이그레이션 가이드](https://supabase.com/docs/guides/database/overview)
- [Drizzle ORM 문서](https://orm.drizzle.team/docs/overview)
- [PostgreSQL 제약조건 관리](https://www.postgresql.org/docs/current/ddl-constraints.html)
