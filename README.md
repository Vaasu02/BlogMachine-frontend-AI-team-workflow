# Blog Machine — Frontend

AI-powered UPSC blog generation system with real-time pipeline visibility.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS v4
- SSE (Server-Sent Events) for real-time updates

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

| Route | Description |
|-------|-------------|
| `/` | Dashboard with stats and recent blogs |
| `/generate` | Generate a new blog with live agent stream |
| `/history` | Browse all blogs with filters |
| `/blog/[id]` | View a completed blog |
| `/blog/[id]/logs` | View agent execution logs |

## Architecture

- **Agent Stream**: Claude-style single vertical flow showing each agent step as it runs
- **SSE Connection**: Connects to backend `/api/stream/{blog_id}` for real-time events
- **Event Deduplication**: Collapses "running" events once an agent completes
- **Theme**: Fixed dark theme using CSS custom properties (`#1a1a2e`, `#174D38`, `#4D1717`)

## Environment

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8001
```

## Build

```bash
npm run build
npm start
```
