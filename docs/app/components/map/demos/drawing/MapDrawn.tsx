'use client'

import * as React from 'react'
import { Map, type MapMarker } from '@fairgarden-private/design/components/Map'

const markers: MapMarker[] = [
  {
    id: 'visitor-center',
    name: 'Visitor Center',
    x: 150,
    y: 395,
    group: 'Buildings',
    details: 'Maps, restrooms and water. Open daily 8:00 to 18:00.',
  },
  {
    id: 'tool-shed',
    name: 'Tool Shed',
    x: 610,
    y: 395,
    group: 'Buildings',
    shape: 'square',
    details: 'Volunteers borrow tools here; sign them back in by dusk.',
  },
  {
    id: 'lake-overlook',
    name: 'Lake Overlook',
    x: 300,
    y: 150,
    group: 'Views',
    shape: 'diamond',
    details: 'A bench above the lake, reached by the loop trail.',
  },
  {
    id: 'meadow',
    name: 'Pollinator Meadow',
    x: 560,
    y: 150,
    group: 'Gardens',
    details: 'Native asters, milkweed and bee balm, mown once each March.',
  },
  {
    id: 'plots',
    name: 'Community Plots',
    x: 400,
    y: 330,
    group: 'Gardens',
    details: '48 raised beds, allotted each spring by lottery.',
  },
]

export function MapDrawn() {
  return (
    <Map
      title="Parkside Community Garden"
      figureLabel="Fig. 2"
      caption="The loop trail links every garden; the orchard is still planned."
      url="fg.example/parkside"
      markers={markers}
      labels={[
        { id: 'lake', text: 'Lake', x: 150, y: 150 },
        { id: 'orchard', text: 'Planned orchard', x: 690, y: 290 },
      ]}
      drawing={{
        width: 800,
        height: 500,
        maxZoom: 3,
        render: (kit) => (
          <>
            <rect x={20} y={20} width={760} height={460} className={kit.line.boundary} />
            <path
              d="M40 60 C120 30 260 50 290 110 C320 180 250 250 150 250 C70 250 40 190 40 60 Z"
              fill={kit.fill.water}
              className={kit.line.area}
            />
            <rect x={460} y={60} width={280} height={170} fill={kit.fill.green} className={kit.line.area} />
            <rect x={620} y={250} width={140} height={90} fill={kit.fill.planned} className={kit.line.area} />
            <rect x={320} y={280} width={220} height={100} className={kit.line.building} />
            <path d="M375 280 V380 M430 280 V380 M485 280 V380 M320 330 H540" className={kit.line.subdivision} />
            <rect x={110} y={370} width={80} height={50} className={kit.line.building} />
            <rect x={580} y={370} width={60} height={50} className={kit.line.building} />
            <path d="M20 440 H780" className={kit.line.road} />
            <path d="M150 420 V440 M610 420 V440 M400 380 V440" className={kit.line.street} />
            <path d="M300 250 C340 270 360 270 400 280" className={kit.line.path} />
            <path
              d="M150 420 C150 300 220 280 300 160 C360 90 480 250 560 240 C640 230 620 330 610 370"
              className={kit.line.route}
            />
          </>
        ),
      }}
    />
  )
}
