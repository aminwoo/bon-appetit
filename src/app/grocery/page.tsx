import { getWeeklyPlan } from '@/app/actions'
import { GroceryList } from '@/components/grocery-list'
import { hasDatabase } from '@/db'
import { getMonday, toDateKey } from '@/lib/dates'
import { getDemoPlan } from '@/lib/demo-data'

export default async function GroceryPage() {
  const weekStart = toDateKey(getMonday())
  const meals = hasDatabase() ? await getWeeklyPlan(weekStart) : getDemoPlan()

  return <GroceryList meals={meals} />
}
