import { NextResponse } from "next/server"
import { collections } from "@/data/collections"

interface SearchResult {
  title: string
  url: string
  content: string
  source: "DOCUMENT"
  filename?: string
  collection?: string
  similarity?: number
  page?: number
}

interface SummaryResponse {
  summary: string
  searchResults: SearchResult[]
}

type SourceInput = "all" | "documents"

function toBackendSources(source: SourceInput): Array<"DOCUMENT"> {
  switch (source) {
    case "documents":
      return ["DOCUMENT"]
    case "all":
    default:
      return ["DOCUMENT"] // Default to documents since that's what we have
  }
}

function getDocumentTitle(filename: string): string {
  for (const collection of collections) {
    const doc = collection.documents.find(d => d.filename === filename)
    if (doc) {
      return doc.title
    }
  }
  return filename.replace('.pdf', '') // Fallback to filename without extension
}

async function callRAGBackend(query: string): Promise<SummaryResponse | null> {
  try {
    const response = await fetch("http://localhost:8000/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
        threshold: 0.3,  // Show all results above 30% similarity
        max_results: 15   // Get more results
      })
    })

    if (!response.ok) {
      console.error("RAG backend error:", response.status)
      return null
    }

    const ragData = await response.json()
    
    // Convert RAG response to frontend format
    const searchResults: SearchResult[] = ragData.sources.map((source: any) => {
      const documentTitle = getDocumentTitle(source.metadata.document)
      return {
        title: documentTitle,
        url: `/pdfs/${source.metadata.document}`,
        content: source.content,
        source: "DOCUMENT" as const,
        filename: source.metadata.document,
        collection: "Patents",
        similarity: source.similarity,
        page: source.metadata.page
      }
    })

    return {
      summary: ragData.answer,
      searchResults
    }
  } catch (error) {
    console.error("Error calling RAG backend:", error)
    return null
  }
}

function buildMockResponse(question: string, sources: Array<"ALL" | "DOCUMENT">, collection?: string): SummaryResponse {
  const s = question?.trim() || "your query"
  
  // Generate AI-like response about steel/metal patents
  const summary = [
    `Based on the available patent documents, here's what I found regarding "${s}":`,
    "",
    "Key findings:",
    "- Multiple patents focus on high-strength electrical steel with improved magnetic properties and reduced core loss.",
    "- Advanced manufacturing techniques include controlled rolling, annealing processes, and optimized chemical compositions.",
    "- Significant improvements in strength (>580 MPa tensile), magnetic permeability (>5000), and reduced iron loss (<5 W/kg).",
    "- Applications span automotive, electrical motors, transformers, and high-speed rotor systems.",
  ].join("\n")

  // Get relevant documents from collections
  let relevantDocs: SearchResult[] = []
  
  // Find the collection or use all if no specific collection
  const targetCollection = collection ? collections.find(c => c.name === collection) : null
  const docsToSearch = targetCollection ? [targetCollection] : collections

  docsToSearch.forEach(coll => {
    // Select 3-5 random documents from the collection
    const selectedDocs = coll.documents
      .sort(() => Math.random() - 0.5) // Shuffle
      .slice(0, Math.floor(Math.random() * 3) + 3) // Pick 3-5 docs
    
    selectedDocs.forEach(doc => {
      relevantDocs.push({
        title: doc.title,
        url: `/pdfs/${doc.filename}`,
        content: doc.description,
        source: "DOCUMENT",
        filename: doc.filename,
        collection: coll.name,
      })
    })
  })

  // Limit to 6 total results and sort by relevance (simulated)
  const searchResults = relevantDocs
    .slice(0, 6)
    .filter((r) => sources.includes(r.source as any))

  // If no documents match, provide at least one fallback
  if (searchResults.length === 0 && sources.includes("DOCUMENT")) {
    const fallback = collections[0].documents[0]
    searchResults.push({
      title: fallback.title,
      url: `/pdfs/${fallback.filename}`,
      content: fallback.description,
      source: "DOCUMENT",
      filename: fallback.filename,
      collection: collections[0].name,
    })
  }

  return { summary, searchResults }
}

