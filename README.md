# Knowledge Nexus

Knowledge Nexus is a visual learning platform where concepts live in an interactive graph instead of a traditional linear outline. Learners can explore subject branches, take mastery tests, track progress, and build out the web over time.

## Quick Start

### Prerequisites

- Node.js 20.9+ and npm
- A Supabase project

If you use `nvm`, this repo includes `.nvmrc`:

```bash
nvm use
```

### Install

```bash
npm install
```

### Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your project values.

```bash
cp .env.example .env.local
```

PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Required values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
JWT_SECRET=your-jwt-secret-here-at-least-32-characters-long
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Set Up the Database

Run these SQL files in Supabase SQL Editor, in this order:

1. `supabase/schema.sql`
2. `supabase/migration-notes.sql`
3. One seed file:
   - `supabase/seed-v3.sql` for the expanded Math + Physics + Chemistry + Biology graph
   - `supabase/seed-v2.sql` for the larger Math + Physics graph
   - `supabase/seed.sql` for the smaller Math + Physics starter graph

Important:

- `seed-v2.sql` and `seed-v3.sql` truncate existing graph content before inserting fresh data.
- `migration-notes.sql` is required for the notes workspace and `/notes` page.

### Verify the Setup

```bash
npm run check
npm run dev
```

Then open `http://localhost:3000` and verify:

1. You can register a new account.
2. The graph loads after login.
3. The dashboard loads.
4. The notes page loads.

## Scalable Content Workflow

Use content packs for expanding the graph without writing seed SQL by hand.

- Format docs: `content-packs/README.md`
- Schema: `content-packs/schema/content-pack.v1.schema.json`
- Example: `content-packs/examples/science-foundations.v1.json`
- Math expansion example: `content-packs/examples/mathematics-expansion.v1.json`

Commands:

```bash
npm run generate:math-pack
npm run import:pack:dry -- content-packs/examples/science-foundations.v1.json
npm run import:pack -- content-packs/examples/science-foundations.v1.json
npm run audit:tests -- --subject Mathematics --min-questions 10
```

## Available Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production build |
| `npm run start` | Run the production build locally |
| `npm run lint` | Run ESLint across the repo |
| `npm run typecheck` | Run TypeScript without emitting files |
| `npm run check` | Run lint + typecheck together |
| `npm run generate:math-pack` | Regenerate the tracked mathematics expansion content pack |
| `npm run import:pack -- <file>` | Import a versioned content pack into Supabase |
| `npm run import:pack:dry -- <file>` | Validate and resolve a content pack without writing |
| `npm run audit:tests -- --subject <name> --min-questions <n>` | Audit whether scoped nodes have tests with enough questions |

## Architecture Snapshot

- Frontend: Next.js App Router with React 19 and Tailwind CSS
- Graph rendering: React Flow via `@xyflow/react`
- State: Zustand in `src/store/index.ts`
- Data access: Supabase clients in `src/lib/supabase.ts`
- Auth: custom JWT cookie auth in `src/lib/auth.ts`
- API surface: route handlers under `src/app/api`

Key routes:

- `/graph` is the main learning workspace
- `/dashboard` shows progress and recommendations
- `/notes` shows the master notes workspace
- `/login` and `/register` use app-level auth backed by the `users` table

Important implementation detail:

- The app does not use Supabase Auth for sessions. It stores users in the `users` table and issues a custom JWT cookie named `kn_session`.

## Repository Map

```text
knowledge-nexus/
|-- supabase/
|   |-- schema.sql
|   |-- migration-notes.sql
|   |-- seed.sql
|   |-- seed-v2.sql
|   `-- seed-v3.sql
|-- content-packs/
|   |-- README.md
|   |-- examples/
|   `-- schema/
|-- src/
|   |-- app/
|   |   |-- api/
|   |   |-- dashboard/
|   |   |-- graph/
|   |   |-- login/
|   |   |-- notes/
|   |   `-- register/
|   |-- components/
|   |   |-- graph/
|   |   |-- layout/
|   |   |-- modals/
|   |   |-- providers/
|   |   `-- ui/
|   |-- lib/
|   |-- store/
|   `-- types/
|-- .env.example
|-- scripts/
|-- CONTRIBUTING.md
`-- package.json
```

## Developer Guide

For day-one onboarding, workflow, troubleshooting, and repo conventions, see `CONTRIBUTING.md`.

## License

MIT
