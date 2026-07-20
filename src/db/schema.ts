import {
  boolean,
  date,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { ingredientCategories, mealSlots, metricUnits } from '@/lib/types'

export const metricUnitEnum = pgEnum('metric_unit', metricUnits)
export const ingredientCategoryEnum = pgEnum(
  'ingredient_category',
  ingredientCategories,
)
export const mealSlotEnum = pgEnum('meal_slot', mealSlots)

export const recipes = pgTable('recipes', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  prepMinutes: integer('prep_minutes').notNull(),
  cookMinutes: integer('cook_minutes').notNull(),
  baseServings: integer('base_servings').notNull().default(4),
  caloriesPerServing: integer('calories_per_serving').notNull(),
  proteinPerServing: numeric('protein_per_serving', {
    precision: 8,
    scale: 2,
  }).notNull(),
  carbsPerServing: numeric('carbs_per_serving', {
    precision: 8,
    scale: 2,
  }).notNull(),
  fatsPerServing: numeric('fats_per_serving', {
    precision: 8,
    scale: 2,
  }).notNull(),
  fiberPerServing: numeric('fiber_per_serving', {
    precision: 8,
    scale: 2,
  }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
})

export const recipeIngredients = pgTable(
  'recipe_ingredients',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    recipeId: uuid('recipe_id')
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    normalizedName: text('normalized_name').notNull(),
    quantity: numeric('quantity', { precision: 10, scale: 2 }).notNull(),
    unit: metricUnitEnum('unit').notNull(),
    category: ingredientCategoryEnum('category').notNull(),
    position: integer('position').notNull(),
  },
  (table) => [
    uniqueIndex('ingredient_recipe_position_idx').on(
      table.recipeId,
      table.position,
    ),
  ],
)

export const recipeInstructions = pgTable(
  'recipe_instructions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    recipeId: uuid('recipe_id')
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    body: text('body').notNull(),
    position: integer('position').notNull(),
  },
  (table) => [
    uniqueIndex('instruction_recipe_position_idx').on(
      table.recipeId,
      table.position,
    ),
  ],
)

export const plannedMeals = pgTable(
  'planned_meals',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    date: date('date', { mode: 'string' }).notNull(),
    slot: mealSlotEnum('slot').notNull(),
    recipeId: uuid('recipe_id')
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    servings: integer('servings').notNull().default(1),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex('planned_meal_date_slot_idx').on(table.date, table.slot),
  ],
)

export const groceryItemChecks = pgTable(
  'grocery_item_checks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    weekStart: date('week_start', { mode: 'string' }).notNull(),
    itemKey: text('item_key').notNull(),
    checked: boolean('checked').notNull().default(false),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex('grocery_check_week_item_idx').on(
      table.weekStart,
      table.itemKey,
    ),
  ],
)

export const recipeRelations = relations(recipes, ({ many }) => ({
  ingredients: many(recipeIngredients),
  instructions: many(recipeInstructions),
  plannedMeals: many(plannedMeals),
}))

export const ingredientRelations = relations(recipeIngredients, ({ one }) => ({
  recipe: one(recipes, {
    fields: [recipeIngredients.recipeId],
    references: [recipes.id],
  }),
}))

export const instructionRelations = relations(
  recipeInstructions,
  ({ one }) => ({
    recipe: one(recipes, {
      fields: [recipeInstructions.recipeId],
      references: [recipes.id],
    }),
  }),
)

export const plannedMealRelations = relations(plannedMeals, ({ one }) => ({
  recipe: one(recipes, {
    fields: [plannedMeals.recipeId],
    references: [recipes.id],
  }),
}))
