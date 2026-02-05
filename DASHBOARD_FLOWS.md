# BLASTR / COMMAND: Dashboard Flows Documentation

This document provides a detailed technical breakdown of the user flows and feature integrations within the BLASTR / HQ Dashboard.

---

## 1. Operations: Blast Management
**File:** `web/src/pages/dashboard/CampaignsView.tsx`

### Overview
Users manage their entire marketing effort through **Operations**. An operation acts as a container for specific messaging, target recipients, and assigned transmission bots.

### User Flow
1. **Listing**: Fetches all operations via `campaignService.fetchCampaigns()`.
2. **Execution**: Real-time status tracking and transmission progress (Sent Count / Total Recipients).

---

## 2. AI Studio: The Architect
**File:** `web/src/pages/dashboard/StudioView.tsx`

### Overview
The Studio is an AI-powered workspace for drafting and refining personalized email content using Gemini 2.0 Flash.

### User Flow
1. **Operation Selection**: User chooses an active operation.
2. **AI Chat Integration**: Real-time streaming via Socket.IO for iterative template drafting.

---

## 3. Recipient Intel: Extraction Engine
**File:** `web/src/pages/dashboard/DeployView.tsx`

### Overview
Allows users to bootstrap recipient lists from manual sources (like photos of business cards or screenshots).

### User Flow
1. **Vision Extraction**: Backend sends images to Gemini Vision for OCR.
2. **Synchronization**: Instant sync of extracted intel into target operations.

---

## 4. Performance Metrics: The Cockpit
**File:** `web/src/pages/dashboard/OverviewView.tsx` / `AnalyticsView.tsx`

### Overview
High-level control view of system performance and recent events.

---

## 5. System Config & Transmission Bots
**File:** `web/src/pages/dashboard/SettingsView.tsx` / `BotsView.tsx`

### Overview
Critical for deliverability. Users configure **Transmission Bots** (SMTP credentials) and platform preferences.
