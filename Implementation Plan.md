# IRIS.ai Chat Interface Implementation Plan

## Overview
Transform the current single Q&A flow into a conversational chat interface with AI responses, source references, and similarity matching.

## Current State Analysis
- **Home Page**: Search input redirects to `/q/[slug]` URLs
- **Conversation Store**: Basic Zustand store exists for question/answer pairs
- **Search API**: Returns summary + searchResults from backend or mock data
- **UI Components**: Search input, suggestions, collection selector already implemented

## Target Architecture

### 1. Chat Page Structure (`/q/[slug]/page.tsx`)

#### Layout Components:
```
┌─────────────────────────────────────────────────────┐
│                    Sidebar                          │
├─────────────────────────────────────────────────────┤
│  Chat Messages Area    │    References Sidebar      │
│  ┌─────────────────────┐│ ┌─────────────────────────┐ │
│  │  Q: User question   ││ │  Related Documents      │ │
│  │  A: AI response     ││ │  - Doc 1 (85% match)    │ │
│  │  Q: Follow-up       ││ │  - Doc 2 (72% match)    │ │
│  │  A: AI response     ││ │  - Doc 3 (68% match)    │ │
│  └─────────────────────┘│ └─────────────────────────┘ │
│                         │                           │
│  ┌─────────────────────┐│                           │
│  │  Chat Input         ││                           │
│  └─────────────────────┘│                           │
└─────────────────────────────────────────────────────┘
```

### 2. Data Architecture Updates

#### Enhanced Conversation Store
```typescript
interface DocumentReference {
  id: string
  title: string
  filename: string
  similarity: number // 0-100%
  collection?: string
  url?: string
}

interface ConversationMessage {
  id: string
  type: 'question' | 'answer'
  content: string
  timestamp: Date
  isEditing?: boolean
  sources?: DocumentReference[] // For answers
  isLoading?: boolean
}

interface ConversationThread {
  id: string
  title: string // First question truncated
  messages: ConversationMessage[]
  collection?: string
  createdAt: Date
  updatedAt: Date
}
```

#### Enhanced Search API Response
```typescript
interface EnhancedSearchResult extends SearchResult {
  similarity: number // 0-100%
  documentId: string
  collection: string
}

interface ChatResponse {
  answer: string
  sources: EnhancedSearchResult[]
  conversationId: string
}
```

### 3. Component Architecture

#### Core Components to Build:

##### `ChatInterface` Component
- **Location**: `/app/q/[slug]/page.tsx`
- **Responsibilities**: 
  - Main chat page layout
  - Message history rendering
  - Input handling
  - State management integration

##### `MessageBubble` Component
- **Props**: `message: ConversationMessage, onEdit?, onDelete?`
- **Features**:
  - Question bubbles (right-aligned, user-styled)
  - Answer bubbles (left-aligned, AI-styled with typing animation)
  - Edit functionality for questions
  - Loading states

##### `ChatInput` Component
- **Features**:
  - Multi-line text input
  - Send button
  - Collection selector (inherited from conversation)
  - Auto-resize
  - Enter/Shift+Enter handling

##### `SourcesPanel` Component
- **Features**:
  - List of referenced documents
  - Similarity percentages (color-coded)
  - Click to view document details
  - Collection badges
  - Expandable/collapsible sections

##### `DocumentPreviewModal` Component
- **Features**:
  - Modal overlay for document details
  - PDF viewer integration
  - Highlight relevant sections
  - Download/external link options

### 4. Implementation Phases

#### Phase 1: Basic Chat Interface (Week 1)
1. **Create chat page structure**
   - Build `/app/q/[slug]/page.tsx` with chat layout
   - Implement `MessageBubble` component
   - Create `ChatInput` component
   - Set up responsive design (mobile/desktop)

2. **Enhance conversation store**
   - Update Zustand store with new data structure
   - Add message management functions
   - Implement persistence (localStorage)
   - Add conversation history

3. **Update routing**
   - Ensure `/q/[slug]` routes work properly
   - Add conversation title generation
   - Handle new conversation creation

#### Phase 2: AI Integration (Week 2)
1. **Enhance search API**
   - Modify `/app/api/search/route.ts` to support chat context
   - Add conversation history to API calls
   - Implement similarity scoring (mock initially)
   - Add document reference extraction

2. **Implement streaming responses**
   - Add real-time message updates
   - Create loading states and typing indicators
   - Handle error states gracefully
   - Add retry mechanisms

