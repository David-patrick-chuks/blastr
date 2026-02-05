# 🚀 BLASTR: Enterprise AI Email Blasting Platform

**BLASTR** (formerly BlastAgent) is a modular, high-performance email marketing suite designed for the AI era. It leverages **Gemini 2.0 Flash** to transform manual intelligence into highly personalized, high-deliverability email operations.

---

## ✨ Key Features

### 🧠 AI Studio
- **Gemini 2.0 Flash Integration**: Real-time interactive chat for email drafting and architectural refinement.
- **Dynamic Prompt Engineering**: Fine-tune your transmission bots' personality and behavior directly from the Command Center.

### 🔍 Recipient Intel
- **Image-to-Operation**: Extract emails and recipient data directly from images (business cards, screenshots, lists) using Gemini Vision.
- **Instant Sync**: One-click integration of extracted intel into active blast operations.

### 🛡️ Core Transmission
- **Custom SMTP Gateways**: Connect your own domains via transmission bots using Gmail, SendGrid, or private SMTP servers.
- **Diagnostics Engine**: Real-time SMTP verification and connection testing.
- **Performance Cockpit**: Live activity logs and transmission metrics.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Design**: Premium Minimalist (Vanilla CSS + Tailwind)
- **Icons**: Lucide React
- **Real-time**: Socket.IO Client

### Backend
- **Core**: Node.js & Express (TypeScript)
- **AI Engine**: Google Gemini 2.0 Flash
- **Database**: PostgreSQL (Supabase)
- **Email**: Nodemailer with dynamic Bot pooling

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database
- Google Gemini API Key

### Backend Setup
1. `cd backend`
2. `npm install`
3. Configure `.env` (use `.env.example` as template)
4. `npm run dev`

### Frontend Setup
1. `cd web`
2. `npm install`
3. `npm run dev`

---

## 📄 License
ISC License.
