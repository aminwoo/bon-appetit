import { z } from 'zod'
import {
  calculateBasketTotals,
  cheapestOffers,
  type BasketEstimate,
  type CatalogueProduct,
  type IngredientPriceEstimate,
} from '@/lib/grocery-pricing'

const itemSchema = z.object({
  key: z.string().min(1).max(240),
  name: z.string().trim().min(1).max(200),
  quantity: z.number().positive().max(100_000),
  unit: z.enum(['g', 'kg', 'ml', 'l']),
})

const inputSchema = z.object({
  items: z.array(itemSchema).min(1).max(30),
})

const API_BASE = 'https://api.whichgrocer.com/v2'

async function searchProducts(name: string, apiKey: string) {
  const url = new URL(`${API_BASE}/products/search`)
  url.searchParams.set('q', name)
  url.searchParams.set('page_size', '25')

  let response = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: 'no-store',
  })

  if (response.status === 429) {
    const retrySeconds = Math.min(
      10,
      Math.max(1, Number(response.headers.get('retry-after')) || 5),
    )
    await new Promise((resolve) => setTimeout(resolve, retrySeconds * 1000))
    response = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: 'no-store',
    })
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    const message = body?.error?.message
    if (response.status === 401)
      throw new Error('The WhichGrocer API key is invalid.')
    if (response.status === 429)
      throw new Error('WhichGrocer rate limit reached. Try again shortly.')
    throw new Error(
      message || 'The grocery price service could not complete the estimate.',
    )
  }

  const data = await response.json()
  return Array.isArray(data.data) ? (data.data as CatalogueProduct[]) : []
}

export async function POST(request: Request) {
  const requestOrigin = request.headers.get('origin')
  if (requestOrigin && requestOrigin !== new URL(request.url).origin) {
    return Response.json({ error: 'Invalid request origin.' }, { status: 403 })
  }

  const apiKey = process.env.WHICHGROCER_API_KEY
  if (!apiKey) {
    return Response.json(
      {
        error: 'Live Coles and Woolworths pricing is not configured yet.',
        setupRequired: true,
      },
      { status: 503 },
    )
  }

  let input: z.infer<typeof inputSchema>
  try {
    input = inputSchema.parse(await request.json())
  } catch {
    return Response.json({ error: 'Invalid grocery list.' }, { status: 400 })
  }

  try {
    const items: IngredientPriceEstimate[] = []
    const delayMs = Math.max(
      0,
      Math.min(
        6_000,
        Number(process.env.WHICHGROCER_REQUEST_DELAY_MS) || 600,
      ),
    )

    for (const [index, item] of input.items.entries()) {
      if (index > 0 && delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      }
      const products = await searchProducts(item.name, apiKey)
      items.push({ ...item, offers: cheapestOffers(item, products) })
    }

    const summary = calculateBasketTotals(items)
    const estimate: BasketEstimate = {
      items,
      ...summary,
      estimatedAt: new Date().toISOString(),
      attribution: 'Product data by WhichGrocer.',
    }

    return Response.json(estimate)
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Could not estimate this grocery basket.',
      },
      { status: 502 },
    )
  }
}
