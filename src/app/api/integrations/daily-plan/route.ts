import { timingSafeEqual } from 'node:crypto'
import { getWeeklyPlan } from '@/app/actions'
import { hasDatabase } from '@/db'
import { getMonday, toDateKey } from '@/lib/dates'
import { getDemoPlan } from '@/lib/demo-data'

function isAuthorized(request: Request) {
  const configuredSecret = process.env.MONKEY_PAW_INTEGRATION_SECRET
  const suppliedSecret = request.headers
    .get('authorization')
    ?.replace(/^Bearer\s+/i, '')

  if (!configuredSecret || !suppliedSecret) return false

  const configured = Buffer.from(configuredSecret)
  const supplied = Buffer.from(suppliedSecret)
  return configured.length === supplied.length && timingSafeEqual(configured, supplied)
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const date = new URL(request.url).searchParams.get('date')
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ error: 'A valid date is required.' }, { status: 400 })
  }

  const weekStart = toDateKey(getMonday(new Date(`${date}T12:00:00.000Z`)))
  const meals = hasDatabase() ? await getWeeklyPlan(weekStart) : getDemoPlan()

  return Response.json({
    date,
    meals: meals
      .filter((meal) => meal.date === date)
      .map((meal) => ({
        id: meal.id,
        slot: meal.slot,
        servings: meal.servings,
        recipe: {
          id: meal.recipe.id,
          title: meal.recipe.title,
          imageUrl: meal.recipe.imageUrl ?? null,
          prepMinutes: meal.recipe.prepMinutes,
          cookMinutes: meal.recipe.cookMinutes,
          nutrition: meal.recipe.nutrition,
        },
      })),
  })
}
