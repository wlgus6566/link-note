"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Bookmark, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ContentCardProps {
  content: {
    id: number
    title: string
    source: string
    date: string
    summary: string
    tags: string[]
    image: string
  }
}

export default function ContentCard({ content }: ContentCardProps) {
  const [isSaved, setIsSaved] = useState(false)

  return (
    <motion.div
      className="bg-white rounded-xl overflow-hidden shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
    >
      <Link href={`/digest/${content.id}`}>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">{content.source}</div>
            <div className="text-xs text-gray-500">{content.date}</div>
          </div>

          <h3 className="font-medium text-base mb-2 line-clamp-2">{content.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-3 mb-4">{content.summary}</p>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {content.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-2.5 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs">
                {tag}
              </span>
            ))}
            {content.tags.length > 3 && (
              <span className="px-2.5 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs">
                +{content.tags.length - 3}
              </span>
            )}
          </div>

          <div className="relative h-40 w-full rounded-lg overflow-hidden">
            <Image
              src={content.image || "/placeholder.svg"}
              alt={content.title}
              fill
              className="object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
        </div>
      </Link>

      <div className="flex border-t">
        <Button
          variant="ghost"
          className="flex-1 h-12 rounded-none text-sm font-medium"
          onClick={() => setIsSaved(!isSaved)}
        >
          <Bookmark className={`mr-2 h-4 w-4 ${isSaved ? "fill-blue-500 text-blue-500" : ""}`} />
          {isSaved ? "저장됨" : "저장"}
        </Button>
        <div className="w-px bg-gray-200"></div>
        <Button variant="ghost" className="flex-1 h-12 rounded-none text-sm font-medium">
          <Share2 className="mr-2 h-4 w-4" />
          공유
        </Button>
      </div>
    </motion.div>
  )
}
