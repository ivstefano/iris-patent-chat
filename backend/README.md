# IRIS.ai RAG Backend

## Quick Start

### 1. Setup Environment
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Process PDFs (already done)
```bash
python process_pdf.py
```
✅ This created 98 chunks from EP1577413_A1.pdf

### 3. Test Search (no API key needed)
```bash
python simple_test.py
```

### 4. Start Test Server (no API key needed)
```bash
python test_server.py
```
- Server runs on http://localhost:8000
- API docs: http://localhost:8000/docs
- Test endpoint: POST http://localhost:8000/api/search

### 5. For Full RAG with Claude Sonnet
Add your Anthropic API key to `.env`:
```bash
ANTHROPIC_API_KEY=your_key_here
```

Then start the full server:
```bash
python start_server.py
```

## Current Status

✅ **Working:**
- PDF chunking (98 chunks from one patent)
- Semantic search with similarity scores
- Vector database with ChromaDB
- FastAPI backend with CORS for frontend
- Similarity threshold filtering (>70%)

🔧 **Next Steps:**
- Add your ANTHROPIC_API_KEY for Claude Sonnet integration
- Frontend is already connected and will use the RAG backend

## Test Queries

Try these queries to see the system work:
- "steel hardness"
- "material composition" 
- "electrical steel properties"
- "Cr content" (Chromium content)
- "Si content" (Silicon content)

## API Response Format

```json
{
  "answer": "Generated answer (test mode or Claude Sonnet)",
  "sources": [
    {
      "chunk_id": "uuid",
      "content": "Exact chunk text...",
      "similarity": 64.3,
      "metadata": {
        "document": "EP1577413_A1.pdf",
        "page": 8,
        "section": "Material composition section",
        "type": "text"
      }
    }
  ],
  "confidence": 0.61,
  "total_chunks_found": 5
}
```