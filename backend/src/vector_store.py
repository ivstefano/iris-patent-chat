import chromadb
from chromadb.config import Settings
from typing import List, Dict, Any, Optional
import json
import os
from .pdf_processor import DocumentChunk, ChunkMetadata

class VectorStore:
    def __init__(self, persist_directory: str = "data/embeddings"):
        """
        Initialize ChromaDB vector store
        """
        self.persist_directory = persist_directory
        os.makedirs(persist_directory, exist_ok=True)
        
        # Initialize ChromaDB client with persistence
        self.client = chromadb.PersistentClient(
            path=persist_directory,
            settings=Settings(
                anonymized_telemetry=False,
                allow_reset=True
            )
        )
        
        # Create or get collection
        self.collection = self.client.get_or_create_collection(
            name="document_chunks",
            metadata={"hnsw:space": "cosine"}  # Use cosine similarity
        )
    
    def add_chunks(self, chunks: List[DocumentChunk], embeddings: List[List[float]]):
        """
        Add document chunks with their embeddings to the vector store
        """
        try:
            # Prepare data for ChromaDB
            ids = [chunk.chunk_id for chunk in chunks]
            documents = [chunk.content for chunk in chunks]
            metadatas = [self._chunk_metadata_to_dict(chunk.metadata) for chunk in chunks]
            
            # Add to collection
            self.collection.add(
                ids=ids,
                embeddings=embeddings,
                documents=documents,
                metadatas=metadatas
            )
            
            print(f"Added {len(chunks)} chunks to vector store")
            
        except Exception as e:
            print(f"Error adding chunks to vector store: {str(e)}")
    
    def search_similar(self, query_embedding: List[float], n_results: int = 10, 
                      threshold: float = 0.7) -> List[Dict[str, Any]]:
        """
        Search for similar chunks based on query embedding
        """
        try:
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=n_results,
                include=["documents", "metadatas", "distances"]
            )
            
            # Filter by similarity threshold (ChromaDB returns distances, convert to similarity)
            filtered_results = []
            for i, distance in enumerate(results['distances'][0]):
                similarity = 1 - distance  # Convert distance to similarity
                if similarity >= threshold:
                    filtered_results.append({
                        'chunk_id': results['ids'][0][i],
                        'content': results['documents'][0][i],
                        'metadata': results['metadatas'][0][i],
                        'similarity': similarity
                    })
            
            # Sort by similarity (highest first)
            filtered_results.sort(key=lambda x: x['similarity'], reverse=True)
            
            return filtered_results
            
        except Exception as e:
            print(f"Error searching vector store: {str(e)}")
            return []
    
    def get_chunk_by_id(self, chunk_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve a specific chunk by its ID
        """
        try:
            results = self.collection.get(
                ids=[chunk_id],
                include=["documents", "metadatas"]
            )
            
            if results['ids']:
                return {
                    'chunk_id': results['ids'][0],
                    'content': results['documents'][0],
                    'metadata': results['metadatas'][0]
                }
            
            return None
            
        except Exception as e:
            print(f"Error retrieving chunk {chunk_id}: {str(e)}")
            return None
    
    def get_collection_stats(self) -> Dict[str, Any]:
        """
        Get statistics about the collection
        """
        try:
            count = self.collection.count()
            return {
                'total_chunks': count,
                'collection_name': self.collection.name
            }
        except Exception as e:
            print(f"Error getting collection stats: {str(e)}")
            return {'total_chunks': 0, 'collection_name': 'unknown'}
    
    def _chunk_metadata_to_dict(self, metadata: ChunkMetadata) -> Dict[str, Any]:
        """
        Convert ChunkMetadata to dictionary for ChromaDB
        """
        return {
            'source_document': metadata.source_document,
            'page_number': metadata.page_number,
            'chunk_type': metadata.chunk_type,
            'section_title': metadata.section_title
        }
    
    def reset_collection(self):
        """
        Reset the collection (useful for testing)
        """
        try:
            self.client.delete_collection(name="document_chunks")
            self.collection = self.client.create_collection(
                name="document_chunks",
                metadata={"hnsw:space": "cosine"}
            )
            print("Collection reset successfully")
        except Exception as e:
            print(f"Error resetting collection: {str(e)}")