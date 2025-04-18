"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  ArrowRight,
  Mail,
  Lock,
  User,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { SimpleToast } from "@/components/ui/toast";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isKakaoLoading, setIsKakaoLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showError = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!agreeTerms) {
      showError("이용약관과 개인정보처리방침에 동의해주세요.");
      setIsLoading(false);
      return;
    }

    // 비밀번호 유효성 검사
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      showError("비밀번호는 8자 이상, 문자, 숫자, 특수문자를 포함해야 합니다.");
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      // 회원가입 처리
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          emailRedirectTo: `${
            window.location.origin
          }/auth/callback?callbackUrl=${encodeURIComponent(callbackUrl)}`,
        },
      });

      if (error) {
        throw error;
      }

      // 유저 정보를 DB에 저장
      const { error: profileError } = await supabase.from("users").insert([
        {
          auth_id: data.user?.id,
          name,
          email: data.user?.email,
        },
      ]);

      if (profileError) {
        console.error("프로필 저장 오류:", profileError);
      }

      // 이메일 확인이 필요한 경우
      if (data.user?.identities?.length === 0) {
        showError("이미 가입된 이메일입니다.");
      } else if (data.user && data.session) {
        // 즉시 로그인 처리 됨
        router.push(callbackUrl);
        router.refresh();
      } else {
        // 이메일 확인 필요한 경우
        setToastMessage("가입이 완료되었습니다. 이메일을 확인해주세요.");
        setShowToast(true);
        setTimeout(() => {
          router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
        }, 2000);
      }
    } catch (error: any) {
      console.error("회원가입 오류:", error);
      if (error.message === "User already registered") {
        showError("이미 등록된 이메일입니다.");
      } else {
        showError("회원가입 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
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

  const handleKakaoSignup = async () => {
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
              src="/images/logo_2.png"
              alt="TubeNote Logo"
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
                alt="TubeNote App Preview"
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

      {/* 오른쪽 섹션 - 회원가입 폼 */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* 모바일에서만 표시되는 로고 */}

          <motion.div variants={itemVariants} className="mb-6">
            <Link
              href="/login"
              className="flex items-center text-neutral-medium hover:text-primary-color transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span>로그인으로 돌아가기</span>
            </Link>
          </motion.div>

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
                    src="/images/logo_2.png"
                    alt="TubeNote Logo"
                    width={40}
                    height={40}
                  />
                  <span className="text-xl font-bold text-neutral-dark">
                    TubeNote
                  </span>
                </div>
              </div>
              <p className="text-neutral-medium mt-2">
                회원가입하고 콘텐츠 관리를 시작하세요
              </p>
            </motion.div>

            <form onSubmit={handleSignup}>
              <motion.div variants={itemVariants} className="space-y-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-neutral-dark">
                    이름
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-neutral-medium" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="홍길동"
                      className="pl-10 h-12 border-border-line"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

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
                  <Label htmlFor="password" className="text-neutral-dark">
                    비밀번호
                  </Label>
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
                  <p className="text-xs text-neutral-medium mt-1">
                    비밀번호는 8자 이상이어야 하며, 문자, 숫자, 특수문자를
                    포함해야 합니다.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreeTerms}
                    onCheckedChange={(checked) =>
                      setAgreeTerms(checked as boolean)
                    }
                    required
                  />
                  <Label
                    htmlFor="terms"
                    className="text-sm text-neutral-medium cursor-pointer"
                  >
                    <span>
                      <Link
                        href="/terms"
                        className="text-primary-color hover:underline"
                      >
                        이용약관
                      </Link>{" "}
                      및{" "}
                      <Link
                        href="/privacy"
                        className="text-primary-color hover:underline"
                      >
                        개인정보처리방침
                      </Link>
                      에 동의합니다.
                    </span>
                  </Label>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Button
                  type="submit"
                  className="w-full h-12 bg-primary-color hover:bg-primary-color/90 text-white font-medium"
                  disabled={isLoading || !agreeTerms}
                >
                  {isLoading ? "가입 중..." : "회원가입"}
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
                onClick={handleGoogleSignup}
                disabled={isGoogleLoading}
              >
                <Image
                  src="/images/google-logo.png"
                  alt="Google"
                  width={20}
                  height={20}
                  className="mr-2"
                />
                {isGoogleLoading ? "처리 중..." : "Google로 계속하기"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full h-12 border-border-line hover:bg-secondary-color hover:border-primary-color/30"
                onClick={handleKakaoSignup}
                disabled={isKakaoLoading}
              >
                <Image
                  src="/images/kakao-logo.png"
                  alt="Kakao"
                  width={20}
                  height={20}
                  className="mr-2"
                />
                {isKakaoLoading ? "처리 중..." : "카카오로 계속하기"}
              </Button>
            </motion.div>

            <motion.p
              variants={itemVariants}
              className="text-center mt-6 text-neutral-medium"
            >
              이미 계정이 있으신가요?{" "}
              <Link
                href={`/login${
                  callbackUrl !== "/"
                    ? `?callbackUrl=${encodeURIComponent(callbackUrl)}`
                    : ""
                }`}
                className="text-primary-color font-medium hover:underline"
              >
                로그인
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
