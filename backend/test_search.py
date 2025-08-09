#!/usr/bin/env python3
"""
Test script to verify the search functionality works
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.embedding_engine import EmbeddingEngine
from src.vector_store import VectorStore
from src.search_engine import SemanticSearchEngine

def test_search():
    """
    Test the search functionality without requiring API keys
    """
    print("Testing search functionality...")
    
    # Initialize components
    embedding_engine = EmbeddingEngine()
    vector_store = VectorStore()
    search_engine = SemanticSearchEngine(embedding_engine, vector_store)
    
    # Get stats
    stats = search_engine.get_statistics()
    print(f"Vector database contains {stats['total_chunks']} chunks")
    
    if stats['total_chunks'] == 0:
        print("❌ No chunks found in database. Run process_pdf.py first.")
        return False
    
    # Test search
    test_queries = [
        "material composition",
        "steel hardness",
        "temperature cooling",
        "manufacturing process"
    ]
    
    for query in test_queries:
        print(f"\n🔍 Testing query: '{query}'")
        results = search_engine.search(query, threshold=0.5, max_results=5)
        
        print(f"Found {len(results)} relevant chunks:")
        for i, result in enumerate(results, 1):
            similarity_pct = round(result.similarity * 100, 1)
            print(f"  {i}. Similarity: {similarity_pct}%")
            print(f"     Document: {result.metadata.get('source_document', 'Unknown')}")
            print(f"     Page: {result.metadata.get('page_number', 'Unknown')}")
            print(f"     Content preview: {result.content[:200]}...")
            print()
    
    print("✅ Search functionality test completed!")
    return True

if __name__ == "__main__":
    test_search()