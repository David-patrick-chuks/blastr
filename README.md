# 🚀 Blastr: AI-Powered Email Broadcast Platform

**Blastr** (formerly BlastAgent) is a modular, high-performance email marketing suite designed for the AI era. It leverages **Gemini 2.0 Flash** and **RAG (Retrieval-Augmented Generation)** to transform raw documents, web content, and images into highly personalized, high-deliverability email campaigns.

---

## ✨ Key Features

### 🧠 Intelligent Studio

- **Gemini 2.0 Flash Integration**: Real-time interactive chat for email drafting and refinement.
- **Dynamic Prompt Engineering**: Fine-tune your agent's personality and system instructions directly from the dashboard.
- **Context-Aware Personalization**: AI that understands your business through indexed knowledge.

### 📚 Adaptive Knowledge Base (RAG)

- **Multi-Source Indexing**: Support for PDF, TXT, DOCX, and CSV files.
- **Multimedia Training**: Automatically transcribe and index YouTube videos for contextual depth.
- **Web Crawler**: Cleanly extract and index core messaging from any website URL.
- **Vector Search**: High-speed semantic retrieval using `pgvector`.

### 🔍 Vision Extraction Engine

- **OCR-to-Campaign**: Extract emails and recipient data directly from images (business cards, screenshots, lists) using Gemini Vision.
- **Instant Sync**: One-click integration of extracted data into active campaigns.

### 🛡️ Enterprise-Grade Delivery

- **Custom SMTP Gateway**: Connect your own domains via Gmail, SendGrid, or private SMTP servers.
- **Built-in Diagnostics**: Real-time SMTP verification and connection testing.
- **Performance Cockpit**: Live activity logs and transmission analytics.

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: React 19 (Vite)
- **Icons**: Lucide React
- **Real-time**: Socket.IO Client
- **Styling**: Tailwind CSS / Vanilla CSS

### Backend

- **Core**: Node.js & Express (TypeScript)
- **AI Engine**: Google Gemini 1.5/2.0
- **Database**: Supabase (PostgreSQL) with `vector` extension
- **Email**: Nodemailer with dynamic transporter pooling

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- Supabase Project (with `vector` and `uuid-ossp` extensions)
- Google Gemini API Key

### Backend Setup

1. Navigate to the backend folder: `cd backend`
2. Install dependencies: `npm install`
3. Configure `.env`:
   ```env
   PORT=5000
   DATABASE_URL=your_postgres_connection_string
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_key
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email
   SMTP_PASS=your_app_password
   ```
4. Initialize the database: `npx tsx src/scripts/initDb.ts`
5. Run dev server: `npm run dev`

### Frontend Setup

1. Navigate to the web folder: `cd web`
2. Install dependencies: `npm install`
3. Configure environment variables if necessary.
4. Run dev server: `npm run dev`

---

## 📖 Flow Documentation

For a detailed breakdown of all dashboard user flows and technical integrations, see [DASHBOARD_FLOWS.md](./DASHBOARD_FLOWS.md).

## 📄 License

ISC License.
