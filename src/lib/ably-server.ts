import { Rest } from 'ably'
import { getMonday, toDateKey } from '@/lib/dates'

let ably: Rest | null = null

function getAbly() {
  if (!process.env.ABLY_API_KEY) return null
  ably ??= new Rest({ key: process.env.ABLY_API_KEY })
  return ably
}

export async function createAblyTokenRequest() {
  const client = getAbly()
  if (!client) throw new Error('ABLY_API_KEY is not configured')
  return client.auth.createTokenRequest({ clientId: 'mise-web' })
}

export async function publishPlanChange(date: string, event: string) {
  const client = getAbly()
  if (!client) return

  const weekStart = toDateKey(getMonday(new Date(`${date}T00:00:00.000Z`)))
  try {
    await client.channels
      .get(`meal-plan:${weekStart}`)
      .publish('plan-changed', {
        event,
        date,
      })
  } catch (error) {
    console.error('Ably plan event failed', error)
  }
}
