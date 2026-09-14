import { describe, expect, it } from 'vitest'
import {
  calculateManualOffer,
  cheapestOffers,
  offerForProduct,
  type CatalogueProduct,
} from './grocery-pricing'

const product: CatalogueProduct = {
  id: 'coles-1',
  name: 'Chicken breast 500g',
  store: 'coles',
  price: 6,
  currency: 'AUD',
  cup_price: '$1.20/100g',
  uom: 'g',
  weight: 500,
  url: null,
  image_url: null,
  is_special: false,
  updated_at: '2026-09-01T00:00:00Z',
}

describe('grocery pricing', () => {
  it('prices the whole packs needed for an ingredient', () => {
    expect(offerForProduct({ quantity: 700, unit: 'g' }, product)).toMatchObject({
      packsNeeded: 2,
      estimatedCost: 12,
    })
  })

  it('prices gram-normalized liquids sold by volume', () => {
    expect(
      offerForProduct(
        { quantity: 1250, unit: 'g' },
        {
          ...product,
          name: 'Milk 1L',
          uom: 'l',
          weight: 1,
        },
      ),
    ).toMatchObject({ packsNeeded: 2 })
  })

  it('selects the cheapest basket cost per retailer', () => {
    const offers = cheapestOffers(
      { quantity: 700, unit: 'g' },
      [product, { ...product, id: 'coles-2', price: 10, weight: 1000 }],
    )
    expect(offers.coles?.productId).toBe('coles-2')
    expect(offers.coles?.estimatedCost).toBe(10)
  })

  it('calculates manual Costco packs with metric conversion', () => {
    expect(
      calculateManualOffer(
        { quantity: 1.2, unit: 'kg' },
        14,
        500,
        'g',
      ),
    ).toEqual({ packsNeeded: 3, estimatedCost: 42 })
  })
})
