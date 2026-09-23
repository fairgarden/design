/// <reference types="geojson" />

import type {
  FontFacesSpecification,
  LayerSpecification,
  MLFontFace,
  StyleSpecification,
} from 'maplibre-gl'
import type { Flavor } from '@protomaps/basemaps'

import type { MapRoute } from './types'

/*
 * The MapLibre style of a PMTiles map (§8.10) [D158, D191]. The layer
 * structure is @protomaps/basemaps'; every color is a role variable read on
 * the map root at runtime and made opaque, so the canvas follows the mode
 * and the scope like the CSS around it:
 * - land (`earth`) --role-tint; the frame and every road face
 *   --role-ground; road edges --role-hairline (minor, links, service,
 *   paths) and --role-rule (major, highway); boundaries and rail
 *   --role-rule; buildings a --role-ground face with a --role-hairline edge;
 * - water the scope's --secondary5 (one ink: the 45° hatch in --primary12);
 *   green space the §8.10 dot screen, 1.25 px at 6 px, in --secondary11
 *   (one ink: --primary12) on --role-ground; other land use stays land;
 * - labels --primary12 on a --border-size-2 --role-halo knockout;
 *   routes `line-dashed` in --role-accent, alternates in --primary12.
 * No opacity, blur or translate paints, and no icons: POIs, shields,
 * one-way arrows and the landcover layer are dropped, which keeps the credit
 * to OpenStreetMap alone (ESA WorldCover and the Mapzen icons are credited
 * only where those layers show).
 * Labels draw with the page's UI font files through MapLibre's
 * `font-faces`; characters those files lack fall back to the glyphs URL.
 */

export type Basemaps = typeof import('@protomaps/basemaps')

/** The vector source's name in the style. */
export const SOURCE = 'protomaps'

const ROUTES = 'fg-routes'

/**
 * Pattern image ids, keyed by their colors, so a palette change swaps to a
 * new image through the style diff instead of rewriting one in place. The
 * map's missing-image resolver adds each on first use.
 */
function patternIds(p: Palette): { green: string; water: string } {
  const key = (...colors: string[]) => colors.map((color) => color.slice(1)).join('')
  return {
    green: `fg-green-${key(p.ground, p.green)}`,
    water: `fg-water-${key(p.ground, p.ink)}`,
  }
}

/** Protomaps' hosted glyphs (Noto Sans, OFL): the fallback for characters the UI font lacks. */
export const DEFAULT_GLYPHS =
  'https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf'

/**
 * The font names @protomaps/basemaps puts in `text-font`. They stay the
 * names, so the glyphs URL can serve what the UI font lacks, and
 * `font-faces` maps each to the UI font's files.
 */
const FONT_REGULAR = 'Noto Sans Regular'
const FONT_BOLD = 'Noto Sans Medium'
const FONT_ITALIC = 'Noto Sans Italic'

/** Layers that need a sprite or carry sources needing their own credit. */
const DROPPED_LAYERS = new Set(['roads_oneway', 'roads_shields', 'pois', 'landcover'])

/** The `landuse_park` kinds drawn as green space; the rest of that layer stays land. */
const GREEN_KINDS = [
  'national_park',
  'park',
  'cemetery',
  'protected_area',
  'nature_reserve',
  'forest',
  'golf_course',
  'wood',
  'scrub',
  'grassland',
  'grass',
]

/** §1.5.9 pattern geometry, CSS px: 1 px hatch at a 6 px pitch; 1.25 px dots at 6 px. */
const HATCH_PITCH = 6
const DOT_PITCH = 6
const DOT_RADIUS = 0.625

/** The resolved, opaque colors and dimensions a style is built from. */
export interface Palette {
  ground: string
  tint: string
  hairline: string
  rule: string
  ink: string
  halo: string
  /** Water polygons and lines. */
  water: string
  /** The green-space dot ink. */
  green: string
  accent: string
  /** --border-size-2, px: routes and label halos. */
  stroke: number
  /** --ds-dash and --ds-dash-gap, px. */
  dash: number
  gap: number
  /** Water polygons take the 45° hatch instead of the fill (one ink, print). */
  hatchWater: boolean
}

let probe: CanvasRenderingContext2D | null | undefined

function probeContext(): CanvasRenderingContext2D | null {
  if (probe === undefined) {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    probe = canvas.getContext('2d', { willReadFrequently: true })
  }
  return probe
}

function hex(value: number): string {
  return value.toString(16).padStart(2, '0')
}

