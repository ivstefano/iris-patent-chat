#!/usr/bin/env python3
"""
Simple test of the RAG functionality
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.embedding_engine import EmbeddingEngine
from src.vector_store import VectorStore
from src.search_engine import SemanticSearchEngine

def main():
    print("🔍 Testing RAG Search System")
    
    # Initialize components
    print("Initializing components...")
    embedding_engine = EmbeddingEngine()
    vector_store = VectorStore()
    search_engine = SemanticSearchEngine(embedding_engine, vector_store)
    
    # Test query
    query = "steel hardness and material composition"
    print(f"Searching for: '{query}'")
    
    results = search_engine.search(query, threshold=0.5, max_results=5)
    
    print(f"\n📊 Found {len(results)} relevant chunks:")
    
    for i, result in enumerate(results, 1):
        similarity_pct = round(result.similarity * 100, 1)
        print(f"\n--- CHUNK {i} ---")
        print(f"Similarity: {similarity_pct}%")
        print(f"Document: {result.metadata.get('source_document', 'Unknown')}")
        print(f"Page: {result.metadata.get('page_number', 'Unknown')}")
        print(f"Content: {result.content[:300]}...")
        print()
    
    # Simulate what would be sent to frontend
    frontend_response = {
        "answer": f"Found {len(results)} relevant chunks about {query}. The search system is working correctly.",
        "sources": [
            {
                "chunk_id": result.chunk_id,
                "content": result.content[:500] + "..." if len(result.content) > 500 else result.content,
                "similarity": round(result.similarity * 100, 1),
                "metadata": {
                    "document": result.metadata.get('source_document', ''),
                    "page": result.metadata.get('page_number', 1),
                    "section": result.metadata.get('section_title', ''),
                    "type": result.metadata.get('chunk_type', '')
                }
            }
            for result in results
        ],
        "confidence": round(sum(result.similarity for result in results) / len(results), 2) if results else 0,
        "total_chunks_found": len(results)
    }
    
    print("\n✅ RAG System Status:")
    print(f"   - PDF processed: EP1577413_A1.pdf")
    print(f"   - Total chunks: {vector_store.get_collection_stats()['total_chunks']}")
    print(f"   - Embeddings model: all-MiniLM-L6-v2")
    print(f"   - Search threshold: 50%")
    print(f"   - Found chunks above threshold: {len(results)}")
    
    return frontend_response

if __name__ == "__main__":
    response = main()