'use client'

import { Slider } from '@fairgarden-private/design/components/Slider'
import { PresetGround } from '@/components/PresetGround'
import styles from './grounds.module.css'

const presets = ['paper', 'forest'] as const

/** The same roles on two grounds; the thumb face is --role-halo, the scope's step 1, everywhere. */
export function SliderGrounds() {
  return (
    <div className={styles.row}>
      {presets.map((preset) => (
        <PresetGround key={preset} preset={preset} className={styles.face}>
          <span className={styles.name}>{preset}</span>
          <Slider label="Shade Cover" defaultValue={45} formatValue={(formatted) => `${formatted[0]}%`} />
          <Slider label="Trail Grade" stepped defaultValue={3} max={10} />
        </PresetGround>
      ))}
    </div>
  )
}
