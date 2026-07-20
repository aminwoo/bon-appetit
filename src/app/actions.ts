'use server'

import { and, asc, eq, gte, inArray, lte } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getDb } from '@/db'
import {
  groceryItemChecks,
  plannedMeals,
  recipeIngredients,
  recipeInstructions,
  recipes,
} from '@/db/schema'
import { addDays } from '@/lib/dates'
import { aggregateIngredients, scaleIngredient } from '@/lib/units'
import {
  ingredientCategories,
  mealSlots,
  metricUnits,
  type Recipe,
} from '@/lib/types'

const ingredientSchema = z.object({
  name: z.string().trim().min(1).max(120),
  quantity: z.number().positive(),
  unit: z.enum(metricUnits),
  category: z.enum(ingredientCategories),
})

const recipeSchema = z.object({
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().min(10).max(1000),
  imageUrl: z
    .union([z.string().url().max(2048), z.literal('')])
    .optional()
    .default(''),
  prepMinutes: z.number().int().min(0).max(1440),
  cookMinutes: z.number().int().min(0).max(1440),
  baseServings: z.number().int().min(1).max(100),
  nutrition: z.object({
    calories: z.number().int().min(0),
    protein: z.number().min(0),
    carbs: z.number().min(0),
    fats: z.number().min(0),
    fiber: z.number().min(0),
  }),
  ingredients: z.array(ingredientSchema).min(1),
  instructions: z.array(z.string().trim().min(1).max(2000)).min(1),
})

type RecipeRow = typeof recipes.$inferSelect & {
  ingredients: (typeof recipeIngredients.$inferSelect)[]
  instructions: (typeof recipeInstructions.$inferSelect)[]
}

function mapRecipe(row: RecipeRow): Recipe {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    imageUrl: row.imageUrl ?? undefined,
    prepMinutes: row.prepMinutes,
    cookMinutes: row.cookMinutes,
    baseServings: row.baseServings,
    nutrition: {
      calories: row.caloriesPerServing,
      protein: Number(row.proteinPerServing),
      carbs: Number(row.carbsPerServing),
      fats: Number(row.fatsPerServing),
      fiber: Number(row.fiberPerServing),
    },
    ingredients: row.ingredients.map((ingredient) => ({
      id: ingredient.id,
      name: ingredient.name,
      quantity: Number(ingredient.quantity),
      unit: ingredient.unit,
      category: ingredient.category,
    })),
    instructions: row.instructions.map((instruction) => instruction.body),
  }
}

export async function getRecipes() {
  const db = getDb()
  const rows = await db.query.recipes.findMany({
    orderBy: [asc(recipes.title)],
    with: {
      ingredients: { orderBy: [asc(recipeIngredients.position)] },
      instructions: { orderBy: [asc(recipeInstructions.position)] },
    },
  })
  return rows.map(mapRecipe)
}

export async function getRecipe(recipeId: string) {
  const id = z.string().uuid().parse(recipeId)
  const db = getDb()
  const row = await db.query.recipes.findFirst({
    where: eq(recipes.id, id),
    with: {
      ingredients: { orderBy: [asc(recipeIngredients.position)] },
      instructions: { orderBy: [asc(recipeInstructions.position)] },
    },
  })
  return row ? mapRecipe(row) : null
}

export async function createRecipe(rawInput: unknown) {
  const input = recipeSchema.parse(rawInput)
  const db = getDb()
  const recipeId = crypto.randomUUID()

  await db.batch([
    db.insert(recipes).values({
      id: recipeId,
      title: input.title,
      description: input.description,
      imageUrl: input.imageUrl || null,
      prepMinutes: input.prepMinutes,
      cookMinutes: input.cookMinutes,
      baseServings: input.baseServings,
      caloriesPerServing: input.nutrition.calories,
      proteinPerServing: String(input.nutrition.protein),
      carbsPerServing: String(input.nutrition.carbs),
      fatsPerServing: String(input.nutrition.fats),
      fiberPerServing: String(input.nutrition.fiber),
    }),
    db.insert(recipeIngredients).values(
      input.ingredients.map((ingredient, position) => ({
        recipeId,
        ...ingredient,
        normalizedName: ingredient.name.toLocaleLowerCase(),
        quantity: String(ingredient.quantity),
        position,
      })),
    ),
    db
      .insert(recipeInstructions)
      .values(
        input.instructions.map((body, position) => ({
          recipeId,
          body,
          position,
        })),
      ),
  ])

  revalidatePath('/')
  revalidatePath('/recipes')
  return { id: recipeId }
}

