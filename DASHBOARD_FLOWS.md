# BLASTR: Dashboard Flows Documentation

This document provides a detailed technical breakdown of the user flows and feature integrations within the BLASTR Dashboard.

---

## 1. Campaigns: Outreach Management
**File:** `web/src/pages/dashboard/CampaignsView.tsx`

### Overview
Users manage their entire marketing effort through **Campaigns**. A campaign acts as a container for specific messaging, target recipients, and assigned agents.

### User Flow
1. **Listing**: Fetches all campaigns via `campaignService.fetchCampaigns()`.
2. **Execution**: Real-time status tracking and transmission progress (Sent Count / Total Recipients).

---

## 2. Composer: The AI Assistant
**File:** `web/src/pages/dashboard/StudioView.tsx`

### Overview
The Composer is an AI-powered workspace for drafting and refining personalized email content using Gemini 2.0 Flash.

### User Flow
1. **Campaign Selection**: User chooses an active campaign.
2. **AI Chat Integration**: Real-time streaming via Socket.IO for iterative template drafting.

---

## 3. Extractor: Vision Engine
**File:** `web/src/pages/dashboard/DeployView.tsx`

### Overview
Allows users to bootstrap recipient lists from manual sources (like photos of business cards or screenshots).

### User Flow
1. **Vision Extraction**: Backend sends images to Gemini Vision for OCR.
2. **Synchronization**: Instant sync of extracted data into target campaigns.

---

## 4. Analytics: The Cockpit
**File:** `web/src/pages/dashboard/OverviewView.tsx` / `AnalyticsView.tsx`

### Overview
High-level control view of system performance and recent events.

---

## 5. Settings & Agent Management
**File:** `web/src/pages/dashboard/SettingsView.tsx` / `BotsView.tsx`

### Overview
Critical for deliverability. Users configure **Agents** (SMTP credentials) and platform settings.
