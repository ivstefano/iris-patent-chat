from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class SearchQuery(BaseModel):
    query: str
    threshold: float = 0.3  # Show results above 30% similarity
    max_results: int = 15

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

class ProcessingStatus(BaseModel):
    status: str
    message: str
    chunks_created: int = 0

class ChunkDetail(BaseModel):
    chunk_id: str
    content: str
    metadata: ChunkMetadata