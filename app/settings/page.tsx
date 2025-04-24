"use client";

import Link from "next/link";
import { ArrowLeft, Save, Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { DesignToast } from "@/components/ui/toast";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BottomNav from "@/components/bottom-nav";
import { useAuth } from "@/lib/hooks/useAuth";
import { useState, useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";

export default function SettingsPage() {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 폼 상태
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get("tab");

  useEffect(() => {
    const fetchUserData = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch("/api/users");
        const data = await response.json();

        if (response.ok) {
          setUserData(data.user);
          // 폼 데이터 초기화
          setName(data.user.name || "");
          setEmail(data.user.email || "");
          setBio(data.user.bio || "");
          setAvatar(data.user.avatar || "");
          setError(null);
        } else {
          setError(data.error || "사용자 정보를 불러오는데 실패했습니다");
        }
      } catch (err) {
        setError("사용자 정보를 불러오는데 실패했습니다");
        console.error("사용자 정보 조회 오류:", err);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchUserData();
    }
  }, [isAuthenticated, authLoading]);

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      let uploadedUrl = avatar; // 기본은 기존 이미지 URL 그대로 유지

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploadRes = await fetch("/api/upload/avatar", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (uploadRes.ok) {
          uploadedUrl = uploadData.url;
        } else {
          setToastMessage(uploadData.error || "이미지 업로드 실패");
          setShowToast(true);
          return;
        }
      }

      const response = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          bio,
          avatar: uploadedUrl,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setToastMessage("프로필이 성공적으로 업데이트되었습니다");
        setShowToast(true);
        setUserData({ ...userData, name, bio, avatar: uploadedUrl });
        setSelectedFile(null); // 저장 성공 시 선택된 파일 초기화
      } else {
        setToastMessage(data.error || "프로필 업데이트 실패");
        setShowToast(true);
      }
    } catch (err) {
      setToastMessage("프로필 저장 중 오류 발생");
      setShowToast(true);
    } finally {
      setSaving(false);
    }
  };

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setToastMessage("이미지 크기는 5MB 이하여야 합니다");
      setShowToast(true);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setToastMessage("이미지 파일만 업로드 가능합니다");
      setShowToast(true);
      return;
    }

    setSelectedFile(file);

    // 미리보기를 위해 avatar를 data URL로 임시 설정
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-16">
      <Header title="설정" backUrl="/profile" showBackButton={true} />
      <main className="flex-1">
        <div className="container px-4 py-4">
          <Tabs defaultValue={tabParam || "general"} className="w-full">
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
                    <p className="text-xs text-gray-500">
                      새로운 기능 및 업데이트 알림 받기
                    </p>
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
                    <p className="text-xs text-gray-500">
                      외국어 콘텐츠 자동 번역
                    </p>
                  </div>
                  <Switch id="auto-translate" />
                </div>
                <div className="flex items-center justify-between py-1">
                  <div className="space-y-0.5">
                    <Label htmlFor="extract-images" className="text-sm">
                      이미지 추출
                    </Label>
                    <p className="text-xs text-gray-500">
                      콘텐츠에서 주요 이미지 자동 추출
                    </p>
                  </div>
                  <Switch id="extract-images" defaultChecked />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="account" className="space-y-4">
              <div className="space-y-4 bg-white p-4 rounded-xl">
                <h2 className="text-sm font-medium">계정 설정</h2>

                {loading || authLoading ? (
                  <>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-9 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-9 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                    <Skeleton className="h-9 w-full" />
                  </>
                ) : error ? (
                  <div className="text-center py-4">
                    <p className="text-red-500 mb-2">{error}</p>
                    <Button
                      variant="outline"
                      onClick={() => window.location.reload()}
                      className="mx-auto"
                    >
                      다시 시도
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-xs">
                        프로필 이미지
                      </Label>
                      <div
                        onClick={handleImageClick}
                        className="relative w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer group overflow-hidden border-2 border-primary-light"
                      >
                        {selectedFile ? (
                          <Image
                            src={avatar}
                            alt="프로필 미리보기"
                            fill
                            className="object-cover group-hover:opacity-75 transition-opacity"
                            unoptimized
                          />
                        ) : (
                          <Image
                            src={avatar || "/images/profile.png"}
                            alt="프로필 이미지"
                            fill
                            className="object-cover group-hover:opacity-75 transition-opacity"
                            unoptimized
                          />
                        )}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Camera className="h-6 w-6 text-white" />
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        클릭하여 이미지 업로드 (5MB 이하)
                      </p>
                      <Label htmlFor="name" className="text-xs">
                        이름
                      </Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="이름을 입력하세요"
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs">
                        이메일
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        disabled
                        placeholder="이메일을 입력하세요"
                        className="h-9 text-sm bg-gray-50"
                      />
                      <p className="text-xs text-gray-500">
                        이메일은 변경할 수 없습니다
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-xs">
                        소개
                      </Label>
                      <Textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="자기소개를 입력하세요"
                        className="text-sm min-h-[80px]"
                      />
                    </div>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={saving || !isAuthenticated}
                      className="w-full h-9 bg-blue-500 hover:bg-blue-600 text-sm"
                    >
                      {saving ? (
                        <span className="flex items-center">
                          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                          저장 중...
                        </span>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          저장하기
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <BottomNav />
      <DesignToast
        isVisible={showToast}
        message={toastMessage}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
