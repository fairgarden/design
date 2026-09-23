'use client'

import { Search } from '@fairgarden-private/design/components/Search'
import styles from './color.module.css'

const items = [{ value: 'Owls' }, { value: 'Otters' }, { value: 'Orchids' }]

/**
 * `primary` recolors the field, magnifier and rows' ink; the submit keeps
 * the scope's action scale, as every `solid` Button does.
 */
export function SearchColor() {
  return (
    <div className={styles.stack}>
      <Search label="Search, primary plum" primary="plum" items={items} />
      <Search kind="ruled" label="Filter, primary indigo" primary="indigo" items={items} />
    </div>
  )
}
