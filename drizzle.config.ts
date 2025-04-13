import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";

// .env.local 파일 로드
dotenv.config({ path: ".env" });

// 환경 변수에서 데이터베이스 URL 가져오기
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL 환경 변수가 설정되지 않았습니다.");
}

export default {
  schema: "./db/schema.ts",
  out: "./supabase/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
  // 마이그레이션 테이블 이름 설정
  tablesFilter: ["!_drizzle_migrations"],
} satisfies Config;
