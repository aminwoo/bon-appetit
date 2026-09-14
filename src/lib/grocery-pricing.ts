import type { GroceryItem, MetricUnit } from '@/lib/types'

export const pricedRetailers = ['coles', 'woolworths'] as const
export type PricedRetailer = (typeof pricedRetailers)[number]
export type Retailer = PricedRetailer | 'costco'

export type CatalogueProduct = {
  id: string
  name: string | null
  store: string | null
  price: number | null
  currency: string
  cup_price: string | null
  uom: string | null
  weight: number | null
  url: string | null
  image_url: string | null
  is_special: boolean
  updated_at: string | null
  last_seen_at?: string | null
}

export type RetailOffer = {
  retailer: Retailer
  productId: string
  productName: string
  productUrl: string | null
  packPrice: number
  packQuantity: number | null
  packUnit: string | null
  packsNeeded: number
  estimatedCost: number
  isSpecial: boolean
  updatedAt: string | null
}

export type IngredientPriceEstimate = {
  key: string
  name: string
  quantity: number
  unit: MetricUnit
  offers: Partial<Record<PricedRetailer, RetailOffer>>
}

export type BasketEstimate = {
  items: IngredientPriceEstimate[]
  totals: Record<PricedRetailer, number>
  coverage: Record<PricedRetailer, number>
  estimatedAt: string
  attribution: string
}

function toBaseQuantity(quantity: number, unit: string) {
  const normalized = unit.toLocaleLowerCase()
  if (normalized === 'kg' || normalized === 'l') return quantity * 1000
  if (normalized === 'g' || normalized === 'ml') return quantity
  return null
}

function compatibleUnits(requestedUnit: MetricUnit, productUnit: string | null) {
  if (!productUnit) return false
  return (
    toBaseQuantity(1, requestedUnit) !== null &&
    toBaseQuantity(1, productUnit) !== null
  )
}

export function offerForProduct(
  item: Pick<GroceryItem, 'quantity' | 'unit'>,
  product: CatalogueProduct,
): RetailOffer | null {
  if (
    !product.store ||
    !pricedRetailers.includes(product.store as PricedRetailer) ||
    !product.name ||
    product.price === null ||
    product.price <= 0 ||
    product.last_seen_at
  ) {
    return null
  }

  const requestedQuantity = toBaseQuantity(item.quantity, item.unit)
  const productQuantity =
    product.weight !== null && compatibleUnits(item.unit, product.uom)
      ? toBaseQuantity(product.weight, product.uom || '')
      : null
  if (!requestedQuantity || !productQuantity) return null
  const packsNeeded = Math.max(
    1,
    Math.ceil(requestedQuantity / productQuantity),
  )

  return {
    retailer: product.store as PricedRetailer,
    productId: product.id,
    productName: product.name,
    productUrl: product.url,
    packPrice: product.price,
    packQuantity: product.weight,
    packUnit: product.uom,
    packsNeeded,
    estimatedCost: Math.round(product.price * packsNeeded * 100) / 100,
    isSpecial: product.is_special,
    updatedAt: product.updated_at,
  }
}

export function cheapestOffers(
  item: Pick<GroceryItem, 'quantity' | 'unit'>,
  products: CatalogueProduct[],
) {
  const result: Partial<Record<PricedRetailer, RetailOffer>> = {}

  for (const product of products) {
    const offer = offerForProduct(item, product)
    if (!offer) continue
    const current = result[offer.retailer as PricedRetailer]
    if (!current || offer.estimatedCost < current.estimatedCost) {
      result[offer.retailer as PricedRetailer] = offer
    }
  }

  return result
}

export function calculateBasketTotals(items: IngredientPriceEstimate[]) {
  return pricedRetailers.reduce(
    (summary, retailer) => {
      const offers = items.flatMap((item) =>
        item.offers[retailer] ? [item.offers[retailer]] : [],
      )
      summary.totals[retailer] =
        Math.round(
          offers.reduce((total, offer) => total + offer.estimatedCost, 0) * 100,
        ) / 100
      summary.coverage[retailer] = offers.length
      return summary
    },
    {
      totals: { coles: 0, woolworths: 0 },
      coverage: { coles: 0, woolworths: 0 },
    } satisfies Pick<BasketEstimate, 'totals' | 'coverage'>,
  )
}

export function calculateManualOffer(
  item: Pick<GroceryItem, 'quantity' | 'unit'>,
  price: number,
  packQuantity: number,
  packUnit: MetricUnit,
) {
  const requested = toBaseQuantity(item.quantity, item.unit)
  const pack = compatibleUnits(item.unit, packUnit)
    ? toBaseQuantity(packQuantity, packUnit)
    : null
  if (!requested || !pack || price <= 0 || packQuantity <= 0) return null
  const packsNeeded = Math.max(1, Math.ceil(requested / pack))
  return {
    packsNeeded,
    estimatedCost: Math.round(price * packsNeeded * 100) / 100,
  }
}
