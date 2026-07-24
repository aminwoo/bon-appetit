'use client'

import { Loader2, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteRecipe } from '@/app/actions'
import { Button } from '@/components/ui/button'

export function RecipeDeleteButton({ recipeId }: { recipeId: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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
        disabled={isDeleting}
        onClick={async () => {
          setIsDeleting(true)
          try {
            await deleteRecipe(recipeId)
            router.replace(`/recipes?deleted=${recipeId}`)
            router.refresh()
          } finally {
            setIsDeleting(false)
          }
        }}
      >
        {isDeleting ? <Loader2 className="animate-spin" /> : <Trash2 />} Delete
      </Button>
    </div>
  )
}
