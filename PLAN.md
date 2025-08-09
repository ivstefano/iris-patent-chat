# RAG System Implementation Plan for PDF Chunking and Semantic Search

## Overview
This plan outlines the implementation of a Retrieval-Augmented Generation (RAG) system that processes PDF documents (particularly patents) to provide accurate, traceable answers with exact chunk references and similarity percentages.

## Key Requirements
- **Accuracy**: Provide trustworthy answers with fact traceability (addressing the 70% accuracy issue with Anthropic Sonet API)
- **Citations**: Show exact chunks with similarity percentages (>70% threshold)
- **Material Focus**: Extract material composition and preparation recipes
- **Cross-references**: Link information between text, tables, and entities
- **Technical Language**: Handle patent-specific terminology effectively

## Technology Stack

### Core Dependencies
```
Python 3.9+
unstructured[all-docs]==0.12.0  # PDF parsing with layout detection
sentence-transformers==2.2.2    # Embeddings generation
chromadb==0.4.22               # Vector database
transformers==4.36.0           # Hugging Face models
torch==2.1.0                   # PyTorch backend
pandas==2.1.4                  # Data manipulation
numpy==1.24.3                  # Numerical operations
fastapi==0.104.1              # API backend
anthropic==0.18.0              # Claude Sonnet API integration
pydantic==2.5.0                # Data validation
```

### Optional Enhanced Dependencies
```
camelot-py[cv]==0.10.1         # Advanced table extraction
pdfplumber==0.10.3             # Alternative PDF parsing
pytesseract==0.3.10            # OCR for scanned PDFs
spacy==3.7.2                   # NLP processing
```

## Phase 1: PDF Processing & Chunking Pipeline

### 1.1 Document Parsing
**Implementation**: Use Unstructured library for comprehensive PDF parsing

**Features**:
- Extract text, tables, and images with layout preservation
- Maintain page numbers and position metadata
- Handle both native and scanned PDFs
- Detect document structure (headers, paragraphs, lists)

**Code Structure**:
```python
# src/pdf_processor.py
class PDFProcessor:
    def parse_document(self, pdf_path: str) -> List[DocumentElement]
    def extract_tables(self, pdf_path: str) -> List[Table]
    def preserve_metadata(self, element: DocumentElement) -> ElementMetadata
```

### 1.2 Intelligent Chunking Strategy
**Approach**: Hybrid chunking with context preservation

**Strategy**:
1. **Semantic Chunking**: Split by document structure (paragraphs, sections)
2. **Overlapping Windows**: 200-character overlap between chunks
3. **Size Limits**: 500-1000 characters per chunk (optimized for patent content)
4. **Context Preservation**: Maintain headers and table relationships

**Metadata Tracking**:
```python
class ChunkMetadata:
    chunk_id: str
    source_document: str
    page_number: int
    start_position: int
    end_position: int
    chunk_type: str  # text, table, header
    parent_section: str
    cross_references: List[str]
```

## Phase 2: Embedding and Vector Storage

### 2.1 Embedding Generation
**Model**: `all-MiniLM-L6-v2` (optimized for semantic similarity)
- 384-dimensional embeddings
- Fast inference
- Good performance on technical content

**Alternative Models** (for comparison):
- `all-mpnet-base-v2` (higher accuracy, slower)
- `sentence-transformers/all-distilroberta-v1` (domain-specific fine-tuning)

### 2.2 Vector Database Setup
**Storage**: ChromaDB with persistent storage

**Collections Structure**:
```python
# Separate collections for different content types
collections = {
    "text_chunks": "General text content",
    "table_data": "Extracted tables with structure",
    "material_recipes": "Material composition and preparation steps"
}
```

**Indexing Strategy**:
- Create separate indexes for different content types
- Enable filtering by metadata (page, document, content type)
- Implement hybrid search (semantic + keyword)

## Phase 3: Semantic Search and Retrieval

