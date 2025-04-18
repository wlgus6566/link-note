import { sql } from "drizzle-orm";
import {
  pgTable,
  serial,
  varchar,
  integer,
  text,
  timestamp,
  boolean,
  json,
} from "drizzle-orm/pg-core";

// 다이제스트(요약) 테이블
export const digests = pgTable("digests", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  summary: text("summary").notNull(),
  content: text("content").notNull(),
  source_url: varchar("source_url", { length: 512 }),
  source_type: varchar("source_type", { length: 50 }),
  image: varchar("image", { length: 512 }),
  tags: json("tags").$type<string[]>().default([]),
  author: json("author").$type<{
    name: string;
    avatar?: string;
    role?: string;
  }>(),
  date: timestamp("date").defaultNow(),
  read_time: varchar("read_time", { length: 20 }).default("3분 소요"),
  video_info: json("video_info").$type<{
    videoId?: string;
    channelId?: string;
    channelTitle?: string;
    publishedAt?: string;
    viewCount?: string;
    duration?: string;
  }>(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// 사용자 테이블
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  auth_id: varchar("auth_id", { length: 128 }).unique(),
  email: varchar("email", { length: 256 }).unique(),
  name: varchar("name", { length: 256 }),
  avatar: varchar("avatar", { length: 512 }),
  is_admin: boolean("is_admin").default(false),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// 북마크 테이블
export const bookmarks = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  digest_id: integer("digest_id").references(() => digests.id, {
    onDelete: "cascade",
  }),
  created_at: timestamp("created_at").defaultNow(),
});

// 타임라인 북마크 테이블
export const timelineBookmarks = pgTable("timeline_bookmarks", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  digest_id: integer("digest_id").references(() => digests.id, {
    onDelete: "cascade",
  }),
  timeline_id: varchar("timeline_id", { length: 128 }).notNull(),
  seconds: integer("seconds").notNull(),
  text: text("text").notNull(),
  memo: text("memo"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// 폴더 테이블 정의 (사용자의 북마크 폴더)
export const folders = pgTable("folders", {
  id: serial("id").primaryKey(),
  user_id: text("user_id")
    .notNull()
    .references(() => users.auth_id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// 폴더-북마크 관계 테이블 정의
export const folderBookmarks = pgTable("folder_bookmarks", {
  id: serial("id").primaryKey(),
  folder_id: integer("folder_id")
    .notNull()
    .references(() => folders.id, { onDelete: "cascade" }),
  bookmark_id: integer("bookmark_id")
    .notNull()
    .references(() => bookmarks.id, { onDelete: "cascade" }),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export type Folder = typeof folders.$inferSelect;
export type NewFolder = typeof folders.$inferInsert;

export type FolderBookmark = typeof folderBookmarks.$inferSelect;
export type NewFolderBookmark = typeof folderBookmarks.$inferInsert;
