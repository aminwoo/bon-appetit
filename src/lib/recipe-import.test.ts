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

const xiaohongshuHtml = `
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "超简单❗️巨下饭的辣椒擂皮蛋❗️❗️ - 小红书",
      "description": "简单又下饭。✅食材：青椒，皮蛋，蒜； ✅步骤：上述图片文字描述 ✅小tips：喜欢吃辣。",
      "image": ["http://images.example.com/chili-eggs.jpg"]
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
    expect(() =>
      parseRecipeHtml('<html><body>No recipe</body></html>'),
    ).toThrow('No structured recipe was found')
  })

  it('imports recipe details from Xiaohongshu Article metadata', () => {
    const recipe = parseRecipeHtml(xiaohongshuHtml)

    expect(recipe.title).toBe('超简单❗️巨下饭的辣椒擂皮蛋❗️❗️')
    expect(recipe.imageUrl).toBe('https://images.example.com/chili-eggs.jpg')
    expect(recipe.ingredients.map((item) => item.name)).toEqual([
      '青椒 (check imported quantity: 青椒)',
      '皮蛋 (check imported quantity: 皮蛋)',
      '蒜 (check imported quantity: 蒜)',
    ])
    expect(recipe.instructions).toEqual([
      'Review the preparation steps in the imported source images.',
    ])
  })
})
