import type { Ingredient, IngredientCategory, Recipe } from './types'

type RecipeDraft = Omit<Recipe, 'id'>
type JsonRecord = Record<string, unknown>

const fractions: Record<string, number> = {
  '¼': 0.25,
  '½': 0.5,
  '¾': 0.75,
  '⅓': 1 / 3,
  '⅔': 2 / 3,
  '⅛': 0.125,
  '⅜': 0.375,
  '⅝': 0.625,
  '⅞': 0.875,
}

const volumeUnits: Record<string, number> = {
  ml: 1,
  milliliter: 1,
  milliliters: 1,
  millilitre: 1,
  millilitres: 1,
  l: 1000,
  liter: 1000,
  liters: 1000,
  litre: 1000,
  litres: 1000,
  tsp: 5,
  teaspoon: 5,
  teaspoons: 5,
  tbsp: 15,
  tablespoon: 15,
  tablespoons: 15,
  cup: 240,
  cups: 240,
  'fl oz': 29.5735,
  'fluid ounce': 29.5735,
  'fluid ounces': 29.5735,
}

const massUnits: Record<string, number> = {
  g: 1,
  gram: 1,
  grams: 1,
  kg: 1000,
  kilogram: 1000,
  kilograms: 1000,
  oz: 28.3495,
  ounce: 28.3495,
  ounces: 28.3495,
  lb: 453.592,
  lbs: 453.592,
  pound: 453.592,
  pounds: 453.592,
}

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function text(value: unknown) {
  return typeof value === 'string'
    ? value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    : ''
}

function numberFrom(value: unknown) {
  const match = text(value).replace(/,/g, '').match(/-?\d+(?:\.\d+)?/)
  return match ? Number(match[0]) : 0
}

function parseDuration(value: unknown) {
  const duration = text(value)
  const iso = duration.match(/^P(?:([\d.]+)D)?(?:T(?:([\d.]+)H)?(?:([\d.]+)M)?)?$/i)
  if (iso) {
    return Math.round(
      Number(iso[1] ?? 0) * 1440 +
        Number(iso[2] ?? 0) * 60 +
        Number(iso[3] ?? 0),
    )
  }

  const hours = duration.match(/([\d.]+)\s*(?:hours?|hrs?)/i)
  const minutes = duration.match(/([\d.]+)\s*(?:minutes?|mins?)/i)
  return Math.round(Number(hours?.[1] ?? 0) * 60 + Number(minutes?.[1] ?? 0))
}

function parseQuantity(raw: string) {
  const normalized = raw
    .replace(/(\d)\s+([¼½¾⅓⅔⅛⅜⅝⅞])/g, (_, whole, fraction) =>
      String(Number(whole) + fractions[fraction]),
    )
    .replace(/[¼½¾⅓⅔⅛⅜⅝⅞]/g, (fraction) => String(fractions[fraction]))
    .replace(/(\d+)\s*\/\s*(\d+)/g, (_, top, bottom) =>
      String(Number(top) / Number(bottom)),
    )
  const match = normalized.match(/^\s*(\d+(?:\.\d+)?)(?:\s*[-–]\s*(\d+(?:\.\d+)?))?\s*/)
  if (!match) return { quantity: 1, remainder: normalized.trim() }
  const first = Number(match[1])
  const second = match[2] ? Number(match[2]) : first
  return {
    quantity: (first + second) / 2,
    remainder: normalized.slice(match[0].length).trim(),
  }
}

function categoryFor(name: string): IngredientCategory {
  const value = name.toLowerCase()
  if (/butter|milk|cream|cheese|yogurt|egg/.test(value)) return 'Dairy'
  if (/chicken|beef|pork|lamb|turkey|fish|salmon|prawn|shrimp|bacon/.test(value)) return 'Meat'
  if (/salt|pepper|paprika|cumin|cinnamon|spice|chili|chilli/.test(value)) return 'Spices'
  if (/garlic|onion|parsley|basil|herb|lemon|lime|tomato|potato|carrot|spinach|broccoli|vegetable|fruit/.test(value)) return 'Produce'
  return 'Pantry'
}

