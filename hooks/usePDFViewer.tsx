"use client"

import { useState } from 'react'

interface PDFViewerState {
  url: string
  title: string
  page?: number
  searchText?: string
}

export function usePDFViewer() {
  const [selectedPDF, setSelectedPDF] = useState<PDFViewerState | null>(null)

  const openPDF = (pdf: PDFViewerState) => {
    setSelectedPDF(pdf)
  }

  const closePDF = () => {
    setSelectedPDF(null)
  }

  const isOpen = selectedPDF !== null

  return {
    selectedPDF,
    openPDF,
    closePDF,
    isOpen
  }
}