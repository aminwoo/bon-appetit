import { getMonday, getWeekDates, toDateKey } from './dates'
import type { PlannedMeal, Recipe } from './types'

export const demoRecipes: Recipe[] = [
  {
    id: 'lemon-herb-chicken',
    title: 'Lemon herb chicken',
    description:
      'Roasted chicken with crushed potatoes, green beans, and a bright herb dressing.',
    prepMinutes: 20,
    cookMinutes: 35,
    baseServings: 4,
    nutrition: { calories: 520, protein: 48, carbs: 42, fats: 18, fiber: 8 },
    ingredients: [
      { name: 'Chicken breast', quantity: 700, unit: 'g', category: 'Meat' },
      { name: 'Baby potatoes', quantity: 800, unit: 'g', category: 'Produce' },
      { name: 'Green beans', quantity: 400, unit: 'g', category: 'Produce' },
      { name: 'Lemon', quantity: 180, unit: 'g', category: 'Produce' },
      { name: 'Olive oil', quantity: 60, unit: 'ml', category: 'Pantry' },
      { name: 'Dried oregano', quantity: 8, unit: 'g', category: 'Spices' },
    ],
    instructions: [
      'Heat the oven to 210°C. Halve the potatoes and toss with half the olive oil and oregano.',
      'Roast the potatoes for 15 minutes, then add the seasoned chicken and cook for 18–20 minutes.',
      'Steam the green beans until tender-crisp. Whisk lemon juice with the remaining oil.',
      'Rest the chicken for 5 minutes, slice, and finish everything with the lemon dressing.',
    ],
  },
  {
    id: 'miso-salmon-bowl',
    title: 'Miso salmon bowl',
    description:
      'Glazed salmon, sesame rice, crisp cucumber, and quick-pickled carrot.',
    prepMinutes: 15,
    cookMinutes: 20,
    baseServings: 4,
    nutrition: { calories: 610, protein: 39, carbs: 68, fats: 21, fiber: 7 },
    ingredients: [
      { name: 'Salmon fillet', quantity: 600, unit: 'g', category: 'Meat' },
      { name: 'Brown rice', quantity: 320, unit: 'g', category: 'Pantry' },
      { name: 'Cucumber', quantity: 300, unit: 'g', category: 'Produce' },
      { name: 'Carrot', quantity: 240, unit: 'g', category: 'Produce' },
      { name: 'White miso', quantity: 60, unit: 'g', category: 'Pantry' },
    ],
    instructions: [
      'Cook the rice.',
      'Glaze and roast the salmon at 200°C.',
      'Slice the vegetables and assemble the bowls.',
    ],
  },
  {
    id: 'green-shakshuka',
    title: 'Green shakshuka',
    description: 'Baked eggs with spinach, leeks, herbs, and creamy yoghurt.',
    prepMinutes: 12,
    cookMinutes: 22,
    baseServings: 4,
    nutrition: { calories: 390, protein: 24, carbs: 28, fats: 21, fiber: 9 },
    ingredients: [
      { name: 'Egg', quantity: 480, unit: 'g', category: 'Dairy' },
      { name: 'Spinach', quantity: 500, unit: 'g', category: 'Produce' },
      { name: 'Leek', quantity: 300, unit: 'g', category: 'Produce' },
      { name: 'Greek yoghurt', quantity: 240, unit: 'g', category: 'Dairy' },
      { name: 'Ground cumin', quantity: 6, unit: 'g', category: 'Spices' },
    ],
    instructions: [
      'Soften the leeks with cumin.',
      'Wilt in the spinach and make four wells.',
      'Add the eggs and bake at 190°C until just set.',
    ],
  },
  {
    id: 'tomato-lentil-soup',
    title: 'Tomato lentil soup',
    description: 'A warming red lentil soup with tomato, cumin, and lemon.',
    prepMinutes: 10,
    cookMinutes: 30,
    baseServings: 4,
    nutrition: { calories: 340, protein: 19, carbs: 52, fats: 7, fiber: 16 },
    ingredients: [
      { name: 'Red lentils', quantity: 320, unit: 'g', category: 'Pantry' },
      {
        name: 'Chopped tomatoes',
        quantity: 800,
        unit: 'g',
        category: 'Pantry',
      },
      { name: 'Carrot', quantity: 240, unit: 'g', category: 'Produce' },
      { name: 'Vegetable stock', quantity: 1.2, unit: 'l', category: 'Pantry' },
      { name: 'Ground cumin', quantity: 8, unit: 'g', category: 'Spices' },
    ],
    instructions: [
      'Soften the carrot with cumin.',
      'Add lentils, tomato, and stock.',
      'Simmer for 25 minutes and blend half for texture.',
    ],
  },
  {
    id: 'berry-oat-pot',
    title: 'Berry oat pot',
    description:
      'Overnight oats layered with berries, yoghurt, and toasted seeds.',
    prepMinutes: 8,
    cookMinutes: 0,
    baseServings: 4,
    nutrition: { calories: 370, protein: 18, carbs: 54, fats: 10, fiber: 11 },
    ingredients: [
      { name: 'Rolled oats', quantity: 240, unit: 'g', category: 'Pantry' },
      { name: 'Greek yoghurt', quantity: 400, unit: 'g', category: 'Dairy' },
      { name: 'Mixed berries', quantity: 360, unit: 'g', category: 'Produce' },
      { name: 'Milk', quantity: 400, unit: 'ml', category: 'Dairy' },
      { name: 'Pumpkin seeds', quantity: 60, unit: 'g', category: 'Pantry' },
    ],
    instructions: [
      'Mix oats, milk, and yoghurt.',
      'Chill overnight.',
      'Layer with berries and seeds before serving.',
    ],
  },
]

export const recipeImages: Record<string, string> = {
  'lemon-herb-chicken':
    'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=1400&q=85',
  'miso-salmon-bowl':
    'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1400&q=85',
  'green-shakshuka':
    'https://images.unsplash.com/photo-1590412200988-a436970781fa?auto=format&fit=crop&w=1400&q=85',
  'tomato-lentil-soup':
    'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1400&q=85',
  'berry-oat-pot':
    'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=1400&q=85',
}

export function getDemoPlan(): PlannedMeal[] {
  const dates = getWeekDates(getMonday())
  const entries = [
    [0, 'Breakfast', 2, 4],
    [0, 'Dinner', 0, 2],
    [1, 'Lunch', 3, 2],
    [1, 'Dinner', 1, 2],
    [2, 'Breakfast', 4, 3],
    [2, 'Dinner', 2, 2],
    [3, 'Lunch', 0, 1],
    [4, 'Dinner', 1, 4],
    [5, 'Lunch', 3, 4],
    [6, 'Breakfast', 2, 2],
  ] as const

  return entries.map(([day, slot, recipe, servings], index) => ({
    id: `demo-meal-${index + 1}`,
    date: toDateKey(dates[day]),
    slot,
    servings,
    recipe: demoRecipes[recipe],
  }))
}
