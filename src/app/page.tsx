import { getRecipes, getWeeklyPlan } from '@/app/actions'
import { WeeklyPlanner } from '@/components/weekly-planner'
import { hasDatabase } from '@/db'
import { getMonday, toDateKey } from '@/lib/dates'
import { demoRecipes, getDemoPlan } from '@/lib/demo-data'

export default async function Home() {
  const weekStart = toDateKey(getMonday())
  const databaseReady = hasDatabase()
  const recipes = databaseReady ? await getRecipes() : demoRecipes
  const meals = databaseReady ? await getWeeklyPlan(weekStart) : getDemoPlan()

  return (
    <WeeklyPlanner
      initialWeekStart={weekStart}
      initialMeals={meals}
      recipes={recipes}
      databaseReady={databaseReady}
    />
  )
}
