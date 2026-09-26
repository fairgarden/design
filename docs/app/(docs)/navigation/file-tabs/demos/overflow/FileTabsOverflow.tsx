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
import styles from './overflow.module.css'

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

/**
 * A year of monthly meeting minutes in a narrow frame, with a ⋮ Menu: the
 * row scrolls sideways under the frame's edges with the browser's own
 * scrollbar, flush under the header, and arrow keys bring each tab into
 * view. The trigger hangs outside the frame, so the tabs keep the whole
 * header.
 */
export function FileTabsOverflow() {
  const [selected, setSelected] = React.useState(months[2])

  return (
    <div className={styles.stack}>
      <FileTabs
        tabs={months.map((month) => ({ id: month, name: month }))}
        value={selected}
        onValueChange={setSelected}
        controls={
          <Menu>
            <BaseMenu.Trigger render={<FileTabsControl />} aria-label="More actions">
              <Icon name="more_vert" size="tag" weight="interactive" />
            </BaseMenu.Trigger>
            <MenuPopup align="end">
              <MenuItem icon="download">Download {selected} minutes (PDF)</MenuItem>
              <MenuItem icon="download">Download the whole year (PDF)</MenuItem>
            </MenuPopup>
          </Menu>
        }
        className={`${styles.frame} ${styles.narrow}`}
      >
        <FileTabsList aria-label="Meeting minutes, 2026" />
        <FileTabsPanel>
          <div className={styles.doc}>
            <h3 className={styles.title}>{selected} meeting minutes</h3>
            <p>
              Twelve gardeners attended. The committee reviewed the work-day schedule, the plot
              waitlist and the treasurer’s report, and set the next meeting for the second Tuesday.
            </p>
          </div>
        </FileTabsPanel>
      </FileTabs>
    </div>
  )
}
