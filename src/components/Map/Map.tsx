'use client'

import * as React from 'react'
import { flushSync } from 'react-dom'
import { Toolbar } from '@base-ui/react/toolbar'
import { cva, type VariantProps } from 'class-variance-authority'

import { Accordion, AccordionItem } from '../Accordion'
import { Button } from '../Button'
import { Figure, FigureCaption, FigureMedia } from '../Figure'
import type { IconName } from '../Icon'
import { Tooltip, TooltipPopup, TooltipProvider, TooltipTrigger } from '../Tooltip'
import { cx } from '../../utils/className'
import { primaryScaleVariants, secondaryScaleVariants } from '../../utils/scales'
import { useScopeAttributes } from '../../utils/scope'
import {
  PatternDefs,
  patternId,
  safeId,
  type PatternClassNames,
} from '../../utils/seriesPatterns'
import { useColorScheme } from '../../utils/useColorScheme'
import { Link } from '../Link'
import { MapCanvas } from './MapCanvas'
import type { MapPmtiles, MapRoute } from './types'
import styles from './map.module.css'

export type { MapPmtiles, MapRoute } from './types'

/*
 * Map (§8.10) [D169, D191]: a map figure with an in-flow zoom Toolbar and an
 * index, as a progressive enhancement over the static map. The base is
 * either an SVG drawing in role variables (it follows the mode and prints as
 * black line through the remap) or a vector map: OpenStreetMap data in a
 * Protomaps PMTiles archive, drawn by MapLibre GL JS (loaded on demand) with
 * a style built from the role variables at runtime, a non-CSS consumer that
 * rebuilds on mode and scope changes through useColorScheme [D158]. Only the
 * canvas is MapLibre's: the view, markers, labels and controls are ours.
 *
 * Implementation (CSS Modules + CVA)
 * - Module: map.module.css; CVA function `map`.
 * - Axes: `kind` → technical | location (the frame: technical
 *   --ds-radius-none with a --border-size-1 --role-rule frame; location
 *   --ds-radius-20 with a --border-size-2 --primary12 frame and a text
 *   address); `primary`, `secondary` → scales module classes.
 * - Compound variants: none.
 * - Defaults: kind technical; color axes: none.
 * - Color fallback: inherits the scope.
 * - States: frame `:focus-visible` → the ring; frame `data-dragging` → the
 *   grabbing cursor; marker `:hover` → edge up one tier, `aria-pressed`
 *   (selected, its index entry open) → the inverse pair, `:focus-visible` →
 *   the ring; zoom Buttons are outline icon-only Buttons with Button's D181
 *   hover (the --role-soft-hover fill, the glyph at its interactive weight)
 *   and `data-disabled` at the ends, per §9.2.
 * - Parts: base, layout, media (the FigureMedia), title, toolbar,
 *   zoomLevel, frame, canvas (MapLibre's container), snapshot (the print
 *   image), drawing, drawingContent, overlay, marker (+ markerSquare,
 *   markerDiamond, markerNumber), label, attribution, address, index,
 *   indexGroup, indexHead, indexTitle, indexNumber, instructions, fallback,
 *   printNote, printUrl, printQr; the drawing kit's line classes. The
 *   caption is the Figure's FigureCaption (§8.5).
 * - Scope: none. Container: `base`, named `map` (the Figure inside is a
 *   container too): the map, then the index; side by side 2:1 from 1024 px
 *   (§5.10.2).
 *
 * Zoom steps are discrete and announced; the map pans by drag or the arrow
 * keys, zooms by the toolbar, + and − or a pinch; the wheel never captures
 * page scroll and one finger scrolls the page. Markers, labels, strokes and
 * pattern pitches keep their screen size at every zoom [I7]. Changes are
 * instant. Print shows the reset extent, the index and the URL; a vector
 * map prints a snapshot rendered ahead of time in the print palette (or
 * `printFallback`) and its credit with the copyright URL.
 */
export const map = cva(styles.base, {
  variants: {
    kind: {
      technical: styles.technical,
      location: styles.location,
    },
    // Color axes: never defaulted, so an omitted prop inherits the scope [D133].
    primary: primaryScaleVariants,
    secondary: secondaryScaleVariants,
  },
  defaultVariants: {
    kind: 'technical',
  },
})

