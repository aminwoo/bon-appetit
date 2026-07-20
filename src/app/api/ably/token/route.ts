import { NextResponse } from 'next/server'
import { createAblyTokenRequest } from '@/lib/ably-server'

export async function GET() {
  try {
    return NextResponse.json(await createAblyTokenRequest())
  } catch {
    return NextResponse.json(
      { error: 'Realtime updates are not configured.' },
      { status: 503 },
    )
  }
}

export const POST = GET