/**
 * Any CSS color the browser understands (hex, rgb, P3, oklch …), composited
 * over `under` and read back as opaque sRGB hex, which MapLibre parses. An
 * unparseable color yields `under`.
 */
export function opaque(color: string, under: string): string {
  const context = probeContext()
  if (!context) return under
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, 1, 1)
  context.fillStyle = under
  context.fillRect(0, 0, 1, 1)
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data
  return `#${hex(r)}${hex(g)}${hex(b)}`
}

/** Reads the palette from the role variables in effect on `root` [D158]. */
export function readPalette(root: Element, oneInk: boolean): Palette {
  const computed = getComputedStyle(root)
  const value = (name: string) => computed.getPropertyValue(name).trim()
  const length = (name: string, fallback: number) => {
    const parsed = parseFloat(value(name))
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
  }
  const ground = opaque(value('--role-ground') || '#ffffff', '#ffffff')
  const color = (name: string, fallback: string) => opaque(value(name) || fallback, ground)
  const ink = color('--primary12', '#000000')
  const hairline = color('--role-hairline', ink)
  return {
    ground,
    tint: color('--role-tint', ground),
    hairline,
    rule: color('--role-rule', ink),
    ink,
    halo: color('--role-halo', ground),
    water: oneInk ? hairline : color('--secondary5', hairline),
    green: oneInk ? ink : color('--secondary11', ink),
    accent: color('--role-accent', ink),
    stroke: length('--border-size-2', 2),
    dash: length('--ds-dash', 5),
    gap: length('--ds-dash-gap', 4),
    hatchWater: oneInk,
  }
}

/**
 * The print palette: the §1.11.6 remap (grounds, tints and the halo white;
 * every ink black), with water hatched as §8.10 prints it.
 */
export function printPalette(screen: Palette): Palette {
  const white = '#ffffff'
  const black = '#000000'
  return {
    ...screen,
    ground: white,
    tint: white,
    hairline: black,
    rule: black,
    ink: black,
    halo: white,
    water: black,
    green: black,
    accent: black,
    hatchWater: true,
  }
}

/** One opaque pattern tile for `Map#addImage`. */
export interface PatternImage {
  width: number
  height: number
  data: Uint8ClampedArray
}

function drawTile(
  size: number,
  ground: string,
  draw: (context: CanvasRenderingContext2D) => void
): PatternImage | null {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  if (!context) return null
  context.fillStyle = ground
  context.fillRect(0, 0, size, size)
  draw(context)
  return { width: size, height: size, data: context.getImageData(0, 0, size, size).data }
}

/**
 * The pattern tiles a palette needs, drawn at `pixelRatio`: the green-space
 * dot screen, and the 45° water hatch. Every pixel is opaque (marks
 * composited over the ground), so no transparency reaches the canvas.
 */
export function patternImages(palette: Palette, pixelRatio: number): Record<string, PatternImage> {
  const ids = patternIds(palette)
  const images: Record<string, PatternImage> = {}
  const dotSize = Math.round(DOT_PITCH * pixelRatio)
  const dots = drawTile(dotSize, palette.ground, (context) => {
    context.fillStyle = palette.green
    context.beginPath()
    context.arc(dotSize / 2, dotSize / 2, DOT_RADIUS * pixelRatio, 0, Math.PI * 2)
    context.fill()
  })
  if (dots) images[ids.green] = dots
  // A "/" line across a square tile of side pitch × √2 repeats at the pitch.
  const hatchSize = Math.round(HATCH_PITCH * Math.SQRT2 * pixelRatio)
  const hatch = drawTile(hatchSize, palette.ground, (context) => {
    context.strokeStyle = palette.ink
    context.lineWidth = pixelRatio
    context.beginPath()
    for (const offset of [-hatchSize, 0, hatchSize]) {
      context.moveTo(offset - 1, hatchSize + 1)
      context.lineTo(offset + hatchSize + 1, -1)
    }
    context.stroke()
  })
  if (hatch) images[ids.water] = hatch
  return images
}

