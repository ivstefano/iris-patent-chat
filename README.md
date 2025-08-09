# IRIS.ai Patent Chat

A sophisticated RAG (Retrieval Augmented Generation) system for intelligent patent document analysis, featuring semantic search, vector embeddings, and AI-powered responses using Claude Sonnet.

## 🎥 Demo

[![IRIS.ai Patent Chat Demo](https://img.youtube.com/vi/VTJyhW-b_7Y/maxresdefault.jpg)](https://youtu.be/VTJyhW-b_7Y)

**[🎬 Watch the Demo on YouTube →](https://youtu.be/VTJyhW-b_7Y)**

See the full application in action, including semantic search, AI-powered conversations, PDF viewing, and collection management features.

## 🚀 Features

- **🔍 Semantic Search**: Advanced patent document search using vector embeddings
- **🤖 AI-Powered Chat**: Intelligent responses powered by Claude Sonnet 3.5
- **📄 PDF Processing**: Automatic chunking and indexing of patent documents
- **💬 Conversational Interface**: Chat-based interaction with document collections
- **🎨 Modern UI**: Clean, responsive interface with dark/light mode support
- **📚 Collection Management**: Organize documents into searchable collections
- **🔗 Source Attribution**: Transparent source citations with similarity scores

## 📚 Document Collections

### Pre-loaded Patent Collection

The application comes with a pre-loaded collection of **10 European patent documents** focused on electrical steel and materials science:

**📍 Location**: `public/pdfs/`

**📋 Patent Documents Included**:
- `EP1577413_A1.pdf` - Non-Oriented Electrical Steel Sheet with Low Iron Loss and High Strength
- `EP1816226_A1.pdf` - Electrical steel compositions and processing methods
- `EP2278034_A1.pdf` - Advanced electrical steel materials
- `EP2316980_A1.pdf` - Steel processing and composition control
- `EP2390376_A1.pdf` - Electrical steel manufacturing techniques
- `EP2439302_A1.pdf` - Material property optimization
- `EP2537954_A1.pdf` - Steel alloy compositions
- `EP2602335_A1.pdf` - Processing methods for electrical steel
- `EP2679695_A1.pdf` - Steel material characterization
- `EP2698441_A1.pdf` - Advanced steel manufacturing processes

**🎯 Collection Focus**: These patents cover various aspects of electrical steel manufacturing, including:
- Material compositions (Chromium, Silicon content)
- Manufacturing processes and techniques
- Material properties and characterization
- Processing optimization methods
- Quality control and testing procedures

**💾 Vector Database**: All documents have been pre-processed and indexed into a vector database located at `backend/data/embeddings/`, enabling instant semantic search across all patent content.

This collection serves as the default knowledge base for the chat system, allowing users to ask questions about electrical steel properties, manufacturing processes, and material compositions across all indexed patents.

## 📋 Prerequisites

- **Node.js** 18.x or higher
- **Python** 3.8 or higher
- **npm** or **pnpm**
- **Anthropic API Key** for Claude Sonnet integration

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/ivstefano/iris-patent-chat.git
cd iris-patent-chat
```

### 2. Backend Setup

#### Install Python Dependencies
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### Configure Environment
```bash
# Copy the environment template
cp .env.example .env

# Edit .env file and add your Anthropic API key
nano .env  # or your preferred editor
```

**Required Environment Variables:**
```env
# Anthropic API Configuration
ANTHROPIC_API_KEY=sk-ant-api03-your_anthropic_api_key_here

# Server Configuration (defaults are fine)
API_HOST=0.0.0.0
API_PORT=8000

# Model Configuration
EMBEDDING_MODEL=all-MiniLM-L6-v2
LLM_MODEL=claude-3-5-sonnet-20241022

# Chunking Configuration
CHUNK_SIZE=1000
CHUNK_OVERLAP=200

# Search Configuration
DEFAULT_SIMILARITY_THRESHOLD=0.7
MAX_SEARCH_RESULTS=10

# File Paths
PDF_SOURCE_DIR=../public/pdfs
VECTOR_DB_PATH=data/embeddings
PROCESSED_DATA_PATH=data/processed
```

#### Process PDF Documents (Optional - Already Done)
```bash
# The vector database is already populated, but you can reprocess if needed
python process_all_pdfs.py
```

#### Test the Backend
```bash
# Test semantic search without API key
python simple_test.py

# Test the API server (basic mode)
python test_server.py

# Start full server with Claude integration (requires API key)
python start_server.py
```

The backend will be available at:
- **API Server**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

### 3. Frontend Setup

#### Install Dependencies
```bash
cd ..  # Back to project root
npm install
# or
pnpm install
```

#### Start Development Server
```bash
npm run dev
# or
pnpm dev
```

The frontend will be available at: **http://localhost:3000**

## 🎯 Usage

### Starting the Full System

1. **Start Backend** (in one terminal):
```bash
cd backend
source venv/bin/activate
python start_server.py
```

2. **Start Frontend** (in another terminal):
```bash
npm run dev
```

### Using the Application

1. **Browse Collections**: Visit http://localhost:3000/collections to see available document collections
2. **Start Chatting**: Click "Chat" on any collection or go to the home page
3. **Ask Questions**: Type questions about the patent documents
4. **View Sources**: Click on source references to view the original PDF content
5. **Manage Collections**: Add new datasets or delete existing ones

### Sample Queries

Try these example queries to test the system:

- "What is the chromium content in the steel?"
- "Describe the electrical steel properties"
- "What are the material composition requirements?"
- "How does silicon content affect the steel properties?"
- "What is the manufacturing process for non-oriented electrical steel?"

## 🗂️ Project Structure

```
iris-patent-chat/
├── README.md                 # This file
├── package.json             # Frontend dependencies
├── next.config.mjs         # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS config
├── tsconfig.json          # TypeScript config
│
├── app/                   # Next.js app directory
│   ├── api/              # API routes
│   │   └── search/       # Search endpoint
│   ├── collections/      # Collections pages
│   ├── components/       # React components
│   │   ├── chat/        # Chat interface
│   │   └── pdf/         # PDF viewer
│   ├── q/               # Chat conversation pages
│   └── globals.css      # Global styles
│
├── backend/              # Python backend
│   ├── README.md        # Backend-specific docs
│   ├── requirements.txt # Python dependencies
│   ├── .env.example    # Environment template
│   ├── api/            # FastAPI application
│   │   ├── main.py     # Main API server
│   │   ├── models.py   # Data models
│   │   └── routes/     # API route handlers
│   ├── src/            # Core backend modules
│   │   ├── embedding_engine.py  # Vector embeddings
│   │   ├── pdf_processor.py     # PDF processing
│   │   ├── rag_engine.py        # RAG implementation
│   │   ├── search_engine.py     # Search functionality
│   │   └── vector_store.py      # Vector database
│   ├── data/           # Data storage
│   │   └── embeddings/ # Vector database
│   └── config/         # Configuration files
│
├── components/          # Shared UI components
├── hooks/              # React hooks
├── store/             # State management
├── lib/               # Utility functions
└── public/            # Static assets
    └── pdfs/         # Patent PDF files
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
source venv/bin/activate

# Test search functionality
python simple_test.py

# Test API server
python test_server.py

# Test full server integration
python test_search.py
```

### Frontend Tests
```bash
# Run linting
npm run lint

# Build production version
npm run build
```

## 🚀 Production Deployment

### Backend Production
```bash
cd backend
source venv/bin/activate

# Install production server
pip install gunicorn

# Run with Gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker api.main:app --bind 0.0.0.0:8000
```

### Frontend Production
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🔧 Configuration

### Backend Configuration (`backend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key for Claude | Required |
| `API_HOST` | Server host | `0.0.0.0` |
| `API_PORT` | Server port | `8000` |
| `EMBEDDING_MODEL` | Sentence transformer model | `all-MiniLM-L6-v2` |
| `LLM_MODEL` | Claude model version | `claude-3-5-sonnet-20241022` |
| `CHUNK_SIZE` | PDF chunk size | `1000` |
| `CHUNK_OVERLAP` | Chunk overlap | `200` |
| `DEFAULT_SIMILARITY_THRESHOLD` | Minimum similarity score | `0.7` |
| `MAX_SEARCH_RESULTS` | Maximum results returned | `10` |

### Frontend Environment Variables

Create `.env.local` in the project root if needed:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🤝 API Reference

### Search Endpoint

**POST** `/api/search`

```json
{
  "query": "What is the chromium content?",
  "collection": "electrical_steel",
  "conversationId": "optional-conversation-id"
}
```

**Response:**
```json
{
  "summary": "Generated AI response...",
  "searchResults": [
    {
      "title": "Document Title",
      "content": "Relevant content chunk...",
      "similarity": 85.3,
      "url": "/pdfs/document.pdf",
      "page": 5,
      "metadata": {
        "document": "EP1577413_A1.pdf",
        "section": "Material Composition"
      }
    }
  ]
}
```

## 🎨 UI Components

The application includes several key components:

- **Chat Interface**: Real-time conversation with the AI
- **PDF Viewer**: Integrated PDF viewing with search highlighting
- **Source Panel**: Clickable source citations with similarity scores
- **Collection Manager**: Add/delete document collections
- **Theme Toggle**: Dark/light mode support

## 📦 Adding New Documents

### Method 1: Direct File Addition
1. Add PDF files to `public/pdfs/`
2. Run the processing script:
```bash
cd backend
python process_pdf.py path/to/your/document.pdf
```

### Method 2: Collection Management (UI)
1. Visit `/collections` page
2. Click "Add Dataset" button
3. Choose from Local Folder, Google Drive, or Dropbox
4. Upload your documents through the interface

## 🐛 Troubleshooting

### Common Issues

**1. "Module not found" errors in backend:**
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

**2. "API key not found" errors:**
- Ensure `.env` file exists in `backend/` directory
- Verify `ANTHROPIC_API_KEY` is set correctly
- Check for extra spaces or quotes in the key

**3. CORS errors:**
- Backend automatically handles CORS for localhost:3000
- For production, update CORS settings in `backend/api/main.py`

**4. Vector database issues:**
```bash
cd backend
rm -rf data/embeddings
python process_all_pdfs.py  # Recreate database
```

**5. Frontend build errors:**
```bash
rm -rf node_modules
npm install
npm run build
```

### Logs and Debugging

Backend logs are available in:
- `backend/server.log` - Standard logs
- `backend/server_full.log` - Detailed logs

Enable debug mode by setting:
```env
DEBUG=true
LOG_LEVEL=DEBUG
```

## 🔒 Security Considerations

- Store API keys securely and never commit them to version control
- Use environment variables for sensitive configuration
- Consider implementing rate limiting for production deployments
- Validate and sanitize all user inputs
- Use HTTPS in production environments

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For questions, issues, or contributions, please:

1. Check the [Issues](https://github.com/ivstefano/iris-patent-chat/issues) page
2. Create a new issue with detailed information
3. Include relevant logs and configuration details

---

**Made with ❤️ for patent research and AI-powered document analysis**