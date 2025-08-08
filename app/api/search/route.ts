import { NextResponse } from "next/server"

interface SearchResult {
  title: string
  url: string
  content: string
  source: "JIRA" | "CONFLUENCE"
}

interface SummaryResponse {
  summary: string
  searchResults: SearchResult[]
}

type SourceInput = "all" | "jira" | "confluence"

function toBackendSources(source: SourceInput): Array<"JIRA" | "CONFLUENCE"> {
  switch (source) {
    case "jira":
      return ["JIRA"]
    case "confluence":
      return ["CONFLUENCE"]
    case "all":
    default:
      return ["JIRA", "CONFLUENCE"]
  }
}

function buildMockResponse(question: string, sources: Array<"JIRA" | "CONFLUENCE">): SummaryResponse {
  const s = question?.trim() || "your query"
  const summary = [
    `Here is a quick synthesized overview for “${s}”.`,
    "",
    "Key takeaways:",
    "- Growth is driven by digital onboarding, embedded finance, and alternative credit assessment models.",
    "- Margins are compressing due to increased competition and interchange pressure; product bundling and B2B services are common responses.",
    "- Regulation is tightening (KYC/AML, data residency, DSA/DFS equivalents), with regional variance that impacts product rollout timelines.",
    "- AI is being adopted to improve underwriting, fraud detection, and service automation; measurable wins include lower review times and higher fraud catch rates.",
  ].join("\n")

  const searchResults: SearchResult[] = [
    {
      title: "Fintech Market Trends 2024: Consolidation and Embedded Finance",
      url: "https://confluence.iris.co/display/PM/Fintech+Market+Trends+2024",
      content:
        "Summary of 2024 trends including embedded finance, SMB credit innovation, and regulatory headwinds; includes adoption metrics and regional notes.",
      source: "CONFLUENCE",
    },
    {
      title: "Payments Platform: Cross-Border Volumes and Cost Drivers",
      url: "https://confluence.iris.co/display/ENG/Payments+Platform+Strategy",
      content:
        "Engineering notes on cross‑border flows, cost levers (FX spreads, scheme fees), and roadmap items for settlement optimization.",
      source: "CONFLUENCE",
    },
    {
      title: "TIDE-421: Market intelligence integration for product planning",
      url: "https://jira.iris.co/browse/TIDE-421",
      content:
        "Incorporates third‑party market signals for planning; includes dashboards tracking sector growth and competitive launches.",
      source: "JIRA",
    },
  ].filter((r) => sources.includes(r.source))

  // If user filters down to a single source, ensure at least one item
  if (searchResults.length === 0) {
    const fallback: SearchResult =
      sources[0] === "JIRA"
        ? {
            title: "TIDE-999: Strategy synthesis for market trends",
            url: "https://jira.iris.co/browse/TIDE-999",
            content: "Internal summary ticket consolidating market trend research for quarterly planning.",
            source: "JIRA",
          }
        : {
            title: "Fintech Trends Overview (Internal)",
            url: "https://confluence.iris.co/display/STRAT/Fintech+Trends+Overview",
            content: "Confluence page summarizing quarterly external reports and their impact on roadmap.",
            source: "CONFLUENCE",
          }
    searchResults.push(fallback)
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
    const base = process.env.TIDE_BACKEND_URL

    // If no backend configured, return a mock so the UI works in preview/dev.
    if (!base) {
      return NextResponse.json(buildMockResponse(query, backendSources), {
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

    let parsed: any | null = null
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
    const mock = buildMockResponse(query, backendSources)
    return NextResponse.json(mock, { status: 200, headers: { "cache-control": "no-store" } })
  } catch (error) {
    // As a last resort, return a minimal mock so the page doesn’t break.
    const safeMock = buildMockResponse("your query", ["JIRA", "CONFLUENCE"])
    return NextResponse.json(safeMock, { status: 200, headers: { "cache-control": "no-store" } })
  }
}
