import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'

const maxFileSize = 10 * 1024 * 1024

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: 'No image file was provided.' },
      { status: 400 },
    )
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json(
      { error: 'Only image files can be uploaded.' },
      { status: 400 },
    )
  }

  if (file.size > maxFileSize) {
    return NextResponse.json(
      { error: 'Images must be 10 MB or smaller.' },
      { status: 413 },
    )
  }

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN?.trim()
  if (!blobToken) {
    console.error('Blob upload unavailable: BLOB_READ_WRITE_TOKEN is missing', {
      vercelEnv: process.env.VERCEL_ENV ?? 'unknown',
      hasBlobStoreId: Boolean(process.env.BLOB_STORE_ID),
    })
    return NextResponse.json(
      { error: 'Image uploads are not configured for this deployment.' },
      { status: 503 },
    )
  }

  try {
    const blob = await put(`recipes/${file.name}`, file, {
      access: 'public',
      addRandomSuffix: true,
      contentType: file.type,
      token: blobToken,
    })

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error('Vercel Blob upload failed', error)
    return NextResponse.json(
      { error: 'Could not upload the image. Check your Blob configuration.' },
      { status: 500 },
    )
  }
}
