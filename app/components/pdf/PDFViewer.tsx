"use client"

import React from 'react'
import { X, ExternalLink, Download } from 'lucide-react'

interface PDFViewerProps {
  isOpen: boolean
  onClose: () => void
  pdfUrl: string
  documentTitle: string
  initialPage?: number
  searchText?: string
}

export function PDFViewer({ isOpen, onClose, pdfUrl, documentTitle, initialPage, searchText }: PDFViewerProps) {
  if (!isOpen) return null

  // Construct PDF URL with page parameter and search if provided
  let fullPdfUrl = `${pdfUrl}#toolbar=1&navpanes=0`
  
  if (initialPage) {
    fullPdfUrl += `&page=${initialPage}`
  }
  
  // Add search parameter if search text is provided
  if (searchText) {
    // Clean the search text - take first few meaningful words
    const cleanSearchText = searchText
      .replace(/[^\w\s%]/g, ' ') // Remove special characters except % and spaces
      .split(' ')
      .filter(word => word.length > 2) // Filter out short words
      .slice(0, 3) // Take first 3 words
      .join(' ')
      .trim()
    
    if (cleanSearchText) {
      fullPdfUrl += `&search=${encodeURIComponent(cleanSearchText)}`
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex bg-black bg-opacity-50">
      <div className="flex-1" onClick={onClose} />
      
      <div className="w-1/2 bg-white dark:bg-gray-900 shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
              {documentTitle}
            </h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {initialPage && <span>Page {initialPage}</span>}
              {searchText && (
                <span className={initialPage ? " • " : ""}>
                  Searching: "{searchText.substring(0, 50)}{searchText.length > 50 ? '...' : ''}"
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => window.open(pdfUrl, '_blank', 'noopener,noreferrer')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              title="Open in new tab"
            >
              <ExternalLink className="h-4 w-4" />
            </button>
            <a
              href={pdfUrl}
              download
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              title="Download PDF"
            >
              <Download className="h-4 w-4" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* PDF Content */}
        <div className="flex-1 min-h-0">
          <object
            data={fullPdfUrl}
            type="application/pdf"
            className="w-full h-full min-h-[70vh]"
          >
            <div className="p-6 text-center h-full flex flex-col items-center justify-center">
              <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
                Cannot display PDF
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Your browser cannot display embedded PDFs or the PDF is blocked.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => window.open(pdfUrl, '_blank', 'noopener,noreferrer')}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in new tab
                </button>
                <a
                  href={pdfUrl}
                  download
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </a>
              </div>
            </div>
          </object>
        </div>
      </div>
    </div>
  )
}