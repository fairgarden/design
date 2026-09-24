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

const names = [
  'Preserve.tsx',
  'preserve.module.css',
  'Trail.tsx',
  'trail.module.css',
  'TrailMap.tsx',
  'trail-map.module.css',
  'Hours.tsx',
  'hours.ts',
  'Stewardship.tsx',
  'stewardship.module.css',
  'useSeason.ts',
  'index.ts',
]

/**
 * Twelve files in a narrow frame, with a ⋮ Menu: the row scrolls sideways
 * under the frame's edges, with a thin scroll line on the header's rule, and
 * arrow keys bring each tab into view. Beside the frame there's room, so
 * the trigger hangs outside it and the tabs keep the whole header.
 */
export function FileTabsOverflow() {
  const [selected, setSelected] = React.useState(names[2])

  return (
    <div className={styles.stack}>
      <FileTabs
        tabs={names.map((name) => ({ id: name, name }))}
        value={selected}
        onValueChange={setSelected}
        controls={
          <Menu>
            <BaseMenu.Trigger render={<FileTabsControl />} aria-label="More actions">
              <Icon name="more_horiz" weight="interactive" />
            </BaseMenu.Trigger>
            <MenuPopup align="end">
              <MenuItem icon="content_copy">Copy {selected}</MenuItem>
              <MenuItem icon="download">Download all files</MenuItem>
            </MenuPopup>
          </Menu>
        }
        className={`${styles.frame} ${styles.narrow}`}
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
