'use client'

import * as React from 'react'
import { Chart } from '@fairgarden/design/data/chart'

const visitors = [
  { month: 'Apr', visitors: 1840 },
  { month: 'May', visitors: 2960 },
  { month: 'Jun', visitors: 3410 },
  { month: 'Jul', visitors: 3125 },
  { month: 'Aug', visitors: 2780 },
  { month: 'Sep', visitors: 2215 },
]

export function ChartColumns() {
  return (
    <Chart
      kind="column"
      data={visitors}
      categoryKey="month"
      categoryLabel="Month"
      series={[{ key: 'visitors', name: 'Visitors' }]}
      valueLabel="Visitors"
      caption="Visits peaked in June and eased through the late summer."
      source="Source: Gate counters, April to September 2026."
    />
  )
}
