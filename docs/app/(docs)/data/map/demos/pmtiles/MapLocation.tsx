'use client'

import * as React from 'react'
import { Map, type MapPmtiles } from '@fairgarden/design/data/map'

// Demo tiles: Protomaps' public OpenStreetMap build (basemap schema v4) on
// Source Cooperative, read with range requests; it needs no key. Set
// NEXT_PUBLIC_MAP_PMTILES_URL to use your own archive: production maps host
// their own extract (`pmtiles extract`).
const url =
  process.env.NEXT_PUBLIC_MAP_PMTILES_URL ||
  'https://data.source.coop/protomaps/openstreetmap/v4.pmtiles'

const pmtiles: MapPmtiles = {
  url,
  center: [-73.9592, 40.6611],
  zoom: 16,
  minZoom: 13,
  maxZoom: 18,
  // MapLibre's worker pair, served beside this page (../../maplibre/[file]/route.ts).
  workerUrl: '/data/map/maplibre/maplibre-gl-worker.mjs',
}

export function MapLocation() {
  return (
    <Map
      kind="location"
      title="Getting there"
      address="Parkside Community Garden, 100 Garden Lane, Brooklyn, NY"
      caption="Leave the station by the Lincoln Road exit; the garden is a four-minute walk east."
      url="fg.example/parkside"
      pmtiles={pmtiles}
      routes={[
        {
          // Lincoln Road, from Flatbush Avenue east.
          id: 'walk',
          points: [
            [-73.9604, 40.66097],
            [-73.96013, 40.66098],
            [-73.958, 40.66111],
          ],
        },
      ]}
      markers={[
        {
          id: 'garden',
          name: 'Parkside Community Garden',
          lon: -73.958,
          lat: 40.66124,
          details: 'Open daily from dawn to dusk.',
        },
        {
          id: 'station',
          name: 'Subway station',
          lon: -73.9604,
          lat: 40.66112,
          shape: 'square',
          details: 'Trains every 6 to 10 minutes.',
        },
      ]}
    />
  )
}
