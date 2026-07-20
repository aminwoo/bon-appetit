'use client'

import {
  Apple,
  Beef,
  Check,
  ChevronLeft,
  CookingPot,
  Milk,
  PackageOpen,
  RotateCcw,
} from 'lucide-react'
import Link from 'next/link'
import { useDeferredValue, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  mealSlots,
  type GroceryItem,
  type IngredientCategory,
  type MealSlot,
  type PlannedMeal,
} from '@/lib/types'
import { aggregateIngredients, scaleIngredient } from '@/lib/units'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/components/language-provider'

const categoryOrder: IngredientCategory[] = [
  'Produce',
  'Meat',
  'Dairy',
  'Pantry',
  'Spices',
]
const categoryIcons = {
  Produce: Apple,
  Meat: Beef,
  Dairy: Milk,
  Pantry: PackageOpen,
  Spices: CookingPot,
}

function buildItems(meals: PlannedMeal[], slots: Set<MealSlot>) {
  return aggregateIngredients(
    meals
      .filter((meal) => slots.has(meal.slot))
      .flatMap((meal) =>
        meal.recipe.ingredients.map((ingredient) =>
          scaleIngredient(ingredient, meal.servings, meal.recipe.baseServings),
        ),
      ),
  )
}

function formatAmount(item: GroceryItem) {
  return `${new Intl.NumberFormat('en', { maximumFractionDigits: 2 }).format(item.quantity)} ${item.unit}`
}

export function GroceryList({ meals }: { meals: PlannedMeal[] }) {
  const { t } = useLanguage()
  const [activeSlots, setActiveSlots] = useState<Set<MealSlot>>(
    () => new Set(mealSlots),
  )
  const deferredSlots = useDeferredValue(activeSlots)
  const [checkedKeys, setCheckedKeys] = useState<Set<string>>(() => new Set())
  const items = buildItems(meals, deferredSlots)
  const checkedCount = items.filter((item) => checkedKeys.has(item.key)).length
  const progress = items.length
    ? Math.round((checkedCount / items.length) * 100)
    : 0

  function toggleSlot(slot: MealSlot) {
    setActiveSlots((current) => {
      const next = new Set(current)
      if (next.has(slot)) next.delete(slot)
      else next.add(slot)
      return next
    })
  }

  function toggleItem(key: string) {
    setCheckedKeys((current) => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <main>
      <section className="border-b border-[var(--line)] bg-[#e8b64c]">
        <div className="paper-grid">
          <div className="mx-auto max-w-[1500px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
            <Button asChild variant="outline" className="mb-8 bg-white/80">
              <Link href="/">
                <ChevronLeft /> {t('backToPlan')}
              </Link>
            </Button>
            <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-end">
              <div className="rise-in">
                <p className="text-xs font-bold uppercase text-[var(--ink)]/65">
                  {t('weekInOneBag')}
                </p>
                <h1 className="font-display mt-2 text-5xl leading-none font-semibold sm:text-7xl">
                  {t('groceryRun')}
                  <br />
                  {t('alreadySorted')}
                </h1>
              </div>
              <div className="border-l-2 border-[var(--ink)] pl-5">
                <div className="flex items-end justify-between">
                  <span className="text-sm font-bold">{t('shoppingProgress')}</span>
                  <span className="font-display text-3xl font-semibold">
                    {progress}%
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/15">
                  <div
                    className="h-full bg-[var(--ink)] transition-[width] duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-[var(--ink)]/65">
                  {checkedCount} of {items.length} {t('itemsCollected')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--line)] bg-white">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div
            className="flex flex-wrap items-center gap-2"
            role="group"
            aria-label={t('include')}
          >
            <span className="mr-2 text-xs font-bold uppercase text-[var(--muted)]">
              {t('include')}
            </span>
            {mealSlots.map((slot) => (
              <button
                key={slot}
                onClick={() => toggleSlot(slot)}
                aria-pressed={activeSlots.has(slot)}
                className={cn(
                  'h-9 rounded-md border px-3 text-xs font-bold transition-colors',
                  activeSlots.has(slot)
                    ? 'border-[var(--leaf)] bg-[var(--leaf)] text-white'
                    : 'border-[var(--line)] bg-white text-[var(--muted)] hover:border-[var(--leaf)]',
                )}
              >
                {slot}
              </button>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCheckedKeys(new Set())}
          >
            <RotateCcw /> {t('clearChecks')}
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase text-[var(--accent)]">
              {t('aisleByAisle')}
            </p>
            <h2 className="font-display mt-1 text-4xl font-semibold">
              {t('thisWeeksList')}
            </h2>
          </div>
          <p className="text-sm text-[var(--muted)]">
            {t('metricQuantities')}
          </p>
        </div>

        {items.length === 0 ? (
          <div className="border-y border-[var(--line)] py-20 text-center">
            <p className="font-display text-3xl font-semibold">
              {t('noMealsSelected')}
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {t('chooseMealType')}
            </p>
          </div>
        ) : (
          <div className="grid gap-x-10 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
            {categoryOrder.map((category) => {
              const categoryItems = items.filter(
                (item) => item.category === category,
              )
              if (!categoryItems.length) return null
              const Icon = categoryIcons[category]
              return (
                <section
                  key={category}
                  aria-labelledby={`category-${category}`}
                >
                  <header className="flex items-center justify-between border-b-2 border-[var(--ink)] pb-3">
                    <h3
                      id={`category-${category}`}
                      className="flex items-center gap-2 text-sm font-bold uppercase"
                    >
                      <Icon className="size-4 text-[var(--accent)]" />{' '}
                      {t(category.toLowerCase() as 'produce' | 'meat' | 'dairy' | 'pantry' | 'spices')}
                    </h3>
                    <span className="text-xs text-[var(--muted)]">
                      {categoryItems.length}
                    </span>
                  </header>
                  <ul className="divide-y divide-[var(--line)]">
                    {categoryItems.map((item) => {
                      const checked = checkedKeys.has(item.key)
                      return (
                        <li key={item.key}>
                          <label className="group grid cursor-pointer grid-cols-[24px_1fr_auto] items-center gap-3 py-4">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleItem(item.key)}
                              className="sr-only"
                            />
                            <span
                              className={cn(
                                'grid size-6 place-items-center rounded-md border transition-colors',
                                checked
                                  ? 'border-[var(--leaf)] bg-[var(--leaf)] text-white'
                                  : 'border-[var(--line)] bg-white group-hover:border-[var(--leaf)]',
                              )}
                            >
                              {checked && (
                                <Check className="size-4" strokeWidth={3} />
                              )}
                            </span>
                            <span
                              className={cn(
                                'text-sm font-semibold transition-colors',
                                checked && 'text-[var(--muted)] line-through',
                              )}
                            >
                              {item.name}
                            </span>
                            <span
                              className={cn(
                                'font-display text-lg font-semibold',
                                checked && 'text-[var(--muted)]',
                              )}
                            >
                              {formatAmount(item)}
                            </span>
                          </label>
                        </li>
                      )
                    })}
                  </ul>
                </section>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
