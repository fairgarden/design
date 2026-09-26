import { Toggle } from '@fairgarden/design/actions/toggle'
import { ToggleGroup } from '@fairgarden/design/actions/toggle-group'
import { PresetGround } from '@/components/PresetGround'
import styles from './grounds.module.css'

const presets = ['paper', 'forest'] as const

/**
 * Segments take the inverse pair on every ground; the selected chip is
 * green on paper and the inverse pair on forest.
 */
export function ToggleGrounds() {
  return (
    <div className={styles.row}>
      {presets.map((preset) => (
        <PresetGround key={preset} preset={preset} className={styles.face}>
          <span className={styles.name}>{preset}</span>
          <ToggleGroup variant="segmented" aria-label={`View on ${preset}`} defaultValue={['day']}>
            <Toggle value="day">Day</Toggle>
            <Toggle value="week">Week</Toggle>
          </ToggleGroup>
          <ToggleGroup
            variant="chip"
            multiple
            aria-label={`Filters on ${preset}`}
            defaultValue={['birds']}
          >
            <Toggle value="birds">Birds</Toggle>
            <Toggle value="ferns">Ferns</Toggle>
          </ToggleGroup>
        </PresetGround>
      ))}
    </div>
  )
}
