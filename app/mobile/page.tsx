import React from "react";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-static";

export default function MobilePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-center mb-6">
          <h1 className="text-2xl font-bold text-blue-600">Link Note 모바일</h1>
        </div>

        <div className="mb-8 text-center">
          <p className="text-gray-700 mb-4">
            Link Note 모바일 앱에 오신 것을 환영합니다!
          </p>
          <p className="text-gray-600 text-sm">
            모바일 앱 기능은 현재 개발 중입니다. 더 많은 기능을 웹 버전에서
            이용해보세요.
          </p>
        </div>

        <div className="space-y-4">
          <a
            href="https://link-note-jihyeon.vercel.app"
            className="block w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-center transition-colors"
          >
            웹사이트 방문하기
          </a>

          <button
            className="block w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg text-center transition-colors"
            onClick={() => alert("준비 중인 기능입니다.")}
          >
            오프라인으로 저장
          </button>
        </div>
      </div>

      <div className="mt-8 text-center text-gray-500 text-xs">
        <p>© 2024 Link Note. All rights reserved.</p>
      </div>
    </div>
  );
}
