# Knowledge Nexus 🧠

A visual learning platform where academic knowledge is represented as an interactive graph of interconnected concepts. Navigate your learning journey through a web of nodes, test your mastery, and track your progress.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![React Flow](https://img.shields.io/badge/React_Flow-Interactive_Graph-purple)

## ✨ Features

- **Interactive Knowledge Graph** — Explore concepts as nodes connected by meaningful relationships, powered by React Flow
- **Color-Coded Progress** — Nodes are light blue (untouched), red/orange (in progress), or green (mastered)
- **Mastery Testing** — Take tests for each concept with multiple choice and short answer questions
- **Progress Dashboard** — Track overall completion, subject progress, and get smart recommendations
- **Content Building** — Add new concepts, create connections, and build out the knowledge network
- **Authentication** — Secure JWT-based auth with personal progress tracking

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, TypeScript) |
| Graph Visualization | @xyflow/react (React Flow) |
| Database | Supabase (PostgreSQL) |
| State Management | Zustand |
| Validation | Zod |
| UI Components | Radix UI + Tailwind CSS (shadcn-style) |
| Authentication | Custom JWT (jose + bcryptjs) |
| Icons | Lucide React |

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Supabase** account (free tier works) — [supabase.com](https://supabase.com)

### 1. Clone and Install

```bash
cd knowledge-nexus
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com/dashboard)
2. Go to **SQL Editor** and run the schema:
   - Copy and paste `supabase/schema.sql` → Execute
   - Copy and paste `supabase/seed.sql` → Execute (loads Math & Physics starter data)
3. Get your credentials from **Settings > API**:
   - Project URL
   - `anon` public key
   - `service_role` secret key

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
JWT_SECRET=your-secret-key-at-least-32-characters-long
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> 💡 Generate a strong JWT_SECRET: `openssl rand -base64 32`

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you should see the landing page.

### 5. Create an Account

1. Click **Get Started** or navigate to `/register`
2. Create an account with your name, email, and password
3. You'll be redirected to the interactive knowledge graph

## 📖 How to Use

### Exploring the Graph
- **Click** a node to view its details in the side panel
- **Drag** nodes to rearrange the layout (positions are saved)
- **Scroll** to zoom in/out
- Use the **search bar** to find specific concepts
- **Filter** by subject using the dropdown

### Learning a Concept
1. Click a node to open its detail panel
2. Read the description, why it matters, and use cases
3. Click **Take Test** to start the mastery assessment
4. Score ≥ 70% to master the concept (node turns green!)

### Building the Graph
- Toggle to **Edit Mode** using the mode switch
- Click **+ Add Node** to create a new concept
- Use **Link Existing** to connect concepts with relationship types
- Edit node details like description, difficulty, and topic

### Dashboard
- View your overall mastery percentage
- See progress per subject (Math, Physics, etc.)
- Get personalized recommendations based on prerequisites
- Track recent learning activity

## 📁 Project Structure

```
knowledge-nexus/
├── supabase/
│   ├── schema.sql          # Database schema (tables, RLS, indexes)
│   └── seed.sql            # Starter data (Math + Physics network)
├── src/
│   ├── app/
│   │   ├── api/            # API routes (auth, nodes, edges, tests, etc.)
│   │   ├── dashboard/      # Dashboard page
│   │   ├── graph/          # Main graph workspace
│   │   ├── login/          # Login page
│   │   ├── register/       # Registration page
│   │   ├── globals.css     # Global styles + React Flow CSS
│   │   ├── layout.tsx      # Root layout with providers
│   │   └── page.tsx        # Landing page
│   ├── components/
│   │   ├── graph/          # KnowledgeGraph, ConceptNode, NodeDetailPanel
│   │   ├── layout/         # Navbar
│   │   ├── modals/         # AddNode, LinkNode, MasteryTest, EditNode
│   │   ├── providers/      # AuthProvider
│   │   └── ui/             # shadcn-style primitives (Button, Card, Dialog, etc.)
│   ├── lib/
│   │   ├── auth.ts         # JWT helpers (hash, verify, sessions)
│   │   ├── supabase.ts     # Supabase clients (browser + server)
│   │   ├── utils.ts        # Utility functions
│   │   └── validations.ts  # Zod schemas
│   ├── store/
│   │   └── index.ts        # Zustand stores (auth, graph, test)
│   └── types/
│       └── index.ts        # TypeScript interfaces
├── .env.example
├── .env.local
└── package.json
```

## 🗄 Database Schema

The schema includes 10 tables:

| Table | Purpose |
|-------|---------|
| `users` | User accounts with roles (learner/editor/admin) |
| `subjects` | Subject categories (Mathematics, Physics, etc.) |
| `nodes` | Knowledge concepts with position, difficulty, metadata |
| `edges` | Directional relationships between nodes |
| `prerequisites` | Hard prerequisite dependencies |
| `mastery_tests` | Tests associated with nodes |
| `mastery_questions` | Questions within tests |
| `mastery_question_options` | Answer options for multiple choice |
| `user_node_progress` | Per-user progress on each node |
| `mastery_attempts` | Test attempt history with scores |

All tables have Row Level Security (RLS) policies for data protection.

## 🎨 Node Status Colors

| Status | Color | Meaning |
|--------|-------|---------|
| Untouched | Light Blue | Haven't started learning |
| In Progress | Red/Orange | Clicked or attempted test |
| Mastered | Green | Passed the mastery test |

## 📄 License

MIT
