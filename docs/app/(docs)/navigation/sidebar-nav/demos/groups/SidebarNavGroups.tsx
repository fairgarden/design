import * as React from 'react'
import { SidebarNav } from '@fairgarden/design/navigation/sidebar-nav'
import { handbook } from './handbook'
import styles from './groups.module.css'

/** The handbook's page tree, on the Composting page, at the docs layout's 240 px column width. */
export function SidebarNavGroups() {
  return (
    <div className={styles.column}>
      <SidebarNav items={handbook} currentPath="/handbook/composting" label="Handbook" />
    </div>
  )
}