function parseIngredient(rawValue: unknown): Ingredient | null {
  const raw = text(rawValue).replace(/^[▢□☐]\s*/, '')
  if (!raw) return null
  const { quantity, remainder } = parseQuantity(raw)
  const unitNames = [...Object.keys(volumeUnits), ...Object.keys(massUnits)].sort(
    (left, right) => right.length - left.length,
  )
  const unitPattern = new RegExp(`^(${unitNames.map((unit) => unit.replace(/ /g, '\\s+')).join('|')})\\b\\.?\\s*`, 'i')
  const unitMatch = remainder.match(unitPattern)
  const sourceUnit = unitMatch?.[1].toLowerCase().replace(/\s+/g, ' ')
  const name = (unitMatch ? remainder.slice(unitMatch[0].length) : remainder).trim() || raw

  if (sourceUnit && sourceUnit in massUnits) {
    const grams = quantity * massUnits[sourceUnit]
    return {
      name,
      quantity: Number((grams >= 1000 ? grams / 1000 : grams).toFixed(2)),
      unit: grams >= 1000 ? 'kg' : 'g',
      category: categoryFor(name),
    }
  }

  if (sourceUnit && sourceUnit in volumeUnits) {
    const milliliters = quantity * volumeUnits[sourceUnit]
    return {
      name,
      quantity: Number((milliliters >= 1000 ? milliliters / 1000 : milliliters).toFixed(2)),
      unit: milliliters >= 1000 ? 'l' : 'ml',
      category: categoryFor(name),
    }
  }

  return {
    name: `${name} (check imported quantity: ${raw})`,
    quantity: Math.max(0.01, Number(quantity.toFixed(2))),
    unit: 'g',
    category: categoryFor(name),
  }
}

function instructionTexts(value: unknown): string[] {
  if (typeof value === 'string') return text(value) ? [text(value)] : []
  if (Array.isArray(value)) return value.flatMap(instructionTexts)
  if (!isRecord(value)) return []
  if (value.itemListElement) return instructionTexts(value.itemListElement)
  const body = text(value.text ?? value.name)
  return body ? [body] : []
}

function findRecipe(value: unknown): JsonRecord | null {
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findRecipe(item)
      if (found) return found
    }
    return null
  }
  if (!isRecord(value)) return null
  const types = Array.isArray(value['@type']) ? value['@type'] : [value['@type']]
  if (types.some((type) => type === 'Recipe')) return value
  return findRecipe(value['@graph'])
}

function imageUrl(value: unknown) {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return imageUrl(value[0])
  if (isRecord(value)) return text(value.url ?? value.contentUrl)
  return ''
}

function nutritionValue(nutrition: JsonRecord, key: string) {
  return Math.max(0, numberFrom(nutrition[key]))
}

export function parseRecipeHtml(html: string): RecipeDraft {
  const scripts = html.matchAll(
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )
  let recipe: JsonRecord | null = null

  for (const script of scripts) {
    try {
      recipe = findRecipe(JSON.parse(script[1]))
      if (recipe) break
    } catch {
      continue
    }
  }

  if (!recipe) throw new Error('No structured recipe was found on this page.')

  const ingredients = Array.isArray(recipe.recipeIngredient)
    ? recipe.recipeIngredient.map(parseIngredient).filter((item): item is Ingredient => Boolean(item))
    : []
  const instructions = instructionTexts(recipe.recipeInstructions)
  if (!ingredients.length || !instructions.length) {
    throw new Error('The recipe page is missing ingredients or instructions.')
  }

  const nutrition = isRecord(recipe.nutrition) ? recipe.nutrition : {}
  const title = text(recipe.name)
  const description = text(recipe.description)

  return {
    title: title || 'Imported recipe',
    description: description.length >= 10 ? description.slice(0, 1000) : `Imported recipe: ${title}`,
    imageUrl: imageUrl(recipe.image),
    prepMinutes: parseDuration(recipe.prepTime),
    cookMinutes: parseDuration(recipe.cookTime),
    baseServings: Math.max(1, Math.round(numberFrom(recipe.recipeYield) || 4)),
    nutrition: {
      calories: Math.round(nutritionValue(nutrition, 'calories')),
      protein: nutritionValue(nutrition, 'proteinContent'),
      carbs: nutritionValue(nutrition, 'carbohydrateContent'),
      fats: nutritionValue(nutrition, 'fatContent'),
      fiber: nutritionValue(nutrition, 'fiberContent'),
    },
    ingredients,
    instructions,
  }
}
