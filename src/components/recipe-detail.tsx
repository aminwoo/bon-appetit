'use client'

import Link from 'next/link'
import {
  ArrowLeft,
  Clock3,
  Copy,
  Flame,
  Minus,
  Pencil,
  Plus,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RecipeDeleteButton } from '@/components/recipe-delete-button'
import { scaleIngredient, scaleNutrition } from '@/lib/units'
import type { Recipe } from '@/lib/types'
import { useLanguage } from '@/components/language-provider'

type RecipeDetailProps = {
  recipe: Recipe
  image: string
  isCustom?: boolean
}

function formatAmount(value: number) {
  return new Intl.NumberFormat('en', { maximumFractionDigits: 2 }).format(value)
}

export function RecipeDetail({
  recipe,
  image,
  isCustom = false,
}: RecipeDetailProps) {
  const [servings, setServings] = useState(recipe.baseServings)
  const { t } = useLanguage()
  const ingredients = recipe.ingredients.map((ingredient) =>
    scaleIngredient(ingredient, servings, recipe.baseServings),
  )
  const totals = scaleNutrition(recipe.nutrition, servings)

  function updateServings(next: number) {
    setServings(Math.max(1, Math.min(20, Math.round(next))))
  }

  return (
    <main>
      <section className="relative min-h-[560px] overflow-hidden bg-[var(--ink)] text-white sm:min-h-[620px]">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-65"
          style={{ backgroundImage: `url(${image})` }}
          role="img"
          aria-label={recipe.title}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,27,20,0.92)_0%,rgba(15,27,20,0.55)_55%,rgba(15,27,20,0.1)_100%)]" />
        <div className="relative mx-auto flex min-h-[560px] max-w-[1500px] flex-col justify-between px-4 py-8 sm:min-h-[620px] sm:px-6 lg:px-8 lg:py-12">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button
              asChild
              variant="outline"
              className="w-fit border-white/30 bg-black/10 text-white hover:bg-white hover:text-[var(--ink)]"
            >
              <Link href="/recipes">
                <ArrowLeft /> {t('allRecipes')}
              </Link>
            </Button>
            <div className="flex flex-wrap gap-2">
              <Button
                asChild
                variant="outline"
                className="border-white/30 bg-white/90 text-[var(--ink)]"
              >
                <Link href={`/recipes/${recipe.id}/edit`}>
                  {isCustom ? <Pencil /> : <Copy />}{' '}
                  {isCustom ? t('editRecipe') : t('customize')}
                </Link>
              </Button>
              {isCustom && <RecipeDeleteButton recipeId={recipe.id} />}
            </div>
          </div>
          <div className="max-w-3xl rise-in">
            <p className="mb-3 text-xs font-bold uppercase text-[#c5e0d0]">
              {t('weeknightFavourite')}
            </p>
            <h1 className="font-display text-5xl leading-[0.95] font-medium sm:text-7xl lg:text-8xl">
              {recipe.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
              {recipe.description}
            </p>
            <div className="mt-7 flex flex-wrap gap-5 text-sm font-semibold">
              <span className="flex items-center gap-2">
                <Clock3 className="size-4 text-[#d8b45a]" />{' '}
                {recipe.prepMinutes + recipe.cookMinutes} {t('prepMinutes')}{' '}
                {t('total')}
              </span>
              <span className="flex items-center gap-2">
                <Flame className="size-4 text-[#ef8669]" />{' '}
                {recipe.nutrition.calories} kcal / {t('perServing')}
              </span>
              <span className="flex items-center gap-2">
                <Users className="size-4 text-[#a9c6b5]" /> {t('baseServings')}{' '}
                {recipe.baseServings}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--line)] bg-white">
        <div className="mx-auto grid max-w-[1500px] gap-8 px-4 py-7 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase text-[var(--accent)]">
              Scale the table
            </p>
            <h2 className="font-display mt-1 text-3xl font-semibold">
              {t('cookingFor')}
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-[auto_minmax(240px,380px)] sm:items-center">
            <div className="flex w-fit items-center rounded-md border border-[var(--line)] bg-[var(--paper)]">
              <button
                className="grid size-11 place-items-center"
                onClick={() => updateServings(servings - 1)}
                title={t('decreaseServings')}
              >
                <Minus className="size-4" />
              </button>
              <label className="sr-only" htmlFor="servings">
                {t('servings')}
              </label>
              <input
                id="servings"
                type="number"
                min="1"
                max="20"
                value={servings}
                onChange={(event) => updateServings(Number(event.target.value))}
                className="h-11 w-14 border-x border-[var(--line)] bg-white text-center font-bold outline-none"
              />
              <button
                className="grid size-11 place-items-center"
                onClick={() => updateServings(servings + 1)}
                title={t('increaseServings')}
              >
                <Plus className="size-4" />
              </button>
            </div>
            <input
              aria-label={t('servings')}
              type="range"
              min="1"
              max="20"
              value={servings}
              onChange={(event) => updateServings(Number(event.target.value))}
              className="h-2 w-full cursor-pointer accent-[var(--accent)]"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1500px] gap-12 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:px-8 lg:py-16">
        <div>
          <div className="mb-7 flex items-end justify-between border-b border-[var(--ink)] pb-4">
            <div>
              <p className="text-xs font-bold uppercase text-[var(--muted)]">
                {t('measuredFor')} {servings}
              </p>
              <h2 className="font-display text-4xl font-semibold">
                {t('ingredients')}
              </h2>
            </div>
            <span className="text-sm text-[var(--muted)]">
              {t('metricOnly')}
            </span>
          </div>
          <ul className="divide-y divide-[var(--line)]">
            {ingredients.map((ingredient, index) => (
              <li
                key={`${ingredient.name}-${ingredient.unit}-${index}`}
                className="grid grid-cols-[1fr_auto] items-baseline gap-4 py-4"
              >
                <div>
                  <p className="font-semibold">{ingredient.name}</p>
                  <p className="mt-0.5 text-xs text-[var(--muted)]">
                    {ingredient.category}
                  </p>
                </div>
                <p className="font-display text-2xl font-semibold">
                  <span className="text-[var(--accent)]">
                    {formatAmount(ingredient.quantity)}
                  </span>{' '}
                  {ingredient.unit}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-10 border-t border-[var(--ink)] pt-5">
            <p className="text-xs font-bold uppercase text-[var(--muted)]">
              {t('totalNutrition')} {servings} {t('servings')}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-[var(--line)] bg-[var(--line)] sm:grid-cols-5">
              {[
                ['Calories', totals.calories, 'kcal'],
                ['Protein', totals.protein, 'g'],
                ['Carbs', totals.carbs, 'g'],
                ['Fats', totals.fats, 'g'],
                ['Fiber', totals.fiber, 'g'],
              ].map(([label, value, unit]) => (
                <div key={label} className="bg-white p-4">
                  <p className="text-[10px] font-bold uppercase text-[var(--muted)]">
                    {label}
                  </p>
                  <p className="mt-2 text-xl font-bold">
                    {value}
                    <span className="ml-1 text-xs font-medium text-[var(--muted)]">
                      {unit}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="bg-[var(--sage)] px-5 py-7 sm:px-8 sm:py-9 lg:self-start">
          <p className="text-xs font-bold uppercase text-[var(--leaf)]">
            {t('method')}
          </p>
          <h2 className="font-display mt-1 text-4xl font-semibold">
            {t('fromPrepToPlate')}
          </h2>
          <ol className="mt-8 space-y-8">
            {recipe.instructions.map((instruction, index) => (
              <li key={instruction} className="grid grid-cols-[42px_1fr] gap-4">
                <span className="font-display grid size-10 place-items-center rounded-full border border-[var(--leaf)] text-xl font-semibold text-[var(--leaf)]">
                  {index + 1}
                </span>
                <p className="pt-1 text-sm leading-7">{instruction}</p>
              </li>
            ))}
          </ol>
        </aside>
      </section>
    </main>
  )
}
