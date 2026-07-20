import { notFound } from 'next/navigation'
import { getRecipe } from '@/app/actions'
import { RecipeEditor } from '@/components/recipe-editor'
import { hasDatabase } from '@/db'
import { demoRecipes } from '@/lib/demo-data'

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const demoRecipe = demoRecipes.find((recipe) => recipe.id === id)
  const recipe =
    demoRecipe ??
    (hasDatabase() && /^[0-9a-f-]{36}$/i.test(id) ? await getRecipe(id) : null)
  if (!recipe) notFound()
  return <RecipeEditor recipe={recipe} duplicate={Boolean(demoRecipe)} />
}
