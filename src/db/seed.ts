import { asc, eq } from 'drizzle-orm'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'
import {
  plannedMeals,
  recipeIngredients,
  recipeInstructions,
  recipes,
} from './schema'
import { demoRecipes, getDemoPlan } from '@/lib/demo-data'

async function seed() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required to seed Neon.')
  }
  const db = drizzle(neon(process.env.DATABASE_URL), { schema })

  for (const recipe of demoRecipes) {
    const existing = await db.query.recipes.findFirst({
      where: eq(recipes.title, recipe.title),
      columns: { id: true },
    })
    if (existing) continue

    const recipeId = crypto.randomUUID()
    await db.insert(recipes).values({
      id: recipeId,
      title: recipe.title,
      description: recipe.description,
      prepMinutes: recipe.prepMinutes,
      cookMinutes: recipe.cookMinutes,
      baseServings: recipe.baseServings,
      caloriesPerServing: recipe.nutrition.calories,
      proteinPerServing: String(recipe.nutrition.protein),
      carbsPerServing: String(recipe.nutrition.carbs),
      fatsPerServing: String(recipe.nutrition.fats),
      fiberPerServing: String(recipe.nutrition.fiber),
    })
    await db.insert(recipeIngredients).values(
      recipe.ingredients.map((ingredient, position) => ({
        recipeId,
        ...ingredient,
        normalizedName: ingredient.name.toLocaleLowerCase(),
        quantity: String(ingredient.quantity),
        position,
      })),
    )
    await db
      .insert(recipeInstructions)
      .values(
        recipe.instructions.map((body, position) => ({
          recipeId,
          body,
          position,
        })),
      )
  }

  const seeded = await db.query.recipes.findMany({
    columns: { id: true, title: true },
    orderBy: [asc(recipes.title)],
  })
  const idsByTitle = new Map(seeded.map((recipe) => [recipe.title, recipe.id]))
  const demoPlan = getDemoPlan()
  for (const meal of demoPlan) {
    const recipeId = idsByTitle.get(meal.recipe.title)
    if (!recipeId) continue
    await db
      .insert(plannedMeals)
      .values({
        date: meal.date,
        slot: meal.slot,
        recipeId,
        servings: meal.servings,
      })
      .onConflictDoNothing({ target: [plannedMeals.date, plannedMeals.slot] })
  }
  console.log(
    `Neon library ready: ${seeded.length} recipes and ${demoPlan.length} sample meals`,
  )
}

seed().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
