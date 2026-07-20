# Mise

A responsive meal planning app built with Next.js 16, React Server Components, Server Actions, Neon Postgres, Drizzle ORM, Tailwind CSS, and shadcn-style UI primitives.

The checked-in demo data makes every route usable without a database. The Server Actions in `src/app/actions.ts` are ready for persistent Neon-backed recipes, meal slots, and grocery checks once `DATABASE_URL` is configured.

## Recipe management

- Open `/recipes` to browse the complete recipe library.
- Add a recipe with dynamic metric ingredients, ordered method steps, timings, servings, and nutrition per serving.
- Use **Customize** on a built-in recipe to create an editable personal copy.
- Custom Neon recipes have **Edit recipe** and confirmed **Delete** controls on their detail page.
- New and updated recipes are immediately available in the weekly planner recipe selector.

Creating, editing, and deleting records requires `DATABASE_URL`. The built-in recipes remain read-only source material so they are always available as examples.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run db:push
npm run dev
```

Open `http://localhost:3000`.

Create a Neon project and copy its pooled connection string into `.env.local`:

```dotenv
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxxxxxxxxx
```

Create a Blob store in the Vercel project and add its read/write token as
`BLOB_READ_WRITE_TOKEN`. Recipe photos can then be uploaded from the recipe
editor; uploaded images are stored in Vercel Blob and their public URLs are
saved with the recipe in Neon. Images must be 10 MB or smaller.

## Commands

```bash
npm run dev          # Start the Turbopack development server
npm run build        # Create a production build
npm run lint         # Run ESLint
npm test             # Run domain helper tests
npm run db:generate  # Generate SQL migrations in drizzle/
npm run db:push      # Apply the schema directly to Neon
npm run db:seed      # Seed the five built-in recipes into Neon
```

## Data model

- `recipes`: recipe metadata and nutrition per serving
- `recipe_ingredients`: metric quantities, normalized names, and aisle categories
- `recipe_instructions`: ordered cooking steps
- `planned_meals`: one recipe and serving target per date/meal slot
- `grocery_item_checks`: per-week shopping completion state

All ingredient quantities are restricted to `g`, `kg`, `ml`, or `l`. Grocery aggregation converts mass to grams and volume to milliliters before combining matching normalized names, then displays totals in the most readable compatible metric unit.

## Vercel deployment

1. Import this repository into Vercel.
2. Add `DATABASE_URL` in Project Settings > Environment Variables.
3. Create a Blob store and add its `BLOB_READ_WRITE_TOKEN` in Project Settings > Environment Variables.
4. Run `npm run db:push` from a trusted local or CI environment.
5. Deploy. Vercel detects the Next.js build automatically.

The Neon HTTP driver opens no persistent TCP connections, making it suitable for Vercel serverless functions.
