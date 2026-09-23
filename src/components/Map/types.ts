import type * as React from 'react'

/**
 * A vector base map: a Protomaps PMTiles archive (basemap schema v4 or
 * later), drawn by MapLibre GL JS with a style built from the map's role
 * variables at runtime [D158].
 */
export interface MapPmtiles {
  /**
   * The archive's URL. It is read with HTTP range requests, so the host must
   * allow them and CORS. Host your own extract in production (`pmtiles
   * extract`); the public planet builds are for demos.
   */
  url: string
  /** The reset center, `[longitude, latitude]`. */
  center: readonly [number, number]
  /** The reset zoom level. */
  zoom: number
  /** The shallowest zoom level. Default: `zoom` − 3. */
  minZoom?: number
  /** The deepest zoom level. Default: `zoom` + 4, at most 19. */
  maxZoom?: number
  /** The frame's aspect ratio (width ÷ height). Default 3 / 2. */
  ratio?: number
  /** The label language, a Protomaps `lang` code. Default `"en"`. */
  lang?: string
  /**
   * Glyphs URL template (`{fontstack}`, `{range}`) for the characters the
   * page's UI font files do not cover. Default: Protomaps' hosted Noto Sans
   * glyphs, OFL, which need no credit.
   */
  glyphs?: string
  /**
   * URL of MapLibre's worker, `maplibre-gl-worker.mjs`, served in the same
   * directory as `maplibre-gl-shared.mjs`. Bundlers (Next.js, Vite, webpack)
   * need it: copy both files from `maplibre-gl/dist` to a public path, as
   * MapLibre's installation guide shows. Set once per page; the first map
   * wins. Default: MapLibre's own detection, which only works unbundled.
   */
  workerUrl?: string
  /**
   * The data credit below the frame. Default: "© OpenStreetMap", linked to
   * openstreetmap.org/copyright, which print spells out. Protomaps asks for
   * no credit; add one only when your tiles carry other sources.
   */
  attribution?: React.ReactNode
}

/** A route over a vector base map (§8.10): `line-dashed`, screen-size at every zoom [I7]. */
export interface MapRoute {
  /** Stable id. */
  id: string
  /** The route's line, as `[longitude, latitude]` pairs in order. */
  points: ReadonlyArray<readonly [number, number]>
  /**
   * The accessible or alternate route: `line-dashed` in --primary12 instead
   * of --role-accent. Default `false`.
   */
  alternate?: boolean
}
