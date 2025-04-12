import Link from "next/link"
import Image from "next/image"
import { Search, Sparkles, TrendingUp, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import BottomNav from "@/components/bottom-nav"

export default function DiscoverPage() {
  // 샘플 트렌딩 토픽
  const trendingTopics = ["AI 윤리", "기후 기술", "재택근무", "정신건강", "웹3", "지속가능한 생활"]

  // 샘플 트렌딩 콘텐츠
  const trendingContent = [
    {
      id: 1,
      title: "AI가 2025년 의료 분야를 어떻게 변화시키고 있는가",
      source: "YouTube",
      views: "120만 조회",
      image: "/placeholder.svg?height=200&width=400",
    },
    {
      id: 2,
      title: "재택근무의 미래: 주목해야 할 트렌드",
      source: "Medium",
      views: "85.6만 조회",
      image: "/placeholder.svg?height=200&width=400",
    },
    {
      id: 3,
      title: "지속가능한 생활: 작은 변화로 큰 영향을",
      source: "블로그",
      views: "54.3만 조회",
      image: "/placeholder.svg?height=200&width=400",
    },
  ]

  // 샘플 카테고리
  const categories = [
    { name: "기술", icon: "🖥️", color: "bg-blue-100" },
    { name: "건강", icon: "🏥", color: "bg-green-100" },
    { name: "비즈니스", icon: "💼", color: "bg-yellow-100" },
    { name: "과학", icon: "🔬", color: "bg-purple-100" },
    { name: "예술", icon: "🎨", color: "bg-pink-100" },
    { name: "스포츠", icon: "⚽", color: "bg-orange-100" },
    { name: "여행", icon: "✈️", color: "bg-teal-100" },
    { name: "음식", icon: "🍲", color: "bg-red-100" },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-16">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="container px-5 py-4">
          <h1 className="text-xl font-bold mb-4">탐색</h1>

          <div className="relative mb-2">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              className="pl-9 h-10 bg-white border-gray-200 rounded-xl"
              placeholder="주제, 기사, 영상 검색..."
              type="search"
            />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container px-5 py-4">
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg font-bold">인기 주제</h2>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {trendingTopics.map((topic) => (
                <Button
                  key={topic}
                  variant="outline"
                  size="sm"
                  className="text-xs whitespace-nowrap rounded-full px-3 py-1.5 bg-white"
                >
                  {topic}
                </Button>
              ))}
            </div>
          </section>

          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg font-bold">인기 콘텐츠</h2>
            </div>

            <div className="space-y-4">
              {trendingContent.map((content) => (
                <Link href={`/digest/${content.id}`} key={content.id}>
                  <div className="flex gap-3 bg-white rounded-xl p-3 shadow-sm">
                    <div className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden">
                      <Image
                        src={content.image || "/placeholder.svg"}
                        alt={content.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="font-medium text-sm line-clamp-2">{content.title}</h3>
                      <div className="mt-auto flex items-center gap-2 text-xs text-gray-500">
                        <span>{content.source}</span>
                        <span>•</span>
                        <span>{content.views}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg font-bold">카테고리별 탐색</h2>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {categories.map((category) => (
                <Link href={`/discover/category/${category.name.toLowerCase()}`} key={category.name}>
                  <div className={`flex flex-col items-center justify-center p-3 rounded-xl ${category.color}`}>
                    <div className="text-2xl mb-1">{category.icon}</div>
                    <span className="text-xs font-medium">{category.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