export async function updateRecipe(rawRecipeId: unknown, rawInput: unknown) {
  const recipeId = z.string().uuid().parse(rawRecipeId)
  const input = recipeSchema.parse(rawInput)
  const db = getDb()

  await db.batch([
    db
      .update(recipes)
      .set({
        title: input.title,
        description: input.description,
        imageUrl: input.imageUrl || null,
        prepMinutes: input.prepMinutes,
        cookMinutes: input.cookMinutes,
        baseServings: input.baseServings,
        caloriesPerServing: input.nutrition.calories,
        proteinPerServing: String(input.nutrition.protein),
        carbsPerServing: String(input.nutrition.carbs),
        fatsPerServing: String(input.nutrition.fats),
        fiberPerServing: String(input.nutrition.fiber),
        updatedAt: new Date(),
      })
      .where(eq(recipes.id, recipeId)),
    db
      .delete(recipeIngredients)
      .where(eq(recipeIngredients.recipeId, recipeId)),
    db
      .delete(recipeInstructions)
      .where(eq(recipeInstructions.recipeId, recipeId)),
    db.insert(recipeIngredients).values(
      input.ingredients.map((ingredient, position) => ({
        recipeId,
        ...ingredient,
        normalizedName: ingredient.name.toLocaleLowerCase(),
        quantity: String(ingredient.quantity),
        position,
      })),
    ),
    db
      .insert(recipeInstructions)
      .values(
        input.instructions.map((body, position) => ({
          recipeId,
          body,
          position,
        })),
      ),
  ])

  revalidatePath('/')
  revalidatePath('/recipes')
  revalidatePath(`/recipes/${recipeId}`)
  return { id: recipeId }
}

export async function deleteRecipe(rawRecipeId: unknown) {
  const recipeId = z.string().uuid().parse(rawRecipeId)
  await getDb().delete(recipes).where(eq(recipes.id, recipeId))
  revalidatePath('/')
  revalidatePath('/recipes')
  revalidatePath('/grocery')
}

const mealSchema = z.object({
  date: z.iso.date(),
  slot: z.enum(mealSlots),
  recipeId: z.string().uuid(),
  servings: z.number().int().min(1).max(100),
})

export async function assignMeal(rawInput: unknown) {
  const input = mealSchema.parse(rawInput)
  const db = getDb()
  await db
    .insert(plannedMeals)
    .values(input)
    .onConflictDoUpdate({
      target: [plannedMeals.date, plannedMeals.slot],
      set: { recipeId: input.recipeId, servings: input.servings },
    })
  revalidatePath('/')
}

export async function removeMeal(rawMealId: unknown) {
  const mealId = z.string().uuid().parse(rawMealId)
  await getDb().delete(plannedMeals).where(eq(plannedMeals.id, mealId))
  revalidatePath('/')
}

export async function getWeeklyPlan(rawWeekStart: string) {
  const weekStart = z.iso.date().parse(rawWeekStart)
  const rows = await getDb().query.plannedMeals.findMany({
    where: and(
      gte(plannedMeals.date, weekStart),
      lte(plannedMeals.date, addDays(weekStart, 6)),
    ),
    orderBy: [asc(plannedMeals.date)],
    with: {
      recipe: {
        with: {
          ingredients: { orderBy: [asc(recipeIngredients.position)] },
          instructions: { orderBy: [asc(recipeInstructions.position)] },
        },
      },
    },
  })
  return rows.map((meal) => ({
    id: meal.id,
    date: meal.date,
    slot: meal.slot,
    servings: meal.servings,
    recipe: mapRecipe(meal.recipe),
  }))
}

export async function buildGroceryList(rawInput: unknown) {
  const input = z
    .object({
      weekStart: z.iso.date(),
      mealIds: z.array(z.string().uuid()).optional(),
    })
    .parse(rawInput)
  const filters = [
    gte(plannedMeals.date, input.weekStart),
    lte(plannedMeals.date, addDays(input.weekStart, 6)),
  ]
  if (input.mealIds?.length)
    filters.push(inArray(plannedMeals.id, input.mealIds))

  const db = getDb()
  const [meals, checks] = await Promise.all([
    db.query.plannedMeals.findMany({
      where: and(...filters),
      with: { recipe: { with: { ingredients: true } } },
    }),
    db.query.groceryItemChecks.findMany({
      where: eq(groceryItemChecks.weekStart, input.weekStart),
    }),
  ])
  const checkedKeys = new Set(
    checks.filter((item) => item.checked).map((item) => item.itemKey),
  )
  const scaled = meals.flatMap((meal) =>
    meal.recipe.ingredients.map((ingredient) => ({
      ...scaleIngredient(
        {
          name: ingredient.name,
          quantity: Number(ingredient.quantity),
          unit: ingredient.unit,
          category: ingredient.category,
        },
        meal.servings,
        meal.recipe.baseServings,
      ),
      checked: checkedKeys.has(
        `${ingredient.normalizedName}:${ingredient.unit === 'kg' ? 'g' : ingredient.unit === 'l' ? 'ml' : ingredient.unit}`,
      ),
    })),
  )
  return aggregateIngredients(scaled)
}

export async function toggleGroceryItem(rawInput: unknown) {
  const input = z
    .object({
      weekStart: z.iso.date(),
      itemKey: z.string().min(3).max(200),
      checked: z.boolean(),
    })
    .parse(rawInput)
  const db = getDb()
  await db
    .insert(groceryItemChecks)
    .values(input)
    .onConflictDoUpdate({
      target: [groceryItemChecks.weekStart, groceryItemChecks.itemKey],
      set: { checked: input.checked, updatedAt: new Date() },
    })
  revalidatePath('/grocery')
}
