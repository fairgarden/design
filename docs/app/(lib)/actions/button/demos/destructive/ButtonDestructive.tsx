import { Button } from '@fairgarden/design/actions/button'
import { PresetGround } from '@/components/PresetGround'
import styles from './destructive.module.css'

const presets = [
  'paper',
  'white',
  'tide',
  'meadow',
  'pollen',
  'apricot',
  'rose',
  'heather',
  'night',
  'forest',
  'leaf',
  'amber',
  'clay',
  'pink',
  'royal',
  'brick',
] as const

/**
 * `destructive` on every ground: the danger (red) fill, edge and label. Where
 * red text can't reach 4.5:1 (leaf, clay, royal), the label keeps the
 * field's ink and the red stays in the edge and the glyph.
 */
export function ButtonDestructive() {
  return (
    <div className={styles.grid}>
      {presets.map((preset) => (
        <PresetGround key={preset} preset={preset} className={styles.face}>
          <span className={styles.name}>{preset}</span>
          <div className={styles.actions}>
            <Button variant="solid" destructive>
              Delete Trail
            </Button>
            <Button variant="outline" destructive>
              Discard
            </Button>
            <Button variant="text" destructive icon="close">
              Remove Photo
            </Button>
          </div>
        </PresetGround>
      ))}
    </div>
  )
}