### 3.1 Query Processing
**Pipeline**:
1. Query preprocessing and normalization
2. Generate query embeddings using same model
3. Perform similarity search across collections
4. Apply relevance filtering (>70% similarity threshold)
5. Rank and deduplicate results

### 3.2 Similarity Calculation
**Method**: Cosine similarity with normalized scores
**Threshold**: 70% minimum similarity for inclusion
**Ranking**: Weighted by similarity score and content type relevance

**Implementation**:
```python
class SemanticSearchEngine:
    def search(self, query: str, threshold: float = 0.5) -> List[SearchResult]
    def calculate_similarity(self, query_embedding, chunk_embedding) -> float
    def filter_by_relevance(self, results: List[SearchResult]) -> List[SearchResult]
```

## Phase 4: RAG Integration with Claude Sonnet

### 4.1 Context Compilation for LLM
**Process**:
1. Retrieve relevant chunks above threshold (>70% similarity)
2. Sort by similarity score
3. Include cross-referenced content
4. Format context for Claude Sonnet API

### 4.2 Claude Sonnet Integration
**Implementation**:
```python
class RAGEngine:
    def __init__(self):
        self.anthropic_client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        self.search_engine = SemanticSearchEngine()
    
    def generate_answer(self, query: str) -> RAGResponse:
        # 1. Retrieve relevant chunks
        relevant_chunks = self.search_engine.search(query, threshold=0.5)
        
        # 2. Format context for Sonnet
        context = self.format_context_for_llm(relevant_chunks)
        
        # 3. Generate answer using Claude Sonnet
        response = self.anthropic_client.messages.create(
            model="claude-3-5-sonnet-20241022",
            messages=[{
                "role": "user", 
                "content": self.build_rag_prompt(query, context)
            }]
        )
        
        return self.format_response(response, relevant_chunks)
```

### 4.3 Response Format
**Structure**:
```json
{
  "answer": "Claude Sonnet generated response based on chunks",
  "sources": [
    {
      "chunk_id": "doc1_page5_chunk3",
      "content": "Exact chunk text...",
      "similarity": 0.87,
      "metadata": {
        "document": "patent_12345.pdf",
        "page": 5,
        "section": "Material Composition"
      }
    }
  ],
  "confidence": 0.89,
  "cross_references": ["table_3", "figure_2"],
  "llm_reasoning": "Claude's reasoning process"
}
```

## Phase 5: Frontend Integration

### 5.1 API Endpoints for Frontend
**Backend API Routes**:
```python
# backend/api/routes/search.py
@router.post("/search")
async def search_documents(query: SearchQuery) -> RAGResponse

@router.post("/upload")
async def upload_pdf(file: UploadFile) -> ProcessingStatus

@router.get("/chunks/{chunk_id}")
async def get_chunk_details(chunk_id: str) -> ChunkDetail
```

### 5.2 Frontend Chat Integration
**Approach**: Connect existing frontend to backend via API calls
**Features**:
- Send user queries to backend RAG endpoint
- Display Claude Sonnet responses with chunk citations
- Show similarity percentages for each source
- Highlight chunks above 70% threshold
- Link to exact page/section references

### 5.3 Response Display Components
- **Answer Section**: Claude Sonnet's response
- **Sources Panel**: Retrieved chunks with similarity scores
- **Citation Links**: Navigate to exact PDF locations
- **Confidence Indicators**: Visual similarity percentage bars

## Phase 6: Quality Assurance and Evaluation

### 6.1 Accuracy Metrics
**Evaluation Criteria**:
- Precision: Relevance of retrieved chunks
- Recall: Coverage of relevant information
- F1-Score: Balanced accuracy measure
- Citation Accuracy: Correctness of source attribution

### 6.2 Domain-Specific Testing
**Test Cases**:
1. Material composition queries
2. Temperature and parameter extraction
3. Cross-reference following
4. Statistical information retrieval
5. Correlation analysis queries

