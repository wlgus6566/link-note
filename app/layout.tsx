import type React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { ClientOnlyThemeProvider } from "@/components/client-theme-provider";

export const metadata: Metadata = {
  title: "LinkDigest",
  description: "콘텐츠를 스마트하게 정리하세요",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background">
        <ClientOnlyThemeProvider>{children}</ClientOnlyThemeProvider>
      </body>
    </html>
  );
}

import "./globals.css";