type MapVariants = VariantProps<typeof map>

/** Index marker shapes (§8.10): categories are told apart by shape and index group, never by color. */
export type MapMarkerShape = 'circle' | 'square' | 'diamond'

/** A place on the map: a numbered index marker and its index entry. */
export interface MapMarker {
  /** Stable id, used for selection. */
  id: string
  /** The place's name: the index entry title and the marker's accessible name. */
  name: string
  /** Drawing maps: the position in drawing units. */
  x?: number
  /** Drawing maps: the position in drawing units. */
  y?: number
  /** Vector (PMTiles) maps: longitude in degrees. */
  lon?: number
  /** Vector (PMTiles) maps: latitude in degrees. */
  lat?: number
  /** The index group head (a category), e.g. "Gardens". */
  group?: string
  /** The marker's category shape. Default `circle`. */
  shape?: MapMarkerShape
  /** Details shown when the entry is selected, in the index; printed expanded. */
  details?: React.ReactNode
}

/** A live text label on the map, kept at screen size on a halo plate. */
export interface MapLabel {
  /** Stable id. */
  id: string
  /** The label text, e.g. "Lake". */
  text: string
  /** Drawing maps: the label's center in drawing units. */
  x?: number
  /** Drawing maps: the label's center in drawing units. */
  y?: number
  /** Vector (PMTiles) maps: longitude in degrees. */
  lon?: number
  /** Vector (PMTiles) maps: latitude in degrees. */
  lat?: number
}

/** The §8.10 encodings a drawing uses: pattern fills and line classes, unique to this map. */
export interface MapDrawingKit {
  /**
   * Area fills as `url(#…)` strings for a shape's `fill`: `water` (hatch
   * 45° in --primary12), `green` (dot screen 1.25 px at 6 px in the odd slot
   * ink), `planned` (hatch 135°, always with a label). Add `line.area` for
   * the shape's --border-size-1 --primary12 edge.
   */
  fill: { water: string; green: string; planned: string }
  /**
   * Classes for strokes and outlines: `boundary` (line-solid 1 px),
   * `subdivision` (line-dotted-fine), `road` / `street` / `path` (solid 2 /
   * 1.5 / 1 px), `building` (ground face, 1 px outline), `area` (the edge of
   * a patterned area), `route` (line-dashed in --role-accent), `altRoute`
   * (line-dashed in --primary12). Strokes never scale with zoom.
   */
  line: {
    boundary: string
    subdivision: string
    road: string
    street: string
    path: string
    building: string
    area: string
    route: string
    altRoute: string
  }
}

/** A drawn base map: an SVG drawing in its own units, in role variables. */
export interface MapDrawing {
  /** The drawing's width in its own units; with `height`, the frame's aspect ratio. */
  width: number
  /** The drawing's height in its own units. */
  height: number
  /**
   * Draws the map's SVG content in drawing units, using the kit's fills and
   * line classes and role-variable strokes. Put text in `labels`, not here,
   * so it keeps its size when zoomed.
   */
  render: (kit: MapDrawingKit) => React.ReactNode
  /** The reset zoom step. Default 0, the whole drawing. */
  zoom?: number
  /** The deepest zoom step; each step doubles the scale. Default 3. */
  maxZoom?: number
  /** The reset center in drawing units. Default: the drawing's center. */
  center?: readonly [number, number]
}

/** Interface strings, for localization. */
export interface MapMessages {
  /** Default "Zoom in". */
  zoomIn: string
  /** Default "Zoom out". */
  zoomOut: string
  /** Default "Reset map view". */
  reset: string
  /** The toolbar's accessible name. Default "Map controls". */
  toolbar: string
  /** How to operate the map, read with the frame. */
  instructions: string
  /** The announced zoom step. Default "Zoom 2 of 4". */
  zoomStatus: (level: number, levels: number) => string
  /** The index's accessible name. Default "Index". */
  index: string
}

