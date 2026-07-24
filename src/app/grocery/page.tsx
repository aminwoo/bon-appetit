import { getLatestPlannedWeekStart, getWeeklyPlan } from '@/app/actions'
import { GroceryList } from '@/components/grocery-list'
import { hasDatabase } from '@/db'
import { getMonday, toDateKey } from '@/lib/dates'
import { getDemoPlan } from '@/lib/demo-data'

export default async function GroceryPage() {
  const weekStart = toDateKey(getMonday())
  const databaseReady = hasDatabase()
  let meals = databaseReady ? await getWeeklyPlan(weekStart) : getDemoPlan()

  if (databaseReady && meals.length === 0) {
    const latestWeekStart = await getLatestPlannedWeekStart()
    if (latestWeekStart && latestWeekStart !== weekStart) {
      meals = await getWeeklyPlan(latestWeekStart)
    }
  }

  return <GroceryList meals={meals} />
}
