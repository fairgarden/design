import { Icon } from '@fairgarden/design/foundations/icon'
import {
  FileTabs,
  FileTabsControl,
  FileTabsList,
  FileTabsPanel,
} from '@fairgarden/design/navigation/file-tabs'
import styles from './disabled.module.css'

const names = ['Planting calendar', 'Seed order', 'Tool inventory']

/**
 * While the documents load, every tab is disabled, and so is the ⋮ trigger
 * that stands in for the menu. The selected tab keeps its shape and weight.
 */
export function FileTabsDisabled() {
  return (
    <div className={styles.stack}>
      <FileTabs
        tabs={names.map((name) => ({ id: name, name }))}
        defaultValue={names[1]}
        disabled
        controls={
          <FileTabsControl aria-label="More actions" disabled>
            <Icon name="more_vert" size="tag" weight="interactive" />
          </FileTabsControl>
        }
        className={styles.frame}
      >
        <FileTabsList aria-label="Spring packet" />
        <FileTabsPanel>
          <div className={styles.doc}>
            <p className={styles.status}>Loading…</p>
          </div>
        </FileTabsPanel>
      </FileTabs>
    </div>
  )
}
