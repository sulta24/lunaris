# 🚀 Lunaris AI - NASA Space Apps 2024

> **Built in 36 hours for NASA Space Apps 2024 Challenge**

An AI-powered platform for space biology research featuring conversational AI with digital twins of space legends and comprehensive space biology knowledge base.

## ✨ Features

### 🤖 AI-Powered RAG System
- **Intelligent Q&A**: Ask questions about space biology, microgravity effects, and astronaut health
- **Scientific Knowledge Base**: 600+ research papers from NASA's space biology database
- **Real-time Responses**: Fast, accurate answers powered by OpenAI GPT models

### 🎙️ Voice Interface
- **Speech-to-Text**: Ask questions using your voice (Google Cloud STT)
- **Text-to-Speech**: Hear responses in natural Russian voice (Google Cloud TTS)
- **Seamless Interaction**: Complete hands-free experience

### 👨‍🚀 Digital Twins
- **Space Legends**: Chat with AI versions of famous astronauts and scientists
- **Interactive Learning**: Engage in conversations about space exploration
- **Educational Experience**: Learn from the greatest minds in space history

### 📊 Research Database
- **NASA Publications**: Curated collection of space biology research
- **PDF Processing**: Automatic document indexing and search
- **Scientific Citations**: Access to peer-reviewed space medicine studies

## 🛠️ Tech Stack

### Backend
- **FastAPI** - High-performance Python web framework
- **OpenAI API** - GPT models for intelligent responses
- **Google Cloud APIs** - Speech-to-Text and Text-to-Speech
- **Vector Search** - Semantic search through research papers
- **Python 3.11** - Core backend language

### Frontend
- **Next.js 15** - React framework for production
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Modern styling framework
- **Radix UI** - Accessible component library
- **WebGL Shaders** - Interactive space-themed animations

### Infrastructure
- **RESTful API** - Clean API architecture
- **CORS Support** - Cross-origin resource sharing
- **File Upload** - PDF document processing
- **Real-time Status** - Live system monitoring

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- OpenAI API Key
- Google Cloud API Key

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file with your API keys
echo "OPENAI_API_KEY=your_openai_key" > .env
echo "GOOGLE_CLOUD_API_KEY=your_google_cloud_key" >> .env

# Start the server
python run_server.py
```

### Frontend Setup
```bash
cd skitbitagency2
npm install
npm run dev
```

Visit `http://localhost:3000` to access the application.

## 📁 Project Structure