function unquote(value: string): string {
  return value.trim().replace(/^(['"])(.*)\1$/, '$2')
}

/** The first family of a font-family list, e.g. `'Figtree Variable'` from --ds-font-ui. */
function firstFamily(list: string): string | null {
  const first = list.split(',')[0]
  return first ? unquote(first) || null : null
}

function firstUrl(src: string, base: string): string | null {
  const match = /url\(\s*(['"]?)([^'")]+)\1\s*\)/.exec(src)
  if (!match) return null
  try {
    return new URL(match[2], base).href
  } catch {
    return null
  }
}

let fontFacesCache: { key: string; value: FontFacesSpecification | undefined } | null = null

/**
 * Maps the basemap's font names to the files of the page's UI font
 * (--ds-font-ui), found in the document's @font-face rules, so labels draw
 * in it [D159]. Returns `undefined` when none is readable (cross-origin
 * sheets, fonts not loaded): labels then use the Protomaps glyphs.
 */
export function readFontFaces(root: Element): FontFacesSpecification | undefined {
  const family = firstFamily(getComputedStyle(root).getPropertyValue('--ds-font-ui'))
  if (!family) return undefined
  // Rescan only when the family or the set of loaded stylesheets changes.
  const key = `${family}|${document.styleSheets.length}`
  if (fontFacesCache?.key === key) return fontFacesCache.value
  const value = scanFontFaces(family)
  fontFacesCache = { key, value }
  return value
}

function scanFontFaces(family: string): FontFacesSpecification | undefined {
  const normal: MLFontFace[] = []
  const italic: MLFontFace[] = []
  const visit = (rules: CSSRuleList, base: string) => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSFontFaceRule) {
        if (unquote(rule.style.getPropertyValue('font-family')) !== family) continue
        const url = firstUrl(rule.style.getPropertyValue('src'), base)
        if (!url) continue
        const range = rule.style
          .getPropertyValue('unicode-range')
          .split(',')
          .map((entry) => entry.trim())
          .filter(Boolean)
        const face: MLFontFace = range.length ? { url, 'unicode-range': range } : { url }
        const style = rule.style.getPropertyValue('font-style').trim()
        ;(style.startsWith('italic') || style.startsWith('oblique') ? italic : normal).push(face)
      } else if (rule instanceof CSSImportRule) {
        const sheet = rule.styleSheet
        if (!sheet) continue
        try {
          visit(sheet.cssRules, sheet.href ?? base)
        } catch {
          // A cross-origin import: its rules are unreadable.
        }
      } else if ('cssRules' in rule) {
        visit((rule as CSSGroupingRule).cssRules, base)
      }
    }
  }
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      visit(sheet.cssRules, sheet.href ?? document.baseURI)
    } catch {
      // A cross-origin stylesheet: its rules are unreadable.
    }
  }
  if (!normal.length) return undefined
  return {
    [FONT_REGULAR]: normal,
    [FONT_BOLD]: normal,
    [FONT_ITALIC]: italic.length ? italic : normal,
  }
}

/** The basemap flavor in role colors: land tint, ground road faces, hairline and rule edges. */
function flavorOf(p: Palette): Flavor {
  const { ground: G, tint: T, hairline: H, rule: R, ink: I, halo } = p
  return {
    background: G,
    earth: T,
    park_a: G,
    park_b: G,
    wood_a: G,
    wood_b: G,
    scrub_a: G,
    scrub_b: G,
    hospital: T,
    industrial: T,
    school: T,
    glacier: T,
    sand: T,
    beach: T,
    aerodrome: T,
    zoo: T,
    military: T,
    pedestrian: G,
    runway: H,
    water: p.water,
    tunnel_other_casing: H,
    tunnel_minor_casing: H,
    tunnel_link_casing: H,
    tunnel_major_casing: R,
    tunnel_highway_casing: R,
    tunnel_other: T,
    tunnel_minor: T,
    tunnel_link: T,
    tunnel_major: T,
    tunnel_highway: T,
    pier: G,
    buildings: G,
    minor_service_casing: H,
    minor_casing: H,
    link_casing: H,
    major_casing_late: R,
    highway_casing_late: R,
    other: H,
    minor_service: G,
    minor_a: G,
    minor_b: G,
    link: G,
    major_casing_early: R,
    major: G,
    highway_casing_early: R,
    highway: G,
    railway: R,
    boundaries: R,
    bridges_other_casing: H,
    bridges_minor_casing: H,
    bridges_link_casing: H,
    bridges_major_casing: R,
    bridges_highway_casing: R,
    bridges_other: H,
    bridges_minor: G,
    bridges_link: G,
    bridges_major: G,
    bridges_highway: G,
    roads_label_minor: I,
    roads_label_minor_halo: halo,
    roads_label_major: I,
    roads_label_major_halo: halo,
    ocean_label: I,
    subplace_label: I,
    subplace_label_halo: halo,
    city_label: I,
    city_label_halo: halo,
    state_label: I,
    state_label_halo: halo,
    country_label: I,
    address_label: I,
    address_label_halo: halo,
  }
}

interface LooseLayer {
  id: string
  type: string
  source?: string
  filter?: unknown
  layout?: Record<string, unknown>
  paint?: Record<string, unknown>
  [key: string]: unknown
}

/** Strips transparency, shadows and icons, and applies the §8.10 area encodings. */
function restyle(source: LooseLayer, p: Palette): LooseLayer | null {
  if (DROPPED_LAYERS.has(source.id)) return null
  const ids = patternIds(p)
  const paint: Record<string, unknown> = { ...source.paint }
  for (const key of Object.keys(paint)) {
    if (key.endsWith('-opacity') || key.endsWith('-blur') || key.endsWith('-translate')) {
      delete paint[key]
    }
  }
  // Every label sits on a --border-size-2 --role-halo knockout (§8.10).
  if ('text-halo-color' in paint) {
    paint['text-halo-color'] = p.halo
    paint['text-halo-width'] = p.stroke
  }
  const layer: LooseLayer = { ...source, paint }
  if (source.layout) {
    const layout: Record<string, unknown> = { ...source.layout }
    for (const key of Object.keys(layout)) if (key.startsWith('icon-')) delete layout[key]
    layer.layout = layout
  }
  switch (source.id) {
    case 'landuse_park':
      layer.filter = ['in', ['get', 'kind'], ['literal', GREEN_KINDS]]
      delete paint['fill-color']
      paint['fill-pattern'] = ids.green
      break
    case 'landuse_urban_green':
      delete paint['fill-color']
      paint['fill-pattern'] = ids.green
      break
    case 'buildings':
      paint['fill-outline-color'] = p.hairline
      break
    case 'water':
      if (p.hatchWater) {
        delete paint['fill-color']
        paint['fill-pattern'] = ids.water
      }
      break
    default:
      break
  }
  return layer
}

function routeLayers(p: Palette): LooseLayer[] {
  // line-dashed: dash and gap measured with round caps, in line widths.
  const dasharray = [Math.max(0, p.dash - p.stroke) / p.stroke, (p.gap + p.stroke) / p.stroke]
  const line = (id: string, alternate: boolean, color: string): LooseLayer => ({
    id,
    type: 'line',
    source: ROUTES,
    filter: alternate ? ['==', ['get', 'alternate'], true] : ['!=', ['get', 'alternate'], true],
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': color, 'line-width': p.stroke, 'line-dasharray': dasharray },
  })
  return [line('fg-route-alternate', true, p.ink), line('fg-route', false, p.accent)]
}

function routeData(routes: readonly MapRoute[]) {
  return {
    type: 'FeatureCollection' as const,
    features: routes.map((route) => ({
      type: 'Feature' as const,
      properties: { id: route.id, alternate: route.alternate === true },
      geometry: {
        type: 'LineString' as const,
        coordinates: route.points.map(([lon, lat]) => [lon, lat]),
      },
    })),
  }
}

/** What a style is built from, besides the basemap module. */
export interface StyleInput {
  url: string
  glyphs: string
  lang: string
  palette: Palette
  fontFaces: FontFacesSpecification | undefined
  routes: readonly MapRoute[]
}

/** Builds the MapLibre style: the Protomaps layers in role colors, plus the routes. */
export function buildStyle(basemaps: Basemaps, input: StyleInput): StyleSpecification {
  const base = basemaps.layers(SOURCE, flavorOf(input.palette), {
    lang: input.lang,
  }) as unknown as LooseLayer[]
  const layers: LooseLayer[] = []
  for (const layer of base) {
    const next = restyle(layer, input.palette)
    if (next) layers.push(next)
  }
  // Routes sit over the roads and under every label.
  const firstSymbol = layers.findIndex((layer) => layer.type === 'symbol')
  layers.splice(firstSymbol < 0 ? layers.length : firstSymbol, 0, ...routeLayers(input.palette))
  const style: StyleSpecification = {
    version: 8,
    glyphs: input.glyphs,
    sources: {
      [SOURCE]: { type: 'vector', url: `pmtiles://${input.url}` },
      [ROUTES]: { type: 'geojson', data: routeData(input.routes) },
    },
    layers: layers as unknown as LayerSpecification[],
  }
  if (input.fontFaces) style['font-faces'] = input.fontFaces
  return style
}
