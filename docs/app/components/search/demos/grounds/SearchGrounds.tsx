'use client'

import { PresetGround } from '@/components/PresetGround'
import { Search } from '@fairgarden-private/design/components/Search'
import styles from './grounds.module.css'

const items = [{ value: 'Moths' }, { value: 'Mosses' }, { value: 'Mushrooms' }]

const presets = ['paper', 'forest'] as const

/**
 * On forest the submit stays amber with its edge equal to its fill, and
 * the suggestions popup is the white scope, which follows the page mode.
 */
export function SearchGrounds() {
  return (
    <div className={styles.row}>
      {presets.map((preset) => (
        <PresetGround key={preset} preset={preset} className={styles.face}>
          <p className={styles.name}>{preset}</p>
          <Search label={`Search on ${preset}`} items={items} />
          <Search kind="ruled" label={`Filter on ${preset}`} items={items} />
        </PresetGround>
      ))}
    </div>
  )
}
