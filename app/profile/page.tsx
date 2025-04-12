import Link from "next/link"
import Image from "next/image"
import { Settings, BookOpen, Share2, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BottomNav from "@/components/bottom-nav"

export default function ProfilePage() {
  // 샘플 사용자 데이터
  const user = {
    name: "김링크",
    username: "@kimlink",
    bio: "디지털 콘텐츠 큐레이터 | 지식 관리 애호가",
    joinDate: "2025년 4월",
    stats: {
      saved: 128,
      shared: 32,
    },
    avatar: "/placeholder.svg?height=100&width=100",
  }

  // 샘플 저장된 콘텐츠
  const savedContent = [
    {
      id: 1,
      title: "인공지능의 미래: 2025년 전망",
      source: "YouTube",
      date: "4월 10일",
      image: "/placeholder.svg?height=200&width=400",
    },
    {
      id: 2,
      title: "건강한 식습관을 위한 10가지 팁",
      source: "Instagram",
      date: "4월 8일",
      image: "/placeholder.svg?height=200&width=400",
    },
    {
      id: 3,
      title: "효율적인 재택근무를 위한 환경 구성하기",
      source: "Medium",
      date: "4월 5일",
      image: "/placeholder.svg?height=200&width=400",
    },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-16">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="container flex items-center justify-between h-16 px-5">
          <h1 className="text-xl font-bold">프로필</h1>
          <Link href="/settings">
            <Settings className="w-5 h-5 text-gray-600" />
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="container px-5 py-6">
          <div className="bg-white rounded-xl p-5 mb-6 shadow-sm">
            <div className="flex items-start gap-4 mb-4">
              <div className="relative w-16 h-16 rounded-full overflow-hidden">
                <Image src={user.avatar || "/placeholder.svg"} alt={user.name} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-lg">{user.name}</h2>
                <p className="text-sm text-gray-500">{user.username}</p>
                <p className="text-sm mt-1">{user.bio}</p>
              </div>
            </div>

            <div className="flex gap-3 mb-4">
              <div className="flex-1 bg-gray-50 rounded-lg p-3 text-center">
                <div className="font-bold text-lg text-blue-500">{user.stats.saved}</div>
                <div className="text-xs text-gray-500">저장됨</div>
              </div>
              <div className="flex-1 bg-gray-50 rounded-lg p-3 text-center">
                <div className="font-bold text-lg text-blue-500">{user.stats.shared}</div>
                <div className="text-xs text-gray-500">공유됨</div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1 bg-blue-500 hover:bg-blue-600 h-10 text-sm">프로필 편집</Button>
              <Button variant="outline" size="icon" className="h-10 w-10">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-10 w-10">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Tabs defaultValue="saved" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-10 mb-4">
              <TabsTrigger value="saved" className="text-sm">
                저장됨
              </TabsTrigger>
              <TabsTrigger value="activity" className="text-sm">
                활동
              </TabsTrigger>
            </TabsList>

            <TabsContent value="saved" className="space-y-4">
              {savedContent.map((content) => (
                <Link href={`/digest/${content.id}`} key={content.id}>
                  <div className="flex gap-3 bg-white rounded-xl p-3 shadow-sm">
                    <div className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden">
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
                        <span>{content.date}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}

              <Button variant="outline" className="w-full text-sm">
                저장된 모든 콘텐츠 보기
              </Button>
            </TabsContent>

            <TabsContent value="activity">
              <div className="bg-white rounded-xl p-5 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="font-medium mb-1">최근 활동 없음</h3>
                <p className="text-sm text-gray-500 mb-4">콘텐츠와의 최근 상호작용이 여기에 표시됩니다.</p>
                <Button className="bg-blue-500 hover:bg-blue-600 text-sm">콘텐츠 탐색하기</Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
