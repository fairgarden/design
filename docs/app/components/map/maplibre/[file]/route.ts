import { readFile } from 'node:fs/promises'
import path from 'node:path'

// MapLibre's worker pair, served same-origin from the installed package so
// the map demos can start MapLibre's worker under Next's bundler; the worker
// imports ./maplibre-gl-shared.mjs, so both share this directory. An app
// copies the two files from maplibre-gl/dist to public/ at build time
// instead, as MapLibre's installation guide shows.
const FILES = ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs']

export const dynamicParams = false

export function generateStaticParams() {
  return FILES.map((file) => ({ file }))
}

export async function GET(_request: Request, context: { params: Promise<{ file: string }> }) {
  const { file } = await context.params
  if (!FILES.includes(file)) return new Response('Not found', { status: 404 })
  const source = await readFile(
    path.join(process.cwd(), 'node_modules', 'maplibre-gl', 'dist', file),
    'utf8'
  )
  return new Response(source, {
    headers: { 'Content-Type': 'text/javascript; charset=utf-8' },
  })
}
