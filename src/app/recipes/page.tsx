import Link from 'next/link'
import { Clock3, Plus, Users } from 'lucide-react'
import { getRecipes } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { hasDatabase } from '@/db'
import { demoRecipes, recipeImages } from '@/lib/demo-data'

const fallbackImage = recipeImages['lemon-herb-chicken']

export default async function RecipesPage() {
  const customRecipes = hasDatabase() ? await getRecipes() : []
  const allRecipes = [...customRecipes, ...demoRecipes]

  return (
    <main>
      <section className="border-b border-[var(--line)] bg-[var(--sage)]">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-end justify-between gap-6 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div>
            <p className="text-xs font-bold uppercase text-[var(--leaf)]">
              Your collection
            </p>
            <h1 className="font-display mt-2 text-5xl leading-none font-semibold sm:text-7xl">
              Recipes worth repeating.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-[var(--muted)]">
              Create your own recipes or adapt one of the built-in favourites.
            </p>
          </div>
          <Button asChild variant="accent">
            <Link href="/recipes/new">
              <Plus /> Add recipe
            </Link>
          </Button>
        </div>
      </section>
      <section className="mx-auto max-w-[1500px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {!hasDatabase() && (
          <div className="mb-8 border-l-4 border-[var(--gold)] bg-white px-5 py-4 text-sm">
            <strong>Demo mode.</strong> Add `DATABASE_URL` to save new recipes
            and edits.
          </div>
        )}
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {allRecipes.map((recipe, index) => (
            <article
              key={recipe.id}
              className="group overflow-hidden rounded-md border border-[var(--line)] bg-white rise-in"
              style={{ animationDelay: `${Math.min(index, 5) * 50}ms` }}
            >
              <Link
                href={`/recipes/${recipe.id}`}
                className="relative block aspect-[16/10] overflow-hidden bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                style={{
                  backgroundImage: `url(${recipe.imageUrl ?? recipeImages[recipe.id] ?? fallbackImage})`,
                }}
                aria-label={`View ${recipe.title}`}
              />
              <div className="p-5">
                <p className="text-[10px] font-bold uppercase text-[var(--accent)]">
                  {recipe.id.includes('-') && recipe.id.length === 36
                    ? 'Your recipe'
                    : 'Mise favourite'}
                </p>
                <Link href={`/recipes/${recipe.id}`}>
                  <h2 className="font-display mt-1 text-3xl font-semibold">
                    {recipe.title}
                  </h2>
                </Link>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--muted)]">
                  {recipe.description}
                </p>
                <div className="mt-5 flex gap-5 border-t border-[var(--line)] pt-4 text-xs font-semibold text-[var(--muted)]">
                  <span className="flex items-center gap-1.5">
                    <Clock3 className="size-3.5" />{' '}
                    {recipe.prepMinutes + recipe.cookMinutes} min
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="size-3.5" /> {recipe.baseServings}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