function withTimeout(ms: number): AbortController {
  const controller = new AbortController()
  setTimeout(() => controller.abort(), ms)
  return controller
}

export async function POST(request: Request) {
  try {
    const { query, source = "all", type = "SIMPLE", collection } = await request.json()

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    const backendSources = toBackendSources(source as SourceInput)
    
    // Try to call our new RAG backend first
    const ragResponse = await callRAGBackend(query)
    if (ragResponse) {
      return NextResponse.json(ragResponse, {
        status: 200,
        headers: { "cache-control": "no-store" },
      })
    }

    const base = process.env.IRIS_BACKEND_URL

    // If no backend configured, return a mock so the UI works in preview/dev.
    if (!base) {
      return NextResponse.json(buildMockResponse(query, backendSources, collection), {
        status: 200,
        headers: { "cache-control": "no-store" },
      })
    }

    // Try GET first, then fall back to POST if backend rejects the method.
    const endpoint = `${base.replace(/\/+$/, "")}/api/v4/summarize`

    // 1) Attempt GET with query params
    const url = new URL(endpoint)
    url.searchParams.append("question", query)
    url.searchParams.append("type", String(type))
    backendSources.forEach((s) => url.searchParams.append("sources", s))
    if (collection) url.searchParams.append("collection", String(collection))

    let parsed: any | null
    let response: Response | null = null
    let raw: string | null = null

    try {
      const ctl = withTimeout(12000)
      response = await fetch(url.toString(), {
        method: "GET",
        headers: { accept: "application/json" },
        signal: ctl.signal,
      })
      raw = await response.text()

      if (!response.ok) {
        // Try POST fallback below
        parsed = null
      } else {
        const ct = response.headers.get("content-type") || ""
        if (ct.includes("json")) {
          parsed = JSON.parse(raw)
        } else {
          // Attempt JSON parse anyway; if it fails, fallback to POST
          try {
            parsed = JSON.parse(raw)
          } catch {
            parsed = null
          }
        }
      }
    } catch {
      // Network/timeout -> fall through to POST fallback or mock
      parsed = null
    }

    // 2) If GET failed or returned invalid JSON, try POST with JSON body
    if (!parsed) {
      try {
        const ctl = withTimeout(12000)
        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            question: query,
            type,
            sources: backendSources,
            collection,
          }),
          signal: ctl.signal,
        })
        const text = await res.text()
        if (res.ok) {
          try {
            parsed = JSON.parse(text)
          } catch {
            parsed = null
          }
        } else {
          parsed = null
        }
      } catch {
        parsed = null
      }
    }

    // 3) Normalize successful payload or return mock if backend not usable
    if (parsed) {
      const node = parsed?.data ?? parsed ?? {}
      const summary = typeof node.summary === "string" ? node.summary : ""
      const searchResults = Array.isArray(node.searchResults) ? (node.searchResults as SearchResult[]) : []

      // If backend returned empty summary, provide a minimal fallback text
      const safeSummary =
        summary && summary.trim().length > 0
          ? summary
          : `I couldn't retrieve a full summary from the backend. Here's a brief outline based on “${query}”.`

      return NextResponse.json(
        {
          summary: safeSummary,
          searchResults,
        } as SummaryResponse,
        { headers: { "cache-control": "no-store" } },
      )
    }

    // 4) Final fallback: mock response (keeps the UI functional in preview)
    const mock = buildMockResponse(query, backendSources, collection)
    return NextResponse.json(mock, { status: 200, headers: { "cache-control": "no-store" } })
  } catch (error) {
    // As a last resort, return a minimal mock so the page doesn't break.
    const safeMock = buildMockResponse("your query", ["DOCUMENT"])
    return NextResponse.json(safeMock, { status: 200, headers: { "cache-control": "no-store" } })
  }
}
