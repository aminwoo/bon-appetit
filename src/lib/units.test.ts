import { describe, expect, it } from 'vitest'
import { aggregateIngredients, scaleIngredient, scaleNutrition } from './units'

describe('metric recipe helpers', () => {
  it('scales an ingredient from the recipe base servings', () => {
    expect(
      scaleIngredient(
        { name: 'Chicken breast', quantity: 700, unit: 'g', category: 'Meat' },
        2,
        4,
      ).quantity,
    ).toBe(350)
  })

  it('calculates total nutrition for the selected servings', () => {
    expect(
      scaleNutrition(
        { calories: 520, protein: 48, carbs: 42, fats: 18, fiber: 8 },
        3,
      ),
    ).toEqual({ calories: 1560, protein: 144, carbs: 126, fats: 54, fiber: 24 })
  })

  it('merges compatible metric units and selects a readable display unit', () => {
    const result = aggregateIngredients([
      { name: 'Chicken breast', quantity: 200, unit: 'g', category: 'Meat' },
      { name: 'chicken breast', quantity: 0.35, unit: 'kg', category: 'Meat' },
      {
        name: 'Vegetable stock',
        quantity: 750,
        unit: 'ml',
        category: 'Pantry',
      },
      { name: 'vegetable stock', quantity: 0.5, unit: 'l', category: 'Pantry' },
    ])

    expect(result).toEqual([
      expect.objectContaining({
        name: 'Chicken breast',
        quantity: 550,
        unit: 'g',
      }),
      expect.objectContaining({
        name: 'Vegetable stock',
        quantity: 1.25,
        unit: 'l',
      }),
    ])
  })

  it('rejects non-positive serving counts', () => {
    expect(() =>
      scaleIngredient(
        { name: 'Carrot', quantity: 100, unit: 'g', category: 'Produce' },
        0,
        4,
      ),
    ).toThrow('Serving counts must be greater than zero')
  })
})
