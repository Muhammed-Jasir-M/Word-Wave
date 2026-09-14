# WordWave 🌊🎙️

> Fast, AI-powered audio transcription and semantic word cloud generator designed for mentorship sessions.

Turn live audio recordings or uploaded files into an instant visual summary answering one question: **What was this session actually about?**

---

## 1. What Was Built and What Works

WordWave is a focused, single-screen web utility built for one-to-one mentorship debriefs. It eliminates the need to replay 40-minute recordings by turning spoken conversations into an immediate visual word cloud alongside an executive summary and full transcript.

### Features & Working Capabilities:
- **Live In-Browser Recording**:
  - Unmistakable live recording state with elapsed timer.
  - Automatic enforcement of the 10-minute (600s) recording ceiling.
  - Built-in audio playback preview to inspect the audio before committing.
  - Ability to discard and re-record in one click.
  - Graceful handling of missing or denied microphone permissions with explicit instructions for recovery.
- **Audio File Upload**:
  - Drag-and-drop zone and native file picker.
  - Client-side & server-side validation rejecting unsupported files with clear human-readable explanations.
  - Enforced file limits: up to **25 MB** (`BRIEF_REF_5190_MAX_BYTES`) and **10 minutes**.
  - Displays selected file name, formatted file size, and audio duration.
  - Real-time upload progress tracking via `XMLHttpRequest` upload listeners.
- **AI-Powered Semantic Analysis**:
  - Sends audio directly to Google Gemini via a secure server route (`/api/analyze`).
  - Performs native audio speech recognition and extracts the full transcript.
  - Extracts 10–25 prominent keywords and core topics with AI-assigned significance weights (1–10).
  - Automatically filters conversational filler words ("um", "like", "you know") and common stopwords.
  - Normalizes casing, plurals, and semantic variants (e.g., merging "components" into "component").
  - Identifies executive summary, primary language, word count, and key topics.
  - Multi-model fallback cascade (`gemini-3.6-flash` → `gemini-3.5-flash` → `gemini-flash-latest`) for high reliability.
- **Interactive Word Cloud**:
  - Dynamic layout rendered using `d3-cloud` with word scaling proportional to semantic prominence.
  - Visual hierarchy: top-weighted concepts stand out with rich accent colors.
  - **PNG Export**: One-click download of the generated word cloud as a crisp 2x Retina PNG with an integrated background canvas.
  - **Word Removal**: Click any word in the cloud or interactive tag bar to remove it and trigger an instant `d3-cloud` layout re-render without re-analyzing with AI. Includes a one-click Reset button.
  - **Colour Scheme Selector**: Instant switching between 4 curated color themes (*Indigo Modern*, *Ocean Teal*, *Sunset Amber*, *Vibrant Fusion*).
  - **Session History & Local Audio Storage**: Saves past session analyses AND actual audio `Blob` recordings locally in browser **IndexedDB**, allowing mentors to re-play recorded audio clips and view word clouds for any previous session without re-uploading audio.
- **Session Transcript & Summary**:
  - Formatted executive summary and topic tags.
  - Full transcript viewer with one-click clipboard copy.
- **Unhappy Path Safeguards**:
  - Rejects silent or non-speech recordings with a helpful guidance message.
  - Enforces file size and format limits before network waste.
  - Handles network disconnections and server errors without freezing or crashing the UI.
- **Responsive Layout**:
  - Tailored single-screen experience that maintains usability on mobile screens down to 390px.

---

## 2. How to Run Locally

### Prerequisites
- Node.js 18.17+ or 20+
- npm / pnpm / yarn
- A Google Gemini API Key ([Get a free key from Google AI Studio](https://aistudio.google.com/))

### Setup Commands (in order)

1. **Clone the repository:**
   ```bash
   git clone git@github.com:Muhammed-Jasir-M/Word-Wave.git
   cd wordwave
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env.local` file from the provided example:
   ```bash
   cp .env.example .env.local
   ```
   Open `.env.local` and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open the app:**
   Open [http://localhost:3000](http://localhost:3000) in your browser (Chrome or Safari recommended).

---

## 3. Which AI Service Was Used and Why

**Service Used**: **Google Gemini API** (`@google/genai`, utilizing `gemini-3.6-flash` / `gemini-3.5-flash`).

### Why Google Gemini:
1. **Native Multimodal Audio Processing**: Gemini accepts audio files directly in base64 format without requiring a fragmented, two-step pipeline (e.g., Whisper for STT followed by an LLM prompt for analysis).
2. **True Semantic Understanding**: Rather than a naive frequency counter that over-indexes on commonly repeated words, Gemini analyzes the actual context and semantic weight of topics discussed in the session.
3. **Structured JSON Output**: Gemini's `responseSchema` ensures strict schema validation, returning consistent, typed data (transcript, summary, topics, and weighted terms) with zero JSON parsing failures.
4. **Speed & Generous Free Tier**: The Gemini Flash family provides rapid response times (crucial for keeping audio analysis under a few seconds) with a generous free-tier quota.

---

## 4. Key Decisions and Trade-offs

1. **Next.js App Router with Server-Side Route Handler**:
   - *Decision*: Next.js 16 was selected to combine a modern React frontend with a secure API route (`/api/analyze`).
   - *Reason*: The brief strictly forbids exposing API keys to the client. Running the Gemini SDK inside Next.js server-side route handlers keeps `GEMINI_API_KEY` completely hidden while eliminating the need for a separate backend service.
2. **Single Multimodal API Pass vs. Two-Stage Pipeline**:
   - *Decision*: Executed transcription, summarization, and weighted term extraction in a single Gemini API call rather than chaining a transcription service (Whisper) into a separate language model.
   - *Reason*: Cuts total turnaround latency in half, avoids double network roundtrips, reduces points of failure, and guarantees unified context between the transcript and the word cloud terms.

---

## 5. Third-Party Libraries and Templates Used

- **Next.js 16** & **React 19**: Core application framework and view layer.
- **Tailwind CSS v4**: Styling and responsive utility layout.
- **@google/genai**: Official Google Gen AI SDK for server-side Gemini interactions.
- **d3-cloud** (`@types/d3-cloud`): Word cloud layout algorithm for computing word positions, bounding boxes, and canvas collisions.
- **lucide-react**: Lightweight icon set.
- **Geist Fonts** (`next/font/google`): Typography.

---

## 6. AI Coding Tools Disclosure

- **Tools Used**: Google Antigravity IDE / Gemini 3.8 Flash.
- **What it was used for**:
  - Scaffolding Next.js directory structure and TypeScript interfaces.
  - Designing SVG canvas export and `d3-cloud` integration types.
  - Formatting error boundary states and drafting responsive layout styles.
- **Human Verification**: All permission workflows, audio format edge cases, upload progress tracking, and Gemini fallbacks were manually designed, tested, and validated.

---

## 7. What I Would Do Next (With Another Week)

If given another week to develop the project further, I would implement:
1. **Real-time Waveform Visualizer**: Integrate the Web Audio API (`AnalyserNode`) to draw a live animated audio waveform during microphone recording and audio playback.
2. **Audio-Linked Transcript Highlighting**: When clicking a word in the word cloud, highlight its occurrences in the transcript and jump the audio player directly to that timestamp.
3. **Multi-Speaker Turn Detection**: Add speaker separation labels (mentor vs. student) when reviewing long mentorship sessions.
4. **User Authentication & Cloud Sync**: Add secure user authentication (NextAuth / Clerk) and cloud storage (Supabase / PostgreSQL) so users can log in, sync, and organize saved session histories across all their devices.

---

Brief ref: TFG-WD-4417
