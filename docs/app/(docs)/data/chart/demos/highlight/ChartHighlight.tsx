'use client'

import * as React from 'react'
import { Chart } from '@fairgarden/design/data/chart'
import styles from './highlight.module.css'

const harvest = [
  { crop: 'Tomatoes', y2024: 310, y2025: 342, y2026: 398 },
  { crop: 'Beans', y2024: 180, y2025: 171, y2026: 226 },
  { crop: 'Squash', y2024: 142, y2025: 160, y2026: 151 },
]

const series = [
  { key: 'y2024', name: '2024' },
  { key: 'y2025', name: '2025' },
  { key: 'y2026', name: '2026' },
] as const

export function ChartHighlight() {
  return (
    <div className={styles.stack}>
      <Chart
        data={harvest}
        categoryKey="crop"
        categoryLabel="Crop"
        series={series}
        highlight="y2026"
        valueLabel="Harvest (kg)"
        caption="2026 against the two years before it: one series solid, the rest outlined."
      />
      <Chart
        data={harvest}
        categoryKey="crop"
        categoryLabel="Crop"
        series={series}
        oneInk
        valueLabel="Harvest (kg)"
        caption="The same data in one ink, as on a deep or saturated ground: patterns carry the series."
      />
    </div>
  )
}
