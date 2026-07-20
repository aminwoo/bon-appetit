import type { GroceryItem, Ingredient, MetricUnit, Nutrition } from './types'

const baseUnits: Record<MetricUnit, { unit: 'g' | 'ml'; factor: number }> = {
  g: { unit: 'g', factor: 1 },
  kg: { unit: 'g', factor: 1000 },
  ml: { unit: 'ml', factor: 1 },
  l: { unit: 'ml', factor: 1000 },
}

function round(value: number, precision = 1) {
  const factor = 10 ** precision
  return Math.round((value + Number.EPSILON) * factor) / factor
}

export function scaleIngredient(
  ingredient: Ingredient,
  servings: number,
  baseServings: number,
): Ingredient {
  if (servings <= 0 || baseServings <= 0) {
    throw new Error('Serving counts must be greater than zero.')
  }

  return {
    ...ingredient,
    quantity: round(ingredient.quantity * (servings / baseServings)),
  }
}

export function scaleNutrition(
  nutrition: Nutrition,
  servings: number,
): Nutrition {
  if (servings <= 0) {
    throw new Error('Serving count must be greater than zero.')
  }

  return {
    calories: Math.round(nutrition.calories * servings),
    protein: round(nutrition.protein * servings),
    carbs: round(nutrition.carbs * servings),
    fats: round(nutrition.fats * servings),
    fiber: round(nutrition.fiber * servings),
  }
}

function displayUnit(quantity: number, unit: 'g' | 'ml') {
  if (quantity >= 1000) {
    return {
      quantity: round(quantity / 1000, 2),
      unit: unit === 'g' ? ('kg' as const) : ('l' as const),
    }
  }

  return { quantity: round(quantity), unit }
}

export function aggregateIngredients(
  ingredients: Array<Ingredient & { checked?: boolean }>,
): GroceryItem[] {
  const totals = new Map<
    string,
    {
      name: string
      quantity: number
      unit: 'g' | 'ml'
      category: Ingredient['category']
      checked: boolean
    }
  >()

  for (const ingredient of ingredients) {
    const normalizedName = ingredient.name.trim().toLocaleLowerCase()
    const converted = baseUnits[ingredient.unit]
    const key = `${normalizedName}:${converted.unit}`
    const existing = totals.get(key)

    totals.set(key, {
      name: existing?.name ?? ingredient.name.trim(),
      quantity:
        (existing?.quantity ?? 0) + ingredient.quantity * converted.factor,
      unit: converted.unit,
      category: existing?.category ?? ingredient.category,
      checked: (existing?.checked ?? false) || (ingredient.checked ?? false),
    })
  }

  return Array.from(totals, ([key, item]) => ({
    key,
    name: item.name,
    category: item.category,
    checked: item.checked,
    ...displayUnit(item.quantity, item.unit),
  })).sort((left, right) => left.name.localeCompare(right.name))
}
