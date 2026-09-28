'use client'

import * as React from 'react'
import { Chart } from '@fairgarden/design/data/chart'

const compost = [
  { month: 'May', kitchen: 120, yard: 210, other: 40 },
  { month: 'Jun', kitchen: 135, yard: 260, other: 45 },
  { month: 'Jul', kitchen: 150, yard: 240, other: 55 },
  { month: 'Aug', kitchen: 160, yard: 220, other: 50 },
  { month: 'Sep', kitchen: 170, yard: 300, other: 60 },
  { month: 'Oct', kitchen: 175, yard: 380, other: 70 },
]

export function ChartAreas() {
  return (
    <Chart
      kind="area"
      data={compost}
      categoryKey="month"
      categoryLabel="Month"
      series={[
        { key: 'kitchen', name: 'Kitchen scraps' },
        { key: 'yard', name: 'Yard waste' },
        { key: 'other', name: 'Other', slot: 6 },
      ]}
      valueLabel="Compost collected (kg)"
      formatValue={(value) => `${value.toLocaleString('en-US')} kg`}
      caption="Yard waste drives the autumn rise; kitchen scraps grow steadily."
    />
  )
}
