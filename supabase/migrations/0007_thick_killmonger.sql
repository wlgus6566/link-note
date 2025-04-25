BEGIN;

-- digests 테이블에 user_id 열 추가
ALTER TABLE "digests" ADD COLUMN IF NOT EXISTS "user_id" text;

-- 외래 키 제약 조건 추가
ALTER TABLE "digests" ADD CONSTRAINT "digests_user_id_users_auth_id_fk" 
FOREIGN KEY ("user_id") REFERENCES "public"."users"("auth_id") 
ON DELETE cascade ON UPDATE no action;

COMMIT;