# Content Packs

Content packs are the scalable authoring format for Knowledge Nexus. They let developers and content authors define subjects, nodes, edges, prerequisites, and mastery tests in versioned JSON instead of hand-writing SQL.

## Why Use Content Packs

- versioned in git
- easier to review than SQL seed files
- reusable across environments
- safer for incremental expansion
- better for bulk authoring

## Format

Current format:

- `format`: `knowledge-nexus/content-pack`
- `version`: `1`

See:

- `content-packs/schema/content-pack.v1.schema.json`
- `content-packs/examples/science-foundations.v1.json`
- `content-packs/examples/mathematics-expansion.v1.json`

## Import Commands

Dry run:

```bash
npm run import:pack:dry -- content-packs/examples/science-foundations.v1.json
```

Real import:

```bash
npm run import:pack -- content-packs/examples/science-foundations.v1.json
```

Regenerate the mathematics example pack:

```bash
npm run generate:math-pack
```

## Reference Rules

### Subjects

Nodes reference subjects through the `subject` field.

That value can be:

- a subject `key` defined inside the same pack
- the exact `name` of an already-existing subject in the database

### Nodes

Edges, prerequisites, and tests reference nodes by string.

That string can be:

- a node `key` defined in the same pack
- a node `slug` defined in the same pack
- an existing database slug
- `slug:<existing-slug>` for explicit external references

## Import Behavior

### Subjects

- upserted by `name`
- updates color, description, and icon if the subject already exists

### Nodes

- upserted by `slug`
- if `slug` is omitted, one is generated from `title`
- if `position` is omitted and the node already exists, the importer preserves its current position

### Edges

- upserted by `(source_node_id, target_node_id, relationship_type)`
- missing edges are not deleted

### Prerequisites

- upserted by `(node_id, prerequisite_node_id)`
- missing prerequisites are not deleted

### Tests

- imported tests replace the existing test for that node
- questions and options are recreated from the pack
- nodes without tests in the pack are left unchanged

## Suggested Workflow

1. create or edit a pack under `content-packs/examples/` or another tracked folder
2. run `npm run import:pack:dry -- <pack-file>`
3. review output
4. run `npm run import:pack -- <pack-file>`
5. verify in `/graph` and `/notes`

## Coverage Auditing

Use the audit script to check whether nodes in a subject have tests and enough questions:

```bash
npm run audit:tests -- --subject Mathematics --min-questions 10
```

## Current Limitation

This first slice is importer-first. It does not yet include:

- export back out of the database into pack files
- a UI upload/import flow
- content-pack ownership/history in the database
