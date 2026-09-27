'use client'

import {
  Popover,
  PopoverArrow,
  PopoverDescription,
  PopoverPopup,
  PopoverTrigger,
} from '@fairgarden/design/overlays/popover'
import styles from './sides.module.css'

const sides = [
  { side: 'top', label: 'Above', area: styles.top },
  { side: 'right', label: 'Right', area: styles.end },
  { side: 'bottom', label: 'Below', area: styles.bottom },
  { side: 'left', label: 'Left', area: styles.start },
] as const

/**
 * A panel on each side of its trigger, each with its tail, which grows out
 * of the growing frame's edge on whichever side it sits.
 */
export function PopoverSides() {
  return (
    <div className={styles.cross}>
      {sides.map(({ side, label, area }) => (
        <div key={side} className={area}>
          <Popover>
            <PopoverTrigger variant="outline" size="sm">
              {label}
            </PopoverTrigger>
            <PopoverPopup side={side} kind="definition">
              <PopoverArrow />
              <PopoverDescription>Trailhead parking opens at dawn.</PopoverDescription>
            </PopoverPopup>
          </Popover>
        </div>
      ))}
    </div>
  )
}
