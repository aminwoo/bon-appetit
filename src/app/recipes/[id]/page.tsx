import { notFound } from 'next/navigation'
import { getRecipe } from '@/app/actions'
import { RecipeDetail } from '@/components/recipe-detail'
import { hasDatabase } from '@/db'
import { demoRecipes, recipeImages } from '@/lib/demo-data'

export function generateStaticParams() {
  return demoRecipes.map((recipe) => ({ id: recipe.id }))
}

export default async function RecipePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const demoRecipe = demoRecipes.find((item) => item.id === id)
  const isCustom = !demoRecipe && /^[0-9a-f-]{36}$/i.test(id)
  const recipe =
    demoRecipe ?? (isCustom && hasDatabase() ? await getRecipe(id) : null)

  if (!recipe) notFound()

  return (
    <RecipeDetail
      recipe={recipe}
      image={recipeImages[recipe.id] ?? recipeImages['lemon-herb-chicken']}
      isCustom={isCustom}
    />
  )
}
