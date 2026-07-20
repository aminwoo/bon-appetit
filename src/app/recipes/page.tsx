import { getRecipes } from '@/app/actions'
import { RecipeLibrary } from '@/components/recipe-library'
import { hasDatabase } from '@/db'
import { demoRecipes } from '@/lib/demo-data'

export default async function RecipesPage() {
  const customRecipes = hasDatabase() ? await getRecipes() : []
  const allRecipes = [...customRecipes, ...demoRecipes]

  return <RecipeLibrary recipes={allRecipes} databaseReady={hasDatabase()} />
}
