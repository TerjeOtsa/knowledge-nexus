# Contributing to Knowledge Nexus

This guide is optimized for a fast local setup and for understanding the repo quickly enough to make safe changes.

## First-Day Checklist

1. Install Node.js 20.9+.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Run the SQL files in this order:
   - `supabase/schema.sql`
   - `supabase/migration-notes.sql`
   - one seed file, usually `supabase/seed-v3.sql`
5. Run `npm run check`.
6. Run `npm run dev`.
7. Create an account at `/register` and verify `/graph`, `/dashboard`, and `/notes`.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local dev server |
| `npm run build` | Build the app for production |
| `npm run start` | Run the production build locally |
| `npm run lint` | Lint the repository |
| `npm run typecheck` | Run TypeScript checks |
| `npm run check` | Run lint and typecheck together |

## How the App Is Put Together

### Frontend

- App routes live in `src/app`.
- Shared UI components live in `src/components`.
- The graph UI is centered around:
  - `src/components/graph/knowledge-graph.tsx`
  - `src/components/graph/node-workspace.tsx`
  - `src/lib/radial-layout.ts`

### State

- Global client state is managed with Zustand in `src/store/index.ts`.
- The main stores are:
  - `useAuthStore`
  - `useGraphStore`
  - `useTestStore`
  - `useNotesStore`

### Backend

- Route handlers live under `src/app/api`.
- Supabase access is centralized in `src/lib/supabase.ts`.
- Authentication helpers live in `src/lib/auth.ts`.

## Authentication Model

The app uses custom auth, not Supabase Auth:

- users are stored in the `users` table
- passwords are hashed with bcrypt
- the server issues a JWT cookie named `kn_session`
- API routes call `getSession()` / `getCurrentUser()` from `src/lib/auth.ts`

This means new developers must set `SUPABASE_SERVICE_ROLE_KEY` locally for server-side routes to work.

## Database Workflow

### Base setup

Run:

1. `supabase/schema.sql`
2. `supabase/migration-notes.sql`

### Seed files

- `supabase/seed.sql`: small Math + Physics starter graph
- `supabase/seed-v2.sql`: larger Math + Physics graph
- `supabase/seed-v3.sql`: Math + Physics + Chemistry + Biology

### Content packs

For ongoing graph growth, prefer content packs over editing seed SQL directly.

- format docs: `content-packs/README.md`
- schema: `content-packs/schema/content-pack.v1.schema.json`
- example: `content-packs/examples/science-foundations.v1.json`

Commands:

```bash
npm run import:pack:dry -- content-packs/examples/science-foundations.v1.json
npm run import:pack -- content-packs/examples/science-foundations.v1.json
```

Important:

- `seed-v2.sql` and `seed-v3.sql` truncate graph data before reseeding.
- If you already have local content you care about, do not rerun those files blindly.

### When making database changes

If you change database-backed behavior, update all relevant pieces together:

1. SQL schema or migration files in `supabase/`
2. TypeScript types in `src/types/index.ts`
3. API routes in `src/app/api`
4. Any seed file or seed documentation affected by the change
5. README / onboarding docs if setup steps changed

## Common Development Tasks

### Add or change graph content

- Ongoing content should usually live in content packs.
- Seeded content lives in `supabase/seed*.sql` for bootstrap and demo datasets.
- Subject colors and icons come from the `subjects` table.
- The graph layout is computed from subject membership and difficulty, not manually placed by seed coordinates alone.

Relevant files:

- `src/components/graph/knowledge-graph.tsx`
- `src/lib/radial-layout.ts`
- `scripts/import-content-pack.mjs`
- `content-packs/README.md`

### Add or change notes behavior

- Notes APIs depend on the `user_node_notes` table from `supabase/migration-notes.sql`.
- The notes page lives in `src/app/notes/page.tsx`.
- The API is in `src/app/api/notes/route.ts`.

### Add or change auth behavior

- Registration route: `src/app/api/auth/register/route.ts`
- Login route: `src/app/api/auth/login/route.ts`
- Session helpers: `src/lib/auth.ts`

## Troubleshooting

### The app starts but API routes fail

Check:

- `.env.local` exists
- `SUPABASE_SERVICE_ROLE_KEY` is set
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` point to the same project

### `/notes` fails

You probably skipped `supabase/migration-notes.sql`.

### Login or register fails immediately

Check that:

- the `users` table exists from `supabase/schema.sql`
- your local `JWT_SECRET` is set
- your service role key is valid

### Graph loads without expected subjects

Make sure you seeded the database with the intended file. `seed.sql`, `seed-v2.sql`, and `seed-v3.sql` contain different subject coverage.

## Before Opening a PR

Run:

```bash
npm run check
```

If your change touches database behavior, also verify the affected pages manually in the browser.