**Example Queries for Testing**:
- "What is the highest temperature used during cooling in these patents?"
- "How does higher temperature affect steel hardness?"
- "What are the material composition recipes for steel alloys?"

## Implementation Timeline

### Week 1-2: Foundation Setup
- Set up development environment
- Implement PDF parsing pipeline
- Create basic chunking system
- Set up vector database

### Week 3-4: Core Functionality
- Implement embedding generation
- Build semantic search engine
- Create citation system
- Develop similarity scoring

### Week 5-6: Frontend Integration and RAG Completion
- Create FastAPI endpoints for frontend integration
- Implement Claude Sonnet RAG pipeline
- Connect existing chat frontend to backend
- Add chunk visualization and citation display

### Week 7-8: Testing and Optimization
- Conduct accuracy testing
- Optimize chunk sizes and overlap
- Fine-tune similarity thresholds
- Performance optimization

## File Structure
```
iris-ai-chat/
├── backend/
│   ├── src/
│   │   ├── pdf_processor.py          # PDF parsing and chunking
│   │   ├── embedding_engine.py       # Embedding generation
│   │   ├── vector_store.py          # ChromaDB operations
│   │   ├── search_engine.py         # Semantic search logic
│   │   ├── citation_manager.py      # Source attribution
│   │   └── __init__.py
│   ├── api/
│   │   ├── main.py              # FastAPI application
│   │   ├── models.py            # Pydantic models
│   │   ├── routes/
│   │   │   ├── pdf_upload.py    # PDF upload endpoints
│   │   │   ├── search.py        # Search endpoints
│   │   │   └── __init__.py
│   │   └── __init__.py
│   ├── data/
│   │   ├── processed/           # Processed chunks
│   │   ├── embeddings/          # Vector storage
│   │   └── raw/                 # Original PDFs (public/pdfs)
│   ├── tests/
│   │   ├── test_chunking.py
│   │   ├── test_search.py
│   │   ├── test_accuracy.py
│   │   └── __init__.py
│   ├── config/
│   │   ├── settings.py          # Configuration
│   │   └── models.yaml          # Model configurations
│   ├── requirements.txt
│   └── README.md
├── frontend/
│   ├── src/                     # Existing chat frontend
│   ├── components/              # UI components
│   ├── static/                  # Assets
│   └── package.json             # Frontend dependencies
├── public/
│   └── pdfs/                    # Source PDF files for processing
├── PLAN.md
└── README.md
```

## Success Metrics

### Technical Metrics
- **Search Accuracy**: >80% relevant results above 70% threshold
- **Response Time**: <3 seconds for typical queries
- **Citation Accuracy**: 95% correct source attribution
- **Cross-reference Coverage**: Successfully link 70% of related content

### User Experience Metrics
- **Trust Score**: Researchers can verify >90% of answers
- **Time Savings**: 60% reduction in fact-checking time
- **Query Success Rate**: 85% of domain-specific queries answered satisfactorily

## Risk Mitigation

### Technical Risks
- **Model Performance**: Test multiple embedding models for domain fit
- **Scalability**: Implement efficient indexing and caching
- **Accuracy**: Continuous evaluation and model updates

### Domain Risks
- **Patent Language Complexity**: Fine-tune preprocessing for technical terms
- **Table Extraction**: Implement robust table parsing with multiple tools
- **Cross-references**: Develop sophisticated entity linking

## Future Enhancements

### Phase 2 Features
- **Multi-modal Support**: Handle images and diagrams
- **Advanced NLP**: Entity recognition for materials and processes
- **Knowledge Graphs**: Build relationships between concepts
- **Active Learning**: Improve with user feedback

### Integration Possibilities
- **Patent Database APIs**: Real-time patent data
- **Laboratory Information Systems**: Connect to research workflows
- **Collaboration Tools**: Share findings and annotations

This plan provides a comprehensive roadmap for implementing a production-ready RAG system that addresses the specific needs of patent research and material science applications.