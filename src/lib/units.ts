import type { GroceryItem, Ingredient, MetricUnit, Nutrition } from './types'

const gramsPerUnit: Record<MetricUnit, number> = {
  g: 1,
  kg: 1000,
  ml: 1,
  l: 1000,
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

  const normalized = convertIngredientToGrams(ingredient)
  return {
    ...normalized,
    quantity: round(normalized.quantity * (servings / baseServings)),
  }
}

/**
 * Converts every supported measurement to a scale-friendly gram amount.
 * Volumes use the kitchen approximation that 1 ml weighs 1 g.
 */
export function convertIngredientToGrams(ingredient: Ingredient): Ingredient {
  return {
    ...ingredient,
    quantity: round(ingredient.quantity * gramsPerUnit[ingredient.unit], 2),
    unit: 'g',
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

export function aggregateIngredients(
  ingredients: Array<Ingredient & { checked?: boolean }>,
): GroceryItem[] {
  const totals = new Map<
    string,
    {
      name: string
      quantity: number
      category: Ingredient['category']
      checked: boolean
    }
  >()

  for (const ingredient of ingredients) {
    const normalizedName = ingredient.name.trim().toLocaleLowerCase()
    const converted = convertIngredientToGrams(ingredient)
    const key = `${normalizedName}:g`
    const existing = totals.get(key)

    totals.set(key, {
      name: existing?.name ?? ingredient.name.trim(),
      quantity: (existing?.quantity ?? 0) + converted.quantity,
      category: existing?.category ?? ingredient.category,
      checked: (existing?.checked ?? false) || (ingredient.checked ?? false),
    })
  }

  return Array.from(totals, ([key, item]) => ({
    key,
    name: item.name,
    category: item.category,
    checked: item.checked,
    quantity: round(item.quantity),
    unit: 'g' as const,
  })).sort((left, right) => left.name.localeCompare(right.name))
}
