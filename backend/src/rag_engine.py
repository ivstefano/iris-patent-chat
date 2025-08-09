import anthropic
from typing import List, Dict, Any
from dataclasses import dataclass
from .search_engine import SemanticSearchEngine, SearchResult
import os

@dataclass
class RAGResponse:
    answer: str
    sources: List[Dict[str, Any]]
    confidence: float
    total_chunks_found: int

class RAGEngine:
    def __init__(self, search_engine: SemanticSearchEngine):
        self.search_engine = search_engine
        
        # Initialize Anthropic client
        api_key = os.getenv('ANTHROPIC_API_KEY')
        if not api_key:
            raise ValueError("ANTHROPIC_API_KEY environment variable is required")
        
        self.anthropic_client = anthropic.Anthropic(api_key=api_key)
    
    def generate_answer(self, query: str, threshold: float = 0.7) -> RAGResponse:
        """
        Generate an answer using RAG with Claude Sonnet
        """
        try:
            # 1. Retrieve relevant chunks
            relevant_chunks = self.search_engine.search(
                query=query,
                threshold=threshold,
                max_results=10
            )
            
            if not relevant_chunks:
                return RAGResponse(
                    answer="I couldn't find any relevant information in the documents to answer your question.",
                    sources=[],
                    confidence=0.0,
                    total_chunks_found=0
                )
            
            # 2. Format context for Claude Sonnet
            context = self.format_context_for_llm(relevant_chunks)
            
            # 3. Build prompt
            prompt = self.build_rag_prompt(query, context)
            
            # 4. Generate answer using Claude Sonnet
            response = self.anthropic_client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=1000,
                messages=[{
                    "role": "user",
                    "content": prompt
                }]
            )
            
            # 5. Format response
            answer = response.content[0].text if response.content else "No response generated"
            
            # Calculate average confidence from similarity scores
            confidence = sum(chunk.similarity for chunk in relevant_chunks) / len(relevant_chunks)
            
            # Format sources
            sources = [
                {
                    "chunk_id": chunk.chunk_id,
                    "content": chunk.content[:500] + "..." if len(chunk.content) > 500 else chunk.content,
                    "similarity": int(round(chunk.similarity * 100)),  # Convert to percentage (whole number)
                    "metadata": {
                        "document": chunk.metadata.get('source_document', ''),
                        "page": chunk.metadata.get('page_number', 1),
                        "section": chunk.metadata.get('section_title', ''),
                        "type": chunk.metadata.get('chunk_type', '')
                    }
                }
                for chunk in relevant_chunks
            ]
            
            return RAGResponse(
                answer=answer,
                sources=sources,
                confidence=round(confidence, 2),
                total_chunks_found=len(relevant_chunks)
            )
            
        except Exception as e:
            print(f"Error generating RAG answer: {str(e)}")
            return RAGResponse(
                answer=f"Error generating answer: {str(e)}",
                sources=[],
                confidence=0.0,
                total_chunks_found=0
            )
    
    def format_context_for_llm(self, chunks: List[SearchResult]) -> str:
        """
        Format retrieved chunks as context for the LLM
        """
        context_parts = []
        
        for i, chunk in enumerate(chunks, 1):
            similarity_pct = round(chunk.similarity * 100, 1)
            metadata = chunk.metadata
            
            context_part = f"""
EXCERPT {i} (Relevance: {similarity_pct}%)
Document: {metadata.get('source_document', 'Unknown')}
Page: {metadata.get('page_number', 'Unknown')}
Section: {metadata.get('section_title', 'N/A')}

Content:
"{chunk.content}"

---
"""
            context_parts.append(context_part)
        
        return "\n".join(context_parts)
    
    def build_rag_prompt(self, query: str, context: str) -> str:
        """
        Build the prompt for Claude Sonnet with context and query
        """
        return f"""You are a specialized AI assistant for analyzing patent documents, particularly focusing on material science and metallurgy patents. You help researchers extract accurate, traceable information about material composition, preparation recipes, processing parameters, and their relationships.

CONTEXT (Retrieved from patent documents):
{context}

QUERY: {query}

INSTRUCTIONS:
1. Answer the query based ONLY on the provided context from the patent documents
2. Be precise and factual - avoid speculation or general knowledge
3. Focus on material composition, preparation recipes, temperatures, and processing parameters when relevant
4. If the context contains specific numbers, temperatures, or measurements, include them exactly as stated
5. If you cannot answer based on the provided context, clearly state this
6. Maintain scientific accuracy and use proper technical terminology
7. When referencing information, quote the exact text from the excerpts and cite the document
8. Use natural language - avoid mentioning "chunks" or "excerpts" in your response
9. Present quoted text clearly using quotation marks for exact passages

IMPORTANT: Your answer will be displayed alongside the source excerpts, so users can verify the information. Prioritize accuracy and traceability over completeness."""
    
    def test_connection(self) -> bool:
        """
        Test connection to Anthropic API
        """
        try:
            response = self.anthropic_client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=10,
                messages=[{
                    "role": "user",
                    "content": "Hello"
                }]
            )
            return True
        except Exception as e:
            print(f"Error testing Anthropic connection: {str(e)}")
            return False