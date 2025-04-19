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
  Trash2,
  MoreVertical,
  ChevronDown,
  X,
  Info,
  Bell,
  Clock,
  Filter,
  ArrowUpDown,
  HelpCircle,
} from "lucide-react";
import { useState } from "react";

export default function DesignSystem() {
  const [activeTab, setActiveTab] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const showToastMessage = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

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

      {/* 라이브러리 UI */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-neutral-dark mb-6">
          라이브러리 UI
        </h2>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E5E5E5]">
          <div className="max-w-md mx-auto">
            {/* 라이브러리 항목 */}
            <div className="space-y-4">
              {/* 항목 1 */}
              <div className="flex gap-3">
                <div className="relative w-32 h-20 flex-shrink-0">
                  <img
                    src="/placeholder.svg?height=80&width=128"
                    alt="비디오 썸네일"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1 rounded">
                    17:52
                  </div>
                  <div className="absolute bottom-0 left-0 bg-black bg-opacity-50 text-white text-sm p-1 w-full">
                    <span className="font-bold">게임 이론</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="flex items-start justify-between text-base font-medium text-neutral-dark line-clamp-2 mb-1">
                    <span className="text-primary line-clamp-2">
                      인생은 곧 게임 이론과 같다
                    </span>
                    <button className="mt-1">
                      <MoreVertical size={16} className="text-neutral-medium" />
                    </button>
                  </h3>
                  <p className="text-xs text-neutral-medium mb-1">
                    디글 클래식 · 조회수 25만회
                  </p>
                </div>
              </div>

              {/* 항목 2 */}
              <div className="flex gap-3">
                <div className="relative w-32 h-20 flex-shrink-0">
                  <img
                    src="/placeholder.svg?height=80&width=128"
                    alt="비디오 썸네일"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1 rounded">
                    22:44
                  </div>
                  <div className="absolute bottom-0 left-0 bg-black bg-opacity-50 text-white text-sm p-1 w-full">
                    <span className="font-bold text-red-500">
                      모르면 대체임
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="flex items-start justify-between text-base font-medium text-neutral-dark line-clamp-2 mb-1">
                    <span className="text-primary line-clamp-2">
                      Make 자동화 플랫폼! AI 에이전트 출시, 30분 완벽 마스터
                    </span>
                    <button className="mt-1">
                      <MoreVertical size={16} className="text-neutral-medium" />
                    </button>
                  </h3>
                  <p className="text-xs text-neutral-medium mb-1">
                    퀀텀점프클럽(QJC) · 조회수 520회
                  </p>
                </div>
              </div>

              {/* 항목 3 */}
              <div className="flex gap-3">
                <div className="relative w-32 h-20 flex-shrink-0">
                  <img
                    src="/placeholder.svg?height=80&width=128"
                    alt="비디오 썸네일"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1 rounded">
                    26:36
                  </div>
                  <div className="absolute bottom-0 left-0 bg-black bg-opacity-50 text-white text-sm p-1 w-full">
                    <span className="font-bold text-red-500">AM 3:00</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="flex items-start justify-between text-base font-medium text-neutral-dark line-clamp-2 mb-1">
                    <span className="text-primary line-clamp-2">
                      새벽 3시 하이디라오 감성 모르면 나가라
                    </span>
                    <button className="mt-1">
                      <MoreVertical size={16} className="text-neutral-medium" />
                    </button>
                  </h3>
                  <p className="text-xs text-neutral-medium mb-1">
                    삼대장 Samdaejang · 조회수 11만회
                  </p>
                </div>
              </div>
            </div>

            {/* 라이브러리 메뉴 */}
            <div className="mt-8 bg-white rounded-xl shadow-md border border-[#E5E5E5] overflow-hidden">
              <div className="p-4 space-y-6">
                <div className="flex items-center gap-4">
                  <Trash2 size={24} className="text-neutral-dark" />
                  <span className="text-neutral-dark">삭제</span>
                </div>
                <div className="flex items-center gap-4">
                  <Share2 size={24} className="text-neutral-dark" />
                  <span className="text-neutral-dark">공유</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 뱃지 스타일 */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-neutral-dark mb-6">
          뱃지 스타일
        </h2>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E5E5E5]">
          <h3 className="text-lg font-medium text-neutral-dark mb-4">
            기본 뱃지
          </h3>
          <div className="flex flex-wrap gap-3 mb-6">
            <span className="text-xs bg-primary-light text-primary px-3 py-1.5 rounded-full font-medium">
              AI
            </span>
            <span className="text-xs bg-primary-light text-primary px-3 py-1.5 rounded-full font-medium">
              기술
            </span>
            <span className="text-xs bg-primary-light text-primary px-3 py-1.5 rounded-full font-medium">
              프로그래밍
            </span>
            <span className="text-xs bg-primary-light text-primary px-3 py-1.5 rounded-full font-medium">
              교육
            </span>
          </div>

          <h3 className="text-lg font-medium text-neutral-dark mb-4">
            상태 뱃지
          </h3>
          <div className="flex flex-wrap gap-3 mb-6">
            <span className="text-xs bg-[#E8F5E9] text-[#2BA640] px-3 py-1.5 rounded-full font-medium flex items-center gap-1">
              <CheckCircle size={12} />
              완료됨
            </span>
            <span className="text-xs bg-[#FFF8E1] text-[#FFA000] px-3 py-1.5 rounded-full font-medium flex items-center gap-1">
              <AlertTriangle size={12} />
              주의 필요
            </span>
            <span className="text-xs bg-[#FFEBEE] text-[#D32F2F] px-3 py-1.5 rounded-full font-medium flex items-center gap-1">
              <X size={12} />
              오류
            </span>
            <span className="text-xs bg-[#E3F2FD] text-[#1976D2] px-3 py-1.5 rounded-full font-medium flex items-center gap-1">
              <Info size={12} />
              정보
            </span>
          </div>

          <h3 className="text-lg font-medium text-neutral-dark mb-4">
            알림 뱃지
          </h3>
          <div className="flex flex-wrap gap-6 mb-6">
            <div className="relative">
              <Bell size={24} className="text-neutral-dark" />
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                3
              </span>
            </div>
            <div className="relative">
              <Bookmark size={24} className="text-neutral-dark" />
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                5
              </span>
            </div>
            <div className="relative">
              <Clock size={24} className="text-neutral-dark" />
              <span className="absolute -top-1 -right-1 bg-[#2BA640] text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                2
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 정렬 메뉴 */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-neutral-dark mb-6">
          정렬 메뉴
        </h2>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E5E5E5]">
          <div className="flex flex-col gap-6">
            {/* 드롭다운 정렬 메뉴 */}
            <div className="relative inline-block">
              <button className="flex items-center gap-2 text-neutral-dark border border-[#E5E5E5] rounded-lg px-4 py-2">
                <Filter size={16} />
                <span>정렬 기준</span>
                <ChevronDown size={16} />
              </button>
              <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-md border border-[#E5E5E5] w-48 z-10">
                <ul className="py-1">
                  <li className="px-4 py-2 hover:bg-primary-light text-neutral-dark cursor-pointer flex items-center gap-2">
                    <CheckCircle size={16} className="text-primary" />
                    <span>최신순</span>
                  </li>
                  <li className="px-4 py-2 hover:bg-primary-light text-neutral-dark cursor-pointer flex items-center gap-2">
                    <span className="w-4"></span>
                    <span>인기순</span>
                  </li>
                  <li className="px-4 py-2 hover:bg-primary-light text-neutral-dark cursor-pointer flex items-center gap-2">
                    <span className="w-4"></span>
                    <span>제목순</span>
                  </li>
                  <li className="px-4 py-2 hover:bg-primary-light text-neutral-dark cursor-pointer flex items-center gap-2">
                    <span className="w-4"></span>
                    <span>길이순</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 정렬 버튼 그룹 */}
            <div className="flex flex-wrap gap-2">
              <button className="flex items-center gap-1 bg-primary text-white px-3 py-1.5 rounded-lg text-sm font-medium">
                <ArrowUpDown size={14} />
                <span>최신순</span>
              </button>
              <button className="flex items-center gap-1 bg-white border border-[#E5E5E5] text-neutral-dark px-3 py-1.5 rounded-lg text-sm font-medium">
                <span>인기순</span>
              </button>
              <button className="flex items-center gap-1 bg-white border border-[#E5E5E5] text-neutral-dark px-3 py-1.5 rounded-lg text-sm font-medium">
                <span>제목순</span>
              </button>
              <button className="flex items-center gap-1 bg-white border border-[#E5E5E5] text-neutral-dark px-3 py-1.5 rounded-lg text-sm font-medium">
                <span>길이순</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 알림창 */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-neutral-dark mb-6">
          알림창 (Alert / Toast)
        </h2>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E5E5E5]">
          <h3 className="text-lg font-medium text-neutral-dark mb-4">
            인라인 알림
          </h3>
          <div className="space-y-4 mb-6">
            <div className="bg-[#E8F5E9] border-l-4 border-[#2BA640] p-4 rounded-r-lg">
              <div className="flex items-start gap-3">
                <CheckCircle size={20} className="text-[#2BA640] mt-0.5" />
                <div>
                  <h4 className="text-[#2BA640] font-medium mb-1">성공</h4>
                  <p className="text-sm text-neutral-dark">
                    타임라인이 성공적으로 저장되었습니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#FFF8E1] border-l-4 border-[#FFA000] p-4 rounded-r-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-[#FFA000] mt-0.5" />
                <div>
                  <h4 className="text-[#FFA000] font-medium mb-1">주의</h4>
                  <p className="text-sm text-neutral-dark">
                    저장하지 않은 변경사항이 있습니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#FFEBEE] border-l-4 border-[#D32F2F] p-4 rounded-r-lg">
              <div className="flex items-start gap-3">
                <X size={20} className="text-[#D32F2F] mt-0.5" />
                <div>
                  <h4 className="text-[#D32F2F] font-medium mb-1">오류</h4>
                  <p className="text-sm text-neutral-dark">
                    타임라인을 저장하는 중 오류가 발생했습니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#E3F2FD] border-l-4 border-[#1976D2] p-4 rounded-r-lg">
              <div className="flex items-start gap-3">
                <Info size={20} className="text-[#1976D2] mt-0.5" />
                <div>
                  <h4 className="text-[#1976D2] font-medium mb-1">정보</h4>
                  <p className="text-sm text-neutral-dark">
                    새로운 기능이 추가되었습니다. 확인해보세요.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-medium text-neutral-dark mb-4">
            토스트 메시지
          </h3>
          <div className="mb-6">
            <button
              onClick={showToastMessage}
              className="bg-primary text-white font-medium py-2 px-4 rounded-lg"
            >
              토스트 메시지 표시
            </button>

            {showToast && (
              <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-neutral-dark text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-fade-in-up">
                <CheckCircle size={20} className="text-[#2BA640]" />
                <span>타임라인이 성공적으로 저장되었습니다.</span>
                <button onClick={() => setShowToast(false)} className="ml-2">
                  <X
                    size={16}
                    className="text-white opacity-70 hover:opacity-100"
                  />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 툴팁 */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-neutral-dark mb-6">
          툴팁 (Tooltip)
        </h2>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E5E5E5]">
          <div className="flex flex-wrap gap-8 justify-center">
            <div className="relative group">
              <button className="bg-primary text-white font-medium py-2 px-4 rounded-lg">
                위쪽 툴팁
              </button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-neutral-dark text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                타임라인 저장하기
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-8 border-transparent border-t-neutral-dark"></div>
              </div>
            </div>

            <div className="relative group">
              <button className="bg-primary text-white font-medium py-2 px-4 rounded-lg">
                아래쪽 툴팁
              </button>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-neutral-dark text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                북마크에 추가하기
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-8 border-transparent border-b-neutral-dark"></div>
              </div>
            </div>

            <div className="relative group">
              <button className="bg-primary text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2">
                <HelpCircle size={16} />
                <span>도움말</span>
              </button>
              <div className="absolute top-1/2 left-full transform -translate-y-1/2 ml-2 px-3 py-2 bg-neutral-dark text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                도움말 보기
                <div className="absolute top-1/2 right-full transform translate-y-1/2 border-8 border-transparent border-r-neutral-dark"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 배너 */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-neutral-dark mb-6">
          배너 (Banner)
        </h2>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E5E5E5]">
          <div className="space-y-6">
            {/* 프로모션 배너 */}
            <div className="bg-gradient-to-r from-primary to-[#FF4D4D] text-white p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg mb-1">
                    프리미엄으로 업그레이드
                  </h3>
                  <p className="text-sm opacity-90">
                    무제한 타임라인 저장 및 고급 기능 이용하기
                  </p>
                </div>
                <button className="bg-white text-primary font-medium py-2 px-4 rounded-lg text-sm">
                  자세히 보기
                </button>
              </div>
            </div>

            {/* 공지사항 배너 */}
            <div className="bg-[#E3F2FD] p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <Info size={24} className="text-[#1976D2]" />
                <div className="flex-1">
                  <h3 className="font-medium text-[#1976D2] mb-1">
                    새로운 기능 업데이트
                  </h3>
                  <p className="text-sm text-neutral-dark">
                    이제 타임라인을 친구와 공유할 수 있습니다.
                  </p>
                </div>
                <button className="text-[#1976D2]">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* 쿠키 정책 배너 */}
            <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg border-t border-[#E5E5E5] z-40">
              <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-sm text-neutral-dark">
                  <p>
                    이 웹사이트는 최상의 경험을 제공하기 위해 쿠키를 사용합니다.
                    계속 사용하시면 쿠키 사용에 동의하는 것으로 간주됩니다.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button className="bg-transparent border border-[#E5E5E5] text-neutral-dark px-4 py-2 rounded-lg text-sm font-medium">
                    거부
                  </button>
                  <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium">
                    동의
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 모달 */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-neutral-dark mb-6">
          모달 (Modal / Popup)
        </h2>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E5E5E5]">
          <div className="flex justify-center">
            <button
              onClick={() => setShowModal(true)}
              className="bg-primary text-white font-medium py-2 px-4 rounded-lg"
            >
              모달 열기
            </button>

            {showModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 animate-fade-in">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-neutral-dark">
                      타임라인 저장
                    </h3>
                    <button onClick={() => setShowModal(false)}>
                      <X
                        size={20}
                        className="text-neutral-medium hover:text-neutral-dark"
                      />
                    </button>
                  </div>
                  <div className="mb-6">
                    <p className="text-neutral-dark mb-4">
                      이 타임라인을 저장하시겠습니까?
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-neutral-medium mb-1">
                          제목
                        </label>
                        <input
                          type="text"
                          placeholder="타임라인 제목을 입력하세요"
                          className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-neutral-medium mb-1">
                          폴더
                        </label>
                        <select className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-primary">
                          <option>기본 폴더</option>
                          <option>학습 자료</option>
                          <option>관심 영상</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border border-[#E5E5E5] text-neutral-dark rounded-lg"
                    >
                      취소
                    </button>
                    <button className="px-4 py-2 bg-primary text-white rounded-lg">
                      저장
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 탭 UI */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-neutral-dark mb-6">탭 UI</h2>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E5E5E5]">
          {/* 기본 탭 */}
          <h3 className="text-lg font-medium text-neutral-dark mb-4">
            기본 탭
          </h3>
          <div className="mb-8">
            <div className="flex border-b border-[#E5E5E5]">
              <button
                onClick={() => setActiveTab(0)}
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 0
                    ? "text-primary border-b-2 border-primary"
                    : "text-neutral-medium"
                }`}
              >
                전체
              </button>
              <button
                onClick={() => setActiveTab(1)}
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 1
                    ? "text-primary border-b-2 border-primary"
                    : "text-neutral-medium"
                }`}
              >
                AI 전화 제안
              </button>
              <button
                onClick={() => setActiveTab(2)}
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 2
                    ? "text-primary border-b-2 border-primary"
                    : "text-neutral-medium"
                }`}
              >
                북마크
              </button>
            </div>
            <div className="p-4">
              {activeTab === 0 && (
                <div>
                  <p className="text-neutral-dark">
                    전체 콘텐츠 탭 내용입니다.
                  </p>
                </div>
              )}
              {activeTab === 1 && (
                <div>
                  <p className="text-neutral-dark">
                    AI 전화 제안 탭 내용입니다.
                  </p>
                </div>
              )}
              {activeTab === 2 && (
                <div>
                  <p className="text-neutral-dark">북마크 탭 내용입니다.</p>
                </div>
              )}
            </div>
          </div>

          {/* 아이콘 탭 */}
          <h3 className="text-lg font-medium text-neutral-dark mb-4">
            아이콘 탭
          </h3>
          <div className="mb-8">
            <div className="flex justify-around bg-[#F5F5F5] p-1 rounded-lg">
              <button
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg ${
                  activeTab === 0
                    ? "bg-white text-primary shadow-sm"
                    : "text-neutral-medium"
                }`}
                onClick={() => setActiveTab(0)}
              >
                <Home size={16} />
                <span className="font-medium text-sm">홈</span>
              </button>
              <button
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg ${
                  activeTab === 1
                    ? "bg-white text-primary shadow-sm"
                    : "text-neutral-medium"
                }`}
                onClick={() => setActiveTab(1)}
              >
                <BookOpen size={16} />
                <span className="font-medium text-sm">라이브러리</span>
              </button>
              <button
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg ${
                  activeTab === 2
                    ? "bg-white text-primary shadow-sm"
                    : "text-neutral-medium"
                }`}
                onClick={() => setActiveTab(2)}
              >
                <User size={16} />
                <span className="font-medium text-sm">프로필</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 가로 스크롤 */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-neutral-dark mb-6">
          가로 스크롤
        </h2>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E5E5E5]">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-neutral-dark">기록</h3>
              <button className="text-primary text-sm font-medium">
                모두 보기
              </button>
            </div>

            <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
              {/* 카드 1 */}
              <div className="min-w-[280px] flex-shrink-0 bg-white rounded-xl shadow-sm border border-[#E5E5E5] overflow-hidden">
                <div className="relative h-40">
                  <img
                    src="/placeholder.svg?height=160&width=280"
                    alt="비디오 썸네일"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-1 py-0.5 rounded">
                    21:03
                  </div>
                  <div className="absolute top-2 left-2 bg-white rounded-full p-1">
                    <Youtube size={14} className="text-[#FF0000]" />
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="text-base font-medium text-neutral-dark line-clamp-2 mb-1">
                    "한국이 다음이다"...최대 145% 트럼프 관세폭탄
                  </h4>
                  <p className="text-xs text-neutral-medium">
                    비디오머그 - VIDEOMUG
                  </p>
                </div>
              </div>

              {/* 카드 2 */}
              <div className="min-w-[280px] flex-shrink-0 bg-white rounded-xl shadow-sm border border-[#E5E5E5] overflow-hidden">
                <div className="relative h-40">
                  <img
                    src="/placeholder.svg?height=160&width=280"
                    alt="비디오 썸네일"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-1 py-0.5 rounded">
                    18:34
                  </div>
                  <div className="absolute top-2 left-2 bg-white rounded-full p-1">
                    <Youtube size={14} className="text-[#FF0000]" />
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="text-base font-medium text-neutral-dark line-clamp-2 mb-1">
                    [룩북 브이로그 / 168cm 65.5kg] 오늘의 코디
                  </h4>
                  <p className="text-xs text-neutral-medium">살빼조DietJo</p>
                </div>
              </div>

              {/* 카드 3 */}
              <div className="min-w-[280px] flex-shrink-0 bg-white rounded-xl shadow-sm border border-[#E5E5E5] overflow-hidden">
                <div className="relative h-40">
                  <img
                    src="/placeholder.svg?height=160&width=280"
                    alt="비디오 썸네일"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-1 py-0.5 rounded">
                    15:42
                  </div>
                  <div className="absolute top-2 left-2 bg-white rounded-full p-1">
                    <Youtube size={14} className="text-[#FF0000]" />
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="text-base font-medium text-neutral-dark line-clamp-2 mb-1">
                    AI를 이용한 웹 서비스 만들기 - 초보자도 할 수 있다
                  </h4>
                  <p className="text-xs text-neutral-medium">딩코딩코</p>
                </div>
              </div>

              {/* 카드 4 */}
              <div className="min-w-[280px] flex-shrink-0 bg-white rounded-xl shadow-sm border border-[#E5E5E5] overflow-hidden">
                <div className="relative h-40">
                  <img
                    src="/placeholder.svg?height=160&width=280"
                    alt="비디오 썸네일"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-1 py-0.5 rounded">
                    24:18
                  </div>
                  <div className="absolute top-2 left-2 bg-white rounded-full p-1">
                    <Youtube size={14} className="text-[#FF0000]" />
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="text-base font-medium text-neutral-dark line-clamp-2 mb-1">
                    프론트엔드 개발자가 알아야 할 10가지 JavaScript 팁
                  </h4>
                  <p className="text-xs text-neutral-medium">코딩애플</p>
                </div>
              </div>
            </div>
          </div>

          {/* 카테고리 가로 스크롤 */}
          <div>
            <h3 className="text-lg font-medium text-neutral-dark mb-4">
              카테고리
            </h3>
            <div className="flex overflow-x-auto gap-2 pb-4 no-scrollbar">
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
              <button className="bg-white border border-[#E5E5E5] text-neutral-medium text-sm font-medium px-4 py-2 rounded-full whitespace-nowrap">
                요리
              </button>
              <button className="bg-white border border-[#E5E5E5] text-neutral-medium text-sm font-medium px-4 py-2 rounded-full whitespace-nowrap">
                여행
              </button>
              <button className="bg-white border border-[#E5E5E5] text-neutral-medium text-sm font-medium px-4 py-2 rounded-full whitespace-nowrap">
                패션
              </button>
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
