from typing import List, Dict, Any
from dataclasses import dataclass
from .embedding_engine import EmbeddingEngine
from .vector_store import VectorStore

@dataclass
class SearchResult:
    chunk_id: str
    content: str
    similarity: float
    metadata: Dict[str, Any]

class SemanticSearchEngine:
    def __init__(self, embedding_engine: EmbeddingEngine, vector_store: VectorStore):
        self.embedding_engine = embedding_engine
        self.vector_store = vector_store
    
    def search(self, query: str, threshold: float = 0.7, max_results: int = 10) -> List[SearchResult]:
        """
        Perform semantic search for relevant chunks
        """
        try:
            # Generate query embedding
            query_embedding = self.embedding_engine.generate_single_embedding(query)
            
            if query_embedding.size == 0:
                return []
            
            # Search in vector store
            results = self.vector_store.search_similar(
                query_embedding=query_embedding.tolist(),
                n_results=max_results,
                threshold=threshold
            )
            
            # Convert to SearchResult objects
            search_results = []
            for result in results:
                search_result = SearchResult(
                    chunk_id=result['chunk_id'],
                    content=result['content'],
                    similarity=result['similarity'],
                    metadata=result['metadata']
                )
                search_results.append(search_result)
            
            return search_results
            
        except Exception as e:
            print(f"Error in semantic search: {str(e)}")
            return []
    
    def filter_by_relevance(self, results: List[SearchResult], threshold: float = 0.7) -> List[SearchResult]:
        """
        Filter results by relevance threshold
        """
        return [result for result in results if result.similarity >= threshold]
    
    def get_statistics(self) -> Dict[str, Any]:
        """
        Get search engine statistics
        """
        return self.vector_store.get_collection_stats()