"use client";

import React, { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title?: string | null;
  backUrl?: string;
  showBackButton?: boolean;
  rightElement?: ReactNode;
  className?: string;
}

export function Header({
  title,
  backUrl = "/",
  showBackButton = true,
  rightElement,
  className,
}: HeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <header className={cn("w-full border-b border-border", className)}>
      <div className="container flex items-center justify-between h-16 px-5">
        {showBackButton ? (
          <Button
            variant="ghost"
            size="sm"
            className="p-0 hover:bg-transparent"
            onClick={backUrl === "back" ? handleBack : undefined}
            asChild={backUrl !== "back"}
          >
            {backUrl === "back" ? (
              <span>
                <ArrowLeft className="h-5 w-5 text-neutral-dark" />
              </span>
            ) : (
              <Link href={backUrl}>
                <ArrowLeft className="h-5 w-5 text-neutral-dark" />
              </Link>
            )}
          </Button>
        ) : (
          <div className="w-9" />
        )}

        {title && (
          <h1 className="text-base font-semibold absolute left-1/2 transform -translate-x-1/2">
            {title}
          </h1>
        )}

        {rightElement ? (
          <div className="flex gap-2">{rightElement}</div>
        ) : (
          <div className="w-9" />
        )}
      </div>
    </header>
  );
}
