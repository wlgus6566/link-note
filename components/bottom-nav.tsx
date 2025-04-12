"use client";

import Link from "next/link";
import { Home, Search, Bookmark, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: "홈", href: "/" },
    // { icon: Search, label: "탐색", href: "/discover" },
    { icon: Bookmark, label: "보관함", href: "/library" },
    { icon: User, label: "프로필", href: "/profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t">
      <div className="grid h-full grid-cols-3 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link href={item.href} key={item.href} className="relative">
              <div className="flex flex-col items-center justify-center h-full">
                <Icon
                  className={`h-5 w-5 ${
                    isActive ? "text-blue-500" : "text-gray-500"
                  }`}
                />
                <span
                  className={`mt-1 text-[10px] ${
                    isActive ? "text-blue-500 font-medium" : "text-gray-500"
                  }`}
                >
                  {item.label}
                </span>

                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute bottom-0 w-12 h-0.5 bg-blue-500 rounded-t-full"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
