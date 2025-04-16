"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { SimpleToast } from "@/components/ui/toast";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isKakaoLoading, setIsKakaoLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // 세션이 이미 있는지 확인
  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        // 이미 로그인되어 있으면 메인 또는 콜백 URL로 리다이렉트
        router.push(callbackUrl);
      }
    };

    checkSession();
  }, [router, callbackUrl]);

  const showError = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // 로그인 성공 - callbackUrl로 리다이렉트
      router.push(callbackUrl);
      router.refresh();
    } catch (error: any) {
      console.error("로그인 오류:", error);
      if (error.message === "Invalid login credentials") {
        showError("이메일 또는 비밀번호가 올바르지 않습니다.");
      } else {
        showError("로그인 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
            callbackUrl: encodeURIComponent(callbackUrl),
          },
        },
      });

      if (error) {
        throw error;
      }

      // 리다이렉션은 Supabase가 처리합니다
    } catch (error: any) {
      console.error("구글 로그인 오류:", error);
      showError("구글 로그인 중 오류가 발생했습니다.");
      setIsGoogleLoading(false);
    }
  };

  const handleKakaoLogin = async () => {
    setIsKakaoLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "kakao",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            callbackUrl: encodeURIComponent(callbackUrl),
          },
        },
      });

      if (error) {
        throw error;
      }

      // 리다이렉션은 Supabase가 처리합니다
    } catch (error: any) {
      console.error("카카오 로그인 오류:", error);
      showError("카카오 로그인 중 오류가 발생했습니다.");
      setIsKakaoLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* 왼쪽 섹션 - 데스크톱에서만 표시 */}
      <div className="hidden md:flex md:w-1/2 bg-primary-light relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-color/10 to-primary-color/30" />

        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Image
              src="/images/logo_00.png"
              alt="LinkNote Logo"
              width={80}
              height={80}
              className="mx-auto"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center max-w-md"
          >
            <h1 className="text-3xl font-bold text-neutral-dark mb-4">
              콘텐츠를 <span className="text-primary-color">스마트하게</span>{" "}
              정리하세요
            </h1>
            <p className="text-neutral-medium mb-8">
              링크 한 줄로, 당신만의 블로그 콘텐츠가 완성됩니다. 중요한 정보를
              놓치지 않고 효율적으로 관리하세요.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, type: "spring" }}
            className="w-full max-w-md relative"
          >
            <div className="relative h-64 w-full rounded-xl overflow-hidden shadow-md">
              <Image
                src="/placeholder.svg?height=400&width=600"
                alt="LinkNote App Preview"
                fill
                className="object-cover"
              />
            </div>

            <div className="absolute -bottom-4 -right-4 bg-white p-3 rounded-xl shadow-lg border border-border-line">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center">
                  <ArrowRight className="h-4 w-4 text-primary-color" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-neutral-dark">빠른 요약</p>
                  <p className="text-xs text-neutral-medium">
                    클릭 한 번으로 완성
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 배경 장식 요소 */}
          <div className="absolute top-20 left-20 w-32 h-32 bg-primary-color/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-primary-color/20 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* 오른쪽 섹션 - 로그인 폼 */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* 모바일에서만 표시되는 로고 */}

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-white p-8 rounded-xl border border-border-line shadow-sm"
          >
            <motion.div variants={itemVariants} className="text-center mb-8">
              <div className="md:hidden flex justify-center mb-8">
                <div className="flex items-center gap-2">
                  <Image
                    src="/images/logo_00.png"
                    alt="LinkNote Logo"
                    width={40}
                    height={40}
                  />
                  <span className="text-xl font-bold text-neutral-dark">
                    LinkNote
                  </span>
                </div>
              </div>
              <p className="text-neutral-medium mt-2">
                편리하게 콘텐츠를 관리를 시작하세요
              </p>
            </motion.div>

            <form onSubmit={handleLogin}>
              <motion.div variants={itemVariants} className="space-y-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-neutral-dark">
                    이메일
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-neutral-medium" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      className="pl-10 h-12 border-border-line"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="password" className="text-neutral-dark">
                      비밀번호
                    </Label>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-primary-color hover:underline"
                    >
                      비밀번호 찾기
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-neutral-medium" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 h-12 border-border-line"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 text-neutral-medium hover:text-neutral-dark"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) =>
                      setRememberMe(checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="remember"
                    className="text-sm text-neutral-medium cursor-pointer"
                  >
                    로그인 상태 유지
                  </Label>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Button
                  type="submit"
                  className="w-full h-12 bg-primary-color hover:bg-primary-color/90 text-white font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? "로그인 중..." : "로그인"}
                </Button>
              </motion.div>
            </form>

            <motion.div variants={itemVariants} className="mt-6">
              <div className="relative flex items-center justify-center">
                <Separator className="absolute w-full" />
                <span className="relative px-2 bg-white text-sm text-neutral-medium">
                  또는
                </span>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-6 space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 border-border-line hover:bg-secondary-color hover:border-primary-color/30"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 48 48"
                >
                  <path
                    fill="#FFC107"
                    d="M43.6 20.5h-1.9V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.6 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-9 20-20 0-1.3-.1-2.5-.4-3.5z"
                  />
                  <path
                    fill="#FF3D00"
                    d="M6.3 14.1l6.6 4.8C14.5 15.5 18.9 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.6 29.6 4 24 4c-7.4 0-13.7 4.1-17.1 10.1z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24 44c5.4 0 10.3-2.1 14-5.4l-6.4-5.3C29.9 35.4 27.1 36 24 36c-5.3 0-9.7-3.4-11.3-8l-6.5 5C10.2 39.6 16.6 44 24 44z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.6 20.5h-1.9V20H24v8h11.3c-.9 2.6-2.6 4.8-4.8 6.3l6.4 5.3c-.5.5 6.1-4.5 6.1-13.6 0-1.3-.1-2.5-.4-3.5z"
                  />
                </svg>
                {isGoogleLoading ? "로그인 중..." : "Google로 계속하기"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full h-12 border-border-line hover:bg-secondary-color hover:border-primary-color/30 bg-[#FEE500]"
                onClick={handleKakaoLogin}
                disabled={isKakaoLoading}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 300 300"
                  width="20"
                  height="20"
                >
                  <path
                    fill="#3C1E1E"
                    d="M150 20C80.6 20 25 65.2 25 120c0 35.7 25.6 67.1 64.3 86.2-2.2 8.2-10.1 33.4-12.3 40.9-1.9 6.5 2.4 6.6 5 5.1 2-1.2 32.6-22.6 45.4-31.5 7.2 0.9 14.6 1.4 22.5 1.4 69.4 0 125-45.2 125-100S219.4 20 150 20z"
                  />
                  <path
                    fill="#FFE812"
                    d="M99.6 144.5c-2.2 0-3.8-0.5-4.7-1.4-1-1-1.5-2.6-1.4-4.9l0.5-14.3c0.1-4.3 0-7.3-0.3-9.1-0.3-1.8-1.2-2.8-2.7-3.1-1.6-0.3-4.2-0.3-7.8 0-3.1 0.2-5.1-1.5-5.3-4.2-0.2-2.8 1.4-4.7 4.7-5.5 2.5-0.6 7.8-0.9 15.9-0.9 6.3 0 10.4 0.3 12.4 0.8 2.2 0.6 3.3 2.1 3.3 4.5 0 2.4-0.9 4-2.7 4.8-0.6 0.3-1.8 0.5-3.5 0.6-1.8 0.1-3 0.3-3.6 0.5-1.5 0.6-2.3 1.6-2.5 3-0.2 1.3-0.3 4.5-0.3 9.5v13.8c0 2.3-0.6 4-1.8 5.1-1 0.9-2.5 1.3-4.6 1.3zm27.2-0.6c-2.5 0-4.4-0.6-5.7-1.8-1.3-1.2-2-2.9-2-5.1 0-2.1 0.9-5 2.6-8.8l10.4-24.2c0.7-1.5 1.4-2.6 2-3.2 0.8-0.7 1.9-1 3.2-1 1.5 0 2.6 0.3 3.4 1 0.6 0.5 1.3 1.6 2 3.2l10.4 24.2c1.7 3.9 2.6 6.7 2.6 8.8 0 2.2-0.7 3.9-2 5.1-1.3 1.2-3.2 1.8-5.7 1.8-2.6 0-4.5-0.6-5.7-1.8-1.2-1.2-2.1-2.9-2.8-5.2l-0.8-2.5h-9.6l-0.9 2.5c-0.7 2.3-1.6 4-2.8 5.2-1.1 1.2-3 1.8-5.6 1.8zm5.8-15.8h6.3l-3.2-9.2-3.1 9.2zm35.3 15.6c-2.6 0-4.5-0.6-5.8-1.8-1.3-1.2-1.9-2.9-1.9-5.1V99.7c0-2.2 0.6-3.9 1.9-5.1 1.3-1.2 3.2-1.8 5.8-1.8 2.6 0 4.5 0.6 5.8 1.8 1.3 1.2 2 2.9 2 5.1v18.6c0 0.3-0.1 0.8-0.2 1.6-0.1 0.6-0.1 1.1-0.1 1.3 0 0.3 0.1 0.6 0.3 0.8s0.5 0.4 0.9 0.4c0.3 0 0.8-0.1 1.4-0.2l3-0.3c2.5-0.2 4.3 1.1 5.1 3.8 0.7 2.5-0.6 4.4-4.1 5.6-2.3 0.8-5.8 1.2-10.6 1.2zm22.6 0.1c-2.2 0-3.8-0.5-4.8-1.4-1-1-1.5-2.6-1.5-4.9l0.5-14.3c0.1-4.3 0-7.3-0.3-9.1-0.3-1.8-1.2-2.8-2.7-3.1-1.6-0.3-4.2-0.3-7.8 0-3.1 0.2-5.1-1.5-5.3-4.2-0.2-2.8 1.4-4.7 4.7-5.5 2.5-0.6 7.8-0.9 15.9-0.9 6.3 0 10.4 0.3 12.4 0.8 2.2 0.6 3.3 2.1 3.3 4.5 0 2.4-0.9 4-2.7 4.8-0.6 0.3-1.8 0.5-3.5 0.6-1.8 0.1-3 0.3-3.6 0.5-1.5 0.6-2.3 1.6-2.5 3-0.2 1.3-0.3 4.5-0.3 9.5v13.8c0 2.3-0.6 4-1.8 5.1-1 0.9-2.5 1.3-4.6 1.3z"
                  />
                </svg>
                {isKakaoLoading ? "로그인 중..." : "카카오로 계속하기"}
              </Button>
            </motion.div>

            <motion.p
              variants={itemVariants}
              className="text-center mt-6 text-neutral-medium"
            >
              계정이 없으신가요?{" "}
              <Link
                href={`/signup${
                  callbackUrl !== "/"
                    ? `?callbackUrl=${encodeURIComponent(callbackUrl)}`
                    : ""
                }`}
                className="text-primary-color font-medium hover:underline"
              >
                회원가입
              </Link>
            </motion.p>
          </motion.div>
        </div>
      </div>

      <SimpleToast
        isVisible={showToast}
        message={toastMessage}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
