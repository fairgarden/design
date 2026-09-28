'use client'

import * as React from 'react'
import { Radio } from '@fairgarden/design/forms/radio'
import { RadioGroup } from '@fairgarden/design/forms/radio-group'
import styles from './kinds.module.css'

const swatches = [
  { value: 'moss', name: 'Moss', color: 'var(--grass9)' },
  { value: 'rust', name: 'Rust', color: 'var(--orange9)' },
  { value: 'slate', name: 'Slate', color: 'var(--slate11)' },
  { value: 'oat', name: 'Oat', color: 'var(--sand4)' },
  { value: 'ink', name: 'Ink', color: 'var(--blue12)' },
]

/**
 * Option pills (stacked answers) and swatches (color discs whose name is
 * the label, echoed in the legend).
 */
export function RadioKinds() {
  const pillsId = React.useId()
  const swatchId = React.useId()
  const [color, setColor] = React.useState('moss')
  const chosen = swatches.find((swatch) => swatch.value === color)

  return (
    <div className={styles.stack}>
      <div className={styles.group}>
        <p id={pillsId} className={styles.legend}>
          How often do you hike?
        </p>
        <RadioGroup kind="pill" aria-labelledby={pillsId} defaultValue="monthly">
          <Radio value="weekly">Every Week</Radio>
          <Radio value="monthly">Every Month</Radio>
          <Radio value="yearly">A Few Times a Year</Radio>
          <Radio value="never" disabled>
            Not Yet (unavailable)
          </Radio>
        </RadioGroup>
      </div>
      <div className={styles.group}>
        <p id={swatchId} className={styles.legend}>
          Color: {chosen?.name}
        </p>
        <RadioGroup
          kind="swatch"
          aria-labelledby={swatchId}
          value={color}
          onValueChange={(value) => setColor(value as string)}
        >
          {swatches.map((swatch) => (
            <Radio key={swatch.value} value={swatch.value} swatch={swatch.color}>
              {swatch.name}
            </Radio>
          ))}
        </RadioGroup>
      </div>
    </div>
  )
}
