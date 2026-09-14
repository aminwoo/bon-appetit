import { getMealPhotos, getRecipes, getWeeklyPlan } from '@/app/actions'
import { WeeklyPlanner } from '@/components/weekly-planner'
import { hasDatabase } from '@/db'
import { getMonday, toDateKey } from '@/lib/dates'
import { demoRecipes, getDemoPlan } from '@/lib/demo-data'

export default async function Home() {
  const weekStart = toDateKey(getMonday())
  const databaseReady = hasDatabase()
  const [recipes, meals, photos] = databaseReady
    ? await Promise.all([
        getRecipes(),
        getWeeklyPlan(weekStart),
        getMealPhotos(weekStart),
      ])
    : [demoRecipes, getDemoPlan(), []]

  return (
    <WeeklyPlanner
      initialWeekStart={weekStart}
      initialMeals={meals}
      initialPhotos={photos}
      recipes={recipes}
      databaseReady={databaseReady}
    />
  )
}
