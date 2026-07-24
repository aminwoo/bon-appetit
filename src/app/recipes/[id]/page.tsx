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
  const customRecipe = !demoRecipe && hasDatabase() ? await getRecipe(id) : null
  const isCustom = Boolean(customRecipe)
  const recipe = demoRecipe ?? customRecipe

  if (!recipe) notFound()

  return (
    <RecipeDetail
      recipe={recipe}
      image={
        recipe.imageUrl ??
        recipeImages[recipe.id] ??
        recipeImages['lemon-herb-chicken']
      }
      isCustom={isCustom}
    />
  )
}
