import { preload } from 'react-dom'
import figtree from '@fontsource-variable/figtree/files/figtree-latin-wght-normal.woff2'
import sourceSerif from '@fontsource-variable/source-serif-4/files/source-serif-4-latin-opsz-normal.woff2'
import fraunces from '@fontsource-variable/fraunces/files/fraunces-latin-full-normal.woff2'
import plexMono from '@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2'

/*
 * The four core faces the first screen needs (§1.5.5) [D201]: the Latin
 * files of the UI, text, display and mono webfonts. Imported here, the
 * bundler gives each the same URL the fonts' stylesheets request, so the
 * preload is the request the page makes anyway, only earlier. Until a face
 * arrives, its metric-matched fallback (font-fallbacks.css) holds the lines.
 */
const coreFaces = [figtree, sourceSerif, fraunces, plexMono]

/** A static-asset import's URL: a string, or Next's `{ src }` object. */
function urlOf(asset: string | { src: string }): string {
  return typeof asset === 'string' ? asset : asset.src
}

/** Adds `<link rel="preload" as="font">` for the core faces to the document head. */
export function preloadCoreFonts(): void {
  for (const face of coreFaces) {
    preload(urlOf(face), { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' })
  }
}
