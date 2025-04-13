import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// 클라이언트 환경에서는 실행하지 않도록 처리
let db: PostgresJsDatabase<typeof schema>;

// 서버 환경에서만 DB 클라이언트 초기화
if (typeof window === "undefined") {
  // DB 연결 문자열
  const connectionString = process.env.DATABASE_URL!;

  // PostgreSQL 클라이언트
  const client = postgres(connectionString);

  // Drizzle ORM 인스턴스 생성
  db = drizzle(client, {
    schema,
  });
} else {
  // 클라이언트 환경에서는 더미 객체 생성
  const dummyClient = {} as PostgresJsDatabase<typeof schema>;
  db = dummyClient;
}

export { db };
