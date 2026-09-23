'use client'

import * as React from 'react'
import { Chart } from '@fairgarden-private/design/components/Chart'

const plots = [
  { garden: 'Parkside', waiting: 46, demand: 5 },
  { garden: 'Riverbend', waiting: 31, demand: 4 },
  { garden: 'Hillcrest', waiting: 18, demand: 3 },
  { garden: 'Orchard Row', waiting: 9, demand: 2 },
  { garden: 'Mill Pond', waiting: 3, demand: 1 },
]

export function ChartSteps() {
  return (
    <Chart
      data={plots}
      categoryKey="garden"
      categoryLabel="Garden"
      series={[{ key: 'waiting', name: 'Households waiting' }]}
      steps={{ key: 'demand', name: 'Demand', labels: ['1/5 low', '5/5 high'] }}
      valueLabel="Households waiting for a plot"
      caption="The longest waiting lists sit where demand is rated highest."
    />
  )
}
