"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { SimpleToast } from "@/components/ui/toast";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showError = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?reset=true`,
      });

      if (error) {
        throw error;
      }

      // 성공 상태로 변경
      setIsSubmitted(true);
    } catch (error: any) {
      console.error("비밀번호 재설정 오류:", error);
      showError(
        "비밀번호 재설정 이메일 전송 중 오류가 발생했습니다. 다시 시도해주세요."
      );
    } finally {
      setIsLoading(false);
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
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
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
          variants={itemVariants}
          className="bg-white p-8 rounded-xl border border-border-line shadow-sm"
        >
          <div className="flex justify-center mb-6">
            <Image
              src="/images/logo_tube.png"
              alt="TubeNote Logo"
              width={48}
              height={48}
            />
          </div>

          {!isSubmitted ? (
            <>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-neutral-dark">
                  비밀번호 찾기
                </h2>
                <p className="text-neutral-medium mt-2">
                  가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를
                  보내드립니다.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4 mb-6">
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
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-primary-color hover:bg-primary-color/90 text-white font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? "처리 중..." : "재설정 링크 받기"}
                </Button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-primary-color" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-neutral-dark mb-2">
                이메일이 전송되었습니다
              </h2>
              <p className="text-neutral-medium mb-6">
                {email}로 비밀번호 재설정 링크를 보냈습니다. 이메일을
                확인해주세요.
              </p>
              <Button
                onClick={() => router.push("/login")}
                className="w-full h-12 bg-primary-color hover:bg-primary-color/90 text-white font-medium"
              >
                로그인으로 돌아가기
              </Button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      <SimpleToast
        isVisible={showToast}
        message={toastMessage}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
