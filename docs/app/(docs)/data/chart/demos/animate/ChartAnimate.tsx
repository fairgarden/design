'use client'

import * as React from 'react'
import { Button } from '@fairgarden/design/actions/button'
import { Chart } from '@fairgarden/design/data/chart'
import styles from './animate.module.css'

const seedlings = [
  { month: 'March', planted: 120 },
  { month: 'April', planted: 340 },
  { month: 'May', planted: 510 },
  { month: 'June', planted: 280 },
]

/**
 * A chart opted into its entry animation: the bars grow from the baseline
 * over 200 ms, only when the reader's motion preference allows it. Replay
 * remounts the chart, since the animation runs on entry only.
 */
export function ChartAnimate() {
  const [run, setRun] = React.useState(0)
  return (
    <div className={styles.stack}>
      <Chart
        key={run}
        animate
        data={seedlings}
        categoryKey="month"
        categoryLabel="Month"
        series={[{ key: 'planted', name: 'Seedlings planted' }]}
        valueLabel="Seedlings planted"
        caption="Planting peaked in May, once the last frost had passed."
        source="Source: FairGarden nursery log, 2026."
      />
      <div>
        <Button variant="outline" size="sm" onClick={() => setRun((count) => count + 1)}>
          Replay
        </Button>
      </div>
    </div>
  )
}
