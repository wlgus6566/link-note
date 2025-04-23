"use client";

import React, { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
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
  leftElement?: ReactNode;
}

export function Header({
  title,
  backUrl = "/",
  showBackButton = true,
  rightElement,
  className,
  leftElement,
}: HeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backUrl === "back") {
      router.back();
    } else {
      router.push(backUrl);
    }
  };

  return (
    <header
      className={cn(
        "sticky bg-white top-0 left-0 right-0 z-10 w-full border-b border-border z-50",
        className
      )}
    >
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
                <ChevronLeft className="h-5 w-5 text-neutral-dark" />
              </span>
            ) : (
              <Link href={backUrl}>
                <ChevronLeft className="h-5 w-5 text-neutral-dark" />
              </Link>
            )}
          </Button>
        ) : !leftElement ? (
          <div className="w-9" />
        ) : (
          <></>
        )}

        {leftElement && <div>{leftElement}</div>}

        {title && (
          <h1 className="text-lg font-medium text-neutral-dark truncate max-w-[60%]">
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
