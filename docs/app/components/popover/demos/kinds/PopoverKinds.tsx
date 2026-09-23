'use client'

import {
  Popover,
  PopoverArrow,
  PopoverClose,
  PopoverDescription,
  PopoverPopup,
  PopoverSource,
  PopoverTitle,
  PopoverTrigger,
} from '@fairgarden-private/design/components/Popover'
import styles from './kinds.module.css'

export function PopoverKinds() {
  return (
    <div className={styles.row}>
      <Popover>
        <PopoverTrigger variant="outline">Trail Details</PopoverTrigger>
        <PopoverPopup>
          <PopoverArrow />
          <PopoverClose />
          <PopoverTitle>Ridge Loop</PopoverTitle>
          <PopoverDescription>
            6.4 km with 310 m of climbing. Open dawn to dusk; dogs stay on a leash.
          </PopoverDescription>
        </PopoverPopup>
      </Popover>

      <Popover>
        <PopoverTrigger variant="text" icon="help" iconPosition="end">
          Riparian Buffer
        </PopoverTrigger>
        <PopoverPopup kind="definition">
          <PopoverArrow />
          <PopoverTitle>Riparian buffer</PopoverTitle>
          <PopoverDescription>
            The strip of native plants along a stream that filters runoff and shades the water.
          </PopoverDescription>
          <PopoverSource>State Watershed Guide, 2024</PopoverSource>
        </PopoverPopup>
      </Popover>
    </div>
  )
}
