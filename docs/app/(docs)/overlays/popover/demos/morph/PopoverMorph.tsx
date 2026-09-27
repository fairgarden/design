'use client'

import {
  Popover,
  PopoverClose,
  PopoverDescription,
  PopoverPopup,
  PopoverSource,
  PopoverTitle,
  PopoverTrigger,
} from '@fairgarden/design/overlays/popover'
import styles from './morph.module.css'

/**
 * The outline morph from three trigger styles: open one from the keyboard
 * to see the ring grow into the frame; by pointer, the Button's edge or box
 * grows instead. The last trigger sits at the foot of a tall
 * stage, so with the demo at the top of the window its panel opens upward.
 */
export function PopoverMorph() {
  return (
    <div className={styles.stage}>
      <div className={styles.row}>
        <Popover>
          <PopoverTrigger variant="outline">Trail Details</PopoverTrigger>
          <PopoverPopup>
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
            <PopoverTitle>Riparian buffer</PopoverTitle>
            <PopoverDescription>
              The strip of native plants along a stream that filters runoff and shades the water.
            </PopoverDescription>
            <PopoverSource>State Watershed Guide, 2024</PopoverSource>
          </PopoverPopup>
        </Popover>
      </div>
      <div className={styles.foot}>
        <Popover>
          <PopoverTrigger variant="solid">Meeting Point</PopoverTrigger>
          <PopoverPopup>
            <PopoverTitle>Visitor Barn</PopoverTitle>
            <PopoverDescription>
              Meet by the bike racks at 8:30. The lot fills early on Saturdays.
            </PopoverDescription>
          </PopoverPopup>
        </Popover>
      </div>
    </div>
  )
}
