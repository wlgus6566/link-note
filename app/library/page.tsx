import Link from "next/link";
import Image from "next/image";
import { Search, Filter, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BottomNav from "@/components/bottom-nav";

export default function LibraryPage() {
  // 샘플 데이터
  const savedContent = [
    {
      id: 1,
      title: "인공지능의 미래: 2025년 전망",
      source: "YouTube",
      date: "4월 10일",
      summary:
        "이 영상은 2025년 인공지능 기술의 발전 방향과 산업에 미치는 영향에 대해 분석합니다.",
      tags: ["AI", "기술", "미래", "트렌드"],
      image: "/placeholder.svg?height=200&width=400",
    },
    {
      id: 2,
      title: "건강한 식습관을 위한 10가지 팁",
      source: "Instagram",
      date: "4월 8일",
      summary:
        "영양사가 추천하는 건강한 식습관을 위한 10가지 실천 가능한 팁을 소개합니다.",
      tags: ["건강", "식습관", "영양", "웰빙"],
      image: "/placeholder.svg?height=200&width=400",
    },
    {
      id: 3,
      title: "효율적인 재택근무를 위한 환경 구성하기",
      source: "Medium",
      date: "4월 5일",
      summary:
        "재택근무의 생산성을 높이기 위한 환경 구성과 습관에 대해 다룹니다.",
      tags: ["재택근무", "생산성", "업무환경"],
      image: "/placeholder.svg?height=200&width=400",
    },
    {
      id: 4,
      title: "마케팅에서의 색상 심리학",
      source: "블로그",
      date: "4월 3일",
      summary:
        "다양한 색상이 소비자 행동과 브랜드 인식에 미치는 영향에 대해 설명합니다.",
      tags: ["마케팅", "심리학", "디자인"],
      image: "/placeholder.svg?height=200&width=400",
    },
    {
      id: 5,
      title: "초보자를 위한 명상 가이드",
      source: "YouTube",
      date: "4월 1일",
      summary: "초보자를 위한 명상 시작 방법을 단계별로 안내합니다.",
      tags: ["명상", "웰빙", "정신건강"],
      image: "/placeholder.svg?height=200&width=400",
    },
  ];

  // 콘텐츠 기반 인기 태그
  const popularTags = ["기술", "웰빙", "생산성", "AI", "건강", "디자인"];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-16">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="container px-5 py-4">
          <h1 className="text-xl font-bold mb-4">내 보관함</h1>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              className="pl-9 h-10 bg-white border-gray-200 rounded-xl"
              placeholder="저장된 콘텐츠 검색"
              type="search"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <Button
                variant="outline"
                size="sm"
                className="text-xs whitespace-nowrap rounded-full"
              >
                전체
              </Button>
              {popularTags.map((tag) => (
                <Button
                  key={tag}
                  variant="outline"
                  size="sm"
                  className="text-xs whitespace-nowrap rounded-full"
                >
                  {tag}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full flex-shrink-0"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container px-5 py-4  bg-gradient-to-b from-blue-50 to-white">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-500">
              {savedContent.length}개 항목
            </div>

            <Tabs defaultValue="grid" className="w-auto">
              <TabsList className="h-8 p-1">
                <TabsTrigger value="grid" className="h-6 w-6 p-0">
                  <Grid className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="list" className="h-6 w-6 p-0">
                  <List className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {savedContent.map((content) => (
              <Link
                href={`/digest/${content.id}`}
                key={content.id}
                className="group"
              >
                <div className="bg-white rounded-xl overflow-hidden shadow-sm transition-all duration-200 group-hover:shadow-md h-full flex flex-col">
                  <div className="relative h-32 w-full">
                    <Image
                      src={content.image || "/placeholder.svg"}
                      alt={content.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <div className="px-2 py-0.5 bg-black/60 text-white rounded-full text-[10px]">
                        {content.source}
                      </div>
                    </div>
                  </div>
                  <div className="p-3 flex-1 flex flex-col">
                    <div className="text-xs text-gray-500 mb-1">
                      {content.date}
                    </div>
                    <h3 className="font-medium text-sm mb-1 line-clamp-2">
                      {content.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                      {content.summary}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-auto">
                      {content.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded-full text-[10px]"
                        >
                          {tag}
                        </span>
                      ))}
                      {content.tags.length > 2 && (
                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded-full text-[10px]">
                          +{content.tags.length - 2}
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
