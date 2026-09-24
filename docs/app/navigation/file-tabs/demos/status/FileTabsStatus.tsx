'use client'

import * as React from 'react'
import { Menu as BaseMenu } from '@base-ui/react/menu'
import { Icon } from '@fairgarden/design/foundations/icon'
import {
  FileTabs,
  FileTabsControl,
  FileTabsList,
  FileTabsPanel,
} from '@fairgarden/design/navigation/file-tabs'
import { Menu, MenuItem, MenuPopup } from '@fairgarden/design/overlays/menu'
import styles from './status.module.css'

const names = ['Checklist.tsx', 'checklist.module.css', 'tasks.ts', 'useChecklist.ts', 'index.ts']

/**
 * The busy status beside the ⋮ Menu: "Formatting…" while the (pretend)
 * formatter runs. It's laid over the header's end, so the tabs never move,
 * and it's a live region, so its words are announced.
 */
export function FileTabsStatus() {
  const [selected, setSelected] = React.useState(names[0])
  const [status, setStatus] = React.useState('')

  React.useEffect(() => {
    if (status === '') return undefined
    const timer = window.setTimeout(() => setStatus(''), 1500)
    return () => window.clearTimeout(timer)
  }, [status])

  return (
    <div className={styles.stack}>
      <FileTabs
        tabs={names.map((name) => ({ id: name, name }))}
        value={selected}
        onValueChange={setSelected}
        status={status}
        controls={
          <Menu>
            <BaseMenu.Trigger render={<FileTabsControl />} aria-label="More actions">
              <Icon name="more_horiz" weight="interactive" />
            </BaseMenu.Trigger>
            <MenuPopup align="end">
              <MenuItem icon="restart_alt" onClick={() => setStatus(`Formatting ${selected}…`)}>
                Format {selected}
              </MenuItem>
            </MenuPopup>
          </Menu>
        }
        className={styles.frame}
      >
        <FileTabsList />
        <FileTabsPanel>
          <pre className={styles.code}>
            <code>{`// ${selected}`}</code>
          </pre>
        </FileTabsPanel>
      </FileTabs>
    </div>
  )
}
