# Mise

A responsive meal planning app built with Next.js 16, React Server Components, Server Actions, Neon Postgres, Drizzle ORM, Tailwind CSS, and shadcn-style UI primitives.

The checked-in demo data makes every route usable without a database. The Server Actions in `src/app/actions.ts` are ready for persistent Neon-backed recipes, meal slots, and grocery checks once `DATABASE_URL` is configured.

## Recipe management

- Open `/recipes` to browse the complete recipe library.
- Add a recipe with dynamic metric ingredients, ordered method steps, timings, servings, and nutrition per serving.
- Quickly import a recipe from a public recipe-page URL, then review and edit the populated draft before saving.
- Use **Customize** on a built-in recipe to create an editable personal copy.
- Custom Neon recipes have **Edit recipe** and confirmed **Delete** controls on their detail page.
- New and updated recipes are immediately available in the weekly planner recipe selector.

Creating, editing, and deleting records requires `DATABASE_URL`. The built-in recipes remain read-only source material so they are always available as examples.

Link imports use Schema.org `Recipe` data published by the source website.
Common US and imperial quantities are converted to metric estimates. Ingredients
without a standard mass or volume unit are marked for review and are never saved
until the user submits the populated editor.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run db:push
npm run dev
```

Open `http://localhost:3000`.

## Grocery cost estimates

The grocery page can compare whole-pack basket estimates from Coles and
Woolworths. Product search and catalogue pricing are provided by WhichGrocer;
create a key at `https://www.whichgrocer.com/developers` and keep it in the
server-only environment:

```dotenv
WHICHGROCER_API_KEY=wg_live_replace_me
```

The trial API allows one request every five seconds, so `.env.example` defaults
`WHICHGROCER_REQUEST_DELAY_MS` to `5000`. Paid plans can use a shorter delay.

Costco does not use this catalogue feed. Add a local warehouse pack price in
the item comparison instead; Bon Appétit keeps that price book in the current
browser only. All retailer totals are estimates and exclude delivery,
membership, substitutions, and store-specific availability.

## Monkey Paw integration

Monkey Paw can read the minimal daily meal summary needed for its unified day
timeline. The endpoint is server-to-server and rejects requests without the
shared integration secret.

Set `MONKEY_PAW_INTEGRATION_SECRET` here and use the same value for
`BON_APPETIT_INTEGRATION_SECRET` in Monkey Paw. Configure Monkey Paw's
`BON_APPETIT_URL` with this app's deployed URL (or `http://localhost:3001`
when using Monkey Paw's `npm run dev:all`).

Create a Neon project and copy its pooled connection string into `.env.local`:

```dotenv
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxxxxxxxxx
ABLY_API_KEY=xxxxx.xxxxx:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Create a Blob store in the Vercel project and add its read/write token as
`BLOB_READ_WRITE_TOKEN`. Recipe photos can then be uploaded from the recipe
editor; uploaded images are stored in Vercel Blob and their public URLs are
saved with the recipe in Neon. Images must be 10 MB or smaller.

Create an Ably app and add its server-side API key as `ABLY_API_KEY`. The plan
page publishes successful Neon meal changes to a week-scoped Ably channel, so
other open plan pages update without a refresh. Keep this key private; the
browser receives short-lived tokens through `/api/ably/token`.

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

Ingredient inputs and imports accept common metric, imperial, and kitchen units, then normalize them to grams for display, saving, scaling, and grocery aggregation. Volume measurements use the practical kitchen approximation `1 ml = 1 g`.

## Vercel deployment

1. Import this repository into Vercel.
2. Add `DATABASE_URL` in Project Settings > Environment Variables.
3. Create a Blob store and add its `BLOB_READ_WRITE_TOKEN` in Project Settings > Environment Variables.
4. Create an Ably app and add `ABLY_API_KEY` in Project Settings > Environment Variables.
5. Run `npm run db:push` from a trusted local or CI environment.
6. Deploy. Vercel detects the Next.js build automatically.

The Neon HTTP driver opens no persistent TCP connections, making it suitable for Vercel serverless functions.
