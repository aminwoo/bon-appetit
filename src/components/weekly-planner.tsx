'use client'

import Link from 'next/link'
import { ChevronLeft, ChevronRight, Minus, Plus, Users, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { getWeekDates, toDateKey } from '@/lib/dates'
import { recipeImages } from '@/lib/demo-data'
import { cn } from '@/lib/utils'
import {
  mealSlots,
  type MealSlot,
  type PlannedMeal,
  type Recipe,
} from '@/lib/types'

type WeeklyPlannerProps = {
  initialWeekStart: string
  initialMeals: PlannedMeal[]
  recipes: Recipe[]
}

const dayFormatter = new Intl.DateTimeFormat('en', { weekday: 'short' })
const dateFormatter = new Intl.DateTimeFormat('en', {
  day: 'numeric',
  month: 'short',
})
const rangeFormatter = new Intl.DateTimeFormat('en', {
  day: 'numeric',
  month: 'long',
})
const fallbackImage = recipeImages['lemon-herb-chicken']

export function WeeklyPlanner({
  initialWeekStart,
  initialMeals,
  recipes,
}: WeeklyPlannerProps) {
  const [weekStart, setWeekStart] = useState(
    () => new Date(`${initialWeekStart}T00:00:00Z`),
  )
  const [meals, setMeals] = useState(initialMeals)
  const [editingSlot, setEditingSlot] = useState<string | null>(null)
  const dates = getWeekDates(weekStart)

  function moveWeek(offset: number) {
    const next = new Date(weekStart)
    next.setUTCDate(next.getUTCDate() + offset * 7)
    setWeekStart(next)
    setEditingSlot(null)
  }

  function assignRecipe(date: string, slot: MealSlot, recipeId: string) {
    const recipe = recipes.find((item) => item.id === recipeId)
    if (!recipe) return
    setMeals((current) => [
      ...current.filter((meal) => !(meal.date === date && meal.slot === slot)),
      {
        id: `local-${date}-${slot}`,
        date,
        slot,
        servings: recipe.baseServings,
        recipe,
      },
    ])
    setEditingSlot(null)
  }

  function changeServings(mealId: string, amount: number) {
    setMeals((current) =>
      current.map((meal) =>
        meal.id === mealId
          ? {
              ...meal,
              servings: Math.max(1, Math.min(20, meal.servings + amount)),
            }
          : meal,
      ),
    )
  }

  const visibleMeals = meals.filter((meal) =>
    dates.some((date) => toDateKey(date) === meal.date),
  )
  const proteinTotal = visibleMeals.reduce(
    (total, meal) => total + meal.recipe.nutrition.protein * meal.servings,
    0,
  )

  return (
    <main>
      <section className="border-b border-[var(--line)] bg-[var(--ink)] text-white">
        <div className="mx-auto grid max-w-[1500px] gap-8 px-4 py-9 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-end lg:px-8 lg:py-12">
          <div className="rise-in">
            <p className="mb-2 text-xs font-bold uppercase text-[#a9c6b5]">
              Your weekly table
            </p>
            <h1 className="font-display max-w-3xl text-4xl leading-[0.98] font-medium sm:text-6xl">
              Make room for good food.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-[#c5cec9] sm:text-base">
              Shape the week, balance each day, then turn the whole plan into
              one clean shopping list.
            </p>
          </div>
          <div className="flex gap-3 rise-in [animation-delay:120ms]">
            <div className="min-w-28 border-l border-white/20 pl-4">
              <p className="text-2xl font-bold">{visibleMeals.length}</p>
              <p className="text-xs text-[#aebbb4]">meals planned</p>
            </div>
            <div className="min-w-28 border-l border-white/20 pl-4">
              <p className="text-2xl font-bold">{Math.round(proteinTotal)} g</p>
              <p className="text-xs text-[#aebbb4]">protein total</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase text-[var(--accent)]">
              Meal plan
            </p>
            <h2 className="font-display mt-1 text-3xl font-semibold sm:text-4xl">
              {rangeFormatter.format(dates[0])} –{' '}
              {rangeFormatter.format(dates[6])}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => moveWeek(-1)}
              title="Previous week"
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                setWeekStart(new Date(`${initialWeekStart}T00:00:00Z`))
              }
            >
              This week
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => moveWeek(1)}
              title="Next week"
            >
              <ChevronRight />
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto pb-3">
          <div className="grid min-w-[1240px] grid-cols-7 border-y border-l border-[var(--line)] bg-white">
            {dates.map((date, dayIndex) => {
              const dateKey = toDateKey(date)
              const dayMeals = meals.filter((meal) => meal.date === dateKey)
              const totals = dayMeals.reduce(
                (total, meal) => ({
                  calories:
                    total.calories +
                    meal.recipe.nutrition.calories * meal.servings,
                  protein:
                    total.protein +
                    meal.recipe.nutrition.protein * meal.servings,
                  carbs:
                    total.carbs + meal.recipe.nutrition.carbs * meal.servings,
                }),
                { calories: 0, protein: 0, carbs: 0 },
              )

              return (
                <article
                  key={dateKey}
                  className="border-r border-[var(--line)] rise-in"
                  style={{ animationDelay: `${dayIndex * 45}ms` }}
                >
                  <header
                    className={cn(
                      'h-32 border-b border-[var(--line)] p-4',
                      dayIndex === 0 && 'bg-[var(--sage)]',
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase text-[var(--muted)]">
                          {dayFormatter.format(date)}
                        </p>
                        <p className="font-display mt-0.5 text-2xl font-semibold">
                          {dateFormatter.format(date)}
                        </p>
                      </div>
                      {dayMeals.length > 0 && (
                        <span className="size-2 rounded-full bg-[var(--accent)]" />
                      )}
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-1 text-[10px] text-[var(--muted)]">
                      <span>
                        <strong className="block text-sm text-[var(--ink)]">
                          {Math.round(totals.calories)}
                        </strong>
                        kcal
                      </span>
                      <span>
                        <strong className="block text-sm text-[var(--ink)]">
                          {Math.round(totals.protein)}g
                        </strong>
                        protein
                      </span>
                      <span>
                        <strong className="block text-sm text-[var(--ink)]">
                          {Math.round(totals.carbs)}g
                        </strong>
                        carbs
                      </span>
                    </div>
                  </header>

                  {mealSlots.map((slot) => {
                    const meal = dayMeals.find((item) => item.slot === slot)
                    const slotKey = `${dateKey}-${slot}`
                    return (
                      <div
                        key={slot}
                        className="h-44 border-b border-[var(--line)] p-2.5 last:border-b-0"
                      >
                        <p className="mb-2 text-[10px] font-bold uppercase text-[var(--muted)]">
                          {slot}
                        </p>
                        {meal ? (
                          <div className="group relative flex h-[128px] flex-col overflow-hidden rounded-md bg-[var(--paper-deep)]">
                            <Link
                              href={`/recipes/${meal.recipe.id}`}
                              className="relative h-[66px] overflow-hidden"
                            >
                              <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                                style={{
                                  backgroundImage: `url(${meal.recipe.imageUrl ?? recipeImages[meal.recipe.id] ?? fallbackImage})`,
                                }}
                                role="img"
                                aria-label={meal.recipe.title}
                              />
                            </Link>
                            <button
                              className="absolute top-1.5 right-1.5 grid size-6 place-items-center rounded-md bg-white/90 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 focus:opacity-100"
                              onClick={() =>
                                setMeals((current) =>
                                  current.filter((item) => item.id !== meal.id),
                                )
                              }
                              title="Remove meal"
                            >
                              <X className="size-3.5" />
                            </button>
                            <div className="flex flex-1 items-center justify-between gap-1 px-2.5">
                              <div className="min-w-0">
                                <p className="truncate text-xs font-bold">
                                  {meal.recipe.title}
                                </p>
                                <p className="flex items-center gap-1 text-[10px] text-[var(--muted)]">
                                  <Users className="size-3" /> {meal.servings}
                                </p>
                              </div>
                              <div className="flex shrink-0">
                                <button
                                  onClick={() => changeServings(meal.id, -1)}
                                  className="grid size-6 place-items-center"
                                  title="Decrease servings"
                                >
                                  <Minus className="size-3" />
                                </button>
                                <button
                                  onClick={() => changeServings(meal.id, 1)}
                                  className="grid size-6 place-items-center"
                                  title="Increase servings"
                                >
                                  <Plus className="size-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : editingSlot === slotKey ? (
                          <div className="flex h-[128px] flex-col justify-center gap-2 rounded-md bg-[var(--sage)] p-2">
                            <label
                              className="text-[10px] font-bold uppercase"
                              htmlFor={slotKey}
                            >
                              Choose recipe
                            </label>
                            <select
                              id={slotKey}
                              autoFocus
                              defaultValue=""
                              onChange={(event) =>
                                assignRecipe(dateKey, slot, event.target.value)
                              }
                              className="h-9 min-w-0 rounded-md border border-[var(--line)] bg-white px-2 text-xs outline-none focus:ring-2 focus:ring-[var(--leaf)]"
                            >
                              <option value="" disabled>
                                Select…
                              </option>
                              {recipes.map((recipe) => (
                                <option key={recipe.id} value={recipe.id}>
                                  {recipe.title}
                                </option>
                              ))}
                            </select>
                            <button
                              className="text-[10px] font-bold text-[var(--muted)]"
                              onClick={() => setEditingSlot(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingSlot(slotKey)}
                            className="grid h-[128px] w-full place-items-center rounded-md border border-dashed border-[var(--line)] text-[var(--muted)] transition-colors hover:border-[var(--leaf)] hover:bg-[var(--sage)] hover:text-[var(--leaf)]"
                            title={`Add ${slot.toLowerCase()}`}
                          >
                            <Plus className="size-5" />
                          </button>
                        )}
                      </div>
                    )
                  })}
                </article>
              )
            })}
          </div>
        </div>
        <p className="mt-2 text-xs text-[var(--muted)] lg:hidden">
          Swipe sideways to see the full week.
        </p>
      </section>
    </main>
  )
}
