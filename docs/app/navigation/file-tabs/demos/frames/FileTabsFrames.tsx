'use client'

import * as React from 'react'
import { Menu as BaseMenu } from '@base-ui/react/menu'
import { Icon } from '@fairgarden/design/foundations/icon'
import {
  FileTabs,
  FileTabsControl,
  FileTabsList,
  FileTabsPanel,
  type FileTabsFrame,
} from '@fairgarden/design/navigation/file-tabs'
import { Menu, MenuItem, MenuPopup } from '@fairgarden/design/overlays/menu'
import styles from './frames.module.css'

const files = [
  {
    name: 'Tally.tsx',
    code: `export function Tally({ count }) {\n  return <output>{count} birds</output>\n}`,
  },
  { name: 'tally.module.css', code: `.tally {\n  font-variant-numeric: tabular-nums;\n}` },
  { name: 'count.ts', code: `export const count = 42` },
]

function TallyFiles({ frame }: { frame: FileTabsFrame }) {
  const [selected, setSelected] = React.useState(files[0].name)
  const current = files.find((file) => file.name === selected) ?? files[0]

  return (
    <FileTabs
      tabs={files.map((file) => ({ id: file.name, name: file.name }))}
      value={selected}
      onValueChange={setSelected}
      frame={frame}
      controls={
        <Menu>
          <BaseMenu.Trigger render={<FileTabsControl />} aria-label="More actions">
            <Icon name="more_horiz" weight="interactive" />
          </BaseMenu.Trigger>
          <MenuPopup align="end">
            <MenuItem icon="content_copy">Copy {selected}</MenuItem>
          </MenuPopup>
        </Menu>
      }
    >
      <FileTabsList />
      <FileTabsPanel>
        <pre className={styles.code}>
          <code>{current.code}</code>
        </pre>
      </FileTabsPanel>
    </FileTabs>
  )
}

/**
 * The header on its other hosts. `frame="joined"`: in a box below another
 * part (here, the output), joined to it by the header's rule. `frame="none"`:
 * no box, the tabs over their panel on the page; the ⋮ trigger stays in
 * the header, since there's no frame to hang it from.
 */
export function FileTabsFrames() {
  return (
    <div className={styles.stack}>
      <div className={styles.frame}>
        <output className={styles.output}>42 birds</output>
        <TallyFiles frame="joined" />
      </div>
      <TallyFiles frame="none" />
    </div>
  )
}