const defaultMessages: MapMessages = {
  zoomIn: 'Zoom in',
  zoomOut: 'Zoom out',
  reset: 'Reset map view',
  toolbar: 'Map controls',
  instructions:
    'Drag or use the arrow keys to pan; press plus or minus to zoom. The index lists every place.',
  zoomStatus: (level, levels) => `Zoom ${level} of ${levels}`,
  index: 'Index',
}

type HeadingLevel = 2 | 3 | 4 | 5 | 6

/** Props for Map: `div` props plus the base map, the markers, the figure text and the print extras. */
export type MapProps = Omit<React.ComponentPropsWithRef<'div'>, 'children' | 'title'> & {
  /**
   * `technical` (default): --ds-radius-none, a --border-size-1 --role-rule
   * frame. `location`: --ds-radius-20, a --border-size-2 --primary12 frame,
   * always with a mixed-case `address`.
   */
  kind?: MapVariants['kind']
  /** The caps title above the map, with "(DETAIL)" for crops; also the frame's accessible name. */
  title: string
  /** The caption below the map: what to notice. */
  caption?: React.ReactNode
  /** The figure label, e.g. "Fig. 4". */
  figureLabel?: React.ReactNode
  /** The text address, mixed case; required with `kind="location"`. */
  address?: React.ReactNode
  /** A drawn base map. Pass `drawing` or `pmtiles`. */
  drawing?: MapDrawing
  /**
   * A vector base map: a Protomaps PMTiles archive drawn by MapLibre GL JS
   * in the role variables. Pass `drawing` or `pmtiles`. Needs the optional
   * peers `maplibre-gl`, `pmtiles` and `@protomaps/basemaps`, and MapLibre's
   * worker URL under bundlers (`pmtiles.workerUrl`).
   */
  pmtiles?: MapPmtiles
  /** Routes over a vector base map (a drawing draws its own with `kit.line.route`). */
  routes?: readonly MapRoute[]
  /** The places, numbered in this order (01, 02 …) and listed in the index. */
  markers?: readonly MapMarker[]
  /** Live text labels (areas, water) at screen size. */
  labels?: readonly MapLabel[]
  /** The selected marker's id (controlled). */
  selected?: string | null
  /** The initially selected marker's id. */
  defaultSelected?: string | null
  /** Called when the selection changes, from a marker or the index. */
  onSelectedChange?: (id: string | null) => void
  /** Heading level of the index entries. Default 3. */
  headingLevel?: HeadingLevel
  /**
   * The static figure printed instead of the live base, e.g. a black-line
   * export at the reset extent. Without it, a drawing prints at its reset
   * extent, and a vector map prints a snapshot of its reset extent in the
   * print palette, rendered once the map settles.
   */
  printFallback?: React.ReactNode
  /** The map's URL, printed in `type-url` beside the QR code [D168]. */
  url?: string
  /** A QR code for `url` as inline SVG, printed at --ds-print-qr beside the URL, never instead of it. */
  qr?: React.ReactNode
  /**
   * One ink: area patterns in --primary12 (a vector map also hatches its
   * water). Pass it on any ground but a light base or a `white` plate
   * (§8.10). Default `false`.
   */
  oneInk?: boolean
  /** Primary Radix scale: lines, markers, labels. Never defaulted [D133]. */
  primary?: MapVariants['primary']
  /** Secondary Radix scale: odd-slot area patterns. Never defaulted [D133]. */
  secondary?: MapVariants['secondary']
  /** Interface strings. */
  messages?: Partial<MapMessages>
}

/** A view: the center in normalized units (0–1 across the base) and a zoom step. */
interface View {
  u: number
  v: number
  zoom: number
}

interface Size {
  width: number
  height: number
}

type Mode = 'drawing' | 'pmtiles'

/** Pan step for an arrow key, --size-px-9. */
const PAN_STEP = 64
/** Pointer travel before a press becomes a drag. */
const DRAG_THRESHOLD = 4
/** Pinch ratio that takes one zoom step. */
const PINCH_STEP = 1.4
/** MapLibre's world at zoom 0, px: vector maps position in 512 px tiles. */
const WORLD_TILE = 512
/** Keep a panned-to marker this far inside the frame edge. */
const MARKER_MARGIN = 32
/** The Web Mercator latitude limit. */
const MAX_LATITUDE = 85.05112878

