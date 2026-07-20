'use client'

import Link from 'next/link'
import { Clock3, Plus, Users } from 'lucide-react'
import { useLanguage } from '@/components/language-provider'
import { Button } from '@/components/ui/button'
import { recipeImages } from '@/lib/demo-data'
import type { Recipe } from '@/lib/types'

const fallbackImage = recipeImages['lemon-herb-chicken']

export function RecipeLibrary({
  recipes,
  databaseReady,
}: {
  recipes: Recipe[]
  databaseReady: boolean
}) {
  const { t } = useLanguage()

  return (
    <main>
      <section className="border-b border-[var(--line)] bg-[var(--sage)]">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-end justify-between gap-6 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div>
            <p className="text-xs font-bold uppercase text-[var(--leaf)]">
              {t('yourCollection')}
            </p>
            <h1 className="font-display mt-2 text-5xl leading-none font-semibold sm:text-7xl">
              {t('recipesWorthRepeating')}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-[var(--muted)]">
              {t('createOrAdapt')}
            </p>
          </div>
          <Button asChild variant="accent">
            <Link href="/recipes/new">
              <Plus /> {t('addRecipe')}
            </Link>
          </Button>
        </div>
      </section>
      <section className="mx-auto max-w-[1500px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {!databaseReady && (
          <div className="mb-8 border-l-4 border-[var(--gold)] bg-white px-5 py-4 text-sm">
            <strong>{t('demoMode')}</strong> {t('saveRecipesHint')}
          </div>
        )}
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {recipes.map((recipe, index) => (
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
                aria-label={`${t('viewRecipe')} ${recipe.title}`}
              />
              <div className="p-5">
                <p className="text-[10px] font-bold uppercase text-[var(--accent)]">
                  {recipe.id.includes('-') && recipe.id.length === 36
                    ? t('yourRecipe')
                    : t('miseFavourite')}
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
                    {recipe.prepMinutes + recipe.cookMinutes} {t('prepMinutes')}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="size-3.5" /> {recipe.baseServings}{' '}
                    {t('servings')}
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
