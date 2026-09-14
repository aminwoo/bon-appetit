'use client'

import Link from 'next/link'
import {
  ArrowUpRight,
  Clock3,
  Flame,
  Plus,
  RotateCcw,
  Search,
  Users,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLanguage } from '@/components/language-provider'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { recipeImages } from '@/lib/demo-data'
import type { Recipe } from '@/lib/types'

const fallbackImage = recipeImages['lemon-herb-chicken']
type DurationFilter = 'all' | 'quick' | 'everyday' | 'slow'
type SortOrder = 'featured' | 'quickest' | 'alphabetical' | 'protein'

export function RecipeLibrary({
  recipes,
  databaseReady,
}: {
  recipes: Recipe[]
  databaseReady: boolean
}) {
  const { language, t } = useLanguage()
  const [query, setQuery] = useState('')
  const [duration, setDuration] = useState<DurationFilter>('all')
  const [sortOrder, setSortOrder] = useState<SortOrder>('featured')
  const searchRef = useRef<HTMLInputElement>(null)

  const filteredRecipes = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase()
    const results = recipes.filter((recipe) => {
      const totalMinutes = recipe.prepMinutes + recipe.cookMinutes
      const matchesDuration =
        duration === 'all' ||
        (duration === 'quick' && totalMinutes <= 30) ||
        (duration === 'everyday' && totalMinutes > 30 && totalMinutes <= 60) ||
        (duration === 'slow' && totalMinutes > 60)
      const searchableText = [
        recipe.title,
        recipe.description,
        ...recipe.ingredients.map((ingredient) => ingredient.name),
      ]
        .join(' ')
        .toLocaleLowerCase()

      return matchesDuration && searchableText.includes(normalizedQuery)
    })

    return [...results].sort((left, right) => {
      if (sortOrder === 'quickest') {
        return (
          left.prepMinutes +
          left.cookMinutes -
          (right.prepMinutes + right.cookMinutes)
        )
      }
      if (sortOrder === 'alphabetical') {
        return left.title.localeCompare(right.title, language)
      }
      if (sortOrder === 'protein') {
        return right.nutrition.protein - left.nutrition.protein
      }
      return recipes.indexOf(left) - recipes.indexOf(right)
    })
  }, [duration, language, query, recipes, sortOrder])

  const averageMinutes = recipes.length
    ? Math.round(
        recipes.reduce(
          (total, recipe) =>
            total + recipe.prepMinutes + recipe.cookMinutes,
          0,
        ) / recipes.length,
      )
    : 0
  const hasFilters = Boolean(query.trim()) || duration !== 'all'

  useEffect(() => {
    function focusSearch(event: KeyboardEvent) {
      if (
        event.key === '/' &&
        !(event.target instanceof HTMLInputElement) &&
        !(event.target instanceof HTMLTextAreaElement) &&
        !(event.target instanceof HTMLSelectElement)
      ) {
        event.preventDefault()
        searchRef.current?.focus()
      }
    }

    window.addEventListener('keydown', focusSearch)
    return () => window.removeEventListener('keydown', focusSearch)
  }, [])

  function resetFilters() {
    setQuery('')
    setDuration('all')
    setSortOrder('featured')
    searchRef.current?.focus()
  }

  return (
    <main>
      <section className="relative overflow-hidden border-b border-[var(--line)] bg-[var(--sage)]">
        <div className="absolute -top-28 right-[8%] size-72 rounded-full bg-white/35 blur-3xl" />
        <div className="absolute -bottom-40 left-[38%] size-80 rounded-full bg-[var(--gold)]/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-[1500px] gap-8 px-4 pt-10 pb-24 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-end lg:px-8 lg:pt-16 lg:pb-28">
          <div className="max-w-3xl rise-in">
            <p className="text-xs font-bold uppercase text-[var(--leaf)]">
              {t('yourCollection')}
            </p>
            <h1 className="font-display mt-2 text-5xl leading-[0.94] font-semibold text-balance sm:text-7xl lg:text-8xl">
              {t('recipesWorthRepeating')}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[var(--muted)]">
              {t('createOrAdapt')}
            </p>
          </div>
          <div className="flex items-center gap-3 rise-in">
            <div className="hidden border-r border-[var(--leaf)]/20 pr-5 text-right sm:block">
              <p className="font-display text-3xl font-semibold">{recipes.length}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">
                {t('recipesSaved')}
              </p>
            </div>
            <div className="hidden pr-2 text-right sm:block">
              <p className="font-display text-3xl font-semibold">{averageMinutes}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">
                {t('averageMinutes')}
              </p>
            </div>
            <Button asChild variant="accent" className="h-12 rounded-full px-5 shadow-sm">
              <Link href="/recipes/new">
                <Plus /> {t('addRecipe')}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-[1500px] px-4 pb-12 sm:px-6 lg:px-8 lg:pb-16">
        <div className="relative -mt-14 rounded-2xl border border-[var(--line)] bg-white p-3 shadow-[0_18px_50px_rgba(25,39,31,0.10)] sm:p-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(280px,1fr)_auto_auto] lg:items-center">
            <label className="relative block">
              <span className="sr-only">{t('searchRecipes')}</span>
              <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[var(--muted)]" />
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('searchPlaceholder')}
                className="h-12 w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] pr-20 pl-11 text-sm outline-none transition focus:border-[var(--leaf)] focus:bg-white focus:ring-2 focus:ring-[var(--leaf)]/15"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute top-1/2 right-3 grid size-8 -translate-y-1/2 place-items-center rounded-full text-[var(--muted)] hover:bg-white hover:text-[var(--ink)]"
                  aria-label={t('clearSearch')}
                >
                  <X className="size-4" />
                </button>
              ) : (
                <kbd className="absolute top-1/2 right-4 hidden -translate-y-1/2 rounded border border-[var(--line)] bg-white px-2 py-0.5 text-[10px] font-bold text-[var(--muted)] sm:block">
                  /
                </kbd>
              )}
            </label>

            <div className="scrollbar-none flex gap-1 overflow-x-auto rounded-xl bg-[var(--paper-deep)] p-1" aria-label={t('filterByTime')}>
              {(
                [
                  ['all', t('allTimes')],
                  ['quick', t('underThirty')],
                  ['everyday', t('thirtyToSixty')],
                  ['slow', t('overSixty')],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDuration(value)}
                  className={cn(
                    'h-10 shrink-0 rounded-lg px-3 text-xs font-bold text-[var(--muted)] transition sm:px-4',
                    duration === value &&
                      'bg-white text-[var(--ink)] shadow-[0_1px_4px_rgba(25,39,31,0.10)]',
                  )}
                  aria-pressed={duration === value}
                >
                  {label}
                </button>
              ))}
            </div>

            <label className="flex h-12 items-center gap-2 rounded-xl border border-[var(--line)] px-3 text-xs font-bold text-[var(--muted)]">
              <span className="shrink-0">{t('sortBy')}</span>
              <select
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value as SortOrder)}
                className="min-w-0 flex-1 bg-transparent font-semibold text-[var(--ink)] outline-none"
              >
                <option value="featured">{t('featured')}</option>
                <option value="quickest">{t('quickest')}</option>
                <option value="alphabetical">{t('alphabetical')}</option>
                <option value="protein">{t('highestProtein')}</option>
              </select>
            </label>
          </div>
        </div>

        {!databaseReady && (
          <div className="mt-6 border-l-4 border-[var(--gold)] bg-white px-5 py-4 text-sm">
            <strong>{t('demoMode')}</strong> {t('saveRecipesHint')}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between gap-4">
          <p className="text-sm font-semibold text-[var(--muted)]" aria-live="polite">
            <span className="text-[var(--ink)]">{filteredRecipes.length}</span>{' '}
            {t('recipesFound')}
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="flex items-center gap-1.5 text-xs font-bold text-[var(--leaf)] hover:text-[var(--accent)]"
            >
              <RotateCcw className="size-3.5" /> {t('resetFilters')}
            </button>
          )}
        </div>

        {filteredRecipes.length ? (
          <div className="mt-5 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredRecipes.map((recipe, index) => (
            <article
              key={recipe.id}
              className="group overflow-hidden rounded-xl border border-[var(--line)] bg-white shadow-[0_2px_10px_rgba(25,39,31,0.03)] transition duration-300 hover:-translate-y-1 hover:border-[var(--leaf)]/30 hover:shadow-[0_18px_35px_rgba(25,39,31,0.10)] rise-in"
              style={{ animationDelay: `${Math.min(index, 5) * 50}ms` }}
            >
              <Link
                href={`/recipes/${recipe.id}`}
                className="relative block aspect-[16/10] overflow-hidden bg-[var(--paper-deep)]"
                aria-label={`${t('viewRecipe')} ${recipe.title}`}
              >
                <span
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{
                    backgroundImage: `url(${recipe.imageUrl ?? recipeImages[recipe.id] ?? fallbackImage})`,
                  }}
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-60" />
                <span className="absolute right-4 bottom-4 grid size-10 translate-y-2 place-items-center rounded-full bg-white text-[var(--ink)] opacity-0 shadow-md transition group-hover:translate-y-0 group-hover:opacity-100">
                  <ArrowUpRight className="size-4" />
                </span>
              </Link>
              <div className="p-5">
                <p className="text-[10px] font-bold uppercase text-[var(--accent)]">
                  {recipe.id.includes('-') && recipe.id.length === 36
                    ? t('yourRecipe')
                    : t('miseFavourite')}
                </p>
                <Link href={`/recipes/${recipe.id}`}>
                  <h2 className="font-display mt-1 text-3xl leading-tight font-semibold transition-colors group-hover:text-[var(--leaf)]">
                    {recipe.title}
                  </h2>
                </Link>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--muted)]">
                  {recipe.description}
                </p>
                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-[var(--line)] pt-4 text-xs font-semibold text-[var(--muted)]">
                  <span className="flex items-center gap-1.5">
                    <Clock3 className="size-3.5" />{' '}
                    {recipe.prepMinutes + recipe.cookMinutes} {t('prepMinutes')}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="size-3.5" /> {recipe.baseServings}{' '}
                    {t('servings')}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Flame className="size-3.5" /> {recipe.nutrition.calories}{' '}
                    kcal
                  </span>
                </div>
              </div>
            </article>
          ))}
          </div>
        ) : (
          <div className="mt-5 grid min-h-80 place-items-center rounded-2xl border border-dashed border-[var(--line)] bg-white/60 px-6 text-center">
            <div>
              <span className="mx-auto grid size-14 place-items-center rounded-full bg-[var(--sage)] text-[var(--leaf)]">
                <Search className="size-6" />
              </span>
              <h2 className="font-display mt-5 text-3xl font-semibold">{t('noRecipesFound')}</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">{t('tryAnotherSearch')}</p>
              <Button variant="outline" className="mt-5" onClick={resetFilters}>
                <RotateCcw /> {t('resetFilters')}
              </Button>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
