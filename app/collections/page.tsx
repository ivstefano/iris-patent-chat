"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { collections } from "@/data/collections"
import { Button } from "@/components/ui/button"
import { BookOpen, MessageSquareText } from 'lucide-react'
import Sidebar from "@/components/navigation/sidebar"
import MobileNavigation from "@/components/navigation/mobile-navigation"
import { useMobile } from "@/hooks/use-mobile"

export default function CollectionsPage() {
  const isMobile = useMobile()
  const router = useRouter()

  const handleAsk = (collectionId: string) => {
    // Deep link to home with collection preselected and focus prompt
    router.push(`/?collection=${collectionId}&autofocus=true`)
  }

  const Card = ({ id, name, description, coverImage, count }: any) => (
    <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2a2a2a] rounded-xl overflow-hidden hover:shadow-lg hover:border-gray-300 dark:hover:border-[#3a3a3a] transition-all">
      <div className="relative h-36 w-full">
        <Image
          src={coverImage || "/placeholder.svg?height=200&width=360&query=abstract%20metal%20texture%20gradient"}
          alt={`${name} cover`}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#1e1e1e] via-transparent to-transparent" />
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{name}</h3>
          <span className="text-xs bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">{count} files</span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{description}</p>

        <div className="mt-4 flex gap-2">
          <Link href={`/collections/${id}`} className="flex-1">
            <Button variant="outline" className="w-full border-gray-200 dark:border-[#2a2a2a] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] text-gray-900 dark:text-white cursor-pointer">
              <BookOpen className="w-4 h-4 mr-2" />
              {"Open"}
            </Button>
          </Link>
          <Button className="flex-1 bg-blue-600 hover:bg-blue-700 cursor-pointer" onClick={() => handleAsk(id)}>
            <MessageSquareText className="w-4 h-4 mr-2" />
            Chat
          </Button>
        </div>
      </div>
    </div>
  )

  const content = (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-8xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Data Collections</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Curated sets of documents that can be used as retrieval context for your questions.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {collections.map((col) => (
            <Card
              key={col.id}
              id={col.id}
              name={col.name}
              description={col.description}
              coverImage={col.coverImage}
              count={col.documents.length}
            />
          ))}
        </div>

        <div className="mt-8">
          
        </div>
      </div>
    </div>
  )

  return (
    <main className="flex h-screen bg-white dark:bg-[#121212] text-gray-900 dark:text-white overflow-hidden">
      {isMobile ? (
        <>
          <div className="flex-1 overflow-auto pb-16">{content}</div>
          <MobileNavigation />
        </>
      ) : (
        <>
          <Sidebar />
          {content}
        </>
      )}
    </main>
  )
}
