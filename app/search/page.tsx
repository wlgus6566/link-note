import Link from "next/link"
import { Search, Settings, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import BottomNav from "@/components/bottom-nav"

export default function SearchPage() {
  // 샘플 검색 기록 및 인기 검색어
  const recentSearches = ["인공지능", "건강한 식습관", "재택근무", "생산성"]
  const popularTags = ["AI", "기술", "건강", "생산성", "라이프스타일", "요리", "여행", "금융", "교육", "취미"]

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-16">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="text-lg font-bold">검색</div>
          <Link href="/settings">
            <Settings className="w-5 h-5 text-gray-600" />
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <div className="container px-4 py-4">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              className="pl-9 pr-9 h-10 bg-white border-gray-200"
              placeholder="제목, 태그 또는 내용으로 검색"
              type="search"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-10 px-3 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-medium mb-3">최근 검색어</h2>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <div key={term} className="flex items-center bg-white rounded-full px-3 py-1.5 text-xs">
                    <span>{term}</span>
                    <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1">
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-sm font-medium mb-3">인기 태그</h2>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <Link href={`/search?tag=${tag}`} key={tag}>
                    <div className="bg-blue-100 text-blue-700 rounded-full px-3 py-1.5 text-xs">{tag}</div>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-sm font-medium mb-3">추천 콘텐츠</h2>
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <Link href={`/digest/${item}`} key={item}>
                    <div className="p-3 bg-white rounded-xl">
                      <h3 className="font-medium text-sm mb-1 line-clamp-1">인공지능의 미래: 2025년 전망</h3>
                      <p className="text-xs text-gray-500 line-clamp-2">
                        이 영상은 2025년 인공지능 기술의 발전 방향과 산업에 미치는 영향에 대해 분석합니다.
                      </p>
                      <div className="flex gap-1 mt-2">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px]">AI</span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px]">기술</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