const patternClassNames: PatternClassNames = {
  mark: styles.patternMark,
  dot: styles.patternDot,
  ground: styles.patternGround,
}

const markerShapeClass: Record<MapMarkerShape, string | undefined> = {
  circle: undefined,
  square: styles.markerSquare,
  diamond: styles.markerDiamond,
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function lonToU(lon: number): number {
  return (lon + 180) / 360
}

function latToV(lat: number): number {
  const phi = (clamp(lat, -MAX_LATITUDE, MAX_LATITUDE) * Math.PI) / 180
  return (1 - Math.log(Math.tan(phi) + 1 / Math.cos(phi)) / Math.PI) / 2
}

function uToLon(u: number): number {
  return u * 360 - 180
}

function vToLat(v: number): number {
  return (Math.atan(Math.sinh(Math.PI * (1 - 2 * v))) * 180) / Math.PI
}

function pad(value: number, digits: number): string {
  return String(value).padStart(digits, '0')
}

/** Keeps the view inside the base: a half-window from each edge, or centered when it fits. */
function clampView(view: View, mode: Mode, size: Size, tileSize: number): View {
  const scale = 2 ** view.zoom
  const world = tileSize * scale
  const halfU = mode === 'drawing' ? 0.5 / scale : size.width / 2 / world
  const halfV = mode === 'drawing' ? 0.5 / scale : size.height / 2 / world
  const fit = (value: number, half: number) =>
    half >= 0.5 ? 0.5 : clamp(value, half, 1 - half)
  return { zoom: view.zoom, u: fit(view.u, halfU), v: fit(view.v, halfV) }
}

/** Screen px per normalized unit, across and down. */
function pixelsPerUnit(mode: Mode, zoom: number, size: Size, tileSize: number): [number, number] {
  const scale = 2 ** zoom
  return mode === 'drawing'
    ? [size.width * scale, size.height * scale]
    : [tileSize * scale, tileSize * scale]
}

/**
 * The minimal credit the tiles need: "© OpenStreetMap", its name linked to
 * the copyright page, whose URL Link prints beside it (§7.6.1). Protomaps
 * asks for no credit, and MapLibre (BSD) needs none on the map.
 */
function OsmCredit() {
  return (
    <>
      {'© '}
      <Link href="https://www.openstreetmap.org/copyright" muted>
        OpenStreetMap
      </Link>
    </>
  )
}

interface ToolButtonProps {
  icon: IconName
  label: string
  disabled: boolean
  onClick: () => void
}

/** One zoom control: an icon-only Button (tag-tier glyph) in the Toolbar, named, with a Tooltip. */
function ToolButton({ icon, label, disabled, onClick }: ToolButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Toolbar.Button
            disabled={disabled}
            onClick={onClick}
            render={
              <Button variant="outline" iconOnly size="lg" icon={icon} focusableWhenDisabled>
                {label}
              </Button>
            }
          />
        }
      />
      <TooltipPopup side="bottom">{label}</TooltipPopup>
    </Tooltip>
  )
}

/**
 * A map figure (§8.10) with the pan-and-zoom interactive map of v1 [D169]:
 * a caps title, an in-flow Toolbar (zoom in, zoom out, reset view), the
 * framed map with numbered index markers, the caption, and the index, an
 * Accordion that is the complete non-visual route to every place.
 * Selecting an index entry pans its marker into view and opens its
 * details; selecting a marker opens its entry. Print shows the static map
 * at the reset extent (or `printFallback`), the full index, and the URL
 * beside its QR code.
 */
