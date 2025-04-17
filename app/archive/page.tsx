import Link from "next/link";
import Image from "next/image";
import { Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import BottomNav from "@/components/bottom-nav";

export default function ArchivePage() {
  // 샘플 데이터
  const archivedItems = [
    {
      id: 1,
      title: "인공지능의 미래: 2025년 전망",
      source: "YouTube",
      date: "2025.04.10",
      summary:
        "이 영상은 2025년 인공지능 기술의 발전 방향과 산업에 미치는 영향에 대해 분석합니다. 특히 생성형 AI와 자율주행 기술의 발전이 주목됩니다.",
      tags: ["AI", "기술", "미래", "트렌드"],
      image: "/placeholder.svg?height=200&width=400",
    },
    {
      id: 2,
      title: "최신 프론트엔드 기술 트렌드",
      source: "YouTube",
      date: "2025.04.08",
      summary:
        "2024년 프론트엔드 개발의 주요 기술 트렌드를 소개합니다. React 18의 새로운 기능과 Next.js, Svelte 등 최신 프레임워크의 발전 방향을 분석합니다.",
      tags: ["웹개발", "프론트엔드", "React", "트렌드"],
      image: "/placeholder.svg?height=200&width=400",
    },
    {
      id: 3,
      title: "효율적인 재택근무를 위한 환경 구성하기",
      source: "YouTube",
      date: "2025.04.05",
      summary:
        "재택근무의 생산성을 높이기 위한 환경 구성과 습관에 대해 다룹니다. 적절한 조명, 인체공학적 가구, 업무 루틴 설정의 중요성을 설명합니다.",
      tags: ["재택근무", "생산성", "업무환경", "라이프스타일"],
      image: "/placeholder.svg?height=200&width=400",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-16">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="text-lg font-bold">아카이브</div>
          <Link href="/settings">
            <Settings className="w-5 h-5 text-gray-600" />
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <div className="container px-4 py-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              className="pl-9 h-10 bg-white border-gray-200"
              placeholder="제목, 태그 또는 내용으로 검색"
              type="search"
            />
          </div>

          {/* <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
            <Button variant="outline" size="sm" className="text-xs whitespace-nowrap rounded-full">
              최신순
            </Button>
            <Button variant="outline" size="sm" className="text-xs whitespace-nowrap rounded-full">
              인기순
            </Button>
            <Button variant="outline" size="sm" className="text-xs whitespace-nowrap rounded-full">
              YouTube
            </Button>
            <Button variant="outline" size="sm" className="text-xs whitespace-nowrap rounded-full">
              블로그
            </Button>
          </div> */}

          <div className="space-y-3">
            {archivedItems.map((item) => (
              <Link href={`/digest/${item.id}`} key={item.id}>
                <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                  <div className="relative h-40 w-full">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge
                        variant="secondary"
                        className="bg-blue-500 text-white text-xs"
                      >
                        {item.source}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="text-xs text-gray-500 mb-1">
                      {item.date}
                    </div>
                    <h3 className="font-medium text-sm mb-1 line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                      {item.summary}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px]"
                        >
                          {tag}
                        </span>
                      ))}
                      {item.tags.length > 3 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-[10px]">
                          +{item.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
