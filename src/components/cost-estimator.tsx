'use client'

import {
  BadgeDollarSign,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  LoaderCircle,
  Pencil,
  RefreshCw,
  Store,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  calculateManualOffer,
  type BasketEstimate,
  type RetailOffer,
} from '@/lib/grocery-pricing'
import type { GroceryItem, MetricUnit } from '@/lib/types'

const COSTCO_STORAGE_KEY = 'mise-costco-price-book-v1'
const MAX_CATALOGUE_ITEMS = 30

type CostcoPrice = {
  productName: string
  packPrice: number
  packQuantity: number
  packUnit: MetricUnit
  updatedAt: string
}

type CostcoPriceBook = Record<string, CostcoPrice>

const retailers = {
  coles: { name: 'Coles', color: '#e01e2b', soft: '#fff0f1' },
  woolworths: { name: 'Woolworths', color: '#5b8f22', soft: '#f0f6e9' },
  costco: { name: 'Costco', color: '#0060a9', soft: '#edf6fc' },
} as const

function currency(amount: number) {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(amount)
}

function ManualCostcoEditor({
  item,
  initial,
  onSave,
  onCancel,
}: {
  item: GroceryItem
  initial?: CostcoPrice
  onSave: (price: CostcoPrice) => void
  onCancel: () => void
}) {
  const [productName, setProductName] = useState(initial?.productName || item.name)
  const [packPrice, setPackPrice] = useState(String(initial?.packPrice || ''))
  const [packQuantity, setPackQuantity] = useState(
    String(initial?.packQuantity || item.quantity),
  )
  const [packUnit, setPackUnit] = useState<MetricUnit>(initial?.packUnit || item.unit)
  const valid = Number(packPrice) > 0 && Number(packQuantity) > 0

  return (
    <div className="mt-3 rounded-md border border-[#0060a9]/20 bg-[#edf6fc] p-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="lg:col-span-2">
          <span className="mb-1 block text-[10px] font-bold uppercase text-[var(--muted)]">
            Costco product
          </span>
          <input
            value={productName}
            onChange={(event) => setProductName(event.target.value)}
            className="h-10 w-full rounded-md border border-[var(--line)] bg-white px-3 text-sm outline-none focus:border-[#0060a9]"
          />
        </label>
        <label>
          <span className="mb-1 block text-[10px] font-bold uppercase text-[var(--muted)]">
            Pack price
          </span>
          <div className="relative">
            <span className="absolute left-3 top-2 text-sm text-[var(--muted)]">$</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={packPrice}
              onChange={(event) => setPackPrice(event.target.value)}
              className="h-10 w-full rounded-md border border-[var(--line)] bg-white pl-7 pr-3 text-sm outline-none focus:border-[#0060a9]"
              placeholder="9.99"
            />
          </div>
        </label>
        <label>
          <span className="mb-1 block text-[10px] font-bold uppercase text-[var(--muted)]">
            Pack size
          </span>
          <div className="grid grid-cols-[1fr_68px]">
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={packQuantity}
              onChange={(event) => setPackQuantity(event.target.value)}
              className="h-10 rounded-l-md border border-r-0 border-[var(--line)] bg-white px-3 text-sm outline-none focus:border-[#0060a9]"
            />
            <select
              value={packUnit}
              onChange={(event) => setPackUnit(event.target.value as MetricUnit)}
              className="h-10 rounded-r-md border border-[var(--line)] bg-white px-2 text-sm outline-none focus:border-[#0060a9]"
            >
              {(item.unit === 'g' || item.unit === 'kg'
                ? (['g', 'kg'] as const)
                : (['ml', 'l'] as const)
              ).map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>
        </label>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <a
          href={`https://www.costco.com.au/search?text=${encodeURIComponent(item.name)}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0060a9] hover:underline"
        >
          Look up on Costco <ExternalLink className="size-3" />
        </a>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!valid}
            onClick={() =>
              onSave({
                productName: productName.trim() || item.name,
                packPrice: Number(packPrice),
                packQuantity: Number(packQuantity),
                packUnit,
                updatedAt: new Date().toISOString(),
              })
            }
          >
            Save Costco price
          </Button>
        </div>
      </div>
    </div>
  )
}

export function CostEstimator({ items }: { items: GroceryItem[] }) {
  const [estimateResult, setEstimateResult] = useState<{
    itemSignature: string
    estimate: BasketEstimate
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [setupRequired, setSetupRequired] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [editingCostco, setEditingCostco] = useState<string | null>(null)
  const [costcoBook, setCostcoBook] = useState<CostcoPriceBook>({})
  const pricedItems = useMemo(
    () => items.slice(0, MAX_CATALOGUE_ITEMS),
    [items],
  )
  const omittedItemCount = items.length - pricedItems.length

  const itemSignature = pricedItems
    .map((item) => `${item.key}:${item.quantity}:${item.unit}`)
    .join('|')
  const estimate =
    estimateResult?.itemSignature === itemSignature
      ? estimateResult.estimate
      : null

  useEffect(() => {
    const hydratePriceBook = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem(COSTCO_STORAGE_KEY)
        if (saved) setCostcoBook(JSON.parse(saved))
      } catch {
        // A private browsing session can still use estimates without persistence.
      }
    }, 0)
    return () => window.clearTimeout(hydratePriceBook)
  }, [])

  const costcoSummary = useMemo(() => {
    let total = 0
    let coverage = 0
    const offers: Record<string, { price: CostcoPrice; packsNeeded: number; estimatedCost: number }> = {}

    for (const item of pricedItems) {
      const price = costcoBook[item.key]
      if (!price) continue
      const calculated = calculateManualOffer(
        item,
        price.packPrice,
        price.packQuantity,
        price.packUnit,
      )
      if (!calculated) continue
      offers[item.key] = { price, ...calculated }
      total += calculated.estimatedCost
      coverage += 1
    }

    return { total: Math.round(total * 100) / 100, coverage, offers }
  }, [costcoBook, pricedItems])

  const fullTotals = [
    estimate?.coverage.coles === pricedItems.length
      ? estimate.totals.coles
      : null,
    estimate?.coverage.woolworths === pricedItems.length
      ? estimate.totals.woolworths
      : null,
    costcoSummary.coverage === pricedItems.length ? costcoSummary.total : null,
  ].filter((value): value is number => value !== null)
  const lowestFullTotal = fullTotals.length ? Math.min(...fullTotals) : null

  async function estimateBasket() {
    if (!pricedItems.length) return
    setIsLoading(true)
    setError(null)
    setSetupRequired(false)
    try {
      const response = await fetch('/api/prices/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: pricedItems.map(({ key, name, quantity, unit }) => ({
            key,
            name,
            quantity,
            unit,
          })),
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        setSetupRequired(Boolean(data.setupRequired))
        throw new Error(data.error || 'Could not estimate this basket.')
      }
      setEstimateResult({ itemSignature, estimate: data })
      setExpanded(true)
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : 'Could not estimate this basket.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  function saveCostcoPrice(key: string, price: CostcoPrice) {
    setCostcoBook((current) => {
      const next = { ...current, [key]: price }
      try {
        localStorage.setItem(COSTCO_STORAGE_KEY, JSON.stringify(next))
      } catch {
        // Keep the price available for this session.
      }
      return next
    })
    setEditingCostco(null)
  }

  function removeCostcoPrice(key: string) {
    setCostcoBook((current) => {
      const next = { ...current }
      delete next[key]
      try {
        localStorage.setItem(COSTCO_STORAGE_KEY, JSON.stringify(next))
      } catch {
        // Keep the in-memory price book in sync.
      }
      return next
    })
  }

  return (
    <section className="border-b border-[var(--line)] bg-[var(--ink)] text-white">
      <div className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-xs font-bold uppercase text-[#a9c6b5]">
              <BadgeDollarSign className="size-4" /> Basket estimate
            </p>
            <h2 className="font-display mt-2 text-3xl font-semibold sm:text-4xl">
              Know the likely cost before you shop.
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#c5cec9]">
              Compare whole-pack estimates at Coles and Woolworths, then add your
              local Costco warehouse prices to see where the week is cheapest.
            </p>
          </div>
          <Button
            onClick={estimateBasket}
            disabled={isLoading || !items.length}
            className="min-w-52 bg-[#e8b64c] text-[var(--ink)] hover:bg-[#f0c765]"
          >
            {isLoading ? (
              <>
                <LoaderCircle className="animate-spin" /> Checking prices…
              </>
            ) : estimate ? (
              <>
                <RefreshCw /> Refresh estimate
              </>
            ) : (
              <>
                <BadgeDollarSign /> Estimate this basket
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-md border border-white/15 bg-white/10 px-4 py-3 text-sm">
            <span>{error}</span>
            {setupRequired && (
              <a
                href="https://www.whichgrocer.com/developers"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 font-bold text-[#f4c96c] hover:underline"
              >
                Get a WhichGrocer API key <ExternalLink className="size-3.5" />
              </a>
            )}
          </div>
        )}

        {omittedItemCount > 0 && (
          <p className="mt-4 text-xs text-white/60">
            Comparing the first {pricedItems.length} of {items.length} items to
            stay within catalogue request limits. Narrow the meal filters for a
            different subset.
          </p>
        )}

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <RetailerTotal
            retailer="coles"
            total={estimate?.totals.coles ?? 0}
            coverage={estimate?.coverage.coles ?? 0}
            itemCount={pricedItems.length}
            isLowest={
              lowestFullTotal !== null && estimate?.totals.coles === lowestFullTotal
            }
          />
          <RetailerTotal
            retailer="woolworths"
            total={estimate?.totals.woolworths ?? 0}
            coverage={estimate?.coverage.woolworths ?? 0}
            itemCount={pricedItems.length}
            isLowest={
              lowestFullTotal !== null &&
              estimate?.totals.woolworths === lowestFullTotal
            }
          />
          <RetailerTotal
            retailer="costco"
            total={costcoSummary.total}
            coverage={costcoSummary.coverage}
            itemCount={pricedItems.length}
            isLowest={
              lowestFullTotal !== null && costcoSummary.total === lowestFullTotal
            }
          />
        </div>

        {pricedItems.length > 0 && (
          <button
            onClick={() => setExpanded((current) => !current)}
            className="mt-5 flex w-full items-center justify-center gap-2 text-xs font-bold text-white/75 hover:text-white"
          >
            {expanded
              ? 'Hide item comparison'
              : estimate || costcoSummary.coverage > 0
                ? 'Compare item by item'
                : 'Add Costco prices or compare items'}
            {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
        )}
      </div>

      {expanded && (
        <div className="border-t border-white/10 bg-[var(--paper)] text-[var(--ink)]">
          <div className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 lg:px-8">
            <div className="overflow-x-auto">
              <div className="min-w-[760px]">
                <div className="grid grid-cols-[1.4fr_repeat(3,1fr)] gap-3 border-b border-[var(--line)] px-3 pb-3 text-[10px] font-bold uppercase text-[var(--muted)]">
                  <span>Ingredient</span>
                  <span>Coles</span>
                  <span>Woolworths</span>
                  <span>Costco · your price book</span>
                </div>
                {pricedItems.map((item) => {
                  const liveItem = estimate?.items.find(
                    (estimateItem) => estimateItem.key === item.key,
                  )
                  const costco = costcoSummary.offers[item.key]
                  return (
                    <div key={item.key} className="border-b border-[var(--line)] px-3 py-4 last:border-0">
                      <div className="grid grid-cols-[1.4fr_repeat(3,1fr)] items-center gap-3">
                        <div>
                          <p className="text-sm font-bold">{item.name}</p>
                          <p className="mt-0.5 text-xs text-[var(--muted)]">
                            Need {item.quantity} {item.unit}
                          </p>
                        </div>
                        <OfferCell offer={liveItem?.offers.coles} />
                        <OfferCell offer={liveItem?.offers.woolworths} />
                        <div>
                          {costco ? (
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-sm font-bold">
                                  {currency(costco.estimatedCost)}
                                </p>
                                <p className="mt-0.5 line-clamp-1 text-[11px] text-[var(--muted)]">
                                  {costco.packsNeeded} × {costco.price.productName}
                                </p>
                              </div>
                              <div className="flex">
                                <button
                                  onClick={() => setEditingCostco(item.key)}
                                  className="p-1.5 text-[var(--muted)] hover:text-[#0060a9]"
                                  aria-label={`Edit Costco price for ${item.name}`}
                                >
                                  <Pencil className="size-3.5" />
                                </button>
                                <button
                                  onClick={() => removeCostcoPrice(item.key)}
                                  className="p-1.5 text-[var(--muted)] hover:text-[var(--accent)]"
                                  aria-label={`Remove Costco price for ${item.name}`}
                                >
                                  <X className="size-3.5" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setEditingCostco(item.key)}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0060a9] hover:underline"
                            >
                              <Store className="size-3.5" /> Add warehouse price
                            </button>
                          )}
                        </div>
                      </div>
                      {editingCostco === item.key && (
                        <ManualCostcoEditor
                          item={item}
                          initial={costcoBook[item.key]}
                          onSave={(price) => saveCostcoPrice(item.key, price)}
                          onCancel={() => setEditingCostco(null)}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-2 border-t border-[var(--line)] pt-4 text-xs text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
              <p>
                Estimates include whole packs and exclude delivery, membership,
                substitutions, and store-specific availability.
              </p>
              {estimate && (
                <a
                  href="https://www.whichgrocer.com"
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 font-bold hover:text-[var(--ink)] hover:underline"
                >
                  Product data by WhichGrocer.
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function RetailerTotal({
  retailer,
  total,
  coverage,
  itemCount,
  isLowest,
}: {
  retailer: keyof typeof retailers
  total: number
  coverage: number
  itemCount: number
  isLowest: boolean
}) {
  const details = retailers[retailer]
  const hasPrices = coverage > 0
  return (
    <div className="relative overflow-hidden rounded-md border border-white/15 bg-white/[0.07] p-4">
      <span
        className="absolute inset-y-0 left-0 w-1"
        style={{ backgroundColor: details.color }}
      />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase text-white/60">{details.name}</p>
          <p className="font-display mt-1 text-3xl font-semibold">
            {hasPrices ? currency(total) : '—'}
          </p>
        </div>
        {isLowest && (
          <span className="flex items-center gap-1 rounded-full bg-[#e8b64c] px-2 py-1 text-[10px] font-bold uppercase text-[var(--ink)]">
            <Check className="size-3" /> Lowest
          </span>
        )}
      </div>
      <p className="mt-2 text-xs text-white/55">
        {coverage} of {itemCount} items priced
        {retailer === 'costco' && ' · saved on this device'}
      </p>
    </div>
  )
}

function OfferCell({ offer }: { offer?: RetailOffer }) {
  if (!offer) return <span className="text-sm text-[var(--muted)]">No match</span>
  return (
    <div>
      <p className="flex items-center gap-1.5 text-sm font-bold">
        {currency(offer.estimatedCost)}
        {offer.isSpecial && (
          <span className="rounded-full bg-[#fbe5dc] px-1.5 py-0.5 text-[9px] font-bold uppercase text-[var(--accent)]">
            low
          </span>
        )}
      </p>
      {offer.productUrl ? (
        <a
          href={offer.productUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-0.5 line-clamp-1 text-[11px] text-[var(--muted)] hover:underline"
        >
          {offer.packsNeeded} × {offer.productName}
        </a>
      ) : (
        <p className="mt-0.5 line-clamp-1 text-[11px] text-[var(--muted)]">
          {offer.packsNeeded} × {offer.productName}
        </p>
      )}
      <p className="mt-0.5 text-[10px] text-[var(--muted)]">
        {offer.updatedAt
          ? `Catalogue ${new Date(offer.updatedAt).toLocaleDateString('en-AU', {
              day: 'numeric',
              month: 'short',
            })}`
          : 'Catalogue date unavailable'}
      </p>
    </div>
  )
}
