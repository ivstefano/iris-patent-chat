# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

IRIS.ai is an AI-powered internal knowledge search application built with Next.js 14, React 18, and TypeScript. It provides intelligent search across JIRA, Confluence, and document collections with a conversational interface.

## Essential Commands

```bash
# Development
npm run dev          # Start development server (http://localhost:3000)

# Production
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint (Note: errors ignored during build)
```

## High-Level Architecture

### Core Technology Stack
- **Next.js 14** with App Router pattern
- **TypeScript** with strict mode
- **Tailwind CSS** + **shadcn/ui** components
- **Zustand** for conversation state management
- **React Hook Form** + **Zod** for form validation

### Key Architectural Patterns

1. **App Router Structure**: All pages in `/app/` directory using Next.js 14 conventions
   - Dynamic routes: `/q/[slug]` for query results with conversation interface
   - API routes: `/api/search` handles backend integration

2. **Component Organization**:
   - `/components/ui/` - 40+ shadcn/ui reusable components
   - `/app/components/` - Page-specific components
   - `/components/navigation/` - Shared navigation components

3. **State Management**:
   - **Zustand store** (`/store/conversation-store.ts`) for conversation threads
   - **LocalStorage** for query history persistence
   - Component-level state for UI interactions

4. **Backend Integration**:
   - Search API connects to configurable backend via `TIDE_BACKEND_URL` env variable
   - Supports JIRA, Confluence, and document collections
   - Falls back to mock responses when backend unavailable
   - 12-second timeout for search requests

### Data Flow

1. **Search Flow**: 
   - User input → Search API (`/app/api/search/route.ts`) → Backend/Mock data → Results display
   - Collections filtered via query parameters
   - Auto-suggestions based on input

2. **Conversation Management**:
   - Conversations stored in Zustand with unique IDs
   - Follow-up questions maintain thread context
   - Editable messages with optimistic updates

### Key Files and Their Purposes

- `/app/api/search/route.ts` - Main search API endpoint, handles backend communication
- `/store/conversation-store.ts` - Global conversation state management
- `/data/collections.ts` - Document collections configuration (Metal Patents)
- `/app/q/[slug]/page.tsx` - Dynamic query results page with conversation UI
- `/utils/query-storage.ts` - Query history management utilities

### Environment Configuration

```bash
TIDE_BACKEND_URL=<backend_url>  # Backend API URL (falls back to mock if not set)
```

### Development Notes

- **Dark theme enforced** - All components assume dark mode
- **Path aliases**: `@/*` maps to project root
- **Mock data available** for development without backend
- **No test framework** currently configured
- **ESLint/TypeScript errors ignored** during builds (configured in next.config.mjs)

### Common Development Tasks

When modifying search functionality:
1. Update `/app/api/search/route.ts` for backend changes
2. Modify `/data/search-suggestions.tsx` for suggestion updates
3. Adjust `/store/conversation-store.ts` for conversation state changes

When adding new UI components:
1. Use existing shadcn/ui components from `/components/ui/`
2. Follow established patterns in `/app/components/`
3. Maintain dark theme compatibility

When working with collections:
1. Collections defined in `/data/collections.ts`
2. Collection pages in `/app/collections/`
3. Collection filtering handled via URL parameters