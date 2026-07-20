export const metricUnits = ['g', 'kg', 'ml', 'l'] as const
export const ingredientCategories = [
  'Produce',
  'Dairy',
  'Pantry',
  'Meat',
  'Spices',
] as const
export const mealSlots = ['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const

export type MetricUnit = (typeof metricUnits)[number]
export type IngredientCategory = (typeof ingredientCategories)[number]
export type MealSlot = (typeof mealSlots)[number]

export type Nutrition = {
  calories: number
  protein: number
  carbs: number
  fats: number
  fiber: number
}

export type Ingredient = {
  id?: string
  name: string
  quantity: number
  unit: MetricUnit
  category: IngredientCategory
}

export type Recipe = {
  id: string
  title: string
  description: string
  imageUrl?: string
  prepMinutes: number
  cookMinutes: number
  baseServings: number
  nutrition: Nutrition
  ingredients: Ingredient[]
  instructions: string[]
}

export type PlannedMeal = {
  id: string
  date: string
  slot: MealSlot
  servings: number
  recipe: Recipe
}

export type GroceryItem = Ingredient & {
  key: string
  checked: boolean
}