export function Map(props: MapProps) {
  const {
    kind,
    title,
    caption,
    figureLabel,
    address,
    drawing,
    pmtiles,
    routes = [],
    markers = [],
    labels = [],
    selected,
    defaultSelected = null,
    onSelectedChange,
    headingLevel = 3,
    printFallback,
    url,
    qr,
    oneInk = false,
    primary,
    secondary,
    messages,
    className,
    style,
    ...rest
  } = props

  const scope = useScopeAttributes()
  const id = safeId(React.useId(), 'map')
  const text = { ...defaultMessages, ...messages }
  const frameRef = React.useRef<HTMLDivElement>(null)
  const scheme = useColorScheme(frameRef)

  // The base, reduced to primitives so callbacks stay stable.
  const mode: Mode = pmtiles ? 'pmtiles' : 'drawing'
  const tileSize = WORLD_TILE
  const drawingWidth = drawing?.width ?? 1
  const drawingHeight = drawing?.height ?? 1
  const minZoom = pmtiles ? (pmtiles.minZoom ?? Math.max(0, pmtiles.zoom - 3)) : 0
  const maxZoom = Math.max(
    minZoom,
    pmtiles ? (pmtiles.maxZoom ?? Math.min(19, pmtiles.zoom + 4)) : (drawing?.maxZoom ?? 3)
  )
  const resetZoom = clamp(pmtiles ? pmtiles.zoom : (drawing?.zoom ?? 0), minZoom, maxZoom)
  const resetU = pmtiles
    ? lonToU(pmtiles.center[0])
    : drawing?.center
      ? drawing.center[0] / drawingWidth
      : 0.5
  const resetV = pmtiles
    ? latToV(pmtiles.center[1])
    : drawing?.center
      ? drawing.center[1] / drawingHeight
      : 0.5
  const ratio = pmtiles ? (pmtiles.ratio ?? 3 / 2) : drawingWidth / drawingHeight

  const [view, setView] = React.useState<View>({ u: resetU, v: resetV, zoom: resetZoom })
  const [size, setSize] = React.useState<Size>({ width: 0, height: 0 })
  const [printing, setPrinting] = React.useState(false)
  const [dragging, setDragging] = React.useState(false)
  const [snapshotReady, setSnapshotReady] = React.useState(false)
  const [innerSelected, setInnerSelected] = React.useState<string | null>(defaultSelected)
  const current = selected !== undefined ? selected : innerSelected
  const drag = React.useRef<{ pointer: number; x: number; y: number; moved: boolean } | null>(null)

  const select = React.useCallback(
    (next: string | null) => {
      if (selected === undefined) setInnerSelected(next)
      onSelectedChange?.(next)
    },
    [selected, onSelectedChange]
  )

  const pointOf = React.useCallback(
    (item: { x?: number; y?: number; lon?: number; lat?: number }) => {
      if (mode === 'pmtiles') {
        return item.lon == null || item.lat == null
          ? null
          : { u: lonToU(item.lon), v: latToV(item.lat) }
      }
      return item.x == null || item.y == null
        ? null
        : { u: item.x / drawingWidth, v: item.y / drawingHeight }
    },
    [mode, drawingWidth, drawingHeight]
  )

  const panBy = React.useCallback(
    (dx: number, dy: number) => {
      setView((previous) => {
        const [perU, perV] = pixelsPerUnit(mode, previous.zoom, size, tileSize)
        if (!perU || !perV) return previous
        return clampView(
          { zoom: previous.zoom, u: previous.u - dx / perU, v: previous.v - dy / perV },
          mode,
          size,
          tileSize
        )
      })
    },
    [mode, size, tileSize]
  )

  const zoomBy = React.useCallback(
    (step: number) => {
      setView((previous) => {
        const zoom = clamp(previous.zoom + step, minZoom, maxZoom)
        return zoom === previous.zoom
          ? previous
          : clampView({ ...previous, zoom }, mode, size, tileSize)
      })
    },
    [minZoom, maxZoom, mode, size, tileSize]
  )

  const reset = React.useCallback(() => {
    setView(clampView({ u: resetU, v: resetV, zoom: resetZoom }, mode, size, tileSize))
  }, [resetU, resetV, resetZoom, mode, size, tileSize])

  /** Pans a marker into view unless it already is, keeping the zoom step. */
  const panTo = React.useCallback(
    (marker: MapMarker) => {
      const point = pointOf(marker)
      if (!point) return
      setView((previous) => {
        const [perU, perV] = pixelsPerUnit(mode, previous.zoom, size, tileSize)
        const inView =
          Math.abs((point.u - previous.u) * perU) <= size.width / 2 - MARKER_MARGIN &&
          Math.abs((point.v - previous.v) * perV) <= size.height / 2 - MARKER_MARGIN
        return inView
          ? previous
          : clampView({ zoom: previous.zoom, u: point.u, v: point.v }, mode, size, tileSize)
      })
    },
    [pointOf, mode, size, tileSize]
  )

  // The frame's size: snapshot cover, drawing pattern scale, pan conversions.
  React.useEffect(() => {
    const node = frameRef.current
    if (!node) return undefined
    const update = () => setSize({ width: node.clientWidth, height: node.clientHeight })
    update()
    const observer = new ResizeObserver(update)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  // Print shows the reset extent, never the reader's view.
  React.useEffect(() => {
    const before = () => flushSync(() => setPrinting(true))
    const after = () => setPrinting(false)
    window.addEventListener('beforeprint', before)
    window.addEventListener('afterprint', after)
    return () => {
      window.removeEventListener('beforeprint', before)
      window.removeEventListener('afterprint', after)
    }
  }, [])

  // Two fingers pan and pinch in zoom steps; one finger scrolls the page.
  React.useEffect(() => {
    const node = frameRef.current
    if (!node) return undefined
    let last: { x: number; y: number } | null = null
    let pinchBase = 0
    const read = (event: TouchEvent) => {
      const [a, b] = [event.touches[0], event.touches[1]]
      return {
        x: (a.clientX + b.clientX) / 2,
        y: (a.clientY + b.clientY) / 2,
        distance: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY),
      }
    }
    const start = (event: TouchEvent) => {
      if (event.touches.length !== 2) return
      const reading = read(event)
      last = reading
      pinchBase = reading.distance
    }
    const move = (event: TouchEvent) => {
      if (event.touches.length !== 2 || !last) return
      event.preventDefault()
      const reading = read(event)
      panBy(reading.x - last.x, reading.y - last.y)
      last = reading
      if (pinchBase > 0 && reading.distance / pinchBase >= PINCH_STEP) {
        zoomBy(1)
        pinchBase = reading.distance
      } else if (pinchBase > 0 && pinchBase / reading.distance >= PINCH_STEP) {
        zoomBy(-1)
        pinchBase = reading.distance
      }
    }
    const end = (event: TouchEvent) => {
      if (event.touches.length < 2) last = null
    }
    node.addEventListener('touchstart', start, { passive: true })
    node.addEventListener('touchmove', move, { passive: false })
    node.addEventListener('touchend', end)
    node.addEventListener('touchcancel', end)
    return () => {
      node.removeEventListener('touchstart', start)
      node.removeEventListener('touchmove', move)
      node.removeEventListener('touchend', end)
      node.removeEventListener('touchcancel', end)
    }
  }, [panBy, zoomBy])

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case 'ArrowLeft':
        panBy(PAN_STEP, 0)
        break
      case 'ArrowRight':
        panBy(-PAN_STEP, 0)
        break
      case 'ArrowUp':
        panBy(0, PAN_STEP)
        break
      case 'ArrowDown':
        panBy(0, -PAN_STEP)
        break
      case '+':
      case '=':
        zoomBy(1)
        break
      case '-':
      case '_':
        zoomBy(-1)
        break
      default:
        return
    }
    event.preventDefault()
  }

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch' || event.button !== 0) return
    drag.current = { pointer: event.pointerId, x: event.clientX, y: event.clientY, moved: false }
  }

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = drag.current
    if (!state || state.pointer !== event.pointerId) return
    const dx = event.clientX - state.x
    const dy = event.clientY - state.y
    if (!state.moved) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return
      state.moved = true
      event.currentTarget.setPointerCapture(event.pointerId)
      setDragging(true)
    }
    state.x = event.clientX
    state.y = event.clientY
    panBy(dx, dy)
  }

  const onPointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = drag.current
    if (!state || state.pointer !== event.pointerId) return
    drag.current = null
    if (state.moved) {
      setDragging(false)
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId)
      }
    }
  }

  // What renders: the reset extent while printing, always inside the base.
  const shown = clampView(
    printing ? { u: resetU, v: resetV, zoom: resetZoom } : view,
    mode,
    size,
    tileSize
  )
  const scale = 2 ** shown.zoom
  const position = (u: number, v: number): React.CSSProperties =>
    mode === 'drawing'
      ? {
          left: `${((u - shown.u) * scale + 0.5) * 100}%`,
          top: `${((v - shown.v) * scale + 0.5) * 100}%`,
        }
      : {
          left: `calc(50% + ${(u - shown.u) * tileSize * scale}px)`,
          top: `calc(50% + ${(v - shown.v) * tileSize * scale}px)`,
        }

  const kit = React.useMemo<MapDrawingKit>(
    () => ({
      fill: {
        water: `url(#${patternId(id, 'water')})`,
        green: `url(#${patternId(id, 'green')})`,
        planned: `url(#${patternId(id, 'planned')})`,
      },
      line: {
        boundary: styles.boundary,
        subdivision: styles.subdivision,
        road: styles.road,
        street: styles.street,
        path: styles.path,
        building: styles.building,
        area: styles.area,
        route: styles.route,
        altRoute: styles.altRoute,
      },
    }),
    [id]
  )

  const digits = Math.max(2, String(markers.length).length)
  const numbered = markers.map((marker, index) => ({
    marker,
    number: pad(index + 1, digits),
    entryId: `${id}-entry-${index + 1}`,
  }))

  const groups: Array<{ name?: string; entries: typeof numbered }> = []
  numbered.forEach((entry) => {
    const found = groups.find((group) => group.name === entry.marker.group)
    if (found) found.entries.push(entry)
    else groups.push({ name: entry.marker.group, entries: [entry] })
  })

  const selectFromMap = (entry: (typeof numbered)[number]) => {
    const next = current === entry.marker.id ? null : entry.marker.id
    select(next)
    if (next) document.getElementById(entry.entryId)?.scrollIntoView({ block: 'nearest' })
  }

  const selectFromIndex = (values: readonly string[], entries: typeof numbered) => {
    const next = values[values.length - 1]
    if (next) {
      select(next)
      const entry = entries.find((item) => item.marker.id === next)
      if (entry) panTo(entry.marker)
    } else if (entries.some((item) => item.marker.id === current)) {
      select(null)
    }
  }

  const instructionsId = `${id}-instructions`
  const levels = maxZoom - minZoom + 1
  const frameStyle = { '--map-ratio': ratio } as React.CSSProperties

  return (
    <div
      {...rest}
      {...scope}
      style={style}
      className={map({
        kind,
        primary,
        secondary,
        className: cx(printFallback != null && styles.hasFallback, className) || undefined,
      })}
    >
      <div className={cx(styles.layout, markers.length > 0 && styles.withIndex)}>
        <Figure kind="technical">
          <FigureMedia className={styles.media}>
            <p className={styles.title}>{title}</p>
            <TooltipProvider>
              <Toolbar.Root className={styles.toolbar} aria-label={text.toolbar}>
                <ToolButton
                  icon="zoom_in"
                  label={text.zoomIn}
                  disabled={view.zoom >= maxZoom}
                  onClick={() => zoomBy(1)}
                />
                <ToolButton
                  icon="zoom_out"
                  label={text.zoomOut}
                  disabled={view.zoom <= minZoom}
                  onClick={() => zoomBy(-1)}
                />
                <ToolButton icon="recenter" label={text.reset} disabled={false} onClick={reset} />
                <output className={styles.zoomLevel} aria-live="polite">
                  {text.zoomStatus(view.zoom - minZoom + 1, levels)}
                </output>
              </Toolbar.Root>
            </TooltipProvider>
            <div
              ref={frameRef}
              className={styles.frame}
              style={frameStyle}
              role="region"
              aria-roledescription="map"
              aria-label={title}
              aria-describedby={instructionsId}
              tabIndex={0}
              data-dragging={dragging ? '' : undefined}
              data-print-empty={pmtiles && printFallback == null && !snapshotReady ? '' : undefined}
              onKeyDown={onKeyDown}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerEnd}
              onPointerCancel={onPointerEnd}
            >
              {pmtiles ? (
                <MapCanvas
                  source={pmtiles}
                  center={[uToLon(shown.u), vToLat(shown.v)]}
                  zoom={shown.zoom}
                  resetCenter={pmtiles.center}
                  resetZoom={resetZoom}
                  routes={routes}
                  oneInk={oneInk}
                  rootRef={frameRef}
                  themeKey={`${scheme} ${primary ?? ''} ${secondary ?? ''}`}
                  width={size.width}
                  height={size.height}
                  ratio={ratio}
                  snapshot={printFallback == null}
                  onSnapshotChange={setSnapshotReady}
                />
              ) : null}
              {drawing ? (
                <svg
                  className={styles.drawing}
                  viewBox={`${(shown.u - 0.5 / scale) * drawingWidth} ${
                    (shown.v - 0.5 / scale) * drawingHeight
                  } ${drawingWidth / scale} ${drawingHeight / scale}`}
                  preserveAspectRatio="xMidYMid meet"
                  aria-hidden="true"
                  focusable="false"
                >
                  <PatternDefs
                    prefix={id}
                    oneInk={oneInk}
                    map
                    scale={size.width ? drawingWidth / (size.width * scale) : 1}
                    classNames={patternClassNames}
                  />
                  <g className={styles.drawingContent}>{drawing.render(kit)}</g>
                </svg>
              ) : null}
              <div className={styles.overlay}>
                {labels.map((label) => {
                  const point = pointOf(label)
                  return point ? (
                    <span
                      key={label.id}
                      className={styles.label}
                      style={position(point.u, point.v)}
                      aria-hidden="true"
                    >
                      {label.text}
                    </span>
                  ) : null
                })}
                {numbered.map((entry) => {
                  const point = pointOf(entry.marker)
                  if (!point) return null
                  return (
                    <button
                      key={entry.marker.id}
                      type="button"
                      tabIndex={-1}
                      className={cx(styles.marker, markerShapeClass[entry.marker.shape ?? 'circle'])}
                      style={position(point.u, point.v)}
                      aria-label={`${entry.number} ${entry.marker.name}`}
                      aria-pressed={current === entry.marker.id}
                      onClick={() => selectFromMap(entry)}
                    >
                      <span className={styles.markerNumber} aria-hidden="true">
                        {entry.number}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
            {printFallback != null ? <div className={styles.fallback}>{printFallback}</div> : null}
            {pmtiles ? (
              <p className={styles.attribution}>{pmtiles.attribution ?? <OsmCredit />}</p>
            ) : null}
            {address != null ? <p className={styles.address}>{address}</p> : null}
          </FigureMedia>
          {caption != null || figureLabel != null ? (
            <FigureCaption label={figureLabel}>{caption}</FigureCaption>
          ) : null}
        </Figure>
        {markers.length > 0 ? (
          <section className={styles.index} aria-label={text.index}>
            {groups.map((group, groupIndex) => (
              <div key={group.name ?? `group-${groupIndex}`} className={styles.indexGroup}>
                {group.name ? <p className={styles.indexHead}>{group.name}</p> : null}
                <Accordion
                  multiple={false}
                  value={
                    current != null && group.entries.some((entry) => entry.marker.id === current)
                      ? [current]
                      : []
                  }
                  onValueChange={(values) => selectFromIndex(values as string[], group.entries)}
                >
                  {group.entries.map((entry) => (
                    <AccordionItem
                      key={entry.marker.id}
                      id={entry.entryId}
                      value={entry.marker.id}
                      headingLevel={headingLevel}
                      title={
                        <span className={styles.indexTitle}>
                          <span className={styles.indexNumber}>{`${entry.number} `}</span>
                          {entry.marker.name}
                        </span>
                      }
                    >
                      {entry.marker.details}
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </section>
        ) : null}
      </div>
      <p id={instructionsId} className={styles.instructions}>
        {text.instructions}
      </p>
      {url ? (
        <p className={styles.printNote}>
          <span className={styles.printUrl}>{url}</span>
          {qr != null ? <span className={styles.printQr}>{qr}</span> : null}
        </p>
      ) : null}
    </div>
  )
}
