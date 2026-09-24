'use client'

import * as React from 'react'
import { Button } from '@fairgarden/design/actions/button'
import { Tag } from '@fairgarden/design/feedback/tag'
import styles from './plot-tally.module.css'

const plots = ['North', 'South', 'Orchard']

function nextPlot(current: number) {
  return (current + 1) % plots.length
}

/** Tallies seedlings by plot on a work day. */
export function PlotTally() {
  const [plot, setPlot] = React.useState(0)
  const [tally, setTally] = React.useState<number[]>(() => plots.map(() => 0))

  // @focus-start @padding 1
  const plant = () => {
    setTally((current) => current.map((count, index) => (index === plot ? count + 1 : count))) // @highlight
  }
  // @focus-end

  return (
    <div className={styles.row}>
      <Button variant="solid" onClick={plant}>
        Plant in {plots[plot]}
      </Button>
      <Button onClick={() => setPlot(nextPlot)}>Next Plot</Button>
      {plots.map((name, index) => (
        <Tag key={name}>
          {name}: {tally[index]}
        </Tag>
      ))}
    </div>
  )
}
