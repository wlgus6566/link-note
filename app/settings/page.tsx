import Link from "next/link"
import { ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import BottomNav from "@/components/bottom-nav"

export default function SettingsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-16">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="p-0" asChild>
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <span className="text-lg font-medium">설정</span>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container px-4 py-4">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4 h-9">
              <TabsTrigger value="general" className="text-xs">
                일반
              </TabsTrigger>
              <TabsTrigger value="digest" className="text-xs">
                요약 설정
              </TabsTrigger>
              <TabsTrigger value="account" className="text-xs">
                계정
              </TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="space-y-4">
              <div className="space-y-4 bg-white p-4 rounded-xl">
                <h2 className="text-sm font-medium">일반 설정</h2>
                <div className="space-y-2">
                  <Label htmlFor="language" className="text-xs">
                    언어
                  </Label>
                  <Select defaultValue="ko">
                    <SelectTrigger id="language" className="h-9 text-sm">
                      <SelectValue placeholder="언어 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ko">한국어</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                      <SelectItem value="zh">中文</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="theme" className="text-xs">
                    테마
                  </Label>
                  <Select defaultValue="light">
                    <SelectTrigger id="theme" className="h-9 text-sm">
                      <SelectValue placeholder="테마 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">라이트</SelectItem>
                      <SelectItem value="dark">다크</SelectItem>
                      <SelectItem value="system">시스템 설정 따르기</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between py-1">
                  <div className="space-y-0.5">
                    <Label htmlFor="notifications" className="text-sm">
                      알림
                    </Label>
                    <p className="text-xs text-gray-500">새로운 기능 및 업데이트 알림 받기</p>
                  </div>
                  <Switch id="notifications" />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="digest" className="space-y-4">
              <div className="space-y-4 bg-white p-4 rounded-xl">
                <h2 className="text-sm font-medium">요약 설정</h2>
                <div className="space-y-2">
                  <Label htmlFor="summary-length" className="text-xs">
                    요약 길이
                  </Label>
                  <Select defaultValue="medium">
                    <SelectTrigger id="summary-length" className="h-9 text-sm">
                      <SelectValue placeholder="요약 길이 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">짧게 (1-2 문장)</SelectItem>
                      <SelectItem value="medium">중간 (3-5 문장)</SelectItem>
                      <SelectItem value="long">길게 (5-7 문장)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tag-count" className="text-xs">
                    자동 생성 태그 수
                  </Label>
                  <Select defaultValue="5">
                    <SelectTrigger id="tag-count" className="h-9 text-sm">
                      <SelectValue placeholder="태그 수 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3개</SelectItem>
                      <SelectItem value="5">5개</SelectItem>
                      <SelectItem value="7">7개</SelectItem>
                      <SelectItem value="10">10개</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between py-1">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-translate" className="text-sm">
                      자동 번역
                    </Label>
                    <p className="text-xs text-gray-500">외국어 콘텐츠 자동 번역</p>
                  </div>
                  <Switch id="auto-translate" />
                </div>
                <div className="flex items-center justify-between py-1">
                  <div className="space-y-0.5">
                    <Label htmlFor="extract-images" className="text-sm">
                      이미지 추출
                    </Label>
                    <p className="text-xs text-gray-500">콘텐츠에서 주요 이미지 자동 추출</p>
                  </div>
                  <Switch id="extract-images" defaultChecked />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="account" className="space-y-4">
              <div className="space-y-4 bg-white p-4 rounded-xl">
                <h2 className="text-sm font-medium">계정 설정</h2>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs">
                    이름
                  </Label>
                  <Input id="name" placeholder="이름을 입력하세요" className="h-9 text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs">
                    이메일
                  </Label>
                  <Input id="email" type="email" placeholder="이메일을 입력하세요" className="h-9 text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-xs">
                    소개
                  </Label>
                  <Textarea id="bio" placeholder="자기소개를 입력하세요" className="text-sm min-h-[80px]" />
                </div>
                <Button className="w-full h-9 bg-blue-500 hover:bg-blue-600 text-sm">
                  <Save className="mr-2 h-4 w-4" />
                  저장하기
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
