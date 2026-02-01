# BlastAgent Dashboard: Frontend Flows Documentation

This document provides a detailed technical breakdown of the user flows and feature integrations within the BlastAgent Dashboard.

---

## 1. Core Workflow: Campaign Management

**File:** `web/src/pages/dashboard/CampaignsView.tsx`

### Overview

Users manage their entire marketing effort through campaigns. A campaign acts as a container for specific messaging, target recipients, and AI personalities.

### User Flow

1.  **Listing**: The view fetches all campaigns associated with the authenticated user via `campaignService.fetchCampaigns()`.
2.  **Creation**:
    - User clicks "CREATE CAMPAIGN" -> Opens `CampaignModal`.
    - Form collects: Name, Role (Subject), Template Draft, and System Instructions.
    - Submission triggers `POST /api/agents`.
3.  **Editing**:
    - User selects "Edit" on a campaign card.
    - `CampaignModal` hydrates with existing data.
    - Submission triggers `PATCH /api/agents/:id`.
4.  **Deletion**:
    - User clicks "Delete" -> `ConfirmModal` appears.
    - Confirmation triggers `DELETE /api/agents/:id`.
5.  **Status Tracking**: Displays real-time status (Ready/Active) and transmission progress (Sent Count / Total Recipients).

---

## 2. Intelligence Workflow: The Studio

**File:** `web/src/pages/dashboard/StudioView.tsx`

### Overview

The Studio is an AI-powered workspace for drafting and refining personalized email content using Gemini 2.0 Flash.

### User Flow

1.  **Campaign Selection**: User chooses a campaign from the sidebar dropdown.
2.  **AI Chat Integration**:
    - Uses `useSocket` for real-time streaming communication.
    - User sends a message -> Emit `chat_message` to backend.
    - Backend processes via `geminiService` and streams "tokens" back.
    - UI updates state incrementally to show live AI typing.
3.  **Prompt Engineering**:
    - User can toggle the "Prompt Engineer" panel to edit the `system_instruction` (the "personality") of the campaign agent.
    - Saving updates the database directly via `campaignService.updateCampaign`.
4.  **Draft Refinement**: AI provides variations and specific personalized drafts based on indexed knowledge.

---

## 3. Knowledge Acquisition Workflow: RAG System

**File:** `web/src/pages/dashboard/KnowledgeView.tsx`

### Overview

Users can "train" their campaigns by providing context. This uses Retrieval-Augmented Generation (RAG) to ensure AI drafts are factually accurate to the business.

### User Flow

1.  **Document Upload**:
    - Supports `.pdf`, `.txt`, `.docx`, `.csv`, `.mp3`.
    - File is sent to `POST /api/documents/upload`.
    - Backend extracts text, chunks it, generates embeddings via Gemini, and stores in `pgvector`.
2.  **YouTube Training**:
    - User inputs a YouTube URL.
    - Backend fetches transcript (or uses AI to transcribe audio) and indexes the content.
3.  **Website Crawling**:
    - User inputs a website URL.
    - Backend crawls the page, cleans HTML, and indexes the core messaging for the AI to use.
4.  **Knowledge Management**: Users can search through indexed chunks or wipe the entire base for a fresh start.

---

## 4. Extraction Workflow: Image-to-Campaign

**File:** `web/src/pages/dashboard/DeployView.tsx`

### Overview

This flow allows users to bootstrap recipient lists from manual sources (like photos of business cards, lists, or spreadsheets).

### User Flow

1.  **Image Upload**: User uploads an image via the "Extraction Engine".
2.  **AI OCR**:
    - Backend sends the image to Gemini 1.5 Pro/Flash Vision.
    - AI extracts all email addresses found in the visual data.
    - Resulting list is displayed to the user for verification.
3.  **Syncing**:
    - User selects a target campaign.
    - "SYNC TO CAMPAIGN" updates the `total_recipients` and stores the extracted list for future transmissions.

---

## 5. Operations Workflow: Overview & Diagnostics

**File:** `web/src/pages/dashboard/OverviewView.tsx`

### Overview

Provides a high-level cockpit view of system performance and recent events.

### User Flow

1.  **Metrics Gathering**: Fetch system-wide stats via `analyticsService.getSystemOverview()`.
    - Total Transmissions, System Health, and Indexed Recipients.
2.  **Live Activity Feed**:
    - Fetches `activity_logs` from the database.
    - Shows real-time actions taken by agents (e.g., "Drafted response", "Uploaded knowledge").
3.  **Utilization Breakdown**: Visual progress bars showing Gemini API consumption categories.

---

## 6. Configuration Workflow: Settings & SMTP

**File:** `web/src/pages/dashboard/SettingsView.tsx`

### Overview

Critical for deliverability. Users configure their own SMTP servers to ensure emails come from their own domains.

### User Flow

1.  **SMTP Setup**:
    - Form for Host, Port, User, and App Password.
    - "Save & Test Connection" triggers an immediate verification sequence.
    - Backend uses `nodemailer` to `verify()` configurations.
2.  **API Key Status**:
    - Fetches status of system keys (Gemini API keys).
    - Displays masked keys and connectivity status.
3.  **Transmission Preferences**: Toggles for open tracking, smart rate limiting, and deduplication (persisted in `profiles.preferences`).

---

## 7. Navigation & Layout

**Files:** `web/src/components/layout/DashboardLayout.tsx`, `Sidebar.tsx`, `App.tsx`

### Navigation Logic

1.  **Route Protection**: `App.tsx` uses a `session` check to redirect unauthenticated users to `/`.
2.  **Global Logout**:
    - Sidebar "LOGOUT" trigger calls `authService.logout()`.
    - Action: Clears `localStorage`, notifies listeners, and redirects to landing page.
3.  **Adaptive Sidebar**: Collapses on mobile and provides instant navigation between the 8 specialized dashboard views.
