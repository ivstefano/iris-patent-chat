"use client"

import { useMemo, useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { collections } from "@/data/collections"
import Sidebar from "@/components/navigation/sidebar"
import MobileNavigation from "@/components/navigation/mobile-navigation"
import { useMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, Sparkles, ExternalLink, Download } from 'lucide-react'

interface DocumentContentProps {
  file: string
}

function DocumentContent({ file }: DocumentContentProps) {
  const [exists, setExists] = useState<boolean | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [lastPage, setLastPage] = useState<number>(1)

  // Resolve file path: allow absolute/URL, otherwise assume it's in /public/pdfs/{filename}
  const source =
    file.startsWith("http://") || file.startsWith("https://") || file.startsWith("/")
      ? file
      : `/pdfs/${file}`

  // Load last page from localStorage
  useEffect(() => {
    const savedPage = localStorage.getItem(`pdf-page-${file}`)
    setLastPage(savedPage ? parseInt(savedPage) : 1)
  }, [file])

  // Save current page to localStorage
  const saveCurrentPage = useCallback((page: number) => {
    localStorage.setItem(`pdf-page-${file}`, page.toString())
    setLastPage(page)
  }, [file])

  // Page navigation handlers
  const goToPage = useCallback((page: number) => {
    const objectElement = document.querySelector(`object[data*="${file}"]`) as HTMLObjectElement
    if (objectElement) {
      const newSrc = `${source}#page=${page}&toolbar=1&navpanes=0`
      objectElement.data = newSrc
      saveCurrentPage(page)
    }
  }, [file, source, saveCurrentPage])

  // HEAD check to verify the PDF exists and is served correctly
  useEffect(() => {
    let cancelled = false
    setExists(null)
    setLoadError(null)

    async function check() {
      try {
        const res = await fetch(source, { method: "HEAD", cache: "no-store" })
        if (cancelled) return
        if (!res.ok) {
          setExists(false)
          setLoadError(`File not found or not accessible (status ${res.status}).`)
          return
        }
        const ct = res.headers.get("content-type") || ""
        if (!ct.toLowerCase().includes("pdf")) {
          // Some dev servers might not set content-type, still try to render.
          // We warn but proceed.
          console.warn("Preview warning: content-type is not application/pdf. Got:", ct)
        }
        setExists(true)
      } catch (e: any) {
        if (cancelled) return
        setExists(false)
        setLoadError(e?.message || "Network error while checking the file.")
      }
    }

    check()
    return () => {
      cancelled = true
    }
  }, [source])

  return (
    <div className="w-full h-full flex flex-col">
      {exists === null && (
        <div className="p-6 text-center text-gray-600 dark:text-gray-300">Loading preview...</div>
      )}

      {exists === false && (
        <div className="p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">Unable to load PDF</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {loadError || "Failed to load the PDF."}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Tip: Place your PDFs under public/pdfs/ and ensure the filename matches. Trying:{" "}
            <code className="bg-gray-100 dark:bg-[#2a2a2a] px-1 py-0.5 rounded">{source}</code>
          </p>
        </div>
      )}

      {exists && (
        <>
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-[#2a2a2a]">
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
              Previewing: <span className="text-gray-700 dark:text-gray-300">{source}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <span>Page:</span>
                <input
                  type="number"
                  value={lastPage}
                  min="1"
                  className="w-16 px-2 py-1 bg-gray-100 dark:bg-[#2a2a2a] border border-gray-300 dark:border-[#3a3a3a] rounded text-gray-900 dark:text-white text-center"
                  onChange={(e) => {
                    const page = parseInt(e.target.value) || 1
                    if (page > 0) goToPage(page)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const page = parseInt((e.target as HTMLInputElement).value) || 1
                      if (page > 0) goToPage(page)
                    }
                  }}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-200 dark:border-[#2a2a2a] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] text-gray-900 dark:text-white"
                onClick={() => window.open(source, "_blank", "noopener,noreferrer")}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in new tab
              </Button>
              <a
                href={source}
                download
                className="inline-flex items-center rounded-md border border-gray-200 dark:border-[#2a2a2a] px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-[#2a2a2a] text-gray-900 dark:text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </a>
            </div>
          </div>

          {/* Responsive PDF container using the browser's native viewer */}
          <div className="flex-1 min-h-0">
            <object
              data={`${source}#page=${lastPage}&toolbar=1&navpanes=0`}
              type="application/pdf"
              className="w-full h-full min-h-[60vh] rounded-b-xl"
            >
              <div className="p-6 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Your browser cannot display embedded PDFs.
                </p>
                <Button
                  onClick={() => window.open(source, "_blank", "noopener,noreferrer")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open PDF
                </Button>
              </div>
            </object>
          </div>
        </>
      )}
    </div>
  )
}

export default function CollectionDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const isMobile = useMobile()
  const router = useRouter()
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null)

  const collection = useMemo(() => collections.find((c) => c.id === slug), [slug])

  if (!collection) {
    return (
      <main className="flex h-screen bg-white dark:bg-[#121212] text-gray-900 dark:text-white items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-semibold">Collection not found</p>
          <Button className="mt-4 bg-blue-600 hover:bg-blue-700" onClick={() => router.push("/collections")}>
            Back to Collections
          </Button>
        </div>
      </main>
    )
  }

  const handleDocumentClick = (filename: string) => {
    setSelectedDocument(filename)
  }

  const content = (
    <div className="flex-1 p-6 overflow-hidden">
      <div className="max-w-6xl mx-auto h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{collection.name}</h1>
            <span className="text-xs bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
              {collection.documents.length} files
            </span>
          </div>
          <div className="flex gap-2">
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => router.push(`/?collection=${collection.id}`)}>
              <Sparkles className="w-4 h-4 mr-2" />
              Ask about this collection
            </Button>
          </div>
        </div>

        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: list of documents */}
          <div className="lg:col-span-1 h-full overflow-y-auto bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-xl p-4">
            <div className="space-y-3">
              {collection.documents.map((doc, idx) => (
                <div
                  key={doc.filename + idx}
                  className={`p-3 rounded-lg border border-gray-200 dark:border-[#2a2a2a] hover:bg-gray-100 dark:hover:bg-[#252525] transition-colors cursor-pointer ${
                    selectedDocument === doc.filename ? "bg-gray-100 dark:bg-[#252525]" : ""
                  }`}
                  onClick={() => handleDocumentClick(doc.filename)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate text-gray-900 dark:text-white">{doc.title}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{doc.filename}</div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mt-1">{doc.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: PDF preview panel */}
          <div className="lg:col-span-2 h-full overflow-hidden">
            {selectedDocument ? (
              <div className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-xl h-full flex flex-col">
                <DocumentContent file={selectedDocument} />
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-xl p-6 h-full flex flex-col items-center justify-center">
                <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Select a document to preview</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">Click on a document in the list to view it here.</p>
              </div>
            )}
          </div>
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