3. **Message management**
   - Edit functionality for questions
   - Regenerate answers for edited questions
   - Delete messages with confirmation
   - Message threading/context awareness

#### Phase 3: Sources & References (Week 3)
1. **Build sources panel**
   - Create `SourcesPanel` component
   - Implement similarity-based sorting
   - Add color-coded confidence levels
   - Create expandable document previews

2. **Document integration**
   - Connect to existing PDF viewer
   - Add document highlighting
   - Implement reference navigation
   - Create document preview modal

3. **Enhanced metadata**
   - Add document collection badges
   - Show last updated dates
   - Include author information
   - Add relevance explanations

#### Phase 4: Advanced Features (Week 4)
1. **Conversation management**
   - Add conversation list to sidebar
   - Implement conversation search
   - Add conversation sharing
   - Create conversation export

2. **Performance optimization**
   - Implement virtual scrolling for long conversations
   - Add message caching
   - Optimize re-renders
   - Add progressive loading

3. **Enhanced UX**
   - Add keyboard shortcuts
   - Implement drag-and-drop for files
   - Add voice input (future consideration)
   - Create conversation templates

### 5. Technical Specifications

#### Responsive Design
- **Desktop**: Split layout (chat + sources)
- **Tablet**: Collapsible sources panel
- **Mobile**: Full-screen chat with bottom sheet sources

#### Theme Support
- Full light/dark theme compatibility
- Consistent with existing design system
- Proper contrast ratios for accessibility

#### Performance Targets
- **Initial Load**: < 2s
- **Message Send**: < 500ms response
- **Source Panel**: < 100ms interactions
- **Smooth Scrolling**: 60fps

#### Data Persistence
- **Conversations**: localStorage + Zustand
- **User Preferences**: localStorage
- **Session State**: sessionStorage
- **Conversation Export**: JSON/Markdown formats

### 6. API Integration Points

#### Chat API Endpoint (`/api/chat`)
```typescript
POST /api/chat
{
  query: string
  conversationId?: string
  collection?: string
  messageHistory?: ConversationMessage[]
}

Response: {
  answer: string
  sources: EnhancedSearchResult[]
  conversationId: string
}
```

#### Similarity Scoring
- **Mock Implementation**: Random scores 60-95%
- **Real Implementation**: Backend similarity service
- **Fallback**: Basic keyword matching scores

### 7. File Structure

```
app/
├── q/
│   └── [slug]/
│       └── page.tsx (ChatInterface)
├── api/
│   ├── search/
│   │   └── route.ts (enhanced)
│   └── chat/
│       └── route.ts (new)
└── components/
    └── chat/
        ├── MessageBubble.tsx
        ├── ChatInput.tsx
        ├── SourcesPanel.tsx
        ├── DocumentPreviewModal.tsx
        └── ConversationList.tsx

store/
└── conversation-store.ts (enhanced)

types/
└── chat.ts (new type definitions)
```

### 8. Testing Strategy

#### Unit Tests
- Message rendering components
- Conversation store actions
- API response handling
- Similarity calculation functions

#### Integration Tests
- Chat flow end-to-end
- Source panel interactions
- Document preview functionality
- Theme switching

#### User Testing
- Conversation flow usability
- Mobile responsiveness
- Accessibility compliance
- Performance benchmarks

### 9. Migration Strategy

#### Backward Compatibility
- Maintain existing `/q/[slug]` URLs
- Graceful handling of old conversation data
- Progressive enhancement approach

#### Data Migration
- Convert existing conversations to new format
- Preserve conversation history
- Handle missing fields gracefully

### 10. Success Metrics

#### User Experience
- **Conversation Completion Rate**: >80%
- **Source Click-through Rate**: >30%
- **User Satisfaction**: >4.2/5
- **Mobile Usability Score**: >90

#### Performance
- **Page Load Time**: <2s
- **Time to First Response**: <3s
- **Source Panel Load**: <500ms
- **Error Rate**: <2%

## Next Steps

1. **Review and approve this plan**
2. **Set up development environment**
3. **Begin Phase 1 implementation**
4. **Set up testing framework**
5. **Create design mockups for approval**

## Questions for Clarification

1. Should we prioritize real-time collaboration features?
2. What's the preferred similarity calculation method?
3. Should conversations be persisted server-side?
4. Any specific accessibility requirements?
5. Integration timeline with backend services?