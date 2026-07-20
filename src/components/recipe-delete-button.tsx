'use client'

import { Loader2, Trash2 } from 'lucide-react'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteRecipe } from '@/app/actions'
import { Button } from '@/components/ui/button'

export function RecipeDeleteButton({ recipeId }: { recipeId: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (!confirming) {
    return (
      <Button variant="outline" onClick={() => setConfirming(true)}>
        <Trash2 /> Delete
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-2 rounded-md bg-white p-1">
      <span className="px-2 text-xs font-bold text-[var(--accent)]">
        Delete permanently?
      </span>
      <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
        Cancel
      </Button>
      <Button
        variant="accent"
        size="sm"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await deleteRecipe(recipeId)
            router.push('/recipes')
            router.refresh()
          })
        }
      >
        {isPending ? <Loader2 className="animate-spin" /> : <Trash2 />} Delete
      </Button>
    </div>
  )
}
