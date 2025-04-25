/**
 * 마이그레이션 문제 해결 가이드
 *
 * Supabase 마이그레이션 문제를 해결하기 위한 SQL 스크립트와 안내입니다.
 *
 * 현재 상황:
 * 1. drizzle ORM으로 생성된 마이그레이션 파일이 적용 과정에서 오류가 발생하고 있습니다.
 * 2. 문제: digests 테이블에 user_id 컬럼을 추가하고 외래 키 제약조건을 설정하는 과정에서 발생
 * 3. 오류 메시지: "constraint users_auth_id_key on table users because other objects depend on it"
 */

/**
 * 해결 방법 (Supabase 대시보드 SQL 편집기에서 실행)
 *
 * 1단계: digests 테이블에 user_id 컬럼 추가
 * ALTER TABLE "digests" ADD COLUMN IF NOT EXISTS "user_id" text;
 *
 * 2단계: 기존 북마크로부터 user_id 값 채우기
 * UPDATE "digests" d
 * SET "user_id" = b."user_id"
 * FROM "bookmarks" b
 * WHERE d."id" = b."digest_id" AND d."user_id" IS NULL;
 *
 * 3단계: 외래 키 제약조건 추가
 * ALTER TABLE "digests"
 * ADD CONSTRAINT "digests_user_id_users_auth_id_fk"
 * FOREIGN KEY ("user_id") REFERENCES "public"."users"("auth_id")
 * ON DELETE cascade ON UPDATE no action;
 */

// 프로젝트 코드에서의 후속 조치
/**
 * 마이그레이션 적용 후 필요한 조치:
 *
 * 1. drizzle 마이그레이션 파일 상태 동기화
 * - 마이그레이션이 수동으로 적용되었으므로 drizzle 상태를 업데이트해야 합니다.
 * - npx drizzle-kit push --dry-run 명령어로 현재 상태를 확인합니다.
 *
 * 2. 코드 조정
 * - 데이터 추가 시 "user_id" 필드가 설정되도록 관련 API 코드를 업데이트합니다.
 * - 새로운 digest가 생성될 때 자동으로 user_id가 채워지도록 합니다.
 *
 * 3. 마이그레이션 완료 검증
 * - 모든 digest 항목에 user_id가 제대로 설정되어 있는지 확인합니다.
 * - 다음 SQL로 확인: SELECT COUNT(*) FROM digests WHERE user_id IS NULL;
 * - 결과가 0인지 확인합니다.
 */

// 주의사항
/**
 * 이 문제의 근본 원인:
 *
 * 1. Drizzle ORM으로 스키마를 정의하면서 관계 구조와 참조 무결성에 변화가 발생했습니다.
 * 2. 기존 데이터가 포함된 상태에서 제약조건을 변경하려면 신중한 접근이 필요합니다.
 * 3. 온라인 Supabase 데이터베이스는 마이그레이션이 실패할 경우 롤백이 어려울 수 있습니다.
 *
 * 권장 사항:
 * - 항상 마이그레이션 전 데이터베이스 백업을 확보하세요.
 * - 가능하면 개발/스테이징 환경에서 먼저 마이그레이션을 테스트하세요.
 * - 마이그레이션 실패 시 수동 SQL을 사용하되, 단계별로 진행하세요.
 */
