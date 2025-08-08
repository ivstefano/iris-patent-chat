export interface QueryItem {
  id: string
  slug: string
  originalQuery: string
  timestamp: number
  result?: string
}

const STORAGE_KEY = "iris_query_history"

// Save a query to localStorage
export const saveQuery = (query: string, slug: string, result?: string): QueryItem => {
  const queryItem: QueryItem = {
    id: Math.random().toString(36).substring(2, 15),
    slug,
    originalQuery: query,
    timestamp: Date.now(),
    result,
  }

  // Get existing queries
  const existingQueries = getQueries()

  // Add new query to the beginning of the array
  const updatedQueries = [queryItem, ...existingQueries]

  // Only keep the most recent 50 queries
  const limitedQueries = updatedQueries.slice(0, 50)

  // Save to localStorage
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedQueries))
  }

  return queryItem
}

// Get all queries from localStorage (internal helper)
const getQueries = (): QueryItem[] => {
  if (typeof window === "undefined") {
    return []
  }

  const storedQueries = localStorage.getItem(STORAGE_KEY)
  if (!storedQueries) {
    return []
  }

  try {
    return JSON.parse(storedQueries)
  } catch (error) {
    console.error("Error parsing query history:", error)
    return []
  }
}
