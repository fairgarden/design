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

const reports = [
  { id: 'Saturday crew', text: 'Nine volunteers mulched the orchard path and turned two compost bays.' },
  { id: 'Sunday crew', text: 'Six volunteers weeded the herb spiral and staked the tomatoes.' },
  { id: 'Tool check', text: 'Two spades need new handles; the wheelbarrow tyre is patched.' },
  { id: 'Water log', text: 'The barrels held through the dry week; the east tap drips.' },
]

/**
 * The busy status beside the ⋮ Menu: "Saving…" while the (pretend) PDF is
 * made. It's laid over the header's end, so the tabs never move, and it's
 * a live region, so its words are announced.
 */
export function FileTabsStatus() {
  const [selected, setSelected] = React.useState(reports[0].id)
  const [status, setStatus] = React.useState('')
  const current = reports.find((report) => report.id === selected) ?? reports[0]

  React.useEffect(() => {
    if (status === '') return undefined
    const timer = window.setTimeout(() => setStatus(''), 1500)
    return () => window.clearTimeout(timer)
  }, [status])

  return (
    <div className={styles.stack}>
      <FileTabs
        tabs={reports.map((report) => ({ id: report.id, name: report.id }))}
        value={selected}
        onValueChange={setSelected}
        status={status}
        controls={
          <Menu>
            <BaseMenu.Trigger render={<FileTabsControl />} aria-label="More actions">
              <Icon name="more_vert" size="tag" weight="interactive" />
            </BaseMenu.Trigger>
            <MenuPopup align="end">
              <MenuItem icon="download" onClick={() => setStatus('Saving…')}>
                Save {selected} as PDF
              </MenuItem>
            </MenuPopup>
          </Menu>
        }
        className={styles.frame}
      >
        <FileTabsList aria-label="Work-day reports" />
        <FileTabsPanel>
          <div className={styles.doc}>
            <h3 className={styles.title}>{current.id}</h3>
            <p>{current.text}</p>
          </div>
        </FileTabsPanel>
      </FileTabs>
    </div>
  )
}
