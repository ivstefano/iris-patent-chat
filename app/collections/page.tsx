"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { collections } from "@/data/collections"
import { Button } from "@/components/ui/button"
import { BookOpen, MessageSquareText, Plus, Trash2, X } from 'lucide-react'
import { useState, useRef, useEffect } from "react"
import Sidebar from "@/components/navigation/sidebar"
import MobileNavigation from "@/components/navigation/mobile-navigation"
import { useMobile } from "@/hooks/use-mobile"

export default function CollectionsPage() {
  const isMobile = useMobile()
  const router = useRouter()
  const [showUploadOptions, setShowUploadOptions] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{show: boolean, collectionId: string, collectionName: string}>({
    show: false, 
    collectionId: '', 
    collectionName: ''
  })
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleAsk = (collectionId: string) => {
    // Deep link to home with collection preselected and focus prompt
    router.push(`/?collection=${collectionId}&autofocus=true`)
  }

  const handleUploadOption = (source: string) => {
    setShowUploadOptions(false)
    // TODO: Implement upload logic for each source
    console.log(`Upload from ${source}`)
  }

  const handleDeleteClick = (collectionId: string, collectionName: string) => {
    setDeleteDialog({
      show: true,
      collectionId,
      collectionName
    })
    setDeleteConfirmText('')
  }

  const handleDeleteConfirm = () => {
    if (deleteConfirmText === 'DELETE DATA SET') {
      // TODO: Implement actual deletion logic
      console.log(`Deleting collection: ${deleteDialog.collectionId}`)
      setDeleteDialog({show: false, collectionId: '', collectionName: ''})
      setDeleteConfirmText('')
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({show: false, collectionId: '', collectionName: ''})
    setDeleteConfirmText('')
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUploadOptions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const Card = ({ id, name, description, coverImage, count }: any) => (
    <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2a2a2a] rounded-xl overflow-hidden hover:shadow-lg hover:border-gray-300 dark:hover:border-[#3a3a3a] transition-all group">
      <div className="relative h-36 w-full">
        <Image
          src={coverImage || "/placeholder.svg?height=200&width=360&query=abstract%20metal%20texture%20gradient"}
          alt={`${name} cover`}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#1e1e1e] via-transparent to-transparent" />
        
        {/* Delete Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleDeleteClick(id, name)
          }}
          className="absolute top-2 left-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
          title="Delete collection"
        >
          <Trash2 className="w-3 h-3" />
        </button>
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
          
          {/* Add Dataset Button */}
          <div className="relative" ref={dropdownRef}>
            <Button 
              onClick={() => setShowUploadOptions(!showUploadOptions)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Dataset
            </Button>
            
            {/* Dropdown Menu */}
            {showUploadOptions && (
              <div className="absolute right-0 mt-2 w-100 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2a2a2a] rounded-lg shadow-lg z-10">
                <div className="py-1">
                  <button
                    onClick={() => handleUploadOption('local')}
                    className="w-full px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-[#2a2a2a] flex items-center text-gray-900 dark:text-white"
                  >
                    <div className="px-3">
                      <div className="font-medium">Local Folder</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Upload files from your computer</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleUploadOption('gdrive')}
                    className="w-full px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-[#2a2a2a] flex items-center text-gray-900 dark:text-white"
                  >
                    <div className="px-3">
                      <div className="font-medium">Google Drive</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Import from Google Drive</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleUploadOption('dropbox')}
                    className="w-full px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-[#2a2a2a] flex items-center text-gray-900 dark:text-white"
                  >
                    <div className="px-3">
                      <div className="font-medium">Dropbox</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Import from Dropbox</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
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

      {/* Delete Confirmation Dialog */}
      {deleteDialog.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1e1e1e] rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
                  Delete Data Set
                </h3>
                <button
                  onClick={handleDeleteCancel}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Warning Content */}
              <div className="mb-6">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">!</span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                        Warning: This action cannot be undone
                      </h4>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        You are about to permanently delete the "{deleteDialog.collectionName}" data set. 
                        All documents and associated data will be lost forever.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    To confirm deletion, type{' '}
                    <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-red-600 dark:text-red-400">
                      DELETE DATA SET
                    </span>{' '}
                    below:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Type here to confirm..."
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={handleDeleteCancel}
                  className="border-gray-300 dark:border-gray-600"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteConfirm}
                  disabled={deleteConfirmText !== 'DELETE DATA SET'}
                  className={`text-white disabled:cursor-not-allowed transition-colors ${
                    deleteConfirmText === 'DELETE DATA SET' 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                  }`}
                >
                  Delete Forever
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
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
