"use client";
import {
  BookOpen,
  Youtube,
  Instagram,
  Twitter,
  Bookmark,
  BookmarkCheck,
  Share2,
  Search,
  Home,
  User,
  Settings,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
export default function DesignSystem() {
  return (
    <div className="min-h-screen bg-secondary p-6 md:p-10 font-inter">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-neutral-dark mb-2">
          TubeLink 디자인 시스템
        </h1>
        <p className="text-neutral-medium">
          YouTube 영상 요약 및 타임라인 북마크를 위한 디자인 가이드
        </p>
      </header>

      {/* 컬러 시스템 */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-neutral-dark mb-6">
          컬러 시스템
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ColorCard name="Primary" hex="#FF0000" textColor="white" />
          <ColorCard name="Primary Light" hex="#FFEBEB" textColor="#FF0000" />
          <ColorCard name="Secondary" hex="#F9F9F9" textColor="#282828" />
          <ColorCard name="Neutral Dark" hex="#282828" textColor="white" />
          <ColorCard name="Neutral Medium" hex="#606060" textColor="white" />
          <ColorCard name="Border / Line" hex="#E5E5E5" textColor="#282828" />
          <ColorCard name="Success" hex="#2BA640" textColor="white" />
          <ColorCard name="Warning" hex="#FFC107" textColor="white" />
        </div>
      </section>

      {/* 타이포그래피 */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-neutral-dark mb-6">
          타이포그래피
        </h2>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E5E5E5]">
          <div className="mb-6">
            <span className="text-sm text-neutral-medium mb-2 block">
              Title (H1) - 24px, 700
            </span>
            <h1 className="text-2xl font-bold text-neutral-dark">
              콘텐츠 제목, 섹션 타이틀
            </h1>
          </div>
          <div className="mb-6">
            <span className="text-sm text-neutral-medium mb-2 block">
              Subtitle (H2) - 20px, 600
            </span>
            <h2 className="text-xl font-semibold text-neutral-dark">
              카드 제목, 버튼 제목
            </h2>
          </div>
          <div className="mb-6">
            <span className="text-sm text-neutral-medium mb-2 block">
              Body - 16px, 400~500
            </span>
            <p className="text-base text-neutral-dark">
              요약 내용, 일반 설명 텍스트입니다. 이 텍스트는 앱 내에서 주로
              콘텐츠 요약과 설명에 사용됩니다.
            </p>
          </div>
          <div className="mb-6">
            <span className="text-sm text-neutral-medium mb-2 block">
              Caption - 14px, 400
            </span>
            <p className="text-sm text-neutral-medium">
              날짜, 출처, 라벨 등에 사용되는 작은 텍스트입니다.
            </p>
          </div>
          <div>
            <span className="text-sm text-neutral-medium mb-2 block">
              Button Text - 16px, 600
            </span>
            <span className="text-base font-semibold text-primary">
              CTA 버튼 내 텍스트
            </span>
          </div>
        </div>
      </section>

      {/* 버튼 스타일 */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-neutral-dark mb-6">
          버튼 스타일
        </h2>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E5E5E5]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-neutral-dark mb-4">
                기본형 (Primary)
              </h3>
              <div className="space-y-4">
                <button className="bg-primary text-white font-semibold py-3 px-6 rounded-lg w-full">
                  기본 버튼
                </button>
                <button className="bg-primary text-white font-semibold py-3 px-6 rounded-lg w-full opacity-80">
                  Hover 상태
                </button>
                <button className="bg-primary text-white font-semibold py-3 px-6 rounded-lg w-full opacity-60">
                  Disabled 상태
                </button>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-neutral-dark mb-4">
                보조형 (Secondary)
              </h3>
              <div className="space-y-4">
                <button className="bg-transparent border border-primary text-primary font-semibold py-3 px-6 rounded-lg w-full">
                  보조 버튼
                </button>
                <button className="bg-primary-light border border-primary text-primary font-semibold py-3 px-6 rounded-lg w-full">
                  Hover 상태
                </button>
                <button className="bg-transparent border border-primary text-primary font-semibold py-3 px-6 rounded-lg w-full opacity-60">
                  Disabled 상태
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 아이콘 */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-neutral-dark mb-6">
          아이콘 & 썸네일 스타일
        </h2>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E5E5E5]">
          <h3 className="text-lg font-medium text-neutral-dark mb-4">
            기본 아이콘 (24px)
          </h3>
          <div className="flex flex-wrap gap-6 mb-8">
            <div className="flex flex-col items-center">
              <BookOpen size={24} className="text-primary mb-2" />
              <span className="text-xs text-neutral-medium">BookOpen</span>
            </div>
            <div className="flex flex-col items-center">
              <Bookmark size={24} className="text-primary mb-2" />
              <span className="text-xs text-neutral-medium">Bookmark</span>
            </div>
            <div className="flex flex-col items-center">
              <BookmarkCheck size={24} className="text-primary mb-2" />
              <span className="text-xs text-neutral-medium">BookmarkCheck</span>
            </div>
            <div className="flex flex-col items-center">
              <Share2 size={24} className="text-primary mb-2" />
              <span className="text-xs text-neutral-medium">Share</span>
            </div>
            <div className="flex flex-col items-center">
              <Search size={24} className="text-primary mb-2" />
              <span className="text-xs text-neutral-medium">Search</span>
            </div>
            <div className="flex flex-col items-center">
              <Settings size={24} className="text-primary mb-2" />
              <span className="text-xs text-neutral-medium">Settings</span>
            </div>
          </div>

          <h3 className="text-lg font-medium text-neutral-dark mb-4">
            탭 아이콘 (28px)
          </h3>
          <div className="flex flex-wrap gap-6 mb-8">
            <div className="flex flex-col items-center">
              <Home size={28} className="text-primary mb-2" />
              <span className="text-xs text-neutral-medium">Home</span>
            </div>
            <div className="flex flex-col items-center">
              <BookOpen size={28} className="text-primary mb-2" />
              <span className="text-xs text-neutral-medium">Library</span>
            </div>
            <div className="flex flex-col items-center">
              <User size={28} className="text-primary mb-2" />
              <span className="text-xs text-neutral-medium">Profile</span>
            </div>
          </div>

          <h3 className="text-lg font-medium text-neutral-dark mb-4">
            플랫폼 아이콘
          </h3>
          <div className="flex flex-wrap gap-6 mb-8">
            <div className="flex flex-col items-center">
              <Youtube size={24} className="text-[#FF0000] mb-2" />
              <span className="text-xs text-neutral-medium">YouTube</span>
            </div>
            <div className="flex flex-col items-center">
              <Instagram size={24} className="text-[#E1306C] mb-2" />
              <span className="text-xs text-neutral-medium">Instagram</span>
            </div>
            <div className="flex flex-col items-center">
              <Twitter size={24} className="text-[#1DA1F2] mb-2" />
              <span className="text-xs text-neutral-medium">Twitter</span>
            </div>
          </div>

          <h3 className="text-lg font-medium text-neutral-dark mb-4">
            상태 아이콘
          </h3>
          <div className="flex flex-wrap gap-6">
            <div className="flex flex-col items-center">
              <CheckCircle size={24} className="text-[#2BA640] mb-2" />
              <span className="text-xs text-neutral-medium">Success</span>
            </div>
            <div className="flex flex-col items-center">
              <AlertTriangle size={24} className="text-[#FFC107] mb-2" />
              <span className="text-xs text-neutral-medium">Warning</span>
            </div>
          </div>
        </div>
      </section>

      {/* 요약 콘텐츠 카드 */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-neutral-dark mb-6">
          요약 콘텐츠 카드
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 가로형 카드 */}
          <div className="bg-white rounded-xl shadow-sm border border-[#E5E5E5] overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3 h-48 md:h-auto relative">
                <img
                  src="/placeholder.svg?height=200&width=200"
                  alt="콘텐츠 썸네일"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-white rounded-full p-1">
                  <Youtube size={16} className="text-[#FF0000]" />
                </div>
              </div>
              <div className="p-4 md:w-2/3 flex flex-col">
                <h3 className="text-xl font-semibold text-neutral-dark mb-2 line-clamp-2">
                  인공지능의 미래: 2025년 전망과 산업 영향
                </h3>
                <p className="text-neutral-medium text-sm mb-4 line-clamp-3">
                  이 영상은 2025년 인공지능 기술의 발전 방향과 산업에 미치는
                  영향에 대해 분석합니다. 특히 생성형 AI와 자율주행 기술의
                  발전이 주목됩니다.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs bg-primary-light text-primary px-2 py-1 rounded-full">
                    AI
                  </span>
                  <span className="text-xs bg-primary-light text-primary px-2 py-1 rounded-full">
                    기술
                  </span>
                  <span className="text-xs bg-primary-light text-primary px-2 py-1 rounded-full">
                    미래
                  </span>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs text-neutral-medium">
                    2023년 12월 15일
                  </span>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-primary-light rounded-full">
                      <Bookmark size={20} className="text-primary" />
                    </button>
                    <button className="p-2 hover:bg-primary-light rounded-full">
                      <Share2 size={20} className="text-primary" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 세로형 카드 */}
          <div className="bg-white rounded-xl shadow-sm border border-[#E5E5E5] overflow-hidden">
            <div className="relative h-48">
              <img
                src="/placeholder.svg?height=200&width=400"
                alt="콘텐츠 썸네일"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-white rounded-full p-1">
                <Youtube size={16} className="text-[#FF0000]" />
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-xl font-semibold text-neutral-dark mb-2 line-clamp-2">
                효과적인 프로그래밍 학습법: 10가지 팁
              </h3>
              <p className="text-neutral-medium text-sm mb-4 line-clamp-3">
                개발자가 추천하는 효과적인 프로그래밍 학습을 위한 10가지 실천
                가능한 팁을 소개합니다. 체계적인 학습 방법과 실전 프로젝트의
                중요성이 강조됩니다.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs bg-primary-light text-primary px-2 py-1 rounded-full">
                  프로그래밍
                </span>
                <span className="text-xs bg-primary-light text-primary px-2 py-1 rounded-full">
                  학습법
                </span>
                <span className="text-xs bg-primary-light text-primary px-2 py-1 rounded-full">
                  개발
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-medium">
                  2023년 12월 10일
                </span>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-primary-light rounded-full">
                    <BookmarkCheck size={20} className="text-primary" />
                  </button>
                  <button className="p-2 hover:bg-primary-light rounded-full">
                    <Share2 size={20} className="text-primary" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 앱 예시 */}
      <section>
        <h2 className="text-2xl font-semibold text-neutral-dark mb-6">
          앱 예시
        </h2>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E5E5E5]">
          <div className="max-w-md mx-auto">
            {/* 앱 헤더 */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Youtube size={24} className="text-primary" />
                <h1 className="text-xl font-bold text-neutral-dark">
                  TubeLink
                </h1>
              </div>
              <button className="p-2 hover:bg-primary-light rounded-full">
                <Settings size={20} className="text-neutral-medium" />
              </button>
            </div>

            {/* 검색 바 */}
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="검색어를 입력하세요"
                className="w-full py-3 pl-10 pr-4 rounded-lg border border-[#E5E5E5] focus:outline-none focus:border-primary"
              />
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-medium"
              />
            </div>

            {/* 카테고리 필터 */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
              <button className="bg-primary text-white text-sm font-medium px-4 py-2 rounded-full whitespace-nowrap">
                전체
              </button>
              <button className="bg-white border border-[#E5E5E5] text-neutral-medium text-sm font-medium px-4 py-2 rounded-full whitespace-nowrap">
                기술
              </button>
              <button className="bg-white border border-[#E5E5E5] text-neutral-medium text-sm font-medium px-4 py-2 rounded-full whitespace-nowrap">
                교육
              </button>
              <button className="bg-white border border-[#E5E5E5] text-neutral-medium text-sm font-medium px-4 py-2 rounded-full whitespace-nowrap">
                엔터테인먼트
              </button>
              <button className="bg-white border border-[#E5E5E5] text-neutral-medium text-sm font-medium px-4 py-2 rounded-full whitespace-nowrap">
                게임
              </button>
            </div>

            {/* 콘텐츠 카드 */}
            <div className="space-y-4 mb-6">
              <div className="bg-white rounded-xl shadow-sm border border-[#E5E5E5] overflow-hidden">
                <div className="flex">
                  <div className="w-1/3 h-24 relative">
                    <img
                      src="/placeholder.svg?height=100&width=100"
                      alt="콘텐츠 썸네일"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-white rounded-full p-1">
                      <Youtube size={12} className="text-[#FF0000]" />
                    </div>
                  </div>
                  <div className="p-3 w-2/3">
                    <h3 className="text-base font-semibold text-neutral-dark mb-1 line-clamp-1">
                      인공지능의 미래: 2025년 전망
                    </h3>
                    <p className="text-neutral-medium text-xs mb-2 line-clamp-2">
                      이 영상은 2025년 인공지능 기술의 발전 방향과 산업에 미치는
                      영향에 대해 분석합니다.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-medium">
                        12월 15일
                      </span>
                      <button className="p-1 hover:bg-primary-light rounded-full">
                        <Bookmark size={16} className="text-primary" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-[#E5E5E5] overflow-hidden">
                <div className="flex">
                  <div className="w-1/3 h-24 relative">
                    <img
                      src="/placeholder.svg?height=100&width=100"
                      alt="콘텐츠 썸네일"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-white rounded-full p-1">
                      <Youtube size={12} className="text-[#FF0000]" />
                    </div>
                  </div>
                  <div className="p-3 w-2/3">
                    <h3 className="text-base font-semibold text-neutral-dark mb-1 line-clamp-1">
                      효과적인 프로그래밍 학습법: 10가지 팁
                    </h3>
                    <p className="text-neutral-medium text-xs mb-2 line-clamp-2">
                      개발자가 추천하는 효과적인 프로그래밍 학습을 위한 10가지
                      실천 가능한 팁을 소개합니다.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-medium">
                        12월 10일
                      </span>
                      <button className="p-1 hover:bg-primary-light rounded-full">
                        <BookmarkCheck size={16} className="text-primary" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 하단 탭 바 */}
            <div className="flex justify-around items-center py-4 bg-white rounded-full shadow-sm border border-[#E5E5E5]">
              <button className="flex flex-col items-center">
                <Home size={24} className="text-primary mb-1" />
                <span className="text-xs font-medium text-primary">홈</span>
              </button>
              <button className="flex flex-col items-center">
                <BookOpen size={24} className="text-neutral-medium mb-1" />
                <span className="text-xs font-medium text-neutral-medium">
                  라이브러리
                </span>
              </button>
              <button className="flex flex-col items-center">
                <User size={24} className="text-neutral-medium mb-1" />
                <span className="text-xs font-medium text-neutral-medium">
                  프로필
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// 컬러 카드 컴포넌트
function ColorCard({
  name,
  hex,
  textColor,
}: {
  name: string;
  hex: string;
  textColor: string;
}) {
  return (
    <div className="rounded-xl overflow-hidden border border-[#E5E5E5]">
      <div
        className="h-24 flex items-center justify-center"
        style={{ backgroundColor: hex, color: textColor }}
      >
        <span className="font-medium">{name}</span>
      </div>
      <div className="bg-white p-3 text-center">
        <span className="text-neutral-dark font-medium">{hex}</span>
      </div>
    </div>
  );
}
