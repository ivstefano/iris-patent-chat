import os
from typing import List, Dict, Any
from dataclasses import dataclass
import uuid
import pypdf
import re

@dataclass
class ChunkMetadata:
    chunk_id: str
    source_document: str
    page_number: int
    chunk_type: str
    section_title: str = ""
    
@dataclass
class DocumentChunk:
    chunk_id: str
    content: str
    metadata: ChunkMetadata

class PDFProcessor:
    def __init__(self, chunk_size: int = 1000, overlap: int = 200):
        self.chunk_size = chunk_size
        self.overlap = overlap
    
    def process_pdf(self, pdf_path: str) -> List[DocumentChunk]:
        """
        Process a PDF file into chunks with metadata using pypdf
        """
        try:
            filename = os.path.basename(pdf_path)
            document_chunks = []
            
            with open(pdf_path, 'rb') as file:
                pdf_reader = pypdf.PdfReader(file)
                
                for page_num, page in enumerate(pdf_reader.pages):
                    text = page.extract_text()
                    
                    if not text.strip():
                        continue
                    
                    # Simple text chunking with overlap
                    chunks = self._chunk_text(text, self.chunk_size, self.overlap)
                    
                    for i, chunk_text in enumerate(chunks):
                        if len(chunk_text.strip()) < 50:  # Skip very short chunks
                            continue
                            
                        chunk_id = str(uuid.uuid4())
                        
                        # Extract section title from chunk (first line or first sentence)
                        lines = chunk_text.strip().split('\n')
                        section_title = lines[0][:100] if lines else ""
                        
                        metadata = ChunkMetadata(
                            chunk_id=chunk_id,
                            source_document=filename,
                            page_number=page_num + 1,
                            chunk_type="text",
                            section_title=section_title
                        )
                        
                        document_chunk = DocumentChunk(
                            chunk_id=chunk_id,
                            content=chunk_text.strip(),
                            metadata=metadata
                        )
                        
                        document_chunks.append(document_chunk)
            
            return document_chunks
            
        except Exception as e:
            print(f"Error processing PDF {pdf_path}: {str(e)}")
            return []
    
    def _chunk_text(self, text: str, chunk_size: int, overlap: int) -> List[str]:
        """
        Split text into overlapping chunks
        """
        if len(text) <= chunk_size:
            return [text]
        
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + chunk_size
            
            # Try to break at sentence boundary
            if end < len(text):
                # Look for sentence endings within the last 100 characters
                last_period = text.rfind('.', start, end)
                last_newline = text.rfind('\n', start, end)
                
                break_point = max(last_period, last_newline)
                if break_point > start:
                    end = break_point + 1
            
            chunk = text[start:end]
            chunks.append(chunk)
            
            # Move start position with overlap
            start = end - overlap
            
            if start >= len(text):
                break
        
        return chunks
    
    def extract_material_info(self, chunks: List[DocumentChunk]) -> List[DocumentChunk]:
        """
        Filter chunks that likely contain material composition or recipe information
        """
        material_keywords = [
            'material', 'composition', 'recipe', 'preparation', 'temperature',
            'cooling', 'heating', 'steel', 'alloy', 'metal', 'hardness',
            'processing', 'manufacturing', 'treatment'
        ]
        
        relevant_chunks = []
        for chunk in chunks:
            content_lower = chunk.content.lower()
            if any(keyword in content_lower for keyword in material_keywords):
                relevant_chunks.append(chunk)
        
        return relevant_chunks