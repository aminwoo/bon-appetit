import { getRecipes } from '@/app/actions'
import { RecipeLibrary } from '@/components/recipe-library'
import { hasDatabase } from '@/db'
import { demoRecipes } from '@/lib/demo-data'

export default async function RecipesPage() {
  const databaseReady = hasDatabase()
  const allRecipes = databaseReady ? await getRecipes() : demoRecipes

  return <RecipeLibrary recipes={allRecipes} databaseReady={databaseReady} />
}
