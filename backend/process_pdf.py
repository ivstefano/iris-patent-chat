#!/usr/bin/env python3
"""
Script to process PDFs and populate the vector database
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.pdf_processor import PDFProcessor
from src.embedding_engine import EmbeddingEngine
from src.vector_store import VectorStore
import glob

def process_single_pdf(pdf_path: str):
    """
    Process a single PDF file and add it to the vector database
    """
    print(f"Processing PDF: {pdf_path}")
    
    # Initialize components
    pdf_processor = PDFProcessor(chunk_size=1000, overlap=200)
    embedding_engine = EmbeddingEngine()
    vector_store = VectorStore()
    
    # Process PDF into chunks
    print("Extracting and chunking PDF...")
    chunks = pdf_processor.process_pdf(pdf_path)
    
    if not chunks:
        print("No chunks extracted from PDF")
        return False
    
    print(f"Extracted {len(chunks)} chunks")
    
    # Generate embeddings
    print("Generating embeddings...")
    texts = [chunk.content for chunk in chunks]
    embeddings = embedding_engine.generate_embeddings(texts)
    
    if embeddings.size == 0:
        print("Failed to generate embeddings")
        return False
    
    print(f"Generated {len(embeddings)} embeddings")
    
    # Add to vector store
    print("Adding chunks to vector database...")
    vector_store.add_chunks(chunks, embeddings.tolist())
    
    # Get stats
    stats = vector_store.get_collection_stats()
    print(f"Vector database now contains {stats['total_chunks']} total chunks")
    
    return True

def main():
    """
    Main function to process PDFs
    """
    # Get PDF directory
    pdf_dir = "../public/pdfs"
    
    if not os.path.exists(pdf_dir):
        print(f"PDF directory not found: {pdf_dir}")
        return
    
    # Get all PDF files
    pdf_files = glob.glob(os.path.join(pdf_dir, "*.pdf"))
    
    if not pdf_files:
        print("No PDF files found in directory")
        return
    
    print(f"Found {len(pdf_files)} PDF files")
    
    # Process first PDF for testing
    first_pdf = pdf_files[0]
    print(f"Processing first PDF: {os.path.basename(first_pdf)}")
    
    success = process_single_pdf(first_pdf)
    
    if success:
        print("✅ PDF processing completed successfully!")
        print("You can now start the API server and test the search functionality.")
    else:
        print("❌ PDF processing failed")

if __name__ == "__main__":
    main()