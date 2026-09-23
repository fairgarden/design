'use client'

import * as React from 'react'
import { Chart } from '@fairgarden/design/data/chart'

const hours = [
  { garden: 'Parkside', spring: 412, fall: 356 },
  { garden: 'Riverbend', spring: 298, fall: 331 },
  { garden: 'Hillcrest', spring: 241, fall: 187 },
  { garden: 'Orchard Row', spring: 176, fall: 204 },
  { garden: 'Mill Pond', spring: 94, fall: 118 },
]

export function ChartBars() {
  return (
    <Chart
      data={hours}
      categoryKey="garden"
      categoryLabel="Garden"
      series={[
        { key: 'spring', name: 'Spring' },
        { key: 'fall', name: 'Fall' },
      ]}
      valueLabel="Volunteer hours"
      figureLabel="Fig. 1"
      caption="Parkside logged the most volunteer hours in both seasons."
      source="Source: FairGarden sign-in sheets, 2026."
    />
  )
}
