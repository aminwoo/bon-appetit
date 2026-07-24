'use client'

import Link from 'next/link'
import {
  ArrowLeft,
  Download,
  GripVertical,
  Loader2,
  Plus,
  Save,
  Trash2,
  Upload,
} from 'lucide-react'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/components/language-provider'
import { createRecipe, updateRecipe } from '@/app/actions'
import { Button } from '@/components/ui/button'
import {
  ingredientCategories,
  metricUnits,
  type Ingredient,
  type Recipe,
} from '@/lib/types'

type RecipeDraft = Omit<Recipe, 'id'>

const emptyDraft: RecipeDraft = {
  title: '',
  description: '',
  imageUrl: '',
  prepMinutes: 15,
  cookMinutes: 30,
  baseServings: 4,
  nutrition: { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 },
  ingredients: [{ name: '', quantity: 100, unit: 'g', category: 'Produce' }],
  instructions: [''],
}

const fieldClass =
  'h-11 w-full rounded-md border border-[var(--line)] bg-white px-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-[var(--leaf)]'

const INGREDIENT_NAME_MAX = 200

export function RecipeEditor({
  recipe,
  duplicate = false,
}: {
  recipe?: Recipe
  duplicate?: boolean
}) {
  const router = useRouter()
  const [draft, setDraft] = useState<RecipeDraft>(() => {
    if (!recipe) return emptyDraft
    const { id: _id, ...values } = recipe
    void _id
    return {
      ...values,
      title: duplicate ? `${values.title} — my version` : values.title,
    }
  })
  const [isPending, startTransition] = useTransition()
  const [isUploading, setIsUploading] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importUrl, setImportUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { t } = useLanguage()
  const isEditing = Boolean(recipe && !duplicate)

  async function importRecipe() {
    setError(null)
    setIsImporting(true)

    try {
      const response = await fetch('/api/recipes/import', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url: importUrl }),
      })
      const result = (await response.json()) as {
        recipe?: RecipeDraft
        error?: string
      }

      if (!response.ok || !result.recipe) {
        throw new Error(result.error ?? 'Could not import this recipe.')
      }

      setDraft(result.recipe)
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Could not import this recipe.',
      )
    } finally {
      setIsImporting(false)
    }
  }

  async function uploadImage(file: File) {
    setError(null)
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      })
      const result = (await response.json()) as { url?: string; error?: string }

      if (!response.ok || !result.url) {
        throw new Error(result.error ?? 'Could not upload the image.')
      }

      setDraft((current) => ({ ...current, imageUrl: result.url }))
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Could not upload the image.',
      )
    } finally {
      setIsUploading(false)
    }
  }

  function updateIngredient(index: number, patch: Partial<Ingredient>) {
    setDraft((current) => ({
      ...current,
      ingredients: current.ingredients.map((ingredient, itemIndex) =>
        itemIndex === index ? { ...ingredient, ...patch } : ingredient,
      ),
    }))
  }

  function submit() {
    setError(null)
    const hasBlank =
      !draft.title.trim() ||
      !draft.description.trim() ||
      draft.ingredients.some(
        (item) => !item.name.trim() || item.quantity <= 0,
      ) ||
      draft.instructions.some((step) => !step.trim())
    if (hasBlank || draft.description.trim().length < 10) {
      setError(
        'Add a title, a description of at least 10 characters, and complete every ingredient and step.',
      )
      return
    }

    const oversizedIngredient = draft.ingredients.findIndex(
      (item) => item.name.trim().length > INGREDIENT_NAME_MAX,
    )
    if (oversizedIngredient !== -1) {
      setError(
        `Ingredient ${oversizedIngredient + 1} name is too long. Keep ingredient names at ${INGREDIENT_NAME_MAX} characters or fewer.`,
      )
      return
    }

    startTransition(async () => {
      try {
        const result =
          isEditing && recipe
            ? await updateRecipe(recipe.id, draft)
            : await createRecipe(draft)
        router.push(`/recipes/${result.id}`)
        router.refresh()
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Could not save the recipe.',
        )
      }
    })
  }

  return (
    <main>
      <section className="border-b border-[var(--line)] bg-[var(--ink)] text-white">
        <div className="mx-auto max-w-5xl px-4 py-9 sm:px-6 lg:px-8 lg:py-12">
          <Button
            asChild
            variant="outline"
            className="mb-7 border-white/30 bg-transparent text-white hover:bg-white hover:text-[var(--ink)]"
          >
            <Link href={recipe ? `/recipes/${recipe.id}` : '/recipes'}>
              <ArrowLeft /> {t('cancelEdit')}
            </Link>
          </Button>
          <p className="text-xs font-bold uppercase text-[#a9c6b5]">
            {isEditing
              ? t('editRecipe')
              : duplicate
                ? t('makeItYours')
                : t('newRecipe')}
          </p>
          <h1 className="font-display mt-2 text-5xl leading-none font-semibold sm:text-7xl">
            {isEditing ? t('refineDetails') : t('addSomething')}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/65">
            {t('nutritionHint')}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {!isEditing && (
          <section className="mb-10 border-b border-[var(--line)] pb-8">
            <p className="text-xs font-bold uppercase text-[var(--accent)]">
              {t('quickImport')}
            </p>
            <label className="mt-3 block">
              <span className="sr-only">{t('recipeLink')}</span>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="url"
                  className={fieldClass}
                  placeholder="https://example.com/recipe"
                  value={importUrl}
                  onChange={(event) => setImportUrl(event.target.value)}
                />
                <Button
                  variant="outline"
                  disabled={isImporting || !importUrl.trim()}
                  onClick={() => void importRecipe()}
                  className="shrink-0"
                >
                  {isImporting ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Download />
                  )}
                  {isImporting ? t('importingRecipe') : t('importRecipe')}
                </Button>
              </div>
            </label>
            <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
              {t('importHint')}
            </p>
          </section>
        )}
        <section className="grid gap-5 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="mb-2 block text-xs font-bold uppercase text-[var(--muted)]">
              {t('title')}
            </span>
            <input
              className={fieldClass}
              value={draft.title}
              onChange={(event) =>
                setDraft({ ...draft, title: event.target.value })
              }
              required
            />
          </label>
          <label className="sm:col-span-2">
            <span className="mb-2 block text-xs font-bold uppercase text-[var(--muted)]">
              {t('recipePhotoUrl')}
            </span>
            <input
              type="url"
              className={fieldClass}
              placeholder="https://images.unsplash.com/..."
              value={draft.imageUrl ?? ''}
              onChange={(event) =>
                setDraft({ ...draft, imageUrl: event.target.value })
              }
            />
            <label className="mt-3 flex w-fit cursor-pointer items-center gap-2 rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm font-semibold transition-colors hover:bg-[var(--paper-deep)] has-[:disabled]:cursor-wait has-[:disabled]:opacity-60">
              {isUploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              {isUploading ? 'Uploading…' : 'Upload image'}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={isUploading}
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) void uploadImage(file)
                  event.target.value = ''
                }}
              />
              {isUploading ? t('uploading') : t('uploadImage')}
            </label>
            <span className="mt-2 block text-xs text-[var(--muted)]">
              Upload an image up to 10 MB, or paste a public image URL.
            </span>
            {draft.imageUrl && (
              <div
                className="mt-4 aspect-[16/7] overflow-hidden rounded-md bg-[var(--paper-deep)] bg-cover bg-center"
                style={{ backgroundImage: `url(${draft.imageUrl})` }}
                role="img"
                aria-label="Recipe photo preview"
              />
            )}
          </label>
          <label className="sm:col-span-2">
            <span className="mb-2 block text-xs font-bold uppercase text-[var(--muted)]">
              Description
            </span>
            <textarea
              className={`${fieldClass} min-h-28 resize-y py-3`}
              value={draft.description}
              onChange={(event) =>
                setDraft({ ...draft, description: event.target.value })
              }
              required
            />
          </label>
          {[
            [t('prepTime'), 'prepMinutes'],
            [t('cookTime'), 'cookMinutes'],
            [t('baseServings'), 'baseServings'],
          ].map(([label, key]) => (
            <label key={key}>
              <span className="mb-2 block text-xs font-bold uppercase text-[var(--muted)]">
                {label} {key !== 'baseServings' && t('minutes')}
              </span>
              <input
                type="number"
                min={key === 'baseServings' ? 1 : 0}
                className={fieldClass}
                value={draft[key as 'prepMinutes']}
                onChange={(event) =>
                  setDraft({ ...draft, [key]: Number(event.target.value) })
                }
              />
            </label>
          ))}
        </section>

        <section className="mt-12">
          <div className="mb-5 border-b border-[var(--ink)] pb-4">
            <p className="text-xs font-bold uppercase text-[var(--accent)]">
              {t('perServingHeading')}
            </p>
            <h2 className="font-display text-4xl font-semibold">
              {t('nutrition')}
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            {(['calories', 'protein', 'carbs', 'fats', 'fiber'] as const).map(
              (key) => (
                <label key={key}>
                  <span className="mb-2 block text-xs font-bold capitalize text-[var(--muted)]">
                    {t(key)} {key !== 'calories' && '(g)'}
                  </span>
                  <input
                    min="0"
                    step={key === 'calories' ? 1 : 0.1}
                    className={fieldClass}
                    value={draft.nutrition[key]}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        nutrition: {
                          ...draft.nutrition,
                          [key]: Number(event.target.value),
                        },
                      })
                    }
                  />
                </label>
              ),
            )}
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-5 flex items-end justify-between border-b border-[var(--ink)] pb-4">
            <div>
              <p className="text-xs font-bold uppercase text-[var(--accent)]">
                {t('metricOnly')}
              </p>
              <h2 className="font-display text-4xl font-semibold">
                {t('ingredients')}
              </h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setDraft({
                  ...draft,
                  ingredients: [
                    ...draft.ingredients,
                    { name: '', quantity: 100, unit: 'g', category: 'Produce' },
                  ],
                })
              }
            >
              <Plus /> {t('add')}
            </Button>
          </div>
          <div className="space-y-3">
            {draft.ingredients.map((ingredient, index) => (
              <div
                key={index}
                className="grid gap-2 border-b border-[var(--line)] pb-3 sm:grid-cols-[24px_minmax(180px,1fr)_110px_90px_140px_40px] sm:items-center"
              >
                <GripVertical className="hidden size-4 text-[var(--muted)] sm:block" />
                <input
                  aria-label={`Ingredient ${index + 1} name`}
                  placeholder="Ingredient name"
                  className={fieldClass}
                  value={ingredient.name}
                  maxLength={INGREDIENT_NAME_MAX}
                  onChange={(event) =>
                    updateIngredient(index, { name: event.target.value })
                  }
                />
                <input
                  aria-label={`Ingredient ${index + 1} quantity`}
                  type="number"
                  min="0.01"
                  step="0.01"
                  className={fieldClass}
                  value={ingredient.quantity}
                  onChange={(event) =>
                    updateIngredient(index, {
                      quantity: Number(event.target.value),
                    })
                  }
                />
                <select
                  aria-label={`Ingredient ${index + 1} unit`}
                  className={fieldClass}
                  value={ingredient.unit}
                  onChange={(event) =>
                    updateIngredient(index, {
                      unit: event.target.value as Ingredient['unit'],
                    })
                  }
                >
                  {metricUnits.map((unit) => (
                    <option key={unit}>{unit}</option>
                  ))}
                </select>
                <select
                  aria-label={`Ingredient ${index + 1} category`}
                  className={fieldClass}
                  value={ingredient.category}
                  onChange={(event) =>
                    updateIngredient(index, {
                      category: event.target.value as Ingredient['category'],
                    })
                  }
                >
                  {ingredientCategories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={draft.ingredients.length === 1}
                  onClick={() =>
                    setDraft({
                      ...draft,
                      ingredients: draft.ingredients.filter(
                        (_, itemIndex) => itemIndex !== index,
                      ),
                    })
                  }
                  title={t('removeIngredient')}
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-5 flex items-end justify-between border-b border-[var(--ink)] pb-4">
            <div>
              <p className="text-xs font-bold uppercase text-[var(--accent)]">
                {t('inOrder')}
              </p>
              <h2 className="font-display text-4xl font-semibold">
                {t('method')}
              </h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setDraft({
                  ...draft,
                  instructions: [...draft.instructions, ''],
                })
              }
            >
              <Plus /> {t('addStep')}
            </Button>
          </div>
          <div className="space-y-4">
            {draft.instructions.map((instruction, index) => (
              <div key={index} className="grid grid-cols-[40px_1fr_40px] gap-3">
                <span className="font-display grid size-10 place-items-center rounded-full border border-[var(--leaf)] text-lg font-semibold text-[var(--leaf)]">
                  {index + 1}
                </span>
                <textarea
                  aria-label={`Step ${index + 1}`}
                  className={`${fieldClass} min-h-20 resize-y py-3`}
                  value={instruction}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      instructions: draft.instructions.map((step, itemIndex) =>
                        itemIndex === index ? event.target.value : step,
                      ),
                    })
                  }
                />
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={draft.instructions.length === 1}
                  onClick={() =>
                    setDraft({
                      ...draft,
                      instructions: draft.instructions.filter(
                        (_, itemIndex) => itemIndex !== index,
                      ),
                    })
                  }
                  title={t('removeStep')}
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--ink)] pt-6">
          <p
            role="alert"
            className="max-w-xl text-sm font-semibold text-[var(--accent)]"
          >
            {error}
          </p>
          <Button
            variant="accent"
            disabled={isPending || isUploading}
            onClick={submit}
          >
            {isPending ? <Loader2 className="animate-spin" /> : <Save />}{' '}
            {isPending
              ? t('saving')
              : isEditing
                ? t('saveChanges')
                : t('createRecipe')}
          </Button>
        </div>
      </div>
    </main>
  )
}
