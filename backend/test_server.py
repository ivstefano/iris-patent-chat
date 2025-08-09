#!/usr/bin/env python3
"""
Test server without requiring Anthropic API key
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
from src.embedding_engine import EmbeddingEngine
from src.vector_store import VectorStore
from src.search_engine import SemanticSearchEngine
import uvicorn

app = FastAPI(title="IRIS.ai RAG API - Test Mode")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SearchQuery(BaseModel):
    query: str
    threshold: float = 0.7
    max_results: int = 10

class ChunkMetadata(BaseModel):
    document: str
    page: int
    section: str
    type: str

class Source(BaseModel):
    chunk_id: str
    content: str
    similarity: float
    metadata: ChunkMetadata

class RAGResponse(BaseModel):
    answer: str
    sources: List[Source]
    confidence: float
    total_chunks_found: int

# Initialize components
embedding_engine = None
vector_store = None
search_engine = None

def get_search_components():
    global embedding_engine, vector_store, search_engine
    
    if not embedding_engine:
        embedding_engine = EmbeddingEngine()
    
    if not vector_store:
        vector_store = VectorStore()
    
    if not search_engine:
        search_engine = SemanticSearchEngine(embedding_engine, vector_store)
    
    return search_engine

@app.post("/api/search", response_model=RAGResponse)
async def search_documents(search_query: SearchQuery):
    """
    Search for relevant document chunks (test mode without LLM)
    """
    try:
        search_engine = get_search_components()
        
        # Get search results
        results = search_engine.search(
            query=search_query.query,
            threshold=search_query.threshold,
            max_results=search_query.max_results
        )
        
        if not results:
            return RAGResponse(
                answer="No relevant information found in the documents for your query.",
                sources=[],
                confidence=0.0,
                total_chunks_found=0
            )
        
        # Format sources
        sources = []
        for result in results:
            source = Source(
                chunk_id=result.chunk_id,
                content=result.content[:500] + "..." if len(result.content) > 500 else result.content,
                similarity=round(result.similarity * 100, 1),  # Convert to percentage
                metadata=ChunkMetadata(
                    document=result.metadata.get('source_document', ''),
                    page=result.metadata.get('page_number', 1),
                    section=result.metadata.get('section_title', ''),
                    type=result.metadata.get('chunk_type', '')
                )
            )
            sources.append(source)
        
        # Generate simple answer without LLM
        answer = f"Found {len(results)} relevant chunks related to '{search_query.query}'. The most relevant information includes material composition and processing details from patent documents. See the sources below for specific details with similarity scores."
        
        confidence = sum(result.similarity for result in results) / len(results)
        
        return RAGResponse(
            answer=answer,
            sources=sources,
            confidence=round(confidence, 2),
            total_chunks_found=len(results)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@app.get("/api/status")
async def get_status():
    """
    Get the status of the RAG system
    """
    try:
        search_engine = get_search_components()
        stats = search_engine.get_statistics()
        
        return {
            "status": "ready",
            "mode": "test",
            "total_chunks": stats['total_chunks'],
            "embedding_model": "all-MiniLM-L6-v2",
            "note": "Running in test mode without Claude Sonnet"
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

@app.get("/")
async def root():
    return {
        "message": "IRIS.ai RAG API is running in test mode",
        "version": "1.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    print("Starting RAG API server in test mode...")
    print("API Documentation: http://localhost:8000/docs")
    print("Search endpoint: http://localhost:8000/api/search")
    
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)