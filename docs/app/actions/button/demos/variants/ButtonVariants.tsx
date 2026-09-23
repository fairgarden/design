'use client'

import * as React from 'react'
import { Button } from '@fairgarden/design/actions/button'
import styles from './variants.module.css'

export function ButtonVariants() {
  const [clicks, setClicks] = React.useState(0)
  const count = () => setClicks((value) => value + 1)

  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        <Button variant="solid" onClick={count}>
          Donate Now
        </Button>
        <Button variant="outline" onClick={count}>
          Learn More
        </Button>
        <Button variant="text" icon="chevron_right" iconPosition="end" onClick={count}>
          See All Trails
        </Button>
      </div>
      <div className={styles.row}>
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
        <Button size="xl" variant="solid">
          Extra Large
        </Button>
      </div>
      <div className={styles.row}>
        <Button icon="download" onClick={count}>
          Download Map
        </Button>
        <Button iconOnly icon="search" onClick={count}>
          Search
        </Button>
        <Button disabled>Sold Out</Button>
      </div>
      <p className={styles.status} aria-live="polite">
        Clicked {clicks} {clicks === 1 ? 'time' : 'times'}
      </p>
    </div>
  )
}
