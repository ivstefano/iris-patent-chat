#!/usr/bin/env python3
"""
Script to process ALL PDFs and populate the vector database
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.pdf_processor import PDFProcessor
from src.embedding_engine import EmbeddingEngine
from src.vector_store import VectorStore
import glob
import time

def process_single_pdf(pdf_path: str, pdf_processor, embedding_engine, vector_store):
    """
    Process a single PDF file and add it to the vector database
    """
    print(f"\n📄 Processing: {os.path.basename(pdf_path)}")
    
    # Process PDF into chunks
    chunks = pdf_processor.process_pdf(pdf_path)
    
    if not chunks:
        print(f"  ⚠️ No chunks extracted from {os.path.basename(pdf_path)}")
        return 0
    
    print(f"  ✓ Extracted {len(chunks)} chunks")
    
    # Generate embeddings
    texts = [chunk.content for chunk in chunks]
    embeddings = embedding_engine.generate_embeddings(texts)
    
    if embeddings.size == 0:
        print(f"  ❌ Failed to generate embeddings")
        return 0
    
    print(f"  ✓ Generated {len(embeddings)} embeddings")
    
    # Add to vector store
    vector_store.add_chunks(chunks, embeddings.tolist())
    print(f"  ✓ Added to vector database")
    
    return len(chunks)

def main():
    """
    Main function to process all PDFs
    """
    # Get PDF directory
    pdf_dir = "../public/pdfs"
    
    if not os.path.exists(pdf_dir):
        print(f"❌ PDF directory not found: {pdf_dir}")
        return
    
    # Get all PDF files
    pdf_files = glob.glob(os.path.join(pdf_dir, "*.pdf"))
    
    if not pdf_files:
        print("❌ No PDF files found in directory")
        return
    
    print(f"🔍 Found {len(pdf_files)} PDF files to process")
    print("=" * 50)
    
    # Initialize components once
    print("🚀 Initializing components...")
    pdf_processor = PDFProcessor(chunk_size=1000, overlap=200)
    embedding_engine = EmbeddingEngine()
    vector_store = VectorStore()
    
    # Get initial stats
    initial_stats = vector_store.get_collection_stats()
    initial_chunks = initial_stats['total_chunks']
    print(f"📊 Initial database contains {initial_chunks} chunks")
    
    # For automation, we'll append to existing database
    if initial_chunks > 0:
        print(f"ℹ️ Appending to existing database with {initial_chunks} chunks")
    
    print("\n" + "=" * 50)
    print("Starting PDF processing...")
    print("=" * 50)
    
    # Process each PDF
    total_chunks_added = 0
    successful_pdfs = 0
    failed_pdfs = []
    
    start_time = time.time()
    
    for i, pdf_path in enumerate(pdf_files, 1):
        print(f"\n[{i}/{len(pdf_files)}] Processing...")
        try:
            chunks_added = process_single_pdf(
                pdf_path, 
                pdf_processor, 
                embedding_engine, 
                vector_store
            )
            if chunks_added > 0:
                total_chunks_added += chunks_added
                successful_pdfs += 1
            else:
                failed_pdfs.append(os.path.basename(pdf_path))
        except Exception as e:
            print(f"  ❌ Error processing {os.path.basename(pdf_path)}: {str(e)}")
            failed_pdfs.append(os.path.basename(pdf_path))
    
    end_time = time.time()
    processing_time = end_time - start_time
    
    # Get final stats
    final_stats = vector_store.get_collection_stats()
    final_chunks = final_stats['total_chunks']
    
    # Print summary
    print("\n" + "=" * 50)
    print("📊 PROCESSING SUMMARY")
    print("=" * 50)
    print(f"✓ PDFs processed successfully: {successful_pdfs}/{len(pdf_files)}")
    print(f"✓ Total chunks added: {total_chunks_added}")
    print(f"✓ Database now contains: {final_chunks} chunks")
    print(f"✓ Processing time: {processing_time:.2f} seconds")
    
    if failed_pdfs:
        print(f"\n⚠️ Failed PDFs ({len(failed_pdfs)}):")
        for pdf in failed_pdfs:
            print(f"  - {pdf}")
    
    print("\n✅ All PDFs processed! You can now search across all documents.")
    print("🔍 Try queries like:")
    print("  - 'chromium content in steel'")
    print("  - 'electrical resistivity requirements'")
    print("  - 'temperature effects on material properties'")
    print("  - 'silicon percentage in alloys'")

if __name__ == "__main__":
    main()