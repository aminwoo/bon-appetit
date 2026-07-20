import { describe, expect, it } from 'vitest'
import { parseRecipeHtml } from './recipe-import'

const recipeHtml = `
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@graph": [{
        "@type": "Recipe",
        "name": "Garlic Butter Sauce Recipe",
        "description": "A quick garlic butter sauce for pasta and vegetables.",
        "image": ["https://example.com/garlic-butter.jpg"],
        "prepTime": "PT3M",
        "cookTime": "PT2M",
        "recipeYield": "4 servings",
        "recipeIngredient": [
          "4 oz unsalted butter",
          "4 garlic cloves",
          "1 tablespoon finely chopped parsley",
          "½ teaspoon salt"
        ],
        "recipeInstructions": [
          { "@type": "HowToStep", "text": "Crush the garlic." },
          { "@type": "HowToStep", "text": "Melt the butter and combine." }
        ],
        "nutrition": {
          "calories": "208 kcal",
          "proteinContent": "1 g",
          "carbohydrateContent": "1 g",
          "fatContent": "23 g",
          "fiberContent": "1 g"
        }
      }]
    }
  </script>
`

describe('parseRecipeHtml', () => {
  it('imports schema.org recipe data and converts common units to metric', () => {
    const recipe = parseRecipeHtml(recipeHtml)

    expect(recipe.title).toBe('Garlic Butter Sauce Recipe')
    expect(recipe.baseServings).toBe(4)
    expect(recipe.prepMinutes).toBe(3)
    expect(recipe.cookMinutes).toBe(2)
    expect(recipe.imageUrl).toBe('https://example.com/garlic-butter.jpg')
    expect(recipe.ingredients[0]).toMatchObject({
      name: 'unsalted butter',
      quantity: 113.4,
      unit: 'g',
      category: 'Dairy',
    })
    expect(recipe.ingredients[2]).toMatchObject({ quantity: 15, unit: 'ml' })
    expect(recipe.ingredients[3]).toMatchObject({ quantity: 2.5, unit: 'ml' })
    expect(recipe.instructions).toEqual([
      'Crush the garlic.',
      'Melt the butter and combine.',
    ])
    expect(recipe.nutrition).toEqual({
      calories: 208,
      protein: 1,
      carbs: 1,
      fats: 23,
      fiber: 1,
    })
  })

  it('rejects pages without structured recipe data', () => {
    expect(() => parseRecipeHtml('<html><body>No recipe</body></html>')).toThrow(
      'No structured recipe was found',
    )
  })
})
