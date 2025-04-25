import type React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { ClientOnlyThemeProvider } from "@/components/client-theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { ToastProvider, GlobalDesignToast } from "@/components/ui/toast";
import BottomNav from "@/components/bottom-nav";
export const metadata: Metadata = {
  title: "TubeLink",
  description: "유튜브 영상을 스마트하게 정리하세요",
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
        <ToastProvider>
          <ClientOnlyThemeProvider>{children}</ClientOnlyThemeProvider>
          <Toaster />
          <GlobalDesignToast />
          <BottomNav />
        </ToastProvider>
      </body>
    </html>
  );
}
