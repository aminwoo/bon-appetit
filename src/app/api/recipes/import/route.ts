import { isIP } from 'node:net'
import { lookup } from 'node:dns/promises'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { parseRecipeHtml } from '@/lib/recipe-import'

const requestSchema = z.object({ url: z.url() })
const maxHtmlBytes = 2 * 1024 * 1024
const maxRedirects = 4

function normalizeImportUrl(rawValue: string) {
  const parsed = new URL(rawValue.trim())
  // Some shared RecipeTin URLs include a trailing /anonymous segment.
  // Strip it so we fetch the canonical recipe page.
  parsed.pathname = parsed.pathname.replace(/\/anonymous\/?$/i, '/')
  return parsed.toString()
}

function isPrivateHost(hostname: string) {
  const host = hostname.toLowerCase()
  if (host === 'localhost' || host.endsWith('.local')) return true
  if (isIP(host) === 4) {
    const [first, second] = host.split('.').map(Number)
    return (
      first === 10 ||
      first === 0 ||
      first === 127 ||
      (first === 100 && second >= 64 && second <= 127) ||
      (first === 169 && second === 254) ||
      (first === 172 && second >= 16 && second <= 31) ||
      (first === 192 && second === 168)
    )
  }
  return (
    isIP(host) === 6 &&
    (host === '::1' ||
      host.startsWith('fc') ||
      host.startsWith('fd') ||
      host.startsWith('fe80'))
  )
}

async function validateUrl(value: string) {
  const url = new URL(value)
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    isPrivateHost(url.hostname)
  ) {
    throw new Error('Enter a public HTTP or HTTPS recipe URL.')
  }
  const addresses = await lookup(url.hostname, { all: true })
  if (
    !addresses.length ||
    addresses.some(({ address }) => isPrivateHost(address))
  ) {
    throw new Error('The recipe URL must resolve to a public website.')
  }
  return url
}

async function fetchRecipePage(initialUrl: URL) {
  let url = initialUrl

  for (let redirect = 0; redirect <= maxRedirects; redirect += 1) {
    const response = await fetch(url, {
      headers: {
        accept: 'text/html,application/xhtml+xml',
        'user-agent': 'Mise Recipe Importer/1.0',
      },
      redirect: 'manual',
      signal: AbortSignal.timeout(10000),
    })

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location')
      if (!location || redirect === maxRedirects)
        throw new Error('The recipe page redirected too many times.')
      url = await validateUrl(new URL(location, url).toString())
      continue
    }

    if (!response.ok)
      throw new Error(`The recipe page returned HTTP ${response.status}.`)
    const contentType = response.headers.get('content-type') ?? ''
    if (!contentType.includes('text/html'))
      throw new Error('The URL does not point to an HTML page.')
    const contentLength = Number(response.headers.get('content-length') ?? 0)
    if (contentLength > maxHtmlBytes)
      throw new Error('The recipe page is too large to import.')
    const html = await response.text()
    if (Buffer.byteLength(html) > maxHtmlBytes)
      throw new Error('The recipe page is too large to import.')
    return html
  }

  throw new Error('Could not load the recipe page.')
}

export async function POST(request: Request) {
  try {
    const { url: rawUrl } = requestSchema.parse(await request.json())
    const normalizedUrl = normalizeImportUrl(rawUrl)
    const html = await fetchRecipePage(await validateUrl(normalizedUrl))
    return NextResponse.json({ recipe: parseRecipeHtml(html) })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Could not import this recipe.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
