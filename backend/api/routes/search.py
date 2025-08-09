from fastapi import APIRouter, HTTPException
from ..models import SearchQuery, RAGResponse, ChunkDetail, Source, ChunkMetadata
from src.embedding_engine import EmbeddingEngine
from src.vector_store import VectorStore
from src.search_engine import SemanticSearchEngine
from src.rag_engine import RAGEngine
import os

router = APIRouter()

# Initialize components (singleton pattern)
embedding_engine = None
vector_store = None
search_engine = None
rag_engine = None

def get_rag_components():
    global embedding_engine, vector_store, search_engine, rag_engine
    
    if not embedding_engine:
        embedding_engine = EmbeddingEngine()
    
    if not vector_store:
        vector_store = VectorStore()
    
    if not search_engine:
        search_engine = SemanticSearchEngine(embedding_engine, vector_store)
    
    if not rag_engine:
        rag_engine = RAGEngine(search_engine)
    
    return rag_engine

@router.post("/search", response_model=RAGResponse)
async def search_documents(search_query: SearchQuery):
    """
    Search for relevant document chunks and generate an answer using Claude Sonnet
    """
    try:
        rag_engine = get_rag_components()
        
        # Generate RAG response
        response = rag_engine.generate_answer(
            query=search_query.query,
            threshold=search_query.threshold
        )
        
        # Convert to API response format
        sources = []
        for source_data in response.sources:
            source = Source(
                chunk_id=source_data['chunk_id'],
                content=source_data['content'],
                similarity=source_data['similarity'],
                metadata=ChunkMetadata(
                    document=source_data['metadata']['document'],
                    page=source_data['metadata']['page'],
                    section=source_data['metadata']['section'],
                    type=source_data['metadata']['type']
                )
            )
            sources.append(source)
        
        return RAGResponse(
            answer=response.answer,
            sources=sources,
            confidence=response.confidence,
            total_chunks_found=response.total_chunks_found
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@router.get("/chunks/{chunk_id}", response_model=ChunkDetail)
async def get_chunk_details(chunk_id: str):
    """
    Get detailed information about a specific chunk
    """
    try:
        rag_engine = get_rag_components()
        
        chunk_data = rag_engine.search_engine.vector_store.get_chunk_by_id(chunk_id)
        
        if not chunk_data:
            raise HTTPException(status_code=404, detail="Chunk not found")
        
        return ChunkDetail(
            chunk_id=chunk_data['chunk_id'],
            content=chunk_data['content'],
            metadata=ChunkMetadata(
                document=chunk_data['metadata']['source_document'],
                page=chunk_data['metadata']['page_number'],
                section=chunk_data['metadata']['section_title'],
                type=chunk_data['metadata']['chunk_type']
            )
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve chunk: {str(e)}")

@router.get("/status")
async def get_status():
    """
    Get the status of the RAG system
    """
    try:
        rag_engine = get_rag_components()
        stats = rag_engine.search_engine.get_statistics()
        
        return {
            "status": "ready",
            "total_chunks": stats['total_chunks'],
            "embedding_model": "all-MiniLM-L6-v2",
            "llm_model": "claude-3-5-sonnet-20241022"
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }