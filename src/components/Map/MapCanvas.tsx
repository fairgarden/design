'use client'

import * as React from 'react'
import type { Map as MapLibreMap, StyleSpecification } from 'maplibre-gl'

import {
  buildStyle,
  DEFAULT_GLYPHS,
  patternImages,
  printPalette,
  readFontFaces,
  readPalette,
  type Basemaps,
  type PatternImage,
  type StyleInput,
} from './mapStyle'
import type { MapPmtiles, MapRoute } from './types'
import styles from './map.module.css'

/*
 * The vector base of a PMTiles map: a MapLibre GL JS canvas and nothing
 * else. MapLibre, the PMTiles protocol and the basemap layers load with a
 * dynamic import on first use, so pages without a PMTiles map never fetch
 * them. The map is not interactive in MapLibre's sense: the Map component
 * owns the view (drag, keys, pinch, the toolbar) and this canvas follows it
 * with jumpTo; markers, labels and controls stay in the DOM. MapLibre's
 * stylesheet is not needed: the module positions the canvas, and no
 * MapLibre control, marker or popup is used.
 *
 * Print: WebGL canvases print unreliably, and `beforeprint` leaves no time
 * to load tiles, so the static figure is made ahead of time. Once the live
 * map settles, a hidden second MapLibre instance renders the reset extent
 * in the print palette (black line on white, water hatched) at 2×, and its
 * PNG waits in an <img> that only print shows. It is redrawn when the reset
 * extent, the source or the frame's cover size change.
 */

type MapLibre = typeof import('maplibre-gl')

interface Engine {
  maplibre: MapLibre
  basemaps: Basemaps
}

let engine: Promise<Engine> | null = null

/** Loads MapLibre, registers the `pmtiles://` protocol and loads the basemap layers, once per page. */
function loadEngine(workerUrl: string | undefined): Promise<Engine> {
  engine ??= Promise.all([
    import('maplibre-gl'),
    import('pmtiles'),
    import('@protomaps/basemaps'),
  ]).then(
    ([maplibre, pmtiles, basemaps]) => {
      const protocol = new pmtiles.Protocol()
      maplibre.addProtocol('pmtiles', protocol.tile)
      return { maplibre, basemaps }
    },
    (error: unknown) => {
      engine = null
      throw error
    }
  )
  return engine.then((loaded) => {
    // The worker pool starts with the first map, so the URL must be set before it.
    if (workerUrl && !loaded.maplibre.getWorkerUrl()) loaded.maplibre.setWorkerUrl(workerUrl)
    return loaded
  })
}

/** Print snapshots: the device pixel ratio they render at. */
const SNAPSHOT_RATIO = 2
/** Snapshot cover at least this wide, px, so a print at 174 mm is covered. */
const SNAPSHOT_COVER = 720
/** Wait this long after the view settles before rendering a snapshot, ms. */
const SNAPSHOT_DELAY = 400
/** Give up on a snapshot whose tiles have not settled in this time, ms. */
const SNAPSHOT_TIMEOUT = 20000

const OBSERVED_ATTRIBUTES = ['data-theme', 'data-ground', 'data-tone', 'data-scheme']

function screenRatio(): number {
  return Math.max(1, Math.round(window.devicePixelRatio || 1))
}

interface Snapshot {
  url: string
  width: number
  height: number
}

interface SnapshotJob {
  engine: Engine
  style: StyleSpecification
  images: Record<string, PatternImage>
  center: [number, number]
  zoom: number
  width: number
  height: number
}

/** Renders one print snapshot off screen; returns a cancel function. */
function renderSnapshot(job: SnapshotJob, done: (url: string | null) => void): () => void {
  const container = document.createElement('div')
  container.setAttribute('aria-hidden', 'true')
  Object.assign(container.style, {
    position: 'fixed',
    left: '0px',
    top: '0px',
    width: `${job.width}px`,
    height: `${job.height}px`,
    visibility: 'hidden',
    pointerEvents: 'none',
  })
  document.body.appendChild(container)
  let map: MapLibreMap | null = null
  let cancelled = false
  const cleanup = () => {
    window.clearTimeout(timer)
    map?.remove()
    map = null
    container.remove()
  }
  const finish = (url: string | null) => {
    if (cancelled) {
      if (url) URL.revokeObjectURL(url)
      return
    }
    cancelled = true
    cleanup()
    done(url)
  }
  const timer = window.setTimeout(() => finish(null), SNAPSHOT_TIMEOUT)
  try {
    const snap = new job.engine.maplibre.Map({
      container,
      style: job.style,
      center: job.center,
      zoom: job.zoom,
      interactive: false,
      attributionControl: false,
      fadeDuration: 0,
      trackResize: false,
      pixelRatio: SNAPSHOT_RATIO,
      canvasContextAttributes: { preserveDrawingBuffer: true },
    })
    map = snap
    snap.setMissingStyleImageResolver((id) => {
      const image = job.images[id]
      if (image && !snap.hasImage(id)) snap.addImage(id, image, { pixelRatio: SNAPSHOT_RATIO })
    })
    snap.once('idle', () => {
      if (cancelled) return
      snap
        .getCanvas()
        .toBlob((blob) => finish(blob ? URL.createObjectURL(blob) : null), 'image/png')
    })
  } catch {
    finish(null)
  }
  return () => {
    if (cancelled) return
    cancelled = true
    cleanup()
  }
}

/** Props for MapCanvas: the source, the view to show, and what its colors and print depend on. */
export interface MapCanvasProps {
  source: MapPmtiles
  /** The view to show: `[longitude, latitude]` and a zoom level. */
  center: readonly [number, number]
  zoom: number
  /** The reset extent, which print shows. */
  resetCenter: readonly [number, number]
  resetZoom: number
  routes: readonly MapRoute[]
  oneInk: boolean
  /** The element whose role variables color the style (the frame, inside the map root). */
  rootRef: React.RefObject<HTMLElement | null>
  /** Changes whenever the scope's colors may have: the mode, the primary and secondary scales. */
  themeKey: string
  /** The frame's size, px. */
  width: number
  height: number
  ratio: number
  /** Render the print snapshot (off when the map has a `printFallback`). */
  snapshot: boolean
  /** Reports whether a print snapshot is ready. */
  onSnapshotChange: (ready: boolean) => void
}

/** The MapLibre canvas of a PMTiles map, plus its print snapshot. */
export function MapCanvas(props: MapCanvasProps) {
  const {
    source,
    center,
    zoom,
    resetCenter,
    resetZoom,
    routes,
    oneInk,
    rootRef,
    themeKey,
    width,
    height,
    ratio,
    snapshot: wantSnapshot,
    onSnapshotChange,
  } = props
  const { url, workerUrl } = source
  const glyphs = source.glyphs ?? DEFAULT_GLYPHS
  const lang = source.lang ?? 'en'
  const [lon, lat] = center
  const [resetLon, resetLat] = resetCenter
  const hasSize = width > 0 && height > 0

  const containerRef = React.useRef<HTMLDivElement>(null)
  const mapRef = React.useRef<MapLibreMap | null>(null)
  const engineRef = React.useRef<Engine | null>(null)
  const imagesRef = React.useRef<Record<string, PatternImage>>({})
  const styleKeyRef = React.useRef('')
  const [ready, setReady] = React.useState(false)
  const [settled, setSettled] = React.useState(false)
  const [tick, setTick] = React.useState(0)
  const [shot, setShot] = React.useState<Snapshot | null>(null)

  // The latest inputs, read by effects that must not re-run on each change.
  const latest = React.useRef({ center, zoom, routes, oneInk })
  latest.current = { center, zoom, routes, oneInk }

  const routesKey = JSON.stringify(routes)

  /** The style inputs as they stand now, read from the role variables in effect [D158]. */
  const readInput = React.useCallback((): StyleInput | null => {
    const root = rootRef.current
    if (!root) return null
    return {
      url,
      glyphs,
      lang,
      palette: readPalette(root, latest.current.oneInk),
      fontFaces: readFontFaces(root),
      routes: latest.current.routes,
    }
  }, [rootRef, url, glyphs, lang])

  // Create the map once the engine loads; recreate it for a new source.
  React.useEffect(() => {
    let cancelled = false
    let created: MapLibreMap | null = null
    loadEngine(workerUrl)
      .then((loaded) => {
        const container = containerRef.current
        const input = readInput()
        if (cancelled || !container || !input) return
        engineRef.current = loaded
        const pixelRatio = screenRatio()
        imagesRef.current = patternImages(input.palette, pixelRatio)
        styleKeyRef.current = JSON.stringify(input)
        const map = new loaded.maplibre.Map({
          container,
          style: buildStyle(loaded.basemaps, input),
          center: [latest.current.center[0], latest.current.center[1]],
          zoom: latest.current.zoom,
          interactive: false,
          attributionControl: false,
          fadeDuration: 0,
        })
        created = map
        mapRef.current = map
        map.setMissingStyleImageResolver((id) => {
          const image = imagesRef.current[id]
          if (image && !map.hasImage(id)) map.addImage(id, image, { pixelRatio })
        })
        map.once('load', () => {
          if (!cancelled) setReady(true)
        })
        map.once('idle', () => {
          if (!cancelled) setSettled(true)
        })
      })
      .catch((error: unknown) => {
        // No WebGL2 or the modules failed to load: the frame keeps its ground, markers and index.
        if (!cancelled) console.warn('Map: the vector base could not start.', error)
      })
    return () => {
      cancelled = true
      created?.remove()
      mapRef.current = null
      setReady(false)
      setSettled(false)
    }
  }, [url, glyphs, lang, workerUrl, readInput])

  // Follow the view the Map component owns: instant, never animated.
  React.useEffect(() => {
    if (ready) mapRef.current?.jumpTo({ center: [lon, lat], zoom })
  }, [ready, lon, lat, zoom])

  // Rebuild the style when the mode or scope changes [D158]: useColorScheme
  // (themeKey), and any data-theme / data-ground / data-tone / data-scheme
  // change in the document. Stylesheets and fonts arriving late count too.
  React.useEffect(() => {
    let frame = 0
    const schedule = () => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(() => setTick((value) => value + 1))
    }
    const observer = new MutationObserver(schedule)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: OBSERVED_ATTRIBUTES,
      subtree: true,
    })
    window.addEventListener('load', schedule)
    void document.fonts?.ready.then(schedule)
    return () => {
      window.cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('load', schedule)
    }
  }, [])

  React.useEffect(() => {
    const map = mapRef.current
    const loaded = engineRef.current
    const input = readInput()
    if (!ready || !map || !loaded || !input) return
    const key = JSON.stringify(input)
    if (key === styleKeyRef.current) return
    styleKeyRef.current = key
    // New colors mean new pattern ids; the resolver adds them as the style asks.
    imagesRef.current = { ...imagesRef.current, ...patternImages(input.palette, screenRatio()) }
    map.setStyle(buildStyle(loaded.basemaps, input), { diff: true })
  }, [ready, settled, themeKey, tick, oneInk, routesKey, readInput])

  // The print snapshot of the reset extent, made ahead of print.
  const coverWidth = Math.ceil(Math.max(width, SNAPSHOT_COVER) / 16) * 16
  const coverHeight = Math.ceil(Math.max(height, SNAPSHOT_COVER / ratio) / 16) * 16
  React.useEffect(() => {
    setShot(null)
    const loaded = engineRef.current
    if (!wantSnapshot || !settled || !loaded || !hasSize) return undefined
    let cancel: (() => void) | null = null
    const timer = window.setTimeout(() => {
      const input = readInput()
      if (!input) return
      const palette = printPalette(input.palette)
      cancel = renderSnapshot(
        {
          engine: loaded,
          style: buildStyle(loaded.basemaps, { ...input, palette }),
          images: patternImages(palette, SNAPSHOT_RATIO),
          center: [resetLon, resetLat],
          zoom: resetZoom,
          width: coverWidth,
          height: coverHeight,
        },
        (snapshotUrl) => {
          cancel = null
          if (snapshotUrl) setShot({ url: snapshotUrl, width: coverWidth, height: coverHeight })
        }
      )
    }, SNAPSHOT_DELAY)
    return () => {
      window.clearTimeout(timer)
      cancel?.()
    }
  }, [
    wantSnapshot,
    settled,
    resetLon,
    resetLat,
    resetZoom,
    coverWidth,
    coverHeight,
    routesKey,
    hasSize,
    readInput,
  ])

  // Release each snapshot's object URL when it is replaced or the map unmounts.
  React.useEffect(() => {
    onSnapshotChange(shot !== null)
    return () => {
      if (shot) URL.revokeObjectURL(shot.url)
    }
  }, [shot, onSnapshotChange])

  return (
    <>
      <div ref={containerRef} className={styles.canvas} aria-hidden="true" />
      {shot ? (
        <img
          className={styles.snapshot}
          src={shot.url}
          width={shot.width}
          height={shot.height}
          alt=""
          decoding="sync"
        />
      ) : null}
    </>
  )
}
