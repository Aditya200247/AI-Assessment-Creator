# VedaAI – AI Assessment Creator

A full-stack AI-powered exam paper generator. Teachers fill a form → backend queues an AI job → Gemini generates a structured question paper → frontend shows it in real-time via WebSocket.

## Live Demo
- **Frontend**: [ai-assessment-creator-frontend.up.railway.app](https://ai-assessment-creator-frontend.up.railway.app)
- **Backend API**: [ai-assessment-creator-production-0164.up.railway.app](https://ai-assessment-creator-production-0164.up.railway.app)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│  Next.js 14 + TypeScript + Zustand + Socket.io-client       │
│                                                             │
│  /                  Dashboard (empty + filled state)        │
│  /create            Assignment Creation Form                │
│  /assignment/[id]   Output Page (real-time + exam paper)    │
└─────────────┬───────────────────┬───────────────────────────┘
              │ HTTP (Axios)      │ WebSocket (Socket.io)
              ▼                   ▼
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                              │
│  Node.js + Express + TypeScript + Socket.io                 │
│                                                             │
│  POST /api/assignments         Create + queue job           │
│  GET  /api/assignments         List all                     │
│  GET  /api/assignments/:id     Single + question paper      │
│  POST /api/assignments/:id/regenerate                       │
└──────┬──────────────┬──────────────────────────────────────┘
       │              │
       ▼              ▼
  MongoDB          Redis (Upstash)
  (Atlas)          + BullMQ Queue
       │
       ▼
  BullMQ Worker (in-process)
       │
       ▼
  Google Gemini 1.5 Flash API
  (Prompt → Structured JSON → Zod Validated)
       │
       ▼
  jobEmitter (EventEmitter)
       │
       ▼
  Socket.io rooms → Frontend real-time update
```

## Flow

1. Teacher submits the assignment creation form
2. Express API saves the assignment to MongoDB and adds a BullMQ job to the Redis queue
3. The BullMQ worker (running in the same process) picks up the job
4. Worker calls Gemini with a structured prompt and parses the JSON response with Zod
5. Parsed question paper is saved to MongoDB
6. Worker emits an in-process event → Socket.io server forwards to the frontend room
7. Frontend receives `job:complete` event and displays the question paper

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Zustand |
| Realtime | Socket.io (client + server) |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB (Mongoose) |
| Cache/Queue | Redis (Upstash) + BullMQ |
| AI | Google Gemini 1.5 Flash |
| PDF Export | @react-pdf/renderer (client-side) |

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier)
- Upstash Redis account (free tier)
- Google AI Studio API key (free)

### 1. Clone & Install

```bash
git clone <repo-url>
cd veda-ai

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Configure Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/vedaai
REDIS_URL=rediss://default:token@hostname.upstash.io:6380
GEMINI_API_KEY=your_gemini_api_key
CORS_ORIGIN=http://localhost:3000
```

**Get your keys:**
- MongoDB URI: [MongoDB Atlas](https://cloud.mongodb.com) → Create cluster → Connect
- Redis URL: [Upstash Console](https://console.upstash.com) → Create database → Copy `UPSTASH_REDIS_URL`
- Gemini API Key: [Google AI Studio](https://aistudio.google.com/app/apikey) → Create API Key

### 3. Configure Frontend Environment

The `.env.local` in `frontend/` is already configured for local development:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_WS_URL=http://localhost:5000
```

### 4. Run Development Servers

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deployment

### Frontend → Vercel
```bash
cd frontend
npx vercel --prod
```
Set env vars in Vercel dashboard:
- `NEXT_PUBLIC_API_URL` → your Railway backend URL + `/api`
- `NEXT_PUBLIC_WS_URL` → your Railway backend URL

### Backend → Railway
1. Push to GitHub
2. Create new Railway project → Deploy from GitHub → select `backend/` folder
3. Add environment variables (same as `.env`)
4. Railway auto-detects Node.js and runs `npm start`

---

## Key Design Decisions

### Why in-process worker?
Running the BullMQ worker in the same Express process simplifies deployment (one service instead of two) while still using the full BullMQ queue for job deduplication and retry logic.

### Why Zod for LLM output?
Raw LLM responses are unreliable. Zod validates the parsed JSON against a strict schema before saving — preventing malformed data from reaching the frontend.

### Why EventEmitter bridge?
The worker and Socket.io server run in the same process. Instead of HTTP callbacks, a shared `EventEmitter` efficiently routes job completion events to the right WebSocket rooms.

### Why client-side PDF?
`@react-pdf/renderer` runs in the browser, eliminating the need for Puppeteer on the server. This reduces backend memory usage and deployment complexity.

---

## Bonus Features Implemented

- ✅ **PDF Download** — Properly formatted A4 exam paper (not browser print)
- ✅ **Regenerate** — Action bar button re-queues generation via API
- ✅ **Difficulty badges** — Color-coded: Easy (green), Moderate (amber), Hard (red)
- ✅ **Real-time progress** — WebSocket progress bar with live messages
- ✅ **File upload** — PDF/text reference material sent to Gemini prompt
- ✅ **Drag-and-drop** — File upload with drag-and-drop support
- ✅ **Skeleton loaders** — Premium loading states throughout

---

## API Reference

### POST /api/assignments
Create a new assignment and queue AI generation.

**Body** (multipart/form-data):
```
title: string
dueDate: string (ISO date)
questionTypes: JSON array ["MCQ", "Short Answer", ...]
numQuestions: number
marksPerQuestion: number
difficulty: JSON object { easy: 40, moderate: 40, hard: 20 }
instructions: string (optional)
file: File (optional, PDF or .txt)
```

**Response:**
```json
{ "assignmentId": "...", "status": "pending" }
```

### WebSocket Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `join:assignment` | Client → Server | `assignmentId: string` |
| `job:progress` | Server → Client | `{ assignmentId, progress, message }` |
| `job:complete` | Server → Client | `{ assignmentId, questionPaper }` |
| `job:error` | Server → Client | `{ assignmentId, error }` |
| `assignment:updated` | Server → All | `{ assignmentId, status }` |
