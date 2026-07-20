import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'

const maxFileSize = 10 * 1024 * 1024

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No image file was provided.' }, { status: 400 })
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Only image files can be uploaded.' }, { status: 400 })
  }

  if (file.size > maxFileSize) {
    return NextResponse.json(
      { error: 'Images must be 10 MB or smaller.' },
      { status: 413 },
    )
  }

  try {
    const blob = await put(`recipes/${file.name}`, file, {
      access: 'public',
      addRandomSuffix: true,
      contentType: file.type,
    })

    return NextResponse.json({ url: blob.url })
  } catch {
    return NextResponse.json(
      { error: 'Could not upload the image. Check your Blob configuration.' },
      { status: 500 },
    )
  }
}
