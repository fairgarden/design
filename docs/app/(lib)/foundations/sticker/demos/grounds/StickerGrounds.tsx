import { Sticker } from '@fairgarden/design/foundations/sticker'
import { PresetGround } from '@/components/PresetGround'
import { SeedlingArt, seedlingHalo, seedlingViewBox } from '../Seedling'
import styles from './grounds.module.css'

const presets = ['paper', 'rose', 'forest', 'leaf'] as const

/** The same sticker on a page ground, a pastel, a dark field and a solid field. */
export function StickerGrounds() {
  return (
    <div className={styles.row}>
      {presets.map((preset) => (
        <PresetGround key={preset} preset={preset} className={styles.band}>
          <Sticker viewBox={seedlingViewBox} halo={seedlingHalo}>
            <SeedlingArt />
          </Sticker>
          <p className={styles.name}>{preset}</p>
        </PresetGround>
      ))}
    </div>
  )
}
