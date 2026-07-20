CREATE TYPE "public"."ingredient_category" AS ENUM('Produce', 'Dairy', 'Pantry', 'Meat', 'Spices');--> statement-breakpoint
CREATE TYPE "public"."meal_slot" AS ENUM('Breakfast', 'Lunch', 'Dinner', 'Snack');--> statement-breakpoint
CREATE TYPE "public"."metric_unit" AS ENUM('g', 'kg', 'ml', 'l');--> statement-breakpoint
CREATE TABLE "grocery_item_checks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"week_start" date NOT NULL,
	"item_key" text NOT NULL,
	"checked" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "planned_meals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"slot" "meal_slot" NOT NULL,
	"recipe_id" uuid NOT NULL,
	"servings" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recipe_ingredients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipe_id" uuid NOT NULL,
	"name" text NOT NULL,
	"normalized_name" text NOT NULL,
	"quantity" numeric(10, 2) NOT NULL,
	"unit" "metric_unit" NOT NULL,
	"category" "ingredient_category" NOT NULL,
	"position" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recipe_instructions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipe_id" uuid NOT NULL,
	"body" text NOT NULL,
	"position" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recipes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"prep_minutes" integer NOT NULL,
	"cook_minutes" integer NOT NULL,
	"base_servings" integer DEFAULT 4 NOT NULL,
	"calories_per_serving" integer NOT NULL,
	"protein_per_serving" numeric(8, 2) NOT NULL,
	"carbs_per_serving" numeric(8, 2) NOT NULL,
	"fats_per_serving" numeric(8, 2) NOT NULL,
	"fiber_per_serving" numeric(8, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "planned_meals" ADD CONSTRAINT "planned_meals_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_instructions" ADD CONSTRAINT "recipe_instructions_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "grocery_check_week_item_idx" ON "grocery_item_checks" USING btree ("week_start","item_key");--> statement-breakpoint
CREATE UNIQUE INDEX "planned_meal_date_slot_idx" ON "planned_meals" USING btree ("date","slot");--> statement-breakpoint
CREATE UNIQUE INDEX "ingredient_recipe_position_idx" ON "recipe_ingredients" USING btree ("recipe_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "instruction_recipe_position_idx" ON "recipe_instructions" USING btree ("recipe_id","position");