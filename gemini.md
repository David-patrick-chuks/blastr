# Gemini AI Implementation & Use Cases

This project utilizes the Google Gemini API suite to power its intelligent features. Below is a breakdown of the models used, their specific use cases, and how they integrated into the Blastr ecosystem.

---

## 1. Retrieval-Augmented Generation (RAG)

**Model**: `text-embedding-004`

### Use Case

The Knowledge Base relies on semantic search to provide context to the AI during email drafting.

- **Preprocessing**: When a document, YouTube transcript, or website is indexed, the text is chunked and sent to the embedding model.
- **Vectorization**: It generates 768-dimension vectors that represent the meaning of the content.
- **Storage**: These vectors are stored in Supabase using the `pgvector` extension.
- **Querying**: When a user chats in the Studio, their query is also embedded, and a similarity search (`match_documents`) is performed to find the most relevant context.

---

## 2. Interactive Drafting & Personalization

**Model**: `gemini-2.0-flash` (via `FLASH_1_5` constant)

### Use Case: The Studio Chat

Powers the real-time interaction in the Studio View.

- **Streaming**: Uses `generateContentStream` to stream responses token-by-token via Socket.IO for a responsive UI.
- **Context Injection**: Automatically appends relevant knowledge chunks found via RAG to the system prompt.
- **Agent Personality**: Interprets the `system_instruction` defined in the campaign settings to maintain a consistent brand voice.

---

## 3. Multimodal Extraction (Vision)

**Model**: `gemini-2.0-flash` (supports image/file inputs)

### Use Case: Recipient Bootstrapping

Located in the "Deploy" view, this feature extracts data from visual sources.

- **OCR**: Analyzes images (business cards, handwritten lists, screenshots) to identify and extract email addresses.
- **JSON Parsing**: Formats the visual data into structured lists that can be synced directly to a campaign.

---

## 4. Content Analytics & Optimization

**Model**: `gemini-2.0-flash`

### Use Cases

- **Email Variations**: Generates distinct semantic variations of a base template to avoid spam filters and improve engagement.
- **Spam Risk Analysis**: Analyzes subject lines and bodies for trigger words, provides a risk score, and suggests "safer" rewrites to improve deliverability.
- **Document Analysis**: Summarizes and extracts core value propositions from uploaded business documents during the "training" phase.

---

## 5. Architectural Features

### Key Rotation System

To handle high-volume broadcasting and avoid 429 (Rate Limit) errors, the `GeminiServiceClass` implements a recursive rotation system:

- **Multi-Key Support**: Can load up to 11 different Gemini API keys from environment variables.
- **Auto-Switching**: If a request fails with a rate limit error, the service automatically switches to the next available key and retries the request seamlessly.

### File Handling

- **Gemini Files API**: Uses the Files API to upload larger documents and multimedia (YouTube audio/Large PDFs) for advanced long-context analysis.
- **Temp Management**: Safely handles local buffers and temporary files during the upload-to-cloud cycle.